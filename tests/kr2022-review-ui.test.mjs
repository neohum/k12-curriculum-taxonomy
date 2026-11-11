import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkEdge, checkManualEdges, gradeRank } from "../src/core/kr2022/manual-rules.mjs";
import { validateManual } from "../src/core/kr2022/prerequisites.mjs";
import { createReviewHandler, isLocalRequest, itemKey, seoulTimestamp } from "../src/server/review-routes.mjs";
import { K12TaxonomyServer } from "../src/server/K12TaxonomyServer.mjs";
import { attachReviewRoutes } from "../src/server/review-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const KEYS = new Set(["b8:[2수01-01]", "b8:[2수01-02]", "b8:[4수01-01]", "b8:[6수01-01]", "b8:[9수01-01]", "b8:[10공수1-01-01]", "b8:[12미적01-01]"]);
const edge = (from, to, strength = "hard") => ({ from, to, strength, evidence: [{ type: "manual", ref: "test", note: "" }] });
const rules = problems => problems.map(p => p.rule);

// ---------------------------------------------------------------------------
// 검증 규칙
// ---------------------------------------------------------------------------

test("학년군 순서는 코드 숫자 2,4,6,9,10,12로 정한다", () => {
  assert.deepEqual(["b8:[2수01-01]", "[4수01-01]", "[6수01-01]", "b8:[9수01-01]", "b8:[10공수1-01-01]", "b8:[12미적01-01]"].map(gradeRank), [0, 1, 2, 3, 4, 5]);
  assert.equal(gradeRank("b8:[3수01-01]"), null);
});

test("학년 역전: from이 to보다 뒤 학년군이면 거부, 같은 학년군·앞 학년군은 허용", () => {
  assert.deepEqual(rules(checkEdge(edge("b8:[9수01-01]", "b8:[4수01-01]"), KEYS)), ["grade-reversal"]);
  assert.deepEqual(rules(checkEdge(edge("b8:[12미적01-01]", "b8:[10공수1-01-01]"), KEYS)), ["grade-reversal"]);
  assert.deepEqual(checkEdge(edge("b8:[2수01-01]", "b8:[2수01-02]"), KEYS), []);
  assert.deepEqual(checkEdge(edge("b8:[6수01-01]", "b8:[9수01-01]"), KEYS), []);
  assert.throws(() => validateManual({ schemaVersion: 1, edges: [edge("b8:[9수01-01]", "b8:[4수01-01]")] }, KEYS), /학년 역전/);
});

test("순환: 수동 간선끼리 순환이 생기면 거부", () => {
  const edges = [edge("b8:[2수01-01]", "b8:[2수01-02]"), edge("b8:[2수01-02]", "b8:[2수01-01]")];
  assert.ok(rules(checkManualEdges(edges, KEYS)).includes("cycle"));
  assert.throws(() => validateManual({ schemaVersion: 1, edges }, KEYS), /순환/);
  assert.equal(validateManual({ schemaVersion: 1, edges: [edges[0], edge("b8:[2수01-02]", "b8:[4수01-01]")] }, KEYS).length, 2);
});

test("자기 간선·존재하지 않는 id·중복 간선 거부", () => {
  assert.ok(rules(checkEdge(edge("b8:[2수01-01]", "b8:[2수01-01]"), KEYS)).includes("self-loop"));
  assert.throws(() => validateManual({ schemaVersion: 1, edges: [edge("b8:[2수01-01]", "b8:[2수01-01]")] }, KEYS), /자기 자신/);
  assert.deepEqual(rules(checkEdge(edge("b8:[2수01-01]", "b8:[4없음01-01]"), KEYS)), ["unknown-id"]);
  assert.throws(() => validateManual({ schemaVersion: 1, edges: [edge("[2수01-01]", "b8:[4수01-01]")] }, KEYS), /공식 코드가 아님/);
  assert.ok(rules(checkManualEdges([edge("b8:[2수01-01]", "b8:[4수01-01]"), edge("b8:[2수01-01]", "b8:[4수01-01]")], KEYS)).includes("duplicate"));
});

test("build-prerequisites: 규칙 위반 수동 간선이면 종료 코드 3, 출력 파일을 쓰지 않는다", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kr2022-manual-"));
  const manual = path.join(dir, "manual.json");
  const out = path.join(dir, "out.json");
  fs.writeFileSync(manual, JSON.stringify({ schemaVersion: 1, edges: [edge("b8:[9수01-01]", "b8:[2수01-01]")] }));
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts/kr2022/build-prerequisites.mjs"), "--manual", manual, "--out", out], { encoding: "utf8" });
  assert.equal(r.status, 3, r.stderr);
  assert.match(r.stderr, /학년 역전/);
  assert.equal(fs.existsSync(out), false);
});

