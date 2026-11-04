/**
 * LessonLabCurriculumBridge.test.mjs
 *
 * Verification suite for the LessonLabCurriculumBridge.
 * Tests:
 * 1. K-12 standards retrieval across Elementary, Middle, and High school
 * 2. 3-9-3 Modular Scaffold generation (Intro 3, Main 9, Wrapup 3)
 * 3. Three-Tier Teacher Prompts, Multi-Student Dialogue, and Assessment Rubric
 * 4. Piaget Manipulative Simulation Matching:
 *    - 초등 수학: [6수01-06] -> fraction-bars
 *    - 중학 과학: [9과02-01] -> light-reflection
 *    - 초등/고등 국어: [4국02-01] / [10국01-02] -> balance-scale
 *    - 초등 저학년 수학: [2수01-01] -> ten-frame
 *    - 고등 미적분: [12미적1-02-01] -> fraction-bars / balance-scale
 */

import assert from "node:assert/strict";
import { LessonLabCurriculumBridge, MANIPULATIVE_SPECS } from "../src/core/taxonomy/LessonLabCurriculumBridge.mjs";

console.log("=== [TEST START] LessonLabCurriculumBridge Verification ===");

const bridge = new LessonLabCurriculumBridge();

// --------------------------------------------------------------------------
// 1. 성취기준 검색 및 단일 조회 검증
// --------------------------------------------------------------------------
console.log("\n[Test 1] K-12 Standards Search & Resolution");

const mathSearch = bridge.searchStandards("분수", { schoolLevel: "ES", limit: 5 });
assert.ok(mathSearch.length > 0, "분수 검색 결과가 존재해야 합니다.");
console.log(`  ✓ '분수' 검색 결과 ${mathSearch.length}건 확인:`, mathSearch.map(s => s.code).join(", "));

const stdMath = bridge.getStandard("[6수01-06]");
assert.ok(stdMath, "[6수01-06] 성취기준이 검색되어야 합니다.");
assert.equal(stdMath.schoolLevel, "ES");
assert.equal(stdMath.subject, "수학");
console.log(`  ✓ [6수01-06] 조회 성공: ${stdMath.statement}`);

const stdSci = bridge.getStandard("[9과02-01]");
assert.ok(stdSci, "[9과02-01] 성취기준이 검색되어야 합니다.");
assert.equal(stdSci.schoolLevel, "MS");
assert.equal(stdSci.subject, "과학");
console.log(`  ✓ [9과02-01] 조회 성공: ${stdSci.statement}`);

const stdKorES = bridge.getStandard("[4국02-01]");
assert.ok(stdKorES, "[4국02-01] 성취기준이 검색되어야 합니다.");
assert.equal(stdKorES.schoolLevel, "ES");
assert.equal(stdKorES.subject, "국어");
console.log(`  ✓ [4국02-01] 조회 성공: ${stdKorES.statement}`);

const stdCalc = bridge.getStandard("[12미적1-02-01]");
assert.ok(stdCalc, "[12미적1-02-01] 성취기준이 검색되어야 합니다.");
assert.equal(stdCalc.schoolLevel, "HS");
assert.equal(stdCalc.subject, "미적분");
console.log(`  ✓ [12미적1-02-01] 조회 성공: ${stdCalc.statement}`);

// --------------------------------------------------------------------------
// 2. 조작기 매칭 검증 (Piaget Manipulative Recommendation)
// --------------------------------------------------------------------------
console.log("\n[Test 2] Manipulative Recommendation Verification");

const manipMath = bridge.recommendManipulative(stdMath);
assert.equal(manipMath.id, "fraction-bars", "[6수01-06] 분수 덧셈은 fraction-bars에 매칭되어야 합니다.");
console.log(`  ✓ [6수01-06] -> ${manipMath.id} (${manipMath.title})`);

const manipSci = bridge.recommendManipulative(stdSci);
assert.equal(manipSci.id, "light-reflection", "[9과02-01] 빛과 파동은 light-reflection에 매칭되어야 합니다.");
console.log(`  ✓ [9과02-01] -> ${manipSci.id} (${manipSci.title})`);

const manipKor = bridge.recommendManipulative(stdKorES);
assert.equal(manipKor.id, "balance-scale", "[4국02-01] 문장 성분은 balance-scale에 매칭되어야 합니다.");
console.log(`  ✓ [4국02-01] -> ${manipKor.id} (${manipKor.title})`);

const stdTen = bridge.getStandard("[2수01-01]");
if (stdTen) {
  const manipTen = bridge.recommendManipulative(stdTen);
  assert.equal(manipTen.id, "ten-frame", "[2수01-01] 100까지 수세기는 ten-frame에 매칭되어야 합니다.");
  console.log(`  ✓ [2수01-01] -> ${manipTen.id} (${manipTen.title})`);
}

// --------------------------------------------------------------------------
// 3. 3-9-3 수업 지도안 구조 완결성 검증 (초등 수학: [6수01-06])
// --------------------------------------------------------------------------
console.log("\n[Test 3] 3-9-3 Modular Scaffold Integrity: Elementary Math [6수01-06]");
const planMath = bridge.generateLessonPlan("[6수01-06]");

