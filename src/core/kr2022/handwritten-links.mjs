/**
 * 손작성 성취기준 ↔ 공식 성취기준 연결 (교사가 검토 화면에서 확정한 것만).
 *
 * 근거는 review/kr2022-remap/decisions.json 하나뿐이다(검토 화면 /review/가 쓰는 파일,
 * 형식은 src/server/review-routes.mjs). 자동 재매핑 결과(handwritten-remap.json의 matched
 * 포함)는 사람이 확인하지 않았으므로 쓰지 않는다.
 *
 *   { "schemaVersion": 1, "decisions": { "<oldCode>#<sha256 앞 12자리>":
 *       { "oldCode", "decision": "accept-candidate"|"choose-other"|"discard"|"defer",
 *         "officialId": "<standards id>"|null, "note", "decidedAt" } } }
 *
 * - accept-candidate·choose-other이고 officialId가 standards.json에 있을 때만 연결한다.
 * - discard는 그 손작성 항목을 "폐기됨"으로 보고, 그 항목에 기대는 기능 응답에 표시한다.
 * - defer와 그 밖의 값은 연결 없음.
 * - 파일이 없거나, JSON이 아니거나, schemaVersion이 1이 아니거나, decisions가 객체가 아니면
 *   연결 없이 동작한다.
 * - 키는 검토 화면과 같은 itemKey(원래 코드, 손작성 문장)로 손작성 항목과 맞춘다. 같은 코드에
 *   문장이 다른 손작성 항목이 있어(16개 코드) 코드만으로는 맞추지 않는다.
 */

import fs from "node:fs";
import { DEFAULT_PATHS, itemKey } from "../../server/review-routes.mjs";
import { loadOfficial, getById } from "./official.mjs";

export { itemKey };
export const DEFAULT_DECISIONS_PATH = DEFAULT_PATHS.decisions;
export const LINK_DECISIONS = Object.freeze(["accept-candidate", "choose-other"]);

export const HANDWRITTEN_LABEL = "비공식 손작성 성취기준 기반";
export const HANDWRITTEN_WARNING =
  "이 결과는 교육부 고시 원문이 아니라 이 저장소에서 손으로 쓴 성취기준(코드·문장이 원문과 다를 수 있음)과 " +
  "그에 붙인 오개념·교구·피아제 단계 정보로 만든 것입니다. 수업·평가 근거로 쓰기 전에 공식 성취기준을 확인하세요.";
export const DISCARDED_WARNING =
  "교사 검토에서 '해당 없음(폐기)'으로 결정된 손작성 성취기준이 들어 있습니다. 이 항목에 기댄 결과는 쓰지 마세요.";

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * decisions.json을 읽는다. 매번 파일을 확인한다(검토 화면에서 결정이 저장되면 서버를 다시
 * 띄우지 않아도 반영되도록). 파일이 작아 비용은 무시할 만하다.
 *
 * @returns {{ present: boolean, valid: boolean, path: string, error: string|null,
 *             entries: Map<string, object>, links: Map<string, object>, ignored: number }}
 */
export function loadDecisions(filePath = DEFAULT_DECISIONS_PATH, store = loadOfficial()) {
  const state = { present: false, valid: false, path: filePath, error: null, entries: new Map(), links: new Map(), ignored: 0 };
  if (!filePath || !fs.existsSync(filePath)) return state;
  state.present = true;

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    state.error = `decisions.json을 읽을 수 없어 연결 없이 동작합니다: ${err.message}`;
    return state;
  }
  if (doc?.schemaVersion !== 1 || !isPlainObject(doc.decisions)) {
    state.error = "decisions.json 형식이 다릅니다(schemaVersion 1과 decisions 객체 필요). 연결 없이 동작합니다.";
    return state;
  }
  state.valid = true;

  for (const [key, e] of Object.entries(doc.decisions)) {
    if (!isPlainObject(e) || typeof e.oldCode !== "string" || !key.startsWith(`${e.oldCode}#`)) {
      state.ignored += 1;
      continue;
    }
    state.entries.set(key, e);
    if (LINK_DECISIONS.includes(e.decision)) {
      const target = e.officialId ? getById(e.officialId, store) : null;
      if (target) {
        state.links.set(key, { id: target.id, code: target.code, text: target.text, decision: e.decision, decidedAt: e.decidedAt ?? null });
      } else {
        state.ignored += 1;
      }
    }
  }
  return state;
}

/**
 * 손작성 항목 하나의 검토 상태.
 * status: linked(공식 연결) | discarded(폐기) | deferred(보류) | undecided(결정 없음)
 */
export function handwrittenStatus(oldCode, oldText, state) {
  if (!oldCode || typeof oldText !== "string") {
    return { handwrittenCode: oldCode ?? null, key: null, status: "unknown", officialLink: null };
  }
  const key = itemKey(oldCode, oldText);
  const entry = state.entries.get(key);
  const link = state.links.get(key) || null;
  let status = "undecided";
  if (link) status = "linked";
  else if (entry?.decision === "discard") status = "discarded";
  else if (entry?.decision === "defer") status = "deferred";
  return { handwrittenCode: oldCode, key, status, officialLink: link, decidedAt: entry?.decidedAt ?? null };
}

/** 공식 id에 확정 연결된 손작성 항목들({ key, oldCode }). */
export function handwrittenFor(officialId, state) {
  const out = [];
  for (const [key, link] of state.links) {
    if (link.id === officialId) out.push({ key, oldCode: state.entries.get(key).oldCode });
  }
  return out;
}

/**
 * 손작성 데이터에 기대는 기능 응답에 붙이는 표시.
 * @param {object} state loadDecisions 결과
 * @param {Array<{code: string, text: string}>} items 응답이 기댄 손작성 항목
 */
export function handwrittenBasis(state, items = []) {
  const handwrittenItems = items
    .filter(it => it && it.code)
    .map(it => handwrittenStatus(it.code, it.text, state));
  const discarded = handwrittenItems.filter(h => h.status === "discarded");
  return {
    source: "handwritten",
    official: false,
    label: HANDWRITTEN_LABEL,
    warning: HANDWRITTEN_WARNING,
    decisionsFile: !state.present ? "absent" : state.valid ? "present" : "invalid",
    handwrittenItems,
    officialLinks: handwrittenItems.filter(h => h.officialLink).map(h => ({ handwrittenCode: h.handwrittenCode, ...h.officialLink })),
    discarded: discarded.length > 0,
    ...(discarded.length ? { discardedWarning: DISCARDED_WARNING } : {})
  };
}