// ---------------------------------------------------------------------------
// 라우트
// ---------------------------------------------------------------------------

test("itemKey는 같은 문장이면 공백·문장부호가 달라도 같고, 시각은 +09:00", () => {
  assert.equal(itemKey("[2수01-01]", "수를 센다."), itemKey("[2수01-01]", " 수를  센다 "));
  assert.notEqual(itemKey("[2수01-01]", "수를 센다."), itemKey("[2수01-02]", "수를 센다."));
  assert.equal(seoulTimestamp(new Date("2026-11-12T05:03:04.567Z")), "2026-11-12T14:03:04+09:00");
});

test("isLocalRequest: 접속 주소·Host·Origin이 모두 이 컴퓨터여야 한다", () => {
  const req = (remoteAddress, host, origin) => ({ socket: { remoteAddress }, headers: { host, ...(origin ? { origin } : {}) } });
  assert.equal(isLocalRequest(req("127.0.0.1", "localhost:3000")), true);
  assert.equal(isLocalRequest(req("::1", "[::1]:3000")), true);
  assert.equal(isLocalRequest(req("::ffff:127.0.0.1", "127.0.0.1:3000", "http://localhost:3000")), true);
  assert.equal(isLocalRequest(req("192.168.0.20", "localhost:3000")), false);
  assert.equal(isLocalRequest(req("127.0.0.1", "192.168.0.10:3000")), false);
  assert.equal(isLocalRequest(req("127.0.0.1", "localhost:3000", "http://evil.example")), false);
  assert.equal(isLocalRequest(req("127.0.0.1", undefined)), false);
});

function tempPaths() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kr2022-review-"));
  const decisions = path.join(dir, "decisions.json");
  const manual = path.join(dir, "manual.json");
  fs.copyFileSync(path.join(ROOT, "review/kr2022-remap/decisions.json"), decisions);
  fs.copyFileSync(path.join(ROOT, "data/kr-2022/prerequisites.manual.json"), manual);
  return { dir, decisions, manual };
}

async function withServer(fn) {
  const paths = tempPaths();
  const server = new K12TaxonomyServer({ port: 0, host: "127.0.0.1" });
  attachReviewRoutes(server, { paths: { decisions: paths.decisions, manual: paths.manual } });
  const { port } = await server.start();
  try {
    await fn(`http://127.0.0.1:${port}`, paths);
  } finally {
    // fetch의 keep-alive 연결이 닫힌 서버에 남아 다음 테스트 요청이 끊기지 않게 한다.
    server.server.closeAllConnections();
    await server.stop();
    await new Promise(r => setTimeout(r, 50));
    fs.rmSync(paths.dir, { recursive: true, force: true });
  }
}

const post = (url, body, headers = {}) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) })
  .catch(e => { throw new Error(`요청 실패: ${String(typeof body === "string" ? body : JSON.stringify(body)).slice(0, 80)} (${e.cause?.message ?? e.message})`); });

test("커밋된 decisions.json·prerequisites.manual.json은 비어 있다", () => {
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(ROOT, "review/kr2022-remap/decisions.json"), "utf8")).decisions, {});
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(ROOT, "data/kr-2022/prerequisites.manual.json"), "utf8")).edges, []);
});

