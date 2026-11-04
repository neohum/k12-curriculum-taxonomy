import test from "node:test";
import assert from "node:assert/strict";
import { TaxonomyGraphEngine } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";
import { LessonPlannerRAG } from "../src/core/taxonomy/LessonPlannerRAG.mjs";
import { ModularLessonScaffoldSchema } from "../src/core/modular/ModularLessonScaffoldSchema.mjs";

test("LessonPlannerRAG: 3-9-3 모듈러 비계 구조 생성 검증", () => {
  const topics = [
    {
      id: "T_FRAC_ADD_01",
      name: "동분모 분수의 덧셈",
      subject: "수학",
      domain: "수와 연산",
      ageRangeStart: 9,
      ageRangeEnd: 10,
      description: "분모가 같은 두 분수를 더할 때 분모는 그대로 두고 분자끼리 더하는 원리를 이해한다.",
      evidence: [
        "분모가 같은 두 분수의 덧셈 원리를 구체물과 그림으로 설명할 수 있다.",
        "분모는 그대로 두고 분자만 더하는 이유를 단위분수의 개수로 정당화할 수 있다."
      ],
      standards: ["2022-MATH-4103"]
    }
  ];

  const teachingResearch = [
    {
      topicId: "T_FRAC_ADD_01",
      pedagogy: {
        commonMisconceptions: [
          "분수 덧셈 시 분모끼리도 더하고 분자끼리도 더하는 오류 (예: 1/4 + 2/4 = 3/8)",
          "분수를 하나의 단일 수가 아닌 두 개의 독립된 자연수로 취급함"
        ],
        bestPractices: [
          "분수 막대를 나란히 이어붙여 전체 기준 단위(1)에 대한 부분의 확장을 시각화함"
        ]
      },
      learn: {
        activities: [
          {
            title: "분수 막대 이어붙이기 탐구",
            rationale: "분모가 전체를 몇 개로 나눈 것인지를 보존하고 분자만 합산됨을 증명"
          }
        ]
      }
    }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies: [], teachingResearch });
  const rag = new LessonPlannerRAG(graph);

  const plan = rag.generateLessonPlan("T_FRAC_ADD_01");

  // 1. 메타데이터 검증
  assert.equal(plan.meta.topicId, "T_FRAC_ADD_01");
  assert.equal(plan.meta.manipulative.type, "fraction_bars");

  // 2. 3-9-3 구조 검증
  const { intro, development, wrapup } = plan.modular393;
  assert.equal(intro.length, 3, "도입 옵션은 정확히 3개여야 함");
  assert.equal(development.length, 9, "전개 활동은 정확히 9개(3개 트랙 × 3단계)여야 함");
  assert.equal(wrapup.length, 3, "정리 옵션은 정확히 3개여야 함");

  // 전개 3개 트랙(각 3개) 검증
  const trackA = development.filter(d => d.track === "foundation_concrete");
  const trackB = development.filter(d => d.track === "core_inquiry");
  const trackC = development.filter(d => d.track === "deep_challenge");
  assert.equal(trackA.length, 3);
  assert.equal(trackB.length, 3);
  assert.equal(trackC.length, 3);

  // 3. 교수-학습 연구 데이터 주입(RAG) 확인
  assert.ok(plan.researchContext.injectedMisconceptions.length >= 2);
  assert.ok(plan.researchContext.injectedMisconceptions[0].includes("분모끼리도 더하고"));
  assert.ok(plan.researchContext.masteryCriteria.length >= 1);
});

