import test from "node:test";
import assert from "node:assert/strict";
import { LessonTaxonomySchema, TargetGradeGroup, PiagetStage, LessonPhase } from "../src/core/taxonomy/LessonTaxonomySchema.mjs";

test("LessonTaxonomySchema - 정상 메타데이터 검증 통과", () => {
  const validMeta = {
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_LOW,
    piagetStage: PiagetStage.PREOPERATIONAL,
    levels: ["초등"],
    recommendedPeriod: {
      unit: "5단원 글자에 관심을 가져요",
      period: 2,
      phase: LessonPhase.EXPLORATION,
      durationMinutes: 40
    }
  };

  const result = LessonTaxonomySchema.validate(validMeta);
  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test("LessonTaxonomySchema - 광역 학교급 뭉뚱그림(초등+고등) 감지 및 거부", () => {
  const broadMeta = {
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_MID,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL,
    levels: ["초등", "고등학교"], // 금지된 광역 표기
    recommendedPeriod: {
      unit: "분수의 덧셈",
      period: 3,
      phase: LessonPhase.EXPLORATION
    }
  };

  const result = LessonTaxonomySchema.validate(broadMeta);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.some(e => e.includes("광역 학교급 중복 금지 위반")));
});

test("LessonTaxonomySchema - 차시 및 피아제 단계 누락 검증", () => {
  const invalidMeta = {
    targetGradeGroup: "invalid_group",
    levels: ["중학교"]
  };

  const result = LessonTaxonomySchema.validate(invalidMeta);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.length >= 3);
});
