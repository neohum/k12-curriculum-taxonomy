import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mergeHandwritten, remapAll } from "../src/core/kr2022/remap.mjs";
import { buildPrerequisites, findCycle, validateManual } from "../src/core/kr2022/prerequisites.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REMAP_SCRIPT = path.join(ROOT, "scripts/kr2022/remap-handwritten.mjs");
const BUILD_SCRIPT = path.join(ROOT, "scripts/kr2022/build-prerequisites.mjs");
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/kr2022-fixture.json"), "utf8"));
const OFFICIAL = FIXTURE.standards.standards;
const EMPTY_MANUAL = { schemaVersion: 1, edges: [] };

function build(manualDoc = EMPTY_MANUAL) {
  const { items } = remapAll(mergeHandwritten([{ source: "fixture", standards: FIXTURE.handwritten }]), OFFICIAL);
  return buildPrerequisites({
    officialStandards: OFFICIAL,
    remapItems: items,
    marbleDependencies: FIXTURE.marble.dependencies.dependencies,
    marbleTopicIds: new Set(FIXTURE.marble.topics.topics.map(t => t.id)),
    manualDoc
  });
}

const find = (edges, from, to) => edges.find(e => e.from === from && e.to === to);

test("근거 없는 간선은 없고, 근거 유형은 허용된 셋뿐", () => {
  const { edges } = build();
  assert.ok(edges.length > 0);
  for (const e of edges) {
    assert.ok(e.evidence.length > 0);
    for (const ev of e.evidence) {
      assert.ok(["marble-dependency", "same-domain-sequence", "manual"].includes(ev.type));
      assert.ok(ev.ref);
    }
  }
});

test("marble-dependency: matched 재매핑의 토픽 매핑으로 옮기고 strength를 유지", () => {
  const { edges } = build();
  const ab = find(edges, "[2테01-01]", "[4테01-01]");
  assert.equal(ab.strength, "hard");
  assert.deepEqual(ab.evidence.map(e => e.type).sort(), ["marble-dependency", "same-domain-sequence"]);
  assert.match(ab.evidence.find(e => e.type === "marble-dependency").ref, /mt_fixture_a->mt_fixture_b/);

  const bd = find(edges, "[4테01-01]", "[9테01-01]");
  assert.equal(bd.strength, "soft");
  assert.deepEqual(bd.evidence.map(e => e.type), ["marble-dependency"]);
});

test("ambiguous 재매핑의 토픽(mt_fixture_c)에서는 간선이 생기지 않는다", () => {
  const { edges } = build();
  assert.ok(!edges.some(e => e.evidence.some(ev => ev.ref.includes("mt_fixture_c"))));
});

test("Marble 토픽 목록에 없는 ID는 건너뛰고 보고한다", () => {
  const r = build();
  assert.deepEqual(r.unknownTopicIds, ["mt_fixture_missing"]);
  assert.equal(r.stats.marble.unknownTopicIdsSkipped, 1);
});

test("same-domain-sequence: 같은 교과·영역에서 바로 다음 학년군만, 항상 soft", () => {
  const { edges } = build();
  const seq = edges.filter(e => e.evidence.some(ev => ev.type === "same-domain-sequence"));
  assert.deepEqual(seq.map(e => `${e.from}->${e.to}`).sort(), [
    "[2테01-01]->[4테01-01]", "[2테01-02]->[4테01-01]", "[2테01-03]->[4테01-01]"
  ]);
  for (const e of seq.filter(x => x.evidence.length === 1)) assert.equal(e.strength, "soft");
  assert.ok(!find(edges, "[4테01-01]", "[6테02-01]"), "다른 영역은 잇지 않는다");
});

test("근거별 개수와 순환 검사", () => {
  const { stats } = build();
  assert.deepEqual(stats.byEvidence, { "marble-dependency": 2, "same-domain-sequence": 3, manual: 0 });
  assert.equal(stats.edges, 4);
  assert.equal(stats.cycle, null);
  assert.deepEqual(findCycle([{ from: "a", to: "b" }, { from: "b", to: "a" }]), ["a", "b", "a"]);
});

test("manual: 검증을 통과한 간선만 넣고, 틀린 항목은 에러로 멈춘다", () => {
  const manual = {
    schemaVersion: 1,
    edges: [{ from: "[6테02-01]", to: "[9테01-01]", strength: "hard", evidence: [{ type: "manual", ref: "픽스처 검토", note: "테스트" }] }]
  };
  const r = build(manual);
  assert.equal(find(r.edges, "[6테02-01]", "[9테01-01]").strength, "hard");
  assert.equal(r.stats.byEvidence.manual, 1);

  const codes = new Set(OFFICIAL.map(s => s.code));
  assert.throws(() => validateManual({ schemaVersion: 1, edges: [{ from: "[9테01-01]", to: "[0없음-00]", strength: "hard", evidence: [{ type: "manual", ref: "x" }] }] }, codes), /공식 코드가 아님/);
  assert.throws(() => validateManual({ schemaVersion: 1, edges: [{ from: "[2테01-01]", to: "[9테01-01]", strength: "hard", evidence: [] }] }, codes), /evidence가 비어/);
  assert.throws(() => validateManual({ edges: [] }, codes), /형식이 다릅니다/);
});

