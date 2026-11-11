/**
 * 2022 개정 공식 성취기준 사이의 선수관계 간선 생성 (순수 로직, 무의존성)
 *
 * 간선 방향: from = 먼저 배울 성취기준(선수), to = 그 위에 쌓이는 성취기준.
 * from/to는 공식 성취기준의 id(없으면 code)다. 원문 코드는 과목 사이에 겹치는 경우가 있어
 * code만으로는 끝점을 정할 수 없다.
 * 근거(evidence)가 없는 간선은 만들지 않는다. 허용되는 근거 유형은 셋뿐이다.
 *
 * - marble-dependency: Marble os-taxonomy 의존 간선(topicId가 prerequisiteId에 의존)을
 *   손작성 성취기준의 Marble 토픽 매핑을 거쳐 공식 코드로 옮긴 것. 재매핑 결과가
 *   matched인 손작성 항목의 매핑만 쓴다.
 * - same-domain-sequence: 같은 교과·같은 영역에서 학년군이 바로 다음 단계로 이어지는 코드.
 *   항상 soft.
 * - manual: 사람이 data/kr-2022/prerequisites.manual.json에 넣은 것.
 */

import { officialBandKey, officialKey } from "./remap.mjs";
import { checkManualEdges, findCycle } from "./manual-rules.mjs";

export { findCycle };

export const EVIDENCE_TYPES = Object.freeze(["marble-dependency", "same-domain-sequence", "manual"]);
const STRENGTHS = new Set(["hard", "soft"]);

/** 학년군 순서. 고등학교는 과목 간 순서를 코드로 알 수 없어 한 단계로 둔다. */
export const BAND_ORDER = Object.freeze(["ES:1-2", "ES:3-4", "ES:5-6", "MS", "HS"]);

export const MARBLE_LICENSE = Object.freeze({
  spdx: "ODbL-1.0 AND CC-BY-SA-4.0",
  database: "ODbL 1.0 — marble-dependency 근거에서 유래한 간선(파생 데이터베이스)",
  content: "CC BY-SA 4.0 — evidence.note에 옮긴 Marble 의존 간선 reason 문장",
  attribution: "Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).",
  upstream: "https://github.com/withmarbleapp/os-taxonomy"
});

function edgeKey(from, to) {
  return `${from}\u0000${to}`;
}

class EdgeSet {
  constructor() {
    this.map = new Map();
  }

  add(from, to, strength, evidence) {
    if (!from || !to || from === to || !evidence) return false;
    const key = edgeKey(from, to);
    const prev = this.map.get(key);
    if (!prev) {
      this.map.set(key, { from, to, strength, evidence: [evidence] });
      return true;
    }
    if (!prev.evidence.some(e => e.type === evidence.type && e.ref === evidence.ref)) prev.evidence.push(evidence);
    if (strength === "hard") prev.strength = "hard";
    return false;
  }

