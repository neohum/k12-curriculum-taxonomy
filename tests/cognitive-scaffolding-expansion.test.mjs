import test from "node:test";
import assert from "node:assert/strict";
import { 
  CognitiveScaffoldingEngine, 
  LessonTaxonomySchema, 
  ManipulativeEngineType,
  BrunerRepresentation
} from "../src/core/taxonomy/index.mjs";

test("K-12 인지 위계 온톨로지 및 DAG Backtracking 역추적 검증", () => {
  const engine = new CognitiveScaffoldingEngine();

  // 1. 미적분 오답에 대한 초·중·고 인과 역추적 실행
  const result = engine.backtrackCausalChain("미적분");
  assert.equal(result.success, true);
  assert.ok(result.causalSteps.length >= 5, "초등 1학년까지 5단계 이상 역추적되어야 함");
  assert.equal(result.isCrossSchoolLevel, true, "초등·중학교·고등학교를 모두 관통해야 함");

  // 최상위 단계 확인
  assert.equal(result.originTopic.schoolLevel, "고등학교");
  assert.ok(result.originTopic.topic.includes("순간변화율") || result.originTopic.topic.includes("미분"));

  // 최하위 기초 결손 노드 확인
  const foundation = result.rootCauseFoundation;
  assert.equal(foundation.schoolLevel, "초등학교");
  assert.equal(foundation.grade, 1);
  assert.ok(foundation.topic.includes("수 세기") || foundation.topic.includes("몇일까요"));
  assert.ok(foundation.deficitConcept.includes("일대일 대응") || foundation.deficitConcept.includes("기수성"));
});

test("피아제·비고츠키 3-Tier 구체 조작기 및 발문 비계 자동 생성 검증", () => {
  const engine = new CognitiveScaffoldingEngine();
  const chainResult = engine.backtrackCausalChain("일차방정식");
  assert.equal(chainResult.success, true);

  const step = chainResult.originTopic;
  const scaffolding = engine.generateScaffoldingSpec(step);

  // 1. 브루너 3단계 표상 검증
  assert.ok(scaffolding.brunersRepresentations.enactive);
  assert.ok(scaffolding.brunersRepresentations.iconic);
  assert.ok(scaffolding.brunersRepresentations.symbolic);
  assert.equal(scaffolding.brunersRepresentations.enactive.level, BrunerRepresentation.ENACTIVE);

  // 2. 등식/방정식 주제에 대해 PhET 양팔 저울 자동 바인딩 검증
  assert.equal(scaffolding.brunersRepresentations.enactive.toolType, ManipulativeEngineType.PHET_BALANCE_SCALE);

  // 3. 비고츠키 3단계 발문 검증
  assert.ok(scaffolding.vygotskyScaffolding.activationPrompt.length > 5);
  assert.ok(scaffolding.vygotskyScaffolding.cognitiveConflictPrompt.length > 5);
  assert.ok(scaffolding.vygotskyScaffolding.internalizationPrompt.length > 5);
  assert.ok(Array.isArray(scaffolding.vygotskyScaffolding.dialogueScript));
  assert.ok(scaffolding.vygotskyScaffolding.dialogueScript.length >= 4);
});

test("초등 1학년 수 세기 주제 시 Three.js 3D 리깅 핸드 엔진 자동 바인딩 검증", () => {
  const engine = new CognitiveScaffoldingEngine();
  const chainResult = engine.backtrackCausalChain("몇일까요");
  assert.equal(chainResult.success, true);

  const foundation = chainResult.rootCauseFoundation;
  const scaffolding = engine.generateScaffoldingSpec(foundation);

  assert.equal(scaffolding.brunersRepresentations.enactive.toolType, ManipulativeEngineType.THREE_RIGGED_HAND);
  assert.ok(scaffolding.brunersRepresentations.enactive.toolNameKo.includes("3D 리깅 핸드"));
});

test("LLM 무한 콘텐츠 증폭 메타데이터 번들 생성 검증", () => {
  const engine = new CognitiveScaffoldingEngine();
  const bundle = engine.generateLLMExpansionBundle("분수의 덧셈");

  assert.equal(bundle.success, true);
  assert.ok(bundle.llmPrompt.includes("K-12 인지 위계 온톨로지 기반 정밀 차시 생성 지시서"));
  assert.ok(bundle.llmPrompt.includes("오답 초·중·고 인과 역추적"));
  assert.ok(bundle.llmPrompt.includes("피아제·비고츠키 3-Tier 구체 조작기 & 발문 비계"));
  assert.ok(bundle.llmPrompt.includes("40분 완결 수업"));

  // 메타데이터 검증 스키마 통과 확인
  const metaValidation = LessonTaxonomySchema.validate({
    targetGradeGroup: "elementary_high",
    piagetStage: "concrete_operational",
    recommendedPeriod: {
      unit: "분수의 덧셈과 뺄셈",
      period: 1,
      phase: "introduction"
    },
    levels: ["초등"]
  });
  assert.equal(metaValidation.isValid, true);
});