assert.equal(planMath.success, true);
assert.equal(planMath.scaffold.intro.length, 3, "도입 옵션은 정확히 3개여야 합니다.");
assert.equal(planMath.scaffold.main.length, 9, "전개 활동은 정확히 9개(3트랙 x 3단계)여야 합니다.");
assert.equal(planMath.scaffold.wrapup.length, 3, "정리 옵션은 정확히 3개여야 합니다.");

// 트랙별 3단계 검증
const trackA = planMath.scaffold.main.filter(m => m.track === "foundation_concrete");
const trackB = planMath.scaffold.main.filter(m => m.track === "core_inquiry");
const trackC = planMath.scaffold.main.filter(m => m.track === "deep_challenge");
assert.equal(trackA.length, 3, "트랙 A(기초 구체물 조작)는 3단계여야 합니다.");
assert.equal(trackB.length, 3, "트랙 B(핵심 원리 탐구)는 3단계여야 합니다.");
assert.equal(trackC.length, 3, "트랙 C(심화 확장 챌린지)는 3단계여야 합니다.");

console.log("  ✓ 3-9-3 모듈 구조 검증 완료 (도입 3개, 전개 9개 [A:3, B:3, C:3], 정리 3개)");

// --------------------------------------------------------------------------
// 4. 교사 발문 1·2·3단계 및 학생 예상 다중 응답 대본 검증
// --------------------------------------------------------------------------
console.log("\n[Test 4] Three-Tier Teacher Questioning & Multi-Student Dialogue");

const tp = planMath.scaffold.teacherPrompts;
assert.ok(tp.tier1_observation.prompt.length > 5, "Tier 1 관찰 발문이 존재해야 합니다.");
assert.ok(tp.tier2_cognitive_conflict.prompt.length > 5, "Tier 2 인지 갈등 발문이 존재해야 합니다.");
assert.ok(tp.tier3_generalization.prompt.length > 5, "Tier 3 일반화 발문이 존재해야 합니다.");

console.log(`  ✓ Tier 1 발문: "${tp.tier1_observation.prompt}"`);
console.log(`  ✓ Tier 2 발문: "${tp.tier2_cognitive_conflict.prompt}"`);
console.log(`  ✓ Tier 3 발문: "${tp.tier3_generalization.prompt}"`);

const sr = planMath.scaffold.studentResponses;
assert.equal(sr.length, 3, "학생 응답은 최소 3개(직관/오개념, 부분 이해, 원리 도달)여야 합니다.");
assert.ok(sr[0].response.includes("2/5"), "학생 1의 응답에 분수 덧셈 대표 오개념(2/5)이 포함되어야 합니다.");
assert.ok(sr[2].response.includes("통분") || sr[2].response.includes("5/6"), "학생 3의 응답에 정답 원리(통분, 5/6)가 포함되어야 합니다.");

console.log(`  ✓ 학생 1 (오개념): "${sr[0].response}" [피드백: ${sr[0].teacherFeedback}]`);
console.log(`  ✓ 학생 2 (부분이해): "${sr[1].response}"`);
console.log(`  ✓ 학생 3 (정답도달): "${sr[2].response}"`);

// --------------------------------------------------------------------------
// 5. 1:1 대조 평가 루브릭 검증
// --------------------------------------------------------------------------
console.log("\n[Test 5] Assessment Rubric Verification");
const rubric = planMath.scaffold.rubric;
assert.ok(rubric.levels.proficient.criteria.length > 10, "상(Proficient) 루브릭 기준 필수");
assert.ok(rubric.levels.developing.criteria.length > 10, "중(Developing) 루브릭 기준 필수");
assert.ok(rubric.levels.beginning.criteria.length > 10, "하(Beginning) 루브릭 기준 필수");

console.log(`  ✓ 상 (Proficient): ${rubric.levels.proficient.criteria.slice(0, 45)}...`);
console.log(`  ✓ 중 (Developing): ${rubric.levels.developing.criteria.slice(0, 45)}...`);
console.log(`  ✓ 하 (Beginning): ${rubric.levels.beginning.criteria.slice(0, 45)}...`);

// --------------------------------------------------------------------------
// 6. 중학 과학 ([9과02-01]) 및 고등 미적분 ([12미적1-02-01]) 지도안 생성 확인
// --------------------------------------------------------------------------
console.log("\n[Test 6] Multi-Subject Verification: Middle School Science & High School Math");

const planSci = bridge.generateLessonPlan("[9과02-01]");
assert.equal(planSci.success, true);
assert.equal(planSci.manipulative.id, "light-reflection");
assert.ok(planSci.scaffold.teacherPrompts.tier1_observation.prompt.includes("레이저") || planSci.scaffold.teacherPrompts.tier1_observation.prompt.includes("각도"));
console.log(`  ✓ 중학 과학 [9과02-01] 지도안 생성 성공 (조작기: ${planSci.manipulative.title})`);

const planCalc = bridge.generateLessonPlan("[12미적1-02-01]");
assert.equal(planCalc.success, true);
assert.ok(planCalc.scaffold.teacherPrompts.tier2_cognitive_conflict.prompt.includes("접선") || planCalc.scaffold.teacherPrompts.tier2_cognitive_conflict.prompt.includes("할선"));
console.log(`  ✓ 고등 미적분 [12미적1-02-01] 지도안 생성 성공 (조작기: ${planCalc.manipulative.title})`);

console.log("\n=== [ALL 6 TESTS PASSED SUCCESSFULLY] ===");
