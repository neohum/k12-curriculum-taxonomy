/**
 * 손작성 성취기준 → 2022 개정 교육과정 공식 성취기준 재매핑 (순수 로직, 무의존성)
 *
 * 이 저장소의 기존 한국 성취기준은 고시 원문이 아니라 손으로 쓴 의역이고 코드 형식도
 * 틀리다(`[1수01-02]` 등). 공식 standards.json이 들어오면 손작성 항목마다 공식 후보를
 * 문장 유사도로 찾아 붙이고, 우리가 덧붙인 정보(오개념·교구·피아제 단계·키워드·Marble
 * 매핑)는 `addedByUs`로 분리 보존한다.
 */

import fs from "node:fs";

/*
 * 임계값 — 실제 공식 데이터를 보기 전에 정한 값이다. 실제 데이터에 맞춰 조정하지 않는다.
 *
 * 지표는 공백·문장부호를 지우고 끝의 "(할) 수 있다"를 떼어 낸 문자 bigram 빈도 벡터의
 * 코사인 유사도(0~1)다. 정한 근거:
 *
 * - MATCH_THRESHOLD 0.5: 손작성 문장은 원문의 핵심 명사구(예: "자릿값", "두 자리 수")를
 *   그대로 옮겨 적고 조건·예시만 바꾼 의역이 대부분이다. 핵심 명사구를 공유하면 bigram의
 *   절반 이상이 겹치는 반면, 같은 교과·학년군 안의 무관한 두 문장이 공유하는 것은
 *   "이해", "하고" 같은 기능적 bigram 몇 개뿐이다. 코사인 0.5는 "절반이 겹친다"는
 *   직관에 맞춘 중간값이며 정밀하게 보정된 값이 아니다.
 * - CANDIDATE_FLOOR 0.2: 이보다 낮은 후보는 기능적 bigram 우연 일치 수준이라 사람에게
 *   보여 줘도 판단에 도움이 되지 않는다. 후보 목록 표시용이며 판정에는 쓰지 않는다.
 * - AMBIGUITY_MARGIN 0.1: 1등과 2등의 차가 척도 전체의 10% 미만이면, 같은 영역의
 *   이웃 성취기준(같은 명사구를 공유하는 01·02 항목)과 구별할 근거가 약하다고 본다.
 * - REVIEW_SCORE_BELOW 0.75 / REVIEW_MARGIN_BELOW 0.2: matched라도 점수가 매칭 하한에
 *   가깝거나(0.5~0.75) 2등과의 차가 모호 기준의 두 배 미만이면 사람 검토 목록에 넣는다.
 *
 * 이 값들은 검증된 정확도를 뜻하지 않는다. 그래서 matched에도 검토 큐를 따로 내보낸다.
 * 값을 바꿀 때는 바꾼 이유와 근거가 된 검토 결과를 커밋 본문에 남긴다.
 */
export const MATCH_THRESHOLD = 0.5;
export const CANDIDATE_FLOOR = 0.2;
export const AMBIGUITY_MARGIN = 0.1;
export const REVIEW_SCORE_BELOW = 0.75;
export const REVIEW_MARGIN_BELOW = 0.2;
export const MAX_CANDIDATES = 3;
export const METHOD = "char-bigram-cosine";

/** 손작성 항목에서 원문과 대조되는 식별 필드. 나머지는 모두 addedByUs로 간다. */
const IDENTITY_FIELDS = new Set([
  "code", "subject", "schoolLevel", "gradeCluster", "grade", "domain", "statement"
]);

export class StandardsFileError extends Error {}

/**
 * 공식 standards.json을 읽고 최소 형식을 검증한다. 파일이 없거나 형식이 틀리면
 * StandardsFileError로 멈춘다 — 빈 목록으로 조용히 진행하면 전부 unmapped가 되어
 * 잘못된 산출물이 생기기 때문이다.
 */
export function loadOfficialStandards(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new StandardsFileError(
      `공식 성취기준 파일이 없습니다: ${filePath}\n` +
      "data/kr-2022/standards.json(고시 원문 추출본)이 생성된 뒤에 실행하세요."
    );
  }
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    throw new StandardsFileError(`공식 성취기준 파일을 JSON으로 읽을 수 없습니다: ${filePath} (${err.message})`);
  }
  if (doc?.schemaVersion !== 1 || !Array.isArray(doc.standards)) {
    throw new StandardsFileError(
      `공식 성취기준 파일 형식이 다릅니다: ${filePath} (schemaVersion 1과 standards 배열이 필요)`
    );
  }
  const bad = doc.standards.filter(s => !s || typeof s.code !== "string" || typeof s.text !== "string" || !s.subject);
  if (bad.length) {
    throw new StandardsFileError(
      `공식 성취기준 ${bad.length}건에 code/subject/text가 없습니다: ${filePath}`
    );
  }
  const ids = doc.standards.map(officialKey);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupIds.length) {
    throw new StandardsFileError(
      `공식 성취기준 식별자(id, 없으면 code)가 중복됩니다: ${[...new Set(dupIds)].slice(0, 5).join(", ")} (${filePath})`
    );
  }
  if (doc.standards.length === 0) {
    throw new StandardsFileError(`공식 성취기준 파일에 항목이 없습니다: ${filePath}`);
  }
  return doc;
}

