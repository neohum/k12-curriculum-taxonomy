/**
 * 2022 개정 교육과정 고시 원문 성취기준(data/kr-2022/standards.json) 조회 모듈.
 *
 * - 파일은 처음 쓸 때 한 번만 읽고 캐시한다(형식 검증은 remap.mjs의 loadOfficialStandards).
 * - code는 고유하지 않다(원문에서 12개 코드가 겹친다). 항목을 하나로 집을 때는 id를 쓴다.
 * - 응답 항목은 toApiItem()이 만든다. 원문 그대로인 값은 code·text뿐이고 나머지는
 *   추출 과정에서 붙인 값이다(standards.json의 fieldProvenance 참고).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadOfficialStandards, charNgrams } from "./remap.mjs";

export const DEFAULT_STANDARDS_PATH = fileURLToPath(new URL("../../../data/kr-2022/standards.json", import.meta.url));

/*
 * 태깅 후보 하한. TF-IDF 가중 문자 bigram 코사인 값이다. 무관한 문장("오늘 점심 메뉴는
 * 김치찌개")의 1등이 0.06, 짧은 관련 문장(자석·나침반 실험)의 정답 후보가 0.14~0.19였던
 * 몇 개 표본을 보고 정했다. 정확도를 검증한 값이 아니다.
 */
export const TAG_SCORE_FLOOR = 0.1;
export const TAG_METHOD = "char-bigram-tfidf-cosine";

const cache = new Map();

/**
 * standards.json을 읽어 인덱스를 만든다. 같은 경로는 한 번만 읽는다.
 * @param {string} [filePath]
 */
export function loadOfficial(filePath = DEFAULT_STANDARDS_PATH) {
  const key = path.resolve(filePath);
  if (cache.has(key)) return cache.get(key);

  const doc = loadOfficialStandards(key);
  const standards = doc.standards;
  const byId = new Map();
  const byCode = new Map();
  for (const s of standards) {
    byId.set(s.id, s);
    const list = byCode.get(s.code) || [];
    list.push(s);
    byCode.set(s.code, list);
  }
  const dataset = {
    notice: doc.source?.notice ?? null,
    noticeDate: doc.source?.noticeDate ?? null,
    count: standards.length,
    path: path.relative(path.resolve(fileURLToPath(new URL("../../../", import.meta.url))), key)
  };
  const store = { doc, standards, byId, byCode, dataset, _tfidf: null };
  cache.set(key, store);
  return store;
}

/** 테스트용: 캐시를 비운다. */
export function clearOfficialCache() {
  cache.clear();
}

/** "2국01-01", " [2국01-01] " → "[2국01-01]" */
export function normalizeOfficialCode(code = "") {
  const c = String(code).normalize("NFC").trim();
  if (!c) return "";
  const inner = c.replace(/^\[/, "").replace(/\]$/, "");
  return `[${inner}]`;
}

export function getById(id, store = loadOfficial()) {
  return store.byId.get(String(id || "").trim()) || null;
}

/** 같은 코드를 쓰는 항목이 여럿일 수 있어 항상 배열을 돌려준다. */
export function getByCode(code, store = loadOfficial()) {
  return store.byCode.get(normalizeOfficialCode(code)) || [];
}

/**
 * API 응답 항목. `source`는 데이터 출처 표시("official")이고, 원문 별책·쪽은 `citation`에 있다
 * (standards.json의 `source` 필드와 이름이 겹쳐 옮겼다). `statement`는 기존 손작성 응답과
 * 같은 이름으로 원문 text를 그대로 넣은 하위 호환 필드다.
 */
export function toApiItem(s, store = loadOfficial()) {
  return {
    source: "official",
    official: true,
    id: s.id,
    code: s.code,
    subject: s.subject,
    course: s.course,
    schoolLevel: s.schoolLevel,
    gradeBand: s.gradeBand,
    domain: s.domain,
    text: s.text,
    statement: s.text,
    citation: {
      notice: store.dataset.notice,
      noticeDate: store.dataset.noticeDate,
      book: s.source?.book ?? null,
      page: s.source?.page ?? null
    },
    parseWarning: s.parseWarning,
    codeConflict: s.codeConflict
  };
}

function compact(text) {
  return String(text ?? "").normalize("NFC").toLowerCase().replace(/\s+/g, "");
}

function subjectFilter(subject) {
  if (!subject) return () => true;
  const want = compact(subject);
  return s => compact(s.subject) === want || compact(s.course) === want;
}

function gradeBandFilter(gradeBand) {
  if (!gradeBand) return () => true;
  const want = compact(gradeBand);
  return s => compact(s.gradeBand).includes(want);
}

/**
 * 키워드·코드·교과·학년군 검색.
 *
 * - query가 성취기준 코드 하나면(괄호 생략 가능) 그 코드의 항목을 모두 돌려준다.
 * - 아니면 공백으로 나눈 낱말이 모두 code·subject·course·domain·text 중 어딘가에 들어 있는
 *   항목만 남긴다(공백 무시 부분 문자열). 순위는 문장에 질의 전체가 들어 있는지,
 *   과목명·영역명에 들어 있는지 순이고, 같으면 원문 순서다.
 * - query가 비면 필터만 적용해 원문 순서대로 돌려준다.
 *
 * @returns {{ items: object[], matchedTotal: number }}
 */
