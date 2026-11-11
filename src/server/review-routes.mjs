/**
 * 교사용 검토 화면(public/review/index.html)의 라우트.
 *
 *   GET  /review/                          검토 화면
 *   GET  /review/manual-rules.mjs          선수관계 검증 규칙(서버와 같은 파일)
 *   GET  /api/review/kr2022/remap          재매핑 검토 항목(검토 순서대로) + 저장된 결정
 *   GET  /api/review/kr2022/standards      공식 성취기준(검색용 축약본)
 *   GET  /api/review/kr2022/prerequisites  수동 선수관계
 *   POST /api/review/kr2022/decisions      결정 하나 저장(덮어쓰기)
 *   POST /api/review/kr2022/prerequisites  수동 간선 추가·삭제
 *
 * 저장(POST)은 이 컴퓨터에서 보낸 요청만 받는다. 서버가 0.0.0.0에 떠 있어도
 * 같은 학교망의 다른 기기가 파일을 고치지 못하게 하기 위해서다.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { normalizeText, officialKey } from "../core/kr2022/remap.mjs";
import { checkEdge, checkManualEdges } from "../core/kr2022/manual-rules.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const DEFAULT_PATHS = Object.freeze({
  standards: path.join(ROOT, "data/kr-2022/standards.json"),
  remap: path.join(ROOT, "review/kr2022-remap/handwritten-remap.json"),
  reviewQueue: path.join(ROOT, "review/kr2022-remap/handwritten-remap.review.json"),
  decisions: path.join(ROOT, "review/kr2022-remap/decisions.json"),
  manual: path.join(ROOT, "data/kr-2022/prerequisites.manual.json"),
  page: path.join(ROOT, "public/review/index.html"),
  rules: path.join(ROOT, "src/core/kr2022/manual-rules.mjs")
});

export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_NOTE_CHARS = 2000;
export const DECISIONS = Object.freeze(["accept-candidate", "choose-other", "discard", "defer"]);
const GROUPS = Object.freeze(["review-queue", "no-candidates", "matched-no-reason"]);

const LOCAL_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

/** 손작성 항목의 안정 키: 원래 코드 + 정규화한 문장의 sha256 앞 12자리. */
export function itemKey(oldCode, oldText) {
  const hash = crypto.createHash("sha256").update(normalizeText(oldText), "utf8").digest("hex").slice(0, 12);
  return `${oldCode}#${hash}`;
}

/** Asia/Seoul 고정 오프셋 ISO 8601 (예: 2026-11-12T14:03:00+09:00). */
export function seoulTimestamp(date = new Date()) {
  return new Date(date.getTime() + 9 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "+09:00");
}

function hostnameOf(hostHeader) {
  if (typeof hostHeader !== "string" || !hostHeader) return null;
  if (hostHeader.startsWith("[")) return hostHeader.slice(0, hostHeader.indexOf("]") + 1).toLowerCase();
  return hostHeader.split(":")[0].toLowerCase();
}