test("GET: 검토 순서(큐 → 후보 없음 → 사유 없는 matched)와 화면·규칙 파일", async () => {
  await withServer(async base => {
    const page = await fetch(`${base}/review/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /<html lang="ko">/);
    const js = await fetch(`${base}/review/manual-rules.mjs`);
    assert.match(js.headers.get("content-type"), /javascript/);

    const remap = await (await fetch(`${base}/api/review/kr2022/remap`)).json();
    const queue = JSON.parse(fs.readFileSync(path.join(ROOT, "review/kr2022-remap/handwritten-remap.review.json"), "utf8")).items;
    const all = JSON.parse(fs.readFileSync(path.join(ROOT, "review/kr2022-remap/handwritten-remap.json"), "utf8")).items;
    assert.equal(remap.items.length, all.length);
    assert.equal(new Set(remap.items.map(i => i.key)).size, all.length);
    const groups = remap.items.map(i => i.group);
    const nQueue = queue.length;
    const nNone = all.filter(i => !i.candidates.length).length;
    assert.ok(groups.slice(0, nQueue).every(g => g === "review-queue"));
    assert.deepEqual(remap.items.slice(0, nQueue).map(i => i.oldCode), queue.map(q => q.oldCode));
    assert.ok(groups.slice(nQueue, nQueue + nNone).every(g => g === "no-candidates"));
    assert.ok(groups.slice(nQueue + nNone).every(g => g === "matched-no-reason"));
    assert.equal(remap.canSave, true);

    const stds = await (await fetch(`${base}/api/review/kr2022/standards`, { headers: { "Accept-Encoding": "gzip" } })).json();
    assert.equal(stds.standards.length, 4296);
  });
});

test("POST decisions: 저장 후 다시 읽으면 남아 있고, 형식이 틀리면 거부", async () => {
  await withServer(async (base, paths) => {
    const { items } = await (await fetch(`${base}/api/review/kr2022/remap`)).json();
    const withCand = items.find(i => i.candidates.length);
    let r = await post(`${base}/api/review/kr2022/decisions`, { key: withCand.key, decision: "accept-candidate", officialId: withCand.candidates[0].id, note: "  검토함 " });
    assert.equal(r.status, 200);
    const saved = await r.json();
    assert.match(saved.decidedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);

    r = await post(`${base}/api/review/kr2022/decisions`, { key: items[1].key, decision: "discard", officialId: null });
    assert.equal(r.status, 200);
    r = await post(`${base}/api/review/kr2022/decisions`, { key: items[2].key, decision: "choose-other", officialId: "b8:[2수01-01]", note: "" });
    assert.equal(r.status, 200);

    const again = await (await fetch(`${base}/api/review/kr2022/remap`)).json();
    assert.deepEqual(Object.keys(again.decisions).sort(), [withCand.key, items[1].key, items[2].key].sort());
    assert.equal(again.decisions[withCand.key].note, "검토함");
    assert.equal(again.decisions[withCand.key].officialId, withCand.candidates[0].id);
    const onDisk = JSON.parse(fs.readFileSync(paths.decisions, "utf8"));
    assert.equal(onDisk.decisions[items[1].key].decision, "discard");
    assert.deepEqual(fs.readdirSync(paths.dir).filter(f => f.includes(".tmp-")), []);

    for (const [body, status] of [
      [{ key: "없는키", decision: "defer" }, 400],
      [{ key: withCand.key, decision: "maybe" }, 400],
      [{ key: withCand.key, decision: "accept-candidate", officialId: "b8:[2수01-01]" }, 400],
      [{ key: withCand.key, decision: "choose-other", officialId: "b99:[없음]" }, 400],
      [{ key: withCand.key, decision: "defer", officialId: "b8:[2수01-01]" }, 400],
      [{ key: withCand.key, decision: "defer", extra: 1 }, 400],
      [{ key: withCand.key, decision: "defer", note: "가".repeat(2001) }, 400],
      ["{not json", 400]
    ]) {
      const res = await post(`${base}/api/review/kr2022/decisions`, body);
      assert.equal(res.status, status, JSON.stringify(body).slice(0, 80));
    }
    const noType = await fetch(`${base}/api/review/kr2022/decisions`, { method: "POST", body: "{}" }).catch(e => { throw new Error(`415 요청 실패 ${e.cause?.message}`); });
    assert.equal(noType.status, 415);
  });
});

test("POST: 본문 크기 상한을 넘으면 413, 파일은 그대로", async () => {
  await withServer(async (base, paths) => {
    const before = fs.readFileSync(paths.decisions, "utf8");
    const r = await post(`${base}/api/review/kr2022/decisions`, { key: "x", decision: "defer", note: "가".repeat(20000) });
    assert.equal(r.status, 413);
    assert.equal(fs.readFileSync(paths.decisions, "utf8"), before);
  });
});

test("POST: 로컬이 아닌 Host·Origin이면 403, GET은 읽기 전용으로 표시", async () => {
  await withServer(async (base, paths) => {
    const before = fs.readFileSync(paths.manual, "utf8");
    const r1 = await post(`${base}/api/review/kr2022/prerequisites`, { op: "add", from: "b8:[2수01-01]", to: "b8:[4수01-01]", strength: "hard", note: "x" }, { Origin: "http://evil.example" });
    assert.equal(r1.status, 403);
    // fetch는 Host 헤더를 바꿀 수 없어 http.request로 보낸다.
    const raw = (method, body) => new Promise((resolve, reject) => {
      const u = new URL(`${base}/api/review/kr2022/prerequisites`);
      const req = http.request({ host: u.hostname, port: u.port, path: u.pathname, method, agent: false, headers: { Host: "school-server.local:3000", "Content-Type": "application/json" } }, res => {
        let text = "";
        res.on("data", c => { text += c; });
        res.on("end", () => resolve({ status: res.statusCode, json: JSON.parse(text) }));
      });
      req.on("error", reject);
      req.end(body);
    });
    assert.equal((await raw("GET")).json.canSave, false);
    assert.equal((await raw("POST", JSON.stringify({ op: "add", from: "b8:[2수01-01]", to: "b8:[4수01-01]", strength: "hard", note: "x" }))).status, 403);
    assert.equal(fs.readFileSync(paths.manual, "utf8"), before);
  });
});

test("POST: 다른 기기(remoteAddress)에서 온 요청은 403", async () => {
  const paths = tempPaths();
  try {
    const handle = createReviewHandler({ paths: { decisions: paths.decisions, manual: paths.manual } });
    const req = Readable.from([Buffer.from("{}")]);
    Object.assign(req, { method: "POST", url: "/api/review/kr2022/decisions", headers: { host: "localhost:3000", "content-type": "application/json" }, socket: { remoteAddress: "192.168.0.31" } });
    let status;
    let body = "";
    const res = { writeHead: s => { status = s; }, end: b => { body += b ?? ""; } };
    assert.equal(await handle(req, res), true);
    assert.equal(status, 403);
    assert.match(body, /localhost/);
  } finally {
    fs.rmSync(paths.dir, { recursive: true, force: true });
  }
});

test("POST prerequisites: 추가·삭제·재로딩, 규칙 위반은 422와 한국어 사유", async () => {
  await withServer(async (base, paths) => {
    const url = `${base}/api/review/kr2022/prerequisites`;
    let r = await post(url, { op: "add", from: "b8:[2수01-01]", to: "b8:[4수01-01]", strength: "hard", note: "자릿값 → 덧셈" });
    assert.equal(r.status, 200);
    r = await post(url, { op: "add", from: "b8:[4수01-01]", to: "b8:[6수01-01]", strength: "soft", note: "근거" });
    assert.equal(r.status, 200);

    const cases = [
      [{ op: "add", from: "b8:[9수01-01]", to: "b8:[4수01-01]", strength: "hard", note: "x" }, /학년 역전/],
      [{ op: "add", from: "b8:[2수01-01]", to: "b8:[2수01-01]", strength: "hard", note: "x" }, /자기 자신/],
      [{ op: "add", from: "b8:[2수01-01]", to: "b0:[없음]", strength: "hard", note: "x" }, /공식 코드가 아님/],
      [{ op: "add", from: "b8:[2수01-01]", to: "b8:[4수01-01]", strength: "soft", note: "x" }, /같은 간선/]
    ];
    for (const [body, re] of cases) {
      const res = await post(url, body);
      assert.equal(res.status, 422);
      assert.match((await res.json()).problems.join("\n"), re);
    }
    // 같은 학년군 안의 순환
    assert.equal((await post(url, { op: "add", from: "b8:[2수01-01]", to: "b8:[2수01-02]", strength: "hard", note: "x" })).status, 200);
    const cyc = await post(url, { op: "add", from: "b8:[2수01-02]", to: "b8:[2수01-01]", strength: "hard", note: "x" });
    assert.equal(cyc.status, 422);
    assert.match((await cyc.json()).problems.join("\n"), /순환/);
    assert.equal((await post(url, { op: "add", from: "b8:[2수01-01]", to: "b8:[6수01-01]", strength: "hard", note: "" })).status, 400);
    assert.equal((await post(url, { op: "add", from: "b8:[2수01-01]", to: "b8:[6수01-01]", strength: "firm", note: "x" })).status, 422);

    let doc = await (await fetch(url)).json();
    assert.equal(doc.edges.length, 3);
    assert.equal(doc.edges[0].evidence[0].type, "manual");
    assert.equal(doc.edges[0].evidence[0].note, "자릿값 → 덧셈");
    validateManual(JSON.parse(fs.readFileSync(paths.manual, "utf8")), new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "data/kr-2022/standards.json"), "utf8")).standards.map(s => s.id)));

    assert.equal((await post(url, { op: "delete", from: "b8:[4수01-01]", to: "b8:[6수01-01]" })).status, 200);
    assert.equal((await post(url, { op: "delete", from: "b8:[4수01-01]", to: "b8:[6수01-01]" })).status, 404);
    doc = await (await fetch(url)).json();
    assert.deepEqual(doc.edges.map(e => e.to), ["b8:[4수01-01]", "b8:[2수01-02]"]);
  });
});