test("저장소의 수동 선수관계 파일은 빈 목록으로 시작한다", () => {
  const manual = JSON.parse(fs.readFileSync(path.join(ROOT, "data/kr-2022/prerequisites.manual.json"), "utf8"));
  assert.equal(manual.schemaVersion, 1);
  assert.deepEqual(manual.edges, []);
});

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

test("스크립트: standards.json이 없으면 분명한 에러로 종료 코드 2", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kr2022-prereq-"));
  const out = path.join(dir, "prerequisites.json");
  const r = run(BUILD_SCRIPT, ["--standards", path.join(dir, "standards.json"), "--out", out]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /공식 성취기준 파일이 없습니다/);
  assert.equal(fs.existsSync(out), false);
});

test("스크립트: 픽스처로 끝까지 돌리면 근거별 개수와 라이선스 메타를 쓴다", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kr2022-prereq-"));
  const p = name => path.join(dir, name);
  fs.writeFileSync(p("standards.json"), JSON.stringify(FIXTURE.standards));
  fs.writeFileSync(p("handwritten.json"), JSON.stringify(FIXTURE.handwritten));
  fs.writeFileSync(p("topics.json"), JSON.stringify(FIXTURE.marble.topics));
  fs.writeFileSync(p("deps.json"), JSON.stringify(FIXTURE.marble.dependencies));
  fs.writeFileSync(p("manual.json"), JSON.stringify(EMPTY_MANUAL));

  const r1 = run(REMAP_SCRIPT, ["--standards", p("standards.json"), "--handwritten", p("handwritten.json"), "--out", p("remap.json"), "--review-out", p("review.json")]);
  assert.equal(r1.status, 0, r1.stderr);

  const args = ["--standards", p("standards.json"), "--remap", p("remap.json"), "--manual", p("manual.json"),
    "--marble-deps", p("deps.json"), "--marble-topics", p("topics.json"), "--out", p("prerequisites.json")];
  const r2 = run(BUILD_SCRIPT, args);
  assert.equal(r2.status, 0, r2.stderr);
  assert.match(r2.stdout, /근거별: marble-dependency 2, same-domain-sequence 3, manual 0/);

  const doc = JSON.parse(fs.readFileSync(p("prerequisites.json"), "utf8"));
  assert.equal(doc.containsMarbleDerivedEdges, true);
  assert.match(doc.license.spdx, /ODbL-1\.0/);
  assert.match(doc.license.spdx, /CC-BY-SA-4\.0/);
  assert.match(doc.attribution, /Marble/);
  assert.equal(doc.edges.length, 4);
  for (const e of doc.edges) assert.ok(["hard", "soft"].includes(e.strength));

  // 다른 공식 파일로 만든 remap을 쓰면 멈춘다
  const fewer = { ...FIXTURE.standards, standards: FIXTURE.standards.standards.slice(1) };
  fs.writeFileSync(p("standards.json"), JSON.stringify(fewer));
  const r3 = run(BUILD_SCRIPT, args);
  assert.equal(r3.status, 1);
  assert.match(r3.stderr, /다른 공식 파일로 만들어졌습니다/);
});

test("선수관계: 끝점은 id이며 코드가 겹치는 두 성취기준을 하나로 합치지 않는다", () => {
  const std = (id, code, gradeBand, schoolLevel) => ({ id, code, subject: "테스트", course: "테스트", domain: "영역", schoolLevel, gradeBand, text: id });
  const officialStandards = [
    std("b1:[6테01-01]", "[6테01-01]", "초등학교 5~6학년", "ES"),
    std("b1:[9테01-01]", "[9테01-01]", "중학교 1~3학년", "MS"),
    std("b2:[9테01-01]", "[9테01-01]", "중학교 1~3학년", "MS")
  ];
  const r = buildPrerequisites({ officialStandards, remapItems: [], marbleDependencies: [], marbleTopicIds: new Set(), manualDoc: { schemaVersion: 1, edges: [] } });
  assert.deepEqual(r.edges.map(e => `${e.from}->${e.to}`), ["b1:[6테01-01]->b1:[9테01-01]", "b1:[6테01-01]->b2:[9테01-01]"]);
  assert.throws(() => validateManual({ schemaVersion: 1, edges: [{ from: "[6테01-01]", to: "b1:[9테01-01]", strength: "soft", evidence: [{ type: "manual", ref: "x" }] }] }, new Set(officialStandards.map(s => s.id))), /id 필요/);
});
