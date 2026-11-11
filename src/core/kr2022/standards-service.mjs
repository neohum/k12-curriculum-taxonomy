/**
 * 성취기준 검색·콘텐츠 태깅 (HTTP 서버와 SDK in-process 모드가 함께 쓴다).
 *
 * 기본은 고시 원문(source "official"). source "handwritten"은 예전 손작성 데이터를
 * 그대로 돌려주되 모든 항목에 official:false와 경고를 붙인다.
 */

import { K12_TERMINOLOGY_DICTIONARY } from "../taxonomy/Korea2022K12CurriculumAdapter.mjs";
import { loadOfficial, searchOfficial, tagOfficial } from "./official.mjs";
import {
  DEFAULT_DECISIONS_PATH,
  HANDWRITTEN_WARNING,
  handwrittenBasis,
  handwrittenCodesFor,
  loadConfirmedLinks,
  officialLinksFor
} from "./handwritten-links.mjs";

export const SOURCES = Object.freeze(["official", "handwritten"]);

export class UnknownSourceError extends Error {}

export function resolveSource(source) {
  const s = source == null || source === "" ? "official" : String(source).trim().toLowerCase();
  if (!SOURCES.includes(s)) {
    throw new UnknownSourceError(`source는 ${SOURCES.join(" 또는 ")}만 쓸 수 있습니다: '${source}'`);
  }
  return s;
}

function markHandwritten(std, linkState) {
  return {
    ...std,
    source: "handwritten",
    official: false,
    warning: HANDWRITTEN_WARNING,
    officialLinks: officialLinksFor(std.code, linkState)
  };
}

/**
 * @param {object} params { query, id, subject, schoolLevel, gradeBand, limit, source }
 * @param {object} deps { adapter, decisionsPath }
 */
export function searchStandards(params = {}, { adapter, decisionsPath = DEFAULT_DECISIONS_PATH } = {}) {
  const source = resolveSource(params.source);
  const limit = Number.isFinite(params.limit) && params.limit > 0 ? params.limit : 20;

  if (source === "handwritten") {
    const linkState = loadConfirmedLinks(decisionsPath);
    const standards = adapter
      .searchK12Standards(params.query || "", { subject: params.subject || null, schoolLevel: params.schoolLevel || null, limit })
      .map(s => markHandwritten(s, linkState));
    return { source, official: false, warning: HANDWRITTEN_WARNING, total: standards.length, standards };
  }

  const store = loadOfficial();
  const { items, matchedTotal } = searchOfficial({ ...params, limit }, store);
  return { source, official: true, dataset: store.dataset, total: items.length, matchedTotal, standards: items };
}

/** 예전 손작성 태깅 로직(동작 변경 없음). */
function tagHandwritten(cleanText, cleanSubject, { adapter, graphEngine }) {
  const codeRegex = /\[?([1-9]|1[0-2])([가-힣]+)([0-9]{2})-([0-9]{2})\]?/g;
  const explicitCodes = [];
  let match;
  while ((match = codeRegex.exec(cleanText)) !== null) {
    explicitCodes.push(`[${match[1]}${match[2]}${match[3]}-${match[4]}]`);
  }

  const searchResults = adapter.searchK12Standards(cleanText, { subject: cleanSubject, limit: 10 });
  const scoredMap = new Map();
  for (const code of explicitCodes) {
    const std = adapter.getK12Standard(code);
    if (std) scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 300 });
  }
  for (const std of searchResults) {
    scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 100 });
  }
  const lowerText = cleanText.toLowerCase();
  for (const [term, meta] of Object.entries(K12_TERMINOLOGY_DICTIONARY)) {
    if (lowerText.includes(term.toLowerCase())) {
      const matched = adapter.searchK12Standards(term, { subject: cleanSubject || meta.subject, limit: 3 });
      for (const std of matched) {
        scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 50 });
      }
    }
  }
  const matchedStandards = Array.from(scoredMap.values()).sort((a, b) => b.score - a.score).map(s => s.standard);
  const primaryStandard = matchedStandards[0] || null;
  return { matchedStandards, primaryStandard, remediationCodes: primaryStandard ? [primaryStandard.code] : [] };
}

function diagnose(graphEngine, code) {
  try {
    return graphEngine.diagnoseK12RemediationPath(code, []);
  } catch {
    return null;
  }
}

/**
 * @param {object} params { text, subject, source }
 * @param {object} deps { adapter, graphEngine, decisionsPath }
 */
export function tagContent(params = {}, { adapter, graphEngine, decisionsPath = DEFAULT_DECISIONS_PATH } = {}) {
  const source = resolveSource(params.source);
  const cleanText = String(params.text || "").trim();
  const cleanSubject = params.subject ? String(params.subject).trim() : null;
  const linkState = loadConfirmedLinks(decisionsPath);

  let matchedStandards;
  let primaryStandard;
  let remediationCodes;
  if (source === "handwritten") {
    ({ matchedStandards, primaryStandard, remediationCodes } = tagHandwritten(cleanText, cleanSubject, { adapter, graphEngine }));
    matchedStandards = matchedStandards.map(s => markHandwritten(s, linkState));
    primaryStandard = matchedStandards[0] || null;
  } else {
    matchedStandards = tagOfficial(cleanText, { subject: cleanSubject, limit: 10 });
    primaryStandard = matchedStandards[0] || null;
    // 선수학습 역추적은 손작성 그래프에만 있다. 사람이 확정한 연결이 있을 때만 쓴다.
    remediationCodes = primaryStandard ? handwrittenCodesFor(primaryStandard.id, linkState) : [];
  }

  const remediationCode = remediationCodes[0] || null;
  const remediation = remediationCode && graphEngine ? diagnose(graphEngine, remediationCode) : null;

  const response = {
    source,
    official: source === "official",
    text: cleanText,
    subject: cleanSubject || primaryStandard?.subject || null,
    matchedStandardsCount: matchedStandards.length,
    matchedStandards,
    primaryStandard,
    foundationalPrerequisites: remediation?.unmasteredPrerequisites || [],
    earliestFoundationalGap: remediation?.earliestFoundationalGap || null,
    remediationPath: remediation?.remediationPath || [],
    piagetStageProgression: remediation?.piagetStageProgression || null,
    schoolLevelsTraversed: remediation?.schoolLevelsTraversed || [],
    remediationBasis: {
      ...handwrittenBasis(linkState, remediationCode ? [remediationCode] : []),
      handwrittenCode: remediationCode,
      note: remediation
        ? "선수학습 역추적은 손작성 성취기준 그래프로 계산했습니다."
        : source === "official"
          ? "공식 성취기준과 손작성 그래프를 잇는 사람 확정 연결(decisions.json)이 없어 선수학습 역추적을 하지 않았습니다."
          : "선수학습 역추적 결과가 없습니다."
    }
  };
  if (source === "official") response.dataset = loadOfficial().dataset;
  else response.warning = HANDWRITTEN_WARNING;
  return response;
}