/** 저장을 허용할 요청인가: 접속 주소·Host·(있으면) Origin이 모두 이 컴퓨터여야 한다. */
export function isLocalRequest(req) {
  if (!LOCAL_ADDRESSES.has(req.socket?.remoteAddress)) return false;
  if (!LOCAL_HOSTNAMES.has(hostnameOf(req.headers?.host))) return false;
  const origin = req.headers?.origin;
  if (origin != null) {
    try {
      if (!LOCAL_HOSTNAMES.has(new URL(origin).host.replace(/:\d+$/, "").toLowerCase())) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function readJsonFile(file, fallback) {
  if (!fs.existsSync(file)) {
    if (fallback !== undefined) return fallback;
    throw new HttpError(500, `파일이 없습니다: ${path.relative(ROOT, file)}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** 임시 파일에 쓴 뒤 rename — 쓰는 도중 서버가 죽어도 원본이 반쯤 쓰인 채로 남지 않는다. */
export function writeJsonAtomic(file, doc) {
  const tmp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmp, JSON.stringify(doc, null, 2) + "\n");
  try {
    fs.renameSync(tmp, file);
  } catch (err) {
    fs.rmSync(tmp, { force: true });
    throw err;
  }
}

function emptyDecisions() {
  return {
    schemaVersion: 1,
    description:
      "교사가 검토 화면(/review/)에서 내린 손작성 성취기준 재매핑 결정. 키는 원래 코드#정규화 문장 sha256 앞 12자리. " +
      "decision: accept-candidate(자동 후보가 맞음) | choose-other(다른 공식 성취기준 지정) | discard(해당 없음, 손작성 폐기) | defer(보류). " +
      "officialId는 standards.json의 id(accept-candidate·choose-other만).",
    decisions: {}
  };
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers?.["content-length"]);
    let size = 0;
    let over = Number.isFinite(declared) && declared > limit;
    const chunks = [];
    req.on("data", chunk => {
      size += chunk.length;
      if (size > limit) over = true;
      // 넘쳐도 끝까지 읽어서 버린다. 중간에 끊으면 클라이언트가 413 응답을 못 받는다.
      if (!over) chunks.push(chunk);
    });
    req.on("end", () => {
      if (over) return reject(new HttpError(413, `요청 본문이 너무 큽니다 (최대 ${limit}바이트)`));
      const text = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(JSON.parse(text));
      } catch {
        reject(new HttpError(400, "요청 본문이 JSON이 아닙니다"));
      }
    });
    req.on("error", reject);
  });
}

function send(req, res, status, data, extraHeaders = {}) {
  let body = Buffer.from(JSON.stringify(data));
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders };
  if (body.length > 4096 && /\bgzip\b/.test(req.headers?.["accept-encoding"] ?? "")) {
    body = zlib.gzipSync(body);
    headers["Content-Encoding"] = "gzip";
    headers.Vary = "Accept-Encoding";
  }
  headers["Content-Length"] = body.length;
  res.writeHead(status, headers);
  res.end(body);
}

function sendFile(res, file, type) {
  const body = fs.readFileSync(file);
  res.writeHead(200, { "Content-Type": type, "Content-Length": body.length, "Cache-Control": "no-cache" });
  res.end(body);
}

function plainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function onlyKeys(obj, allowed) {
  const extra = Object.keys(obj).filter(k => !allowed.includes(k));
  if (extra.length) throw new HttpError(400, `알 수 없는 필드: ${extra.join(", ")}`);
}

function cleanNote(note) {
  if (note == null) return "";
  if (typeof note !== "string") throw new HttpError(400, "메모(note)는 문자열이어야 합니다");
  if (note.length > MAX_NOTE_CHARS) throw new HttpError(400, `메모는 ${MAX_NOTE_CHARS}자 이하여야 합니다`);
  return note.trim();
}

/**
 * 공식 성취기준·재매핑 결과를 읽어 검토 순서를 만든다.
 * 순서: 검토 큐(파일 순서) → 후보 없는 항목 → 검토 사유 없는 matched → 그 밖의 항목.
 */
export function loadReviewData(paths) {
  const standardsDoc = readJsonFile(paths.standards);
  const remap = readJsonFile(paths.remap);
  const queue = readJsonFile(paths.reviewQueue);
  if (!Array.isArray(standardsDoc.standards) || !Array.isArray(remap.items) || !Array.isArray(queue.items)) {
    throw new HttpError(500, "standards·remap·review 파일 형식이 다릅니다");
  }
  const standards = standardsDoc.standards.map(s => ({
    id: officialKey(s),
    code: s.code,
    subject: s.subject,
    course: s.course ?? null,
    schoolLevel: s.schoolLevel ?? null,
    gradeBand: s.gradeBand ?? null,
    domain: s.domain ?? null,
    text: s.text
  }));
  const byId = new Map(standards.map(s => [s.id, s]));

  const queueByKey = new Map(queue.items.map((q, i) => [itemKey(q.oldCode, q.oldText), { q, i }]));
  const items = remap.items.map(it => {
    const key = itemKey(it.oldCode, it.oldText);
    const inQueue = queueByKey.get(key);
    let group = "other";
    if (inQueue) group = "review-queue";
    else if (!it.candidates?.length) group = "no-candidates";
    else if (it.status === "matched") group = "matched-no-reason";
    return {
      key,
      group,
      queueIndex: inQueue ? inQueue.i : null,
      oldCode: it.oldCode,
      oldText: it.oldText,
      subject: it.subject ?? null,
      grade: it.grade ?? null,
      gradeCluster: it.gradeCluster ?? null,
      oldDomain: it.oldDomain ?? null,
      status: it.status,
      reasons: inQueue?.q.reasons ?? [],
      unmappedReason: it.unmappedReason ?? null,
      matchedId: it.matchedId ?? null,
      candidates: (it.candidates ?? []).map(c => ({ ...(byId.get(c.id) ?? { id: c.id, code: c.code, text: c.text }), score: c.score }))
    };
  });
  const rank = g => (GROUPS.includes(g) ? GROUPS.indexOf(g) : GROUPS.length);
  const original = new Map(items.map((it, i) => [it.key, i]));
  items.sort((a, b) => rank(a.group) - rank(b.group) || (a.queueIndex ?? 0) - (b.queueIndex ?? 0) || original.get(a.key) - original.get(b.key));
  const dup = items.find((it, i) => items.findIndex(x => x.key === it.key) !== i);
  if (dup) throw new HttpError(500, `손작성 항목 키가 겹칩니다: ${dup.key}`);
  return { standards, byId, items, itemsByKey: new Map(items.map(it => [it.key, it])) };
}

function validateDecisionsDoc(doc) {
  if (doc?.schemaVersion !== 1 || !plainObject(doc.decisions)) {
    throw new HttpError(500, "decisions.json 형식이 다릅니다 (schemaVersion 1과 decisions 객체 필요)");
  }
  return doc;
}

function validateManualDoc(doc) {
  if (doc?.schemaVersion !== 1 || !Array.isArray(doc.edges)) {
    throw new HttpError(500, "prerequisites.manual.json 형식이 다릅니다 (schemaVersion 1과 edges 배열 필요)");
  }
  return doc;
}

/**
 * 요청 하나를 처리했으면 true, 이 모듈의 경로가 아니면 false.
 */
export function createReviewHandler(options = {}) {
  const paths = { ...DEFAULT_PATHS, ...options.paths };
  const maxBody = options.maxBodyBytes ?? MAX_BODY_BYTES;
  const now = options.now ?? (() => new Date());
  let data = null;
  const getData = () => (data ??= loadReviewData(paths));
  // 같은 프로세스 안의 저장 요청을 한 줄로 세워 읽기-수정-쓰기가 섞이지 않게 한다.
  let writeChain = Promise.resolve();
  const serialized = fn => {
    const run = writeChain.then(fn, fn);
    writeChain = run.catch(() => {});
    return run;
  };

  async function saveDecision(body) {
    if (!plainObject(body)) throw new HttpError(400, "본문은 JSON 객체여야 합니다");
    onlyKeys(body, ["key", "decision", "officialId", "note"]);
    const { itemsByKey, byId } = getData();
    const item = itemsByKey.get(body.key);
    if (!item) throw new HttpError(400, `없는 손작성 항목입니다: ${body.key}`);
    if (!DECISIONS.includes(body.decision)) throw new HttpError(400, `decision은 ${DECISIONS.join(" | ")} 중 하나여야 합니다`);
    let officialId = null;
    if (body.decision === "accept-candidate") {
      if (!item.candidates.some(c => c.id === body.officialId)) throw new HttpError(400, "선택한 공식 성취기준이 이 항목의 후보가 아닙니다");
      officialId = body.officialId;
    } else if (body.decision === "choose-other") {
      if (!byId.has(body.officialId)) throw new HttpError(400, `standards.json에 없는 공식 성취기준입니다: ${body.officialId}`);
      officialId = body.officialId;
    } else if (body.officialId != null) {
      throw new HttpError(400, "해당 없음·보류에는 공식 성취기준을 지정하지 않습니다");
    }
    const note = cleanNote(body.note);
    return serialized(() => {
      const doc = validateDecisionsDoc(readJsonFile(paths.decisions, emptyDecisions()));
      const entry = { oldCode: item.oldCode, decision: body.decision, officialId, note, decidedAt: seoulTimestamp(now()) };
      doc.decisions[item.key] = entry;
      writeJsonAtomic(paths.decisions, doc);
      return { key: item.key, ...entry };
    });
  }

  async function savePrerequisite(body) {
    if (!plainObject(body)) throw new HttpError(400, "본문은 JSON 객체여야 합니다");
    const { byId } = getData();
    if (body.op === "add") {
      onlyKeys(body, ["op", "from", "to", "strength", "note"]);
      const note = cleanNote(body.note);
      if (!note) throw new HttpError(400, "근거 메모를 적어 주세요");
      return serialized(() => {
        const doc = validateManualDoc(readJsonFile(paths.manual));
        const addedAt = seoulTimestamp(now());
        const edge = { from: body.from, to: body.to, strength: body.strength, evidence: [{ type: "manual", ref: `교사 입력(검토 화면) ${addedAt}`, note }] };
        const problems = [...checkEdge(edge, byId, "새 간선"), ...checkManualEdges([...doc.edges, edge], byId).filter(p => p.rule === "duplicate" || p.rule === "cycle")];
        if (problems.length) throw new HttpError(422, "선수관계 규칙에 맞지 않습니다", { problems: problems.map(p => p.message) });
        doc.edges.push(edge);
        writeJsonAtomic(paths.manual, doc);
        return { edges: doc.edges };
      });
    }
    if (body.op === "delete") {
      onlyKeys(body, ["op", "from", "to"]);
      return serialized(() => {
        const doc = validateManualDoc(readJsonFile(paths.manual));
        const i = doc.edges.findIndex(e => e.from === body.from && e.to === body.to);
        if (i < 0) throw new HttpError(404, "그 간선이 없습니다");
        doc.edges.splice(i, 1);
        writeJsonAtomic(paths.manual, doc);
        return { edges: doc.edges };
      });
    }
    throw new HttpError(400, 'op는 "add" 또는 "delete"여야 합니다');
  }

  return async function handleReview(req, res) {
    const url = new URL(req.url, "http://localhost");
    const p = url.pathname;
    const method = (req.method || "GET").toUpperCase();
    if (!(p === "/review" || p.startsWith("/review/") || p.startsWith("/api/review/"))) return false;
    try {
      if (method === "GET") {
        if (p === "/review") {
          res.writeHead(302, { Location: "/review/" });
          res.end();
          return true;
        }
        if (p === "/review/" || p === "/review/index.html") return sendFile(res, paths.page, "text/html; charset=utf-8"), true;
        if (p === "/review/manual-rules.mjs") return sendFile(res, paths.rules, "text/javascript; charset=utf-8"), true;
        if (p === "/api/review/kr2022/standards") return send(req, res, 200, { standards: getData().standards }), true;
        if (p === "/api/review/kr2022/remap") {
          const decisions = validateDecisionsDoc(readJsonFile(paths.decisions, emptyDecisions())).decisions;
          return send(req, res, 200, { items: getData().items, decisions, canSave: isLocalRequest(req) }), true;
        }
        if (p === "/api/review/kr2022/prerequisites") {
          return send(req, res, 200, { ...validateManualDoc(readJsonFile(paths.manual)), canSave: isLocalRequest(req) }), true;
        }
      }
      if (method === "POST" && (p === "/api/review/kr2022/decisions" || p === "/api/review/kr2022/prerequisites")) {
        if (!isLocalRequest(req)) {
          req.resume();
          throw new HttpError(403, "저장은 이 컴퓨터(localhost)에서 연 화면에서만 할 수 있습니다");
        }
        if (!/^application\/json\b/i.test(req.headers["content-type"] ?? "")) {
          req.resume();
          throw new HttpError(415, "Content-Type은 application/json이어야 합니다");
        }
        const body = await readBody(req, maxBody);
        const result = p.endsWith("/decisions") ? await saveDecision(body) : await savePrerequisite(body);
        return send(req, res, 200, { ok: true, ...result }), true;
      }
      throw new HttpError(404, "없는 검토 경로입니다");
    } catch (err) {
      if (err instanceof HttpError) send(req, res, err.status, { error: err.message, ...err.extra });
      else send(req, res, 500, { error: `서버 오류: ${err.message}` });
      return true;
    }
  };
}

/** K12TaxonomyServer 인스턴스에 검토 라우트를 붙인다. start() 전에 호출한다. */
export function attachReviewRoutes(server, options) {
  const handle = createReviewHandler(options);
  const next = server.handleRequest.bind(server);
  server.handleRequest = async (req, res) => {
    if (await handle(req, res)) return;
    return next(req, res);
  };
  return server;
}
