import test from "node:test";
import assert from "node:assert/strict";
import { CurriculumRemappingEngine } from "../src/core/taxonomy/CurriculumRemappingEngine.mjs";
import { TargetGradeGroup, PiagetStage, LessonTaxonomySchema } from "../src/core/taxonomy/LessonTaxonomySchema.mjs";

test("CurriculumRemappingEngine - 고난도 물리/미적분 자료 고등학교 형식적 조작기 분류", () => {
  const engine = new CurriculumRemappingEngine();
  const rawLesson = {
    id: "quantum-mechanics-sim",
    title: "빛의 파동성과 광전효과 시뮬레이터",
    description: "광양자설과 일함수, 전자기 유도 현상을 가변 전압으로 관찰",
    subject: "과학",
    levels: ["초등", "중학교", "고등학교"], // 기존 광역 오염
    grades: "초6~고3"
  };

  const remapped = engine.remap(rawLesson);
  assert.equal(remapped.targetGradeGroup, TargetGradeGroup.HIGH);
  assert.equal(remapped.piagetStage, PiagetStage.FORMAL_OPERATIONAL);
  assert.deepEqual(remapped.levels, ["고등학교"]); // 광역 오염 해소
  assert.equal(remapped.recommendedPeriod.durationMinutes, 50);

  const validation = LessonTaxonomySchema.validate(remapped);
  assert.equal(validation.isValid, true);
});

test("CurriculumRemappingEngine - 초등 한글/글자 자료 저학년 전조작기 분류", () => {
  const engine = new CurriculumRemappingEngine();
  const rawLesson = {
    id: "hangul-letter-intro",
    title: "글자에 관심을 가져요 (초성·중성 플랩)",
    description: "소리내어 읽고 자음과 모음을 바꾸어 보는 낱말 놀이",
    subject: "국어",
    levels: ["초등", "중학교"],
    grades: "초1~중1"
  };

  const remapped = engine.remap(rawLesson);
  assert.equal(remapped.targetGradeGroup, TargetGradeGroup.ELEMENTARY_LOW);
  assert.equal(remapped.piagetStage, PiagetStage.PREOPERATIONAL);
  assert.deepEqual(remapped.levels, ["초등"]);
  assert.equal(remapped.recommendedPeriod.touchTargetMinPx, 56); // 1학년 56px+ 터치

  const validation = LessonTaxonomySchema.validate(remapped);
  assert.equal(validation.isValid, true);
});

test("CurriculumRemappingEngine - 초등 태양계/비와비율 자료 고학년 구체적조작기 분류", () => {
  const engine = new CurriculumRemappingEngine();
  const rawLesson = {
    id: "solar-system-scale",
    title: "태양계 행성의 크기와 거리 비율 비교",
    description: "행성들의 공전 궤도와 행성 크기 비례 시뮬레이션",
    subject: "과학",
    levels: ["초등", "중학교", "고등학교"],
    grades: "초4~고3"
  };

  const remapped = engine.remap(rawLesson);
  assert.equal(remapped.targetGradeGroup, TargetGradeGroup.ELEMENTARY_HIGH);
  assert.deepEqual(remapped.levels, ["초등"]);
  assert.equal(remapped.recommendedPeriod.durationMinutes, 40);

  const validation = LessonTaxonomySchema.validate(remapped);
  assert.equal(validation.isValid, true);
});
