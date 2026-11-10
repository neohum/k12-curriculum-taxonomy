import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  AMBIGUITY_MARGIN, MATCH_THRESHOLD,
  bandKey, classify, loadOfficialStandards, mergeHandwritten, normalizeSubject, normalizeText,
  remapAll, textSimilarity, StandardsFileError
} from "../src/core/kr2022/remap.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCRIPT = path.join(ROOT, "scripts/kr2022/remap-handwritten.mjs");
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/kr2022-fixture.json"), "utf8"));

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "kr2022-remap-"));
}

function writeFixtureInputs(dir) {
  const standards = path.join(dir, "standards.json");
  const handwritten = path.join(dir, "handwritten.json");
  fs.writeFileSync(standards, JSON.stringify(FIXTURE.standards));
  fs.writeFileSync(handwritten, JSON.stringify(FIXTURE.handwritten));
  return { standards, handwritten };
}

function runScript(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
}

function remapFixture() {
  return remapAll(mergeHandwritten([{ source: "fixture", standards: FIXTURE.handwritten }]), FIXTURE.standards.standards);
}

const byText = (items, fragment) => items.find(i => i.oldText.includes(fragment));

test("픽스처는 명백한 가짜 교과·코드만 쓴다", () => {
  for (const s of FIXTURE.standards.standards) {
    assert.equal(s.subject, "테스트");
    assert.match(s.code, /^\[\d테\d\d-\d\d\]$/);
  }
});

test("정규화: 공백·문장부호와 끝의 '수 있다'를 제거한다", () => {
  assert.equal(normalizeText("묶어 세고, 말할 수 있다."), "묶어세고말");
  assert.equal(normalizeSubject("실과(컴퓨팅)"), "실과");
  assert.equal(textSimilarity("가나다라", "가나다라"), 1);
  assert.equal(textSimilarity("가나", "라마"), 0);
  assert.equal(textSimilarity("", "가나"), 0);
});

test("학년군 키: 초등은 범위까지, 중·고는 학교급", () => {
  assert.equal(bandKey({ gradeCluster: "초등 1~2학년군" }), "ES:1-2");
  assert.equal(bandKey({ schoolLevel: "ES", gradeBand: "초등학교 5~6학년" }), "ES:5-6");
  assert.equal(bandKey({ grade: "초4" }), "ES:3-4");
  assert.equal(bandKey({ gradeCluster: "중학교 1~3학년군" }), "MS");
  assert.equal(bandKey({ schoolLevel: "HS", gradeBand: "고등학교" }), "HS");
  assert.equal(bandKey({}), null);
});

test("판정: 임계값 미만은 unmapped, 1·2등 차가 작으면 ambiguous", () => {
  assert.equal(classify([]), "unmapped");
  assert.equal(classify([{ score: MATCH_THRESHOLD - 0.01 }]), "unmapped");
  assert.equal(classify([{ score: 0.9 }, { score: 0.9 - AMBIGUITY_MARGIN / 2 }]), "ambiguous");
  assert.equal(classify([{ score: 0.9 }, { score: 0.9 - AMBIGUITY_MARGIN * 2 }]), "matched");
});

test("재매핑: matched / ambiguous / unmapped와 그 이유", () => {
  const { items, stats } = remapFixture();
  assert.deepEqual(stats, { total: 8, matched: 4, ambiguous: 1, unmapped: 3 });

  const m = byText(items, "사과 블록을 열 개씩");
  assert.equal(m.status, "matched");
  assert.equal(m.matchedCode, "[2테01-01]");
  assert.equal(m.candidates[0].method, "char-bigram-cosine");

  const amb = items.find(i => i.oldCode === "[1테01-02]");
  assert.equal(amb.status, "ambiguous");
  assert.equal(amb.matchedCode, null);
  assert.deepEqual(amb.candidates.slice(0, 2).map(c => c.code), ["[2테01-02]", "[2테01-03]"]);

  assert.equal(items.find(i => i.oldCode === "[1테01-09]").unmappedReason, "below-match-threshold");
  const otherSubject = items.find(i => i.oldCode === "[1다01-01]");
  assert.equal(otherSubject.status, "unmapped");
  assert.equal(otherSubject.unmappedReason, "no-official-standard-with-same-subject-and-band");
  assert.equal(otherSubject.candidates.length, 0, "다른 교과의 같은 문장은 후보가 되면 안 된다");
});

test("학년군이 다르면 후보가 되지 않는다", () => {
  const { items } = remapFixture();
  const es34 = items.find(i => i.oldCode === "[3테01-01]");
  assert.ok(es34.candidates.every(c => c.code.startsWith("[4")));
});

test("오개념·교구·피아제 단계·키워드·토픽 매핑은 addedByUs로 분리 보존", () => {
  const { items } = remapFixture();
  const m = items.find(i => i.oldCode === "[1테01-01]");
  assert.deepEqual(m.addedByUs, {
    keywords: ["픽스처 키워드"],
    mappedTopicIds: ["mt_fixture_a"],
    piagetStage: "Concrete Operational",
    manipulative: "픽스처 교구",
    misconception: "픽스처 오개념"
  });
  assert.equal(m.oldText, FIXTURE.handwritten[0].statement);
  assert.ok(!("statement" in m.addedByUs) && !("code" in m.addedByUs));
});

