#!/usr/bin/env node
/**
 * 공식 2022 개정 성취기준 선수관계 그래프(data/kr-2022/prerequisites.json)를 만든다.
 *
 *   node scripts/kr2022/build-prerequisites.mjs \
 *     [--standards data/kr-2022/standards.json] \
 *     [--remap review/kr2022-remap/handwritten-remap.json] \
 *     [--manual data/kr-2022/prerequisites.manual.json] \
 *     [--marble-deps data/os-taxonomy/dependencies.json] \
 *     [--marble-topics data/os-taxonomy/topics.json] \
 *     [--out data/kr-2022/prerequisites.json]
 *
 * 공식 파일이 없으면 종료 코드 2로 멈춘다. 수동 간선이 규칙(없는 id·자기 간선·학년 역전·중복·순환)에
 * 맞지 않으면 종료 코드 3으로 멈추고 출력 파일을 쓰지 않는다. remap 파일은 remap-handwritten.mjs로 먼저 만든다.
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { StandardsFileError, loadOfficialStandards } from "../../src/core/kr2022/remap.mjs";
import { MARBLE_LICENSE, ManualEdgesError, buildPrerequisites } from "../../src/core/kr2022/prerequisites.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function rel(p) {
  return path.relative(ROOT, path.resolve(p)).split(path.sep).join("/");
}

function readJson(file, what) {
  if (!fs.existsSync(file)) throw new StandardsFileError(`${what} 파일이 없습니다: ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main() {
  const { values } = parseArgs({
    options: {
      standards: { type: "string", default: path.join(ROOT, "data/kr-2022/standards.json") },
      remap: { type: "string", default: path.join(ROOT, "review/kr2022-remap/handwritten-remap.json") },
      manual: { type: "string", default: path.join(ROOT, "data/kr-2022/prerequisites.manual.json") },
      "marble-deps": { type: "string", default: path.join(ROOT, "data/os-taxonomy/dependencies.json") },
      "marble-topics": { type: "string", default: path.join(ROOT, "data/os-taxonomy/topics.json") },
      out: { type: "string", default: path.join(ROOT, "data/kr-2022/prerequisites.json") }
    }
  });

  const official = loadOfficialStandards(values.standards);
  const remap = readJson(values.remap, "재매핑 결과(handwritten-remap.json)");
  if (remap.schemaVersion !== 1 || !Array.isArray(remap.items)) {
    throw new Error(`재매핑 결과 형식이 다릅니다: ${values.remap}`);
  }
  if (remap.inputs?.standards?.count !== official.standards.length) {
    throw new Error(
      `재매핑 결과가 다른 공식 파일로 만들어졌습니다 (remap ${remap.inputs?.standards?.count}건 / 현재 ${official.standards.length}건). remap-handwritten.mjs를 다시 실행하세요.`
    );
  }
  const deps = readJson(values["marble-deps"], "Marble 의존 간선");
  const topics = readJson(values["marble-topics"], "Marble 토픽");
  const manual = readJson(values.manual, "수동 선수관계");

  const result = buildPrerequisites({
    officialStandards: official.standards,
    remapItems: remap.items,
    marbleDependencies: deps.dependencies ?? [],
    marbleTopicIds: new Set((topics.topics ?? []).map(t => t.id)),
    manualDoc: manual
  });

  const doc = {
    schemaVersion: 1,
    generatedBy: "scripts/kr2022/build-prerequisites.mjs",
    direction: "from은 먼저 배울 성취기준(선수), to는 그 위에 쌓이는 성취기준",
    containsMarbleDerivedEdges: result.containsMarbleDerivedEdges,
    license: result.containsMarbleDerivedEdges
      ? MARBLE_LICENSE
      : { ...MARBLE_LICENSE, note: "현재 marble-dependency 간선이 없어 실제로 적용되지 않음. 그런 간선이 생기면 이 조건이 적용됨." },
    attribution: MARBLE_LICENSE.attribution,
    evidenceTypes: {
      "marble-dependency": "Marble 의존 간선을 matched 재매핑의 토픽 매핑으로 옮긴 것 (strength는 Marble 값)",
      "same-domain-sequence": "같은 교과·같은 영역에서 바로 다음 학년군의 코드 (항상 soft)",
      manual: "사람이 prerequisites.manual.json에 넣은 것"
    },
    inputs: {
      standards: { path: rel(values.standards), count: official.standards.length },
      remap: { path: rel(values.remap), matched: remap.items.filter(i => i.status === "matched").length },
      marbleDependencies: { path: rel(values["marble-deps"]), count: (deps.dependencies ?? []).length },
      manual: { path: rel(values.manual), count: manual.edges?.length ?? 0 }
    },
    stats: { ...result.stats, byEvidenceNote: "byEvidence는 그 근거 유형을 하나 이상 가진 간선 수 (한 간선이 여러 유형을 가질 수 있음)" },
    unknownTopicIdsSkipped: result.unknownTopicIds,
    edges: result.edges
  };

  fs.mkdirSync(path.dirname(values.out), { recursive: true });
  fs.writeFileSync(values.out, JSON.stringify(doc, null, 2) + "\n");

  const s = result.stats;
  console.log(`간선 ${s.edges}개 (hard ${s.byStrength.hard} / soft ${s.byStrength.soft})`);
  console.log(`근거별: marble-dependency ${s.byEvidence["marble-dependency"]}, same-domain-sequence ${s.byEvidence["same-domain-sequence"]}, manual ${s.byEvidence.manual}`);
  console.log(`Marble에 없는 토픽 ID로 건너뜀: ${s.marble.unknownTopicIdsSkipped}개, 같은 코드로 접혀 건너뜀: ${s.marble.selfLoopsSkipped}개`);
  if (s.cycle) console.log(`경고: 순환이 있습니다: ${s.cycle.join(" → ")}`);
  console.log(`출력: ${rel(values.out)}`);
}

main().catch(err => {
  if (err instanceof StandardsFileError) {
    process.stderr.write(`오류: ${err.message}\n`);
    process.exit(2);
  }
  if (err instanceof ManualEdgesError) {
    process.stderr.write(`오류: ${err.message}\n`);
    process.exit(3);
  }
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(1);
});