  list() {
    return [...this.map.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
  }
}

/** Marble 토픽 ID → 공식 코드 집합. remap 결과에서 matched만 쓴다. */
export function topicToOfficialCodes(remapItems, knownTopicIds) {
  const map = new Map();
  const unknownTopicIds = new Set();
  for (const it of remapItems) {
    const target = it.matchedId ?? it.matchedCode;
    if (it.status !== "matched" || !target) continue;
    for (const t of it.addedByUs?.mappedTopicIds ?? []) {
      if (knownTopicIds && !knownTopicIds.has(t)) {
        unknownTopicIds.add(t);
        continue;
      }
      if (!map.has(t)) map.set(t, new Map());
      const via = map.get(t);
      if (!via.has(target)) via.set(target, []);
      via.get(target).push(it.oldCode);
    }
  }
  return { map, unknownTopicIds: [...unknownTopicIds].sort() };
}

export function marbleEdges(edges, marbleDependencies, remapItems, knownTopicIds, officialCodes) {
  const { map, unknownTopicIds } = topicToOfficialCodes(remapItems, knownTopicIds);
  let added = 0;
  let selfLoops = 0;
  for (const dep of marbleDependencies) {
    const pre = map.get(dep.prerequisiteId);
    const post = map.get(dep.topicId);
    if (!pre || !post) continue;
    for (const [fromCode, fromVia] of pre) {
      for (const [toCode, toVia] of post) {
        if (!officialCodes.has(fromCode) || !officialCodes.has(toCode)) continue;
        if (fromCode === toCode) {
          selfLoops++;
          continue;
        }
        const strength = STRENGTHS.has(dep.strength) ? dep.strength : "soft";
        const ok = edges.add(fromCode, toCode, strength, {
          type: "marble-dependency",
          ref: `data/os-taxonomy/dependencies.json#${dep.prerequisiteId}->${dep.topicId}`,
          note: `Marble ${strength}: ${dep.reason ?? ""} (손작성 ${fromVia.join(",")} → ${toVia.join(",")} 경유)`.trim()
        });
        if (ok) added++;
      }
    }
  }
  return { unknownTopicIds, selfLoopsSkipped: selfLoops, newEdges: added };
}

export function sameDomainSequenceEdges(edges, officialStandards) {
  const groups = new Map();
  let unbanded = 0;
  for (const s of officialStandards) {
    const band = officialBandKey(s);
    const rank = BAND_ORDER.indexOf(band);
    if (rank < 0 || !s.domain) {
      unbanded++;
      continue;
    }
    const key = `${s.subject}\u0000${s.domain}`;
    if (!groups.has(key)) groups.set(key, new Map());
    const byRank = groups.get(key);
    if (!byRank.has(rank)) byRank.set(rank, []);
    byRank.get(rank).push(s);
  }
  let added = 0;
  for (const byRank of groups.values()) {
    for (const [rank, lower] of byRank) {
      const upper = byRank.get(rank + 1);
      if (!upper) continue;
      for (const a of lower) {
        for (const b of upper) {
          const ok = edges.add(officialKey(a), officialKey(b), "soft", {
            type: "same-domain-sequence",
            ref: `${officialKey(a)}->${officialKey(b)}`,
            note: `${a.subject} · ${a.domain}: ${a.gradeBand} → ${b.gradeBand}`
          });
          if (ok) added++;
        }
      }
    }
  }
  return { standardsWithoutBandOrDomain: unbanded, newEdges: added };
}

/**
 * 수동 간선 검증. 틀린 항목은 조용히 버리지 않고 에러로 멈춘다.
 * 규칙(검토 화면과 공유): 없는 id·자기 간선·학년 역전·중복·수동 간선끼리의 순환은 거부.
 */
export class ManualEdgesError extends Error {}

export function validateManual(manualDoc, officialCodes) {
  if (manualDoc?.schemaVersion !== 1 || !Array.isArray(manualDoc.edges)) {
    throw new ManualEdgesError("prerequisites.manual.json 형식이 다릅니다 (schemaVersion 1과 edges 배열 필요)");
  }
  const problems = checkManualEdges(manualDoc.edges, officialCodes).map(p => p.message);
  if (problems.length) throw new ManualEdgesError(`prerequisites.manual.json 검증 실패:\n- ${problems.join("\n- ")}`);
  return manualDoc.edges;
}

export function buildPrerequisites({ officialStandards, remapItems, marbleDependencies, marbleTopicIds, manualDoc }) {
  const officialCodes = new Set(officialStandards.map(officialKey));
  const edges = new EdgeSet();

  const marble = marbleEdges(edges, marbleDependencies, remapItems, marbleTopicIds, officialCodes);
  const sequence = sameDomainSequenceEdges(edges, officialStandards);
  let manualCount = 0;
  for (const e of validateManual(manualDoc, officialCodes)) {
    for (const ev of e.evidence) edges.add(e.from, e.to, e.strength, { type: "manual", ref: ev.ref, note: ev.note ?? "" });
    manualCount++;
  }

  const list = edges.list();
  const byEvidence = Object.fromEntries(EVIDENCE_TYPES.map(t => [t, 0]));
  const byStrength = { hard: 0, soft: 0 };
  for (const e of list) {
    byStrength[e.strength]++;
    for (const t of new Set(e.evidence.map(ev => ev.type))) byEvidence[t]++;
  }
  const cycle = findCycle(list);
  return {
    edges: list,
    stats: {
      edges: list.length,
      byEvidence,
      byStrength,
      manualEntries: manualCount,
      marble: {
        matchedRemapItemsUsed: remapItems.filter(i => i.status === "matched").length,
        unknownTopicIdsSkipped: marble.unknownTopicIds.length,
        selfLoopsSkipped: marble.selfLoopsSkipped
      },
      sameDomainSequence: { standardsWithoutBandOrDomain: sequence.standardsWithoutBandOrDomain },
      cycle
    },
    unknownTopicIds: marble.unknownTopicIds,
    containsMarbleDerivedEdges: byEvidence["marble-dependency"] > 0
  };
}