// ---------------------------------------------------------------------------
// 정규화 · 유사도
// ---------------------------------------------------------------------------

export function normalizeText(text = "") {
  return String(text)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "")
    // 거의 모든 성취기준이 "~할 수 있다"로 끝나서 무관한 문장끼리도 점수를 올린다.
    .replace(/(할|을|를)?수있다$/u, "");
}

export function charNgrams(text, n = 2) {
  const s = normalizeText(text);
  const grams = new Map();
  for (let i = 0; i + n <= s.length; i++) {
    const g = s.slice(i, i + n);
    grams.set(g, (grams.get(g) || 0) + 1);
  }
  return grams;
}

export function cosine(a, b) {
  if (!a.size || !b.size) return 0;
  let dot = 0;
  for (const [g, v] of a) {
    const w = b.get(g);
    if (w) dot += v * w;
  }
  let na = 0;
  let nb = 0;
  for (const v of a.values()) na += v * v;
  for (const v of b.values()) nb += v * v;
  return dot / Math.sqrt(na * nb);
}

export function textSimilarity(a, b) {
  return cosine(charNgrams(a), charNgrams(b));
}

// ---------------------------------------------------------------------------
// 교과 · 학년군 필터
// ---------------------------------------------------------------------------

/** "실과(컴퓨팅)" → "실과", 공백 제거. 별칭 표는 두지 않는다(맞지 않으면 unmapped로 드러낸다). */
export function normalizeSubject(subject = "") {
  return String(subject).normalize("NFC").replace(/\(.*?\)/g, "").replace(/\s+/g, "");
}

/**
 * 학년군 키: 초등은 "ES:1-2"처럼 범위까지, 중·고는 학교급만.
 * 근거 필드가 없으면 null(필터를 통과할 수 없음).
 */
export function bandKey({ schoolLevel, gradeBand, gradeCluster, grade } = {}) {
  const label = String(gradeBand || gradeCluster || "");
  const level = schoolLevel
    || (/초등/.test(label) || /^초/.test(grade || "") ? "ES"
      : /중학/.test(label) || /^중/.test(grade || "") ? "MS"
        : /고등/.test(label) || /^고/.test(grade || "") ? "HS" : null);
  if (!level) return null;
  if (level !== "ES") return level;
  const range = label.match(/(\d)\s*~\s*(\d)/);
  if (range) return `ES:${range[1]}-${range[2]}`;
  const g = String(grade || "").match(/^초(\d)/);
  if (g) {
    const n = Number(g[1]);
    const lo = n % 2 === 1 ? n : n - 1;
    return `ES:${lo}-${lo + 1}`;
  }
  return null;
}

/**
 * 공식 성취기준의 고유 식별자. 원문에는 서로 다른 과목이 같은 코드를 쓰는 경우가 있어
 * (예: [12심독01-01]이 영어와 독일어에 모두 있음) code는 고유하지 않다. id가 있으면 id를 쓴다.
 */
export function officialKey(std) {
  return std.id ?? std.code;
}

export function officialBandKey(std) {
  return bandKey({ schoolLevel: std.schoolLevel, gradeBand: std.gradeBand });
}

function subjectMatches(handwritten, official) {
  const h = normalizeSubject(handwritten.subject);
  return h !== "" && (h === normalizeSubject(official.subject) || h === normalizeSubject(official.course));
}

// ---------------------------------------------------------------------------
// 손작성 항목 정리
// ---------------------------------------------------------------------------

/**
 * 여러 출처의 손작성 항목을 (코드, 문장) 기준으로 합친다. 같은 코드라도 문장이 다르면
 * 별개 항목이다(재매핑은 문장으로 하기 때문). 출처는 sources에 모두 남긴다.
 */
export function mergeHandwritten(sourceLists) {
  const byKey = new Map();
  for (const { source, standards } of sourceLists) {
    for (const s of standards) {
      if (!s || typeof s.code !== "string" || typeof s.statement !== "string") continue;
      const key = `${s.code}\u0000${normalizeText(s.statement)}`;
      const added = splitAddedByUs(s);
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, {
          oldCode: s.code,
          subject: s.subject ?? null,
          schoolLevel: s.schoolLevel ?? null,
          gradeCluster: s.gradeCluster ?? null,
          grade: s.grade ?? null,
          oldDomain: s.domain ?? null,
          oldText: s.statement,
          sources: [source],
          addedByUs: added
        });
        continue;
      }
      if (!prev.sources.includes(source)) prev.sources.push(source);
      for (const f of ["subject", "schoolLevel", "gradeCluster", "grade", "oldDomain"]) {
        const v = f === "oldDomain" ? s.domain : s[f];
        if (prev[f] == null && v != null) prev[f] = v;
      }
      mergeAddedByUs(prev.addedByUs, added);
    }
  }
  return [...byKey.values()];
}