export function searchOfficial({
  query = "",
  id = null,
  subject = null,
  schoolLevel = null,
  gradeBand = null,
  limit = 20
} = {}, store = loadOfficial()) {
  const max = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
  if (id) {
    const hit = getById(id, store);
    return { items: hit ? [toApiItem(hit, store)] : [], matchedTotal: hit ? 1 : 0 };
  }

  const level = schoolLevel && schoolLevel !== "ALL" && schoolLevel !== "all" ? schoolLevel : null;
  const bySubject = subjectFilter(subject);
  const byBand = gradeBandFilter(gradeBand);
  const pass = s => (!level || s.schoolLevel === level) && bySubject(s) && byBand(s);

  const q = String(query || "").normalize("NFC").trim();
  let ranked;
  if (!q) {
    ranked = store.standards.filter(pass);
  } else {
    const codeHits = getByCode(q, store);
    if (codeHits.length) {
      ranked = codeHits.filter(pass);
    } else {
      const terms = q.split(/\s+/).map(compact).filter(Boolean);
      const whole = compact(q);
      const scored = [];
      store.standards.forEach((s, order) => {
        if (!pass(s)) return;
        const text = compact(s.text);
        const course = compact(s.course);
        const domain = compact(s.domain);
        const hay = `${compact(s.code)}|${compact(s.subject)}|${course}|${domain}|${text}`;
        if (!terms.every(t => hay.includes(t))) return;
        let score = 0;
        if (text.includes(whole)) score += 4;
        if (course.includes(whole)) score += 2;
        if (domain.includes(whole)) score += 1;
        scored.push({ s, score, order });
      });
      scored.sort((a, b) => b.score - a.score || a.order - b.order);
      ranked = scored.map(x => x.s);
    }
  }
  return {
    items: ranked.slice(0, max).map(s => toApiItem(s, store)),
    matchedTotal: ranked.length
  };
}

function tfidfIndex(store) {
  if (store._tfidf) return store._tfidf;
  const grams = store.standards.map(s => charNgrams(`${s.text} ${s.course}`));
  const df = new Map();
  for (const g of grams) for (const k of g.keys()) df.set(k, (df.get(k) || 0) + 1);
  const n = store.standards.length;
  const idf = k => Math.log((n + 1) / ((df.get(k) || 0) + 1)) + 1;
  const vectorize = g => {
    const v = new Map();
    let norm = 0;
    for (const [k, c] of g) {
      const w = c * idf(k);
      v.set(k, w);
      norm += w * w;
    }
    return { v, norm: Math.sqrt(norm) };
  };
  store._tfidf = { vectors: grams.map(vectorize), vectorize };
  return store._tfidf;
}

function cosineWeighted(a, b) {
  if (!a.norm || !b.norm) return 0;
  let dot = 0;
  const [small, large] = a.v.size <= b.v.size ? [a, b] : [b, a];
  for (const [k, w] of small.v) {
    const x = large.v.get(k);
    if (x) dot += w * x;
  }
  return dot / (a.norm * b.norm);
}

/** 괄호를 뺀 코드도 받되, "[12국01-01]" 안의 "2국01-01"처럼 앞뒤가 숫자로 이어지면 아니다. */
function mentionsCode(text, code) {
  if (text.includes(code)) return true;
  const bare = code.slice(1, -1);
  let at = text.indexOf(bare);
  while (at !== -1) {
    const before = text[at - 1] ?? "";
    const after = text[at + bare.length] ?? "";
    if (!/[0-9]/.test(before) && !/[0-9]/.test(after)) return true;
    at = text.indexOf(bare, at + 1);
  }
  return false;
}

/**
 * 교재·활동지 텍스트에 공식 성취기준을 붙인다.
 *
 * 1. 텍스트에 원문 코드가 그대로(괄호 포함 또는 생략) 적혀 있으면 그 항목을 맨 앞에 둔다.
 * 2. 나머지는 원문 문장+과목명과의 TF-IDF 문자 bigram 코사인으로 순위를 매기고
 *    TAG_SCORE_FLOOR 미만은 버린다.
 *
 * @returns {Array<object>} toApiItem 형태 + { score, confidence, explicitCode, method }
 */
export function tagOfficial(text, { subject = null, limit = 10 } = {}, store = loadOfficial()) {
  const clean = String(text || "").normalize("NFC");
  if (!clean.trim()) return [];
  const bySubject = subjectFilter(subject);
  const { vectors, vectorize } = tfidfIndex(store);
  const query = vectorize(charNgrams(clean));

  const results = [];
  store.standards.forEach((s, i) => {
    if (!bySubject(s)) return;
    const explicitCode = mentionsCode(clean, s.code);
    const score = cosineWeighted(query, vectors[i]);
    if (!explicitCode && score < TAG_SCORE_FLOOR) return;
    results.push({ s, score, explicitCode });
  });
  results.sort((a, b) => Number(b.explicitCode) - Number(a.explicitCode) || b.score - a.score);
  return results.slice(0, limit).map(({ s, score, explicitCode }) => ({
    ...toApiItem(s, store),
    score: Math.round(score * 10000) / 10000,
    confidence: explicitCode ? 100 : Math.min(100, Math.round(score * 100)),
    explicitCode,
    method: explicitCode ? "explicit-code" : TAG_METHOD
  }));
}
