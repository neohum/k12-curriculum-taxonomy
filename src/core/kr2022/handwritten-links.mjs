/**
 * 손작성 성취기준 ↔ 공식 성취기준 연결 (사람이 확정한 것만).
 *
 * 연결의 근거는 review/kr2022-remap/decisions.json 하나뿐이다. 자동 재매핑 결과
 * (handwritten-remap.json의 matched 포함)는 사람이 확인하지 않았으므로 쓰지 않는다.
 * 파일이 없거나 읽을 수 없으면 연결 없이 동작한다.
 *
 * decisions.json에서 읽는 형태(이 모듈이 기대하는 최소 계약):
 *   { "decisions": [ { "oldCode": "[6수01-06]", "decision": "confirmed",
 *                      "officialIds": ["b8:[6수01-08]"], "decidedBy": "...", "decidedAt": "..." } ] }
 * - 배열 이름은 decisions 또는 items, 최상위 배열도 받는다.
 * - decision이 CONFIRMED_DECISIONS 중 하나일 때만 연결한다. "matched" 같은 자동 판정 값은 버린다.
 * - humanVerified가 false로 적힌 항목은 버린다.
 * - 대상은 officialIds(배열) 또는 officialId(문자열)이고, standards.json에 있는 id만 쓴다.
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { loadOfficial, getById } from "./official.mjs";

export const DEFAULT_DECISIONS_PATH = fileURLToPath(new URL("../../../review/kr2022-remap/decisions.json", import.meta.url));
export const CONFIRMED_DECISIONS = Object.freeze(["confirmed", "accepted", "approved"]);

export const HANDWRITTEN_LABEL = "비공식 손작성 성취기준 기반";
export const HANDWRITTEN_WARNING =
  "이 결과는 교육부 고시 원문이 아니라 이 저장소에서 손으로 쓴 성취기준(코드·문장이 원문과 다를 수 있음)과 " +
  "그에 붙인 오개념·교구·피아제 단계 정보로 만든 것입니다. 수업·평가 근거로 쓰기 전에 공식 성취기준을 확인하세요.";

/**
 * decisions.json을 읽어 확정 연결만 돌려준다. 매번 파일을 확인한다(검토 화면에서 결정이
 * 추가되면 서버를 다시 띄우지 않아도 반영되도록). 파일이 작아 비용은 무시할 만하다.
 *
 * @returns {{ present: boolean, path: string, links: Map<string, object[]>, ignored: number, error: string|null }}
 */
export function loadConfirmedLinks(filePath = DEFAULT_DECISIONS_PATH, store = loadOfficial()) {
  const result = { present: false, path: filePath, links: new Map(), ignored: 0, error: null };
  if (!filePath || !fs.existsSync(filePath)) return result;
  result.present = true;

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    result.error = `decisions.json을 읽을 수 없어 연결 없이 동작합니다: ${err.message}`;
    return result;
  }
  const entries = Array.isArray(doc) ? doc : Array.isArray(doc?.decisions) ? doc.decisions : Array.isArray(doc?.items) ? doc.items : [];

  for (const e of entries) {
    const decision = String(e?.decision ?? "").trim().toLowerCase();
    const ids = Array.isArray(e?.officialIds) ? e.officialIds : e?.officialId ? [e.officialId] : [];
    const targets = ids.map(id => getById(id, store)).filter(Boolean);
    if (!e?.oldCode || !CONFIRMED_DECISIONS.includes(decision) || e.humanVerified === false || !targets.length) {
      result.ignored += 1;
      continue;
    }
    const list = result.links.get(e.oldCode) || [];
    for (const t of targets) {
      if (!list.some(x => x.id === t.id)) {
        list.push({ id: t.id, code: t.code, text: t.text, decidedBy: e.decidedBy ?? null, decidedAt: e.decidedAt ?? null });
      }
    }
    result.links.set(e.oldCode, list);
  }
  return result;
}

/** 손작성 코드 → 사람이 확정한 공식 성취기준 목록(없으면 빈 배열). */
export function officialLinksFor(oldCode, linkState) {
  return linkState.links.get(oldCode) || [];
}

/** 공식 id → 그 id에 확정 연결된 손작성 코드 목록. */
export function handwrittenCodesFor(officialId, linkState) {
  const codes = [];
  for (const [oldCode, targets] of linkState.links) {
    if (targets.some(t => t.id === officialId)) codes.push(oldCode);
  }
  return codes;
}

/** 손작성 데이터에 기대는 기능 응답에 붙이는 표시. */
export function handwrittenBasis(linkState, oldCodes = []) {
  const codes = (Array.isArray(oldCodes) ? oldCodes : [oldCodes]).filter(Boolean);
  return {
    source: "handwritten",
    official: false,
    label: HANDWRITTEN_LABEL,
    warning: HANDWRITTEN_WARNING,
    decisionsFile: linkState.present ? "present" : "absent",
    officialLinks: codes.flatMap(c => officialLinksFor(c, linkState).map(l => ({ handwrittenCode: c, ...l })))
  };
}