test("LessonPlannerRAG: 교사 1·2·3단계 발문 및 학생 다중 응답 대본 검증", () => {
  const topics = [
    {
      id: "T_BALANCE_01",
      name: "등식의 성질과 양팔 저울",
      subject: "수학",
      ageRangeStart: 10,
      ageRangeEnd: 11,
      description: "등식의 양변에 같은 수를 더하거나 빼도 등식이 성립함을 양팔 저울의 수평으로 이해한다.",
      evidence: ["양팔 저울의 평형 원리를 통해 등식의 성질을 설명할 수 있다."]
    }
  ];

  const teachingResearch = [
    {
      topicId: "T_BALANCE_01",
      pedagogy: {
        commonMisconceptions: [
          "등호(=)를 양변의 동치가 아닌 '계산 결과를 쓰는 기호'로만 오해함"
        ]
      }
    }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies: [], teachingResearch });
  const rag = new LessonPlannerRAG(graph);

  const plan = rag.generateLessonPlan("T_BALANCE_01");
  const dialog = plan.dialogScript;

  // 1. 발문 3단계 구조 확인
  assert.equal(dialog.length, 3);
  assert.equal(dialog[0].tier, 1);
  assert.equal(dialog[1].tier, 2);
  assert.equal(dialog[2].tier, 3);

  // 2. 발문별 최소 2인 이상 학생 응답 확인
  dialog.forEach((turn, idx) => {
    assert.ok(turn.teacher.length > 0, `턴 #${idx + 1} 교사 발문 필수`);
    assert.ok(Array.isArray(turn.students) && turn.students.length >= 2, `턴 #${idx + 1} 학생 최소 2인 이상`);
  });

  // 3. 2단계 인지 갈등 발문에서 오개념과 반례 대화 반영 확인
  const tier2 = dialog[1];
  assert.ok(tier2.students.some(s => s.name.includes("오개념")));
  assert.ok(tier2.students.some(s => s.name.includes("반례")));
});

test("LessonPlannerRAG: 1:1 대조 평가 루브릭 검증", () => {
  const topics = [
    {
      id: "T_SOUND_01",
      name: "소리의 세기와 북의 진동",
      subject: "과학",
      ageRangeStart: 9,
      ageRangeEnd: 10,
      evidence: ["북을 세게 칠수록 쌀알이 높이 튀고 소리가 커짐을 설명할 수 있다."]
    }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies: [] });
  const rag = new LessonPlannerRAG(graph);

  const plan = rag.generateLessonPlan("T_SOUND_01");
  const rubric = plan.rubric;

  // 상, 중, 하 3단계 루브릭 검증
  assert.equal(rubric.length, 3);
  const levels = rubric.map(r => r.level);
  assert.deepEqual(levels, ["상", "중", "하"]);

  rubric.forEach(r => {
    assert.ok(r.criteria.length > 0);
    assert.ok(r.studentResponseSample.length > 0);
    assert.ok(r.teacherFeedbackGuide.length > 0);
  });
});

test("LessonPlannerRAG: ModularLessonScaffoldSchema 정규 스키마 호환 검증", () => {
  const topics = [
    {
      id: "T_CIRCUIT_01",
      name: "전기 회로의 연결과 전구의 밝기",
      subject: "과학",
      domain: "물질과 에너지",
      ageRangeStart: 10,
      ageRangeEnd: 11,
      evidence: ["전지의 직렬과 병렬연결에 따른 전구의 밝기 변화를 비교할 수 있다."],
      standards: ["2022-SCI-5102"]
    }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies: [] });
  const rag = new LessonPlannerRAG(graph);

  const scaffold = rag.generateLessonPlan("T_CIRCUIT_01", { asModularScaffold: true });

  // ModularLessonScaffoldSchema 검증 통과 확인
  const validation = ModularLessonScaffoldSchema.validate(scaffold);
  assert.equal(validation.isValid, true, `스키마 위반 에러 발생: ${validation.errors.join(", ")}`);
  assert.equal(validation.errors.length, 0);
});

test("LessonPlannerRAG: 실제 os-taxonomy 데이터셋 통합 수업 설계 검증", () => {
  const graph = new TaxonomyGraphEngine();
  const rag = new LessonPlannerRAG(graph);

  // mt__00ZSLnB7p (Volume & Vibrations)
  const plan = rag.generateLessonPlan("mt__00ZSLnB7p");

  assert.equal(plan.meta.topicId, "mt__00ZSLnB7p");
  assert.equal(plan.modular393.intro.length, 3);
  assert.equal(plan.modular393.development.length, 9);
  assert.equal(plan.modular393.wrapup.length, 3);
  assert.ok(plan.researchContext.injectedMisconceptions.length > 0);
  assert.equal(plan.dialogScript.length, 3);
  assert.equal(plan.rubric.length, 3);
});