test("같은 코드라도 문장이 다르면 별개 항목, 같은 (코드, 문장)은 출처를 합친다", () => {
  const merged = mergeHandwritten([
    { source: "a", standards: FIXTURE.handwritten },
    { source: "b", standards: [{ ...FIXTURE.handwritten[0], keywords: ["추가 키워드"], manipulative: "다른 교구" }] }
  ]);
  assert.equal(merged.filter(i => i.oldCode === "[5테02-01]").length, 2);
  const h1 = merged.find(i => i.oldCode === "[1테01-01]");
  assert.deepEqual(h1.sources, ["a", "b"]);
  assert.deepEqual(h1.addedByUs.keywords, ["픽스처 키워드", "추가 키워드"]);
  assert.equal(h1.addedByUs.manipulative, "픽스처 교구");
  assert.deepEqual(h1.addedByUs.conflicts, { manipulative: ["다른 교구"] });
});

test("검토 큐: ambiguous, 약한 matched, near-miss unmapped", () => {
  const { reviewQueue } = remapFixture();
  const summary = reviewQueue.map(q => [q.oldCode, q.status, q.reasons.join(",")]);
  assert.deepEqual(summary, [
    ["[1테01-02]", "ambiguous", "top-two-within-margin"],
    ["[5테02-01]", "unmapped", "near-miss"],
    ["[5테02-01]", "matched", "low-score"]
  ]);
  assert.equal(reviewQueue[0].priority, "high");
  assert.equal(reviewQueue[2].priority, "normal");
});

test("loadOfficialStandards: 없는 파일·틀린 형식은 StandardsFileError", () => {
  const dir = tmpDir();
  assert.throws(() => loadOfficialStandards(path.join(dir, "none.json")), StandardsFileError);
  const bad = path.join(dir, "bad.json");
  fs.writeFileSync(bad, JSON.stringify({ schemaVersion: 2, standards: [] }));
  assert.throws(() => loadOfficialStandards(bad), /형식이 다릅니다/);
  fs.writeFileSync(bad, JSON.stringify({ schemaVersion: 1, standards: [{ code: "[9테01-01]" }] }));
  assert.throws(() => loadOfficialStandards(bad), /code\/subject\/text/);
});

test("스크립트: standards.json이 없으면 분명한 에러로 종료 코드 2", () => {
  const dir = tmpDir();
  const out = path.join(dir, "out.json");
  const r = runScript(["--standards", path.join(dir, "standards.json"), "--out", out, "--review-out", path.join(dir, "rv.json")]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /공식 성취기준 파일이 없습니다/);
  assert.equal(fs.existsSync(out), false, "실패하면 산출물을 쓰지 않는다");
});

test("스크립트: 픽스처로 재매핑 파일과 검토 큐 파일을 쓴다", () => {
  const dir = tmpDir();
  const { standards, handwritten } = writeFixtureInputs(dir);
  const out = path.join(dir, "remap.json");
  const reviewOut = path.join(dir, "review.json");
  const r = runScript(["--standards", standards, "--handwritten", handwritten, "--out", out, "--review-out", reviewOut]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /matched 4 \/ ambiguous 1 \/ unmapped 3 \/ 검토 큐 3/);

  const doc = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(doc.schemaVersion, 1);
  assert.match(doc.notice, /덧붙인/);
  assert.equal(doc.method.thresholds.MATCH_THRESHOLD, MATCH_THRESHOLD);
  assert.equal(doc.inputs.standards.count, FIXTURE.standards.standards.length);
  assert.equal(doc.items.length, 8);
  for (const it of doc.items) {
    assert.ok(["matched", "ambiguous", "unmapped"].includes(it.status));
    for (const k of ["oldCode", "subject", "grade", "oldText", "candidates", "addedByUs"]) assert.ok(k in it, k);
  }
  const review = JSON.parse(fs.readFileSync(reviewOut, "utf8"));
  assert.equal(review.items.length, 3);
});

test("재매핑: 원문에서 코드가 겹쳐도 id로 구별하고, id 중복 파일은 거부한다", () => {
  const officials = [
    { id: "b14:[12심독01-01]", code: "[12심독01-01]", subject: "테스트", course: "테스트", schoolLevel: "HS", gradeBand: "고등학교 선택 과목", text: "다양한 분야의 기초 학문 주제에 관한 글을 읽고 주요 내용을 파악한다." },
    { id: "b16:[12심독01-01]", code: "[12심독01-01]", subject: "테스트", course: "테스트", schoolLevel: "HS", gradeBand: "고등학교 선택 과목", text: "낱말이나 구, 문장을 듣고 의미를 이해한다." }
  ];
  const hw = [{ code: "[12테01-01]", subject: "테스트", schoolLevel: "HS", gradeCluster: "고등학교", statement: "낱말이나 구, 문장을 듣고 의미를 이해할 수 있다." }];
  const { items } = remapAll(mergeHandwritten([{ source: "t", standards: hw }]), officials);
  assert.equal(items[0].status, "matched");
  assert.equal(items[0].matchedId, "b16:[12심독01-01]");
  assert.equal(items[0].matchedCode, "[12심독01-01]");

  const dir = tmpDir();
  const f = path.join(dir, "dup.json");
  fs.writeFileSync(f, JSON.stringify({ schemaVersion: 1, standards: [officials[0], { ...officials[1], id: officials[0].id }] }));
  assert.throws(() => loadOfficialStandards(f), /중복/);
  fs.writeFileSync(f, JSON.stringify({ schemaVersion: 1, standards: officials }));
  assert.equal(loadOfficialStandards(f).standards.length, 2, "code가 겹쳐도 id가 다르면 허용");
});