function splitAddedByUs(s) {
  const out = {};
  for (const [k, v] of Object.entries(s)) {
    if (IDENTITY_FIELDS.has(k) || v == null) continue;
    out[k] = Array.isArray(v) ? [...v] : v;
  }
  return out;
}

function mergeAddedByUs(target, extra) {
  for (const [k, v] of Object.entries(extra)) {
    if (!(k in target)) {
      target[k] = v;
    } else if (Array.isArray(target[k]) && Array.isArray(v)) {
      for (const x of v) if (!target[k].includes(x)) target[k].push(x);
    } else if (JSON.stringify(target[k]) !== JSON.stringify(v)) {
      target.conflicts ??= {};
      target.conflicts[k] ??= [];
      target.conflicts[k].push(v);
    }
  }
}

// ---------------------------------------------------------------------------
// 매칭
// ---------------------------------------------------------------------------

export function rankCandidates(item, officialStandards) {
  const band = bandKey({
    schoolLevel: item.schoolLevel, gradeCluster: item.gradeCluster, grade: item.grade
  });
  const pool = officialStandards.filter(o => subjectMatches(item, o) && band && officialBandKey(o) === band);
  const query = charNgrams(item.oldText);
  const scored = pool
    .map(o => ({ id: officialKey(o), code: o.code, text: o.text, score: round(cosine(query, charNgrams(o.text))), method: METHOD }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return { band, poolSize: pool.length, scored };
}

export function classify(scored) {
  const top = scored[0]?.score ?? 0;
  const second = scored[1]?.score ?? 0;
  if (top < MATCH_THRESHOLD) return "unmapped";
  if (top - second < AMBIGUITY_MARGIN) return "ambiguous";
  return "matched";
}

export function remapOne(item, officialStandards) {
  const { band, poolSize, scored } = rankCandidates(item, officialStandards);
  const status = classify(scored);
  const candidates = scored.filter(c => c.score >= CANDIDATE_FLOOR).slice(0, MAX_CANDIDATES);
  const out = {
    oldCode: item.oldCode,
    subject: item.subject,
    grade: item.grade ?? item.gradeCluster ?? null,
    gradeCluster: item.gradeCluster,
    oldDomain: item.oldDomain,
    oldText: item.oldText,
    band,
    candidates,
    status,
    matchedCode: status === "matched" ? scored[0].code : null,
    matchedId: status === "matched" ? scored[0].id : null,
    sources: item.sources,
    addedByUs: item.addedByUs
  };
  if (poolSize === 0) {
    out.unmappedReason = band ? "no-official-standard-with-same-subject-and-band" : "unknown-grade-band";
  } else if (status === "unmapped") {
    out.unmappedReason = "below-match-threshold";
  }
  return out;
}

export function remapAll(handwrittenItems, officialStandards) {
  const items = handwrittenItems.map(h => remapOne(h, officialStandards));
  const stats = { total: items.length, matched: 0, ambiguous: 0, unmapped: 0 };
  for (const it of items) stats[it.status]++;
  return { items, stats, reviewQueue: buildReviewQueue(items) };
}

/**
 * 사람 검토 목록. ambiguous 전부, 그리고 matched 중 근거가 약한 것.
 * unmapped라도 하한 이상 후보가 있으면(near-miss) 넣는다.
 */
export function buildReviewQueue(items) {
  const targetCount = new Map();
  for (const it of items) {
    const target = it.matchedId ?? it.matchedCode;
    if (target) targetCount.set(target, (targetCount.get(target) || 0) + 1);
  }
  const queue = [];
  for (const it of items) {
    const reasons = [];
    const top = it.candidates[0];
    const margin = top ? round(top.score - (it.candidates[1]?.score ?? 0)) : null;
    if (it.status === "ambiguous") reasons.push("top-two-within-margin");
    if (it.status === "matched") {
      if (top.score < REVIEW_SCORE_BELOW) reasons.push("low-score");
      if (margin < REVIEW_MARGIN_BELOW) reasons.push("narrow-margin");
      if (targetCount.get(it.matchedId ?? it.matchedCode) > 1) reasons.push("shared-target");
    }
    if (it.status === "unmapped" && top) reasons.push("near-miss");
    if (!reasons.length) continue;
    queue.push({
      oldCode: it.oldCode,
      oldText: it.oldText,
      status: it.status,
      priority: it.status === "matched" ? "normal" : "high",
      reasons,
      topCandidate: top ?? null,
      margin,
      candidates: it.candidates
    });
  }
  const rank = { high: 0, normal: 1 };
  return queue.sort((a, b) => rank[a.priority] - rank[b.priority] || a.oldCode.localeCompare(b.oldCode));
}

function round(x) {
  return Math.round(x * 10000) / 10000;
}
