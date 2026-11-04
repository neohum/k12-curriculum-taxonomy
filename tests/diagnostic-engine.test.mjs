import test from "node:test";
import assert from "node:assert/strict";
import { TaxonomyGraphEngine } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";
import { DiagnosticAssessmentEngine, determinePiagetStage, recommendConcreteManipulative } from "../src/core/taxonomy/DiagnosticAssessmentEngine.mjs";
import { PiagetStage } from "../src/core/taxonomy/LessonTaxonomySchema.mjs";

test("TaxonomyGraphEngine: 메모리 그래프 인덱싱 및 위계 탐색", () => {
  const topics = [
    { id: "T_BASE", name: "10까지의 수 세기와 가르기", subject: "수학", domain: "수와 연산", ageRangeStart: 6, ageRangeEnd: 7 },
    { id: "T_ADD_SINGLE", name: "한 자리 수 덧셈", subject: "수학", domain: "수와 연산", ageRangeStart: 7, ageRangeEnd: 8 },
    { id: "T_ADD_CARRY", name: "받아올림이 있는 덧셈", subject: "수학", domain: "수와 연산", ageRangeStart: 8, ageRangeEnd: 9 }
  ];

  const dependencies = [
    { topicId: "T_ADD_SINGLE", prerequisiteId: "T_BASE", strength: "hard", reason: "수 가르기가 되어야 덧셈 가능" },
    { topicId: "T_ADD_CARRY", prerequisiteId: "T_ADD_SINGLE", strength: "hard", reason: "기본 덧셈이 되어야 받아올림 가능" }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies });

  // 1. 단일 주제 조회
  const tCarry = graph.getTopic("T_ADD_CARRY");
  assert.equal(tCarry.name, "받아올림이 있는 덧셈");

  // 2. 직간접 선수학습 조회
  const directPrereqs = graph.getPrerequisites("T_ADD_CARRY", false);
  assert.equal(directPrereqs.length, 1);
  assert.equal(directPrereqs[0].prerequisiteId, "T_ADD_SINGLE");

  const recursivePrereqs = graph.getPrerequisites("T_ADD_CARRY", true);
  assert.equal(recursivePrereqs.length, 2);
  const prereqIds = recursivePrereqs.map(p => p.prerequisiteId);
  assert.ok(prereqIds.includes("T_ADD_SINGLE"));
  assert.ok(prereqIds.includes("T_BASE"));

  // 3. 후속 주제 조회
  const dependents = graph.getDependents("T_BASE", true);
  assert.equal(dependents.length, 2);
});

test("TaxonomyGraphEngine: 결손 노드 역추적 (Graph Backtracking)", () => {
  const topics = [
    { id: "T_EQUAL_PART", name: "똑같이 나누기 (등분할)", subject: "수학" },
    { id: "T_FRAC_CONCEPT", name: "분수의 개념과 단위분수", subject: "수학" },
    { id: "T_FRAC_ADD_SAME", name: "동분모 분수의 덧셈", subject: "수학" },
    { id: "T_FRAC_ADD_DIFF", name: "이분모 분수의 덧셈 (통분)", subject: "수학" }
  ];

  const dependencies = [
    { topicId: "T_FRAC_CONCEPT", prerequisiteId: "T_EQUAL_PART", strength: "hard" },
    { topicId: "T_FRAC_ADD_SAME", prerequisiteId: "T_FRAC_CONCEPT", strength: "hard" },
    { topicId: "T_FRAC_ADD_DIFF", prerequisiteId: "T_FRAC_ADD_SAME", strength: "hard" }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies });

  // Case 1: 아무것도 마스터하지 못한 상태에서 T_FRAC_ADD_DIFF 실패
  // -> 가장 기저인 T_EQUAL_PART가 근본 원인
  const result1 = graph.backtrackRootCause("T_FRAC_ADD_DIFF", []);
  assert.equal(result1.rootCauseTopic.id, "T_EQUAL_PART");
  assert.deepEqual(result1.path, ["T_FRAC_ADD_DIFF", "T_FRAC_ADD_SAME", "T_FRAC_CONCEPT", "T_EQUAL_PART"]);

  // Case 2: T_EQUAL_PART와 T_FRAC_CONCEPT은 마스터했으나 T_FRAC_ADD_SAME 미마스터
  // -> 중간 연결고리인 T_FRAC_ADD_SAME이 근본 결손
  const result2 = graph.backtrackRootCause("T_FRAC_ADD_DIFF", ["T_EQUAL_PART", "T_FRAC_CONCEPT"]);
  assert.equal(result2.rootCauseTopic.id, "T_FRAC_ADD_SAME");
  assert.deepEqual(result2.path, ["T_FRAC_ADD_DIFF", "T_FRAC_ADD_SAME"]);

  // Case 3: 모든 선수학습 마스터 후 T_FRAC_ADD_DIFF 실패
  // -> 해당 주제 자체의 개념 도입 결손
  const result3 = graph.backtrackRootCause("T_FRAC_ADD_DIFF", ["T_EQUAL_PART", "T_FRAC_CONCEPT", "T_FRAC_ADD_SAME"]);
  assert.equal(result3.rootCauseTopic.id, "T_FRAC_ADD_DIFF");
  assert.deepEqual(result3.path, ["T_FRAC_ADD_DIFF"]);
});

test("DiagnosticAssessmentEngine: 피아제 단계 판별 및 추천 구체 조작물 매핑", () => {
  // 1. 피아제 단계 판별
  assert.equal(determinePiagetStage(5, 7), PiagetStage.PREOPERATIONAL);
  assert.equal(determinePiagetStage(8, 10), PiagetStage.CONCRETE_OPERATIONAL);
  assert.equal(determinePiagetStage(12, 14), PiagetStage.EARLY_FORMAL);
  assert.equal(determinePiagetStage(15, 17), PiagetStage.FORMAL_OPERATIONAL);

  // 2. 조작물 매핑
  const fracTopic = { name: "진분수의 덧셈", description: "분모가 같은 분수를 더하기", subject: "수학" };
  assert.equal(recommendConcreteManipulative(fracTopic).type, "fraction_bars");

  const placeValTopic = { name: "세 자리 수의 덧셈", description: "받아올림과 자릿값", subject: "수학" };
  assert.equal(recommendConcreteManipulative(placeValTopic).type, "10_frame_and_base10");

  const eqTopic = { name: "등식의 성질", description: "양팔 저울을 이용한 수평", subject: "수학" };
  assert.equal(recommendConcreteManipulative(eqTopic).type, "balance_scale");

  const soundTopic = { name: "소리의 세기와 높낮이", description: "물체의 진동과 소리", subject: "과학" };
  assert.equal(recommendConcreteManipulative(soundTopic).type, "sound_drum_rice");
});

test("DiagnosticAssessmentEngine: generateDiagnosticItem 문항 생성 검증", () => {
  const topics = [
    {
      id: "T_FRAC_01",
      name: "진분수의 크기 비교",
      subject: "수학",
      domain: "수와 연산",
      ageRangeStart: 9,
      ageRangeEnd: 10,
      description: "단위분수의 개수를 세어 분모가 같은 진분수의 크기를 비교한다.",
      evidence: [
        "분모가 같은 두 분수의 크기를 비교하여 부등호로 나타낼 수 있다.",
        "단위분수의 개념을 바탕으로 크기 비교 원리를 설명할 수 있다."
      ],
      standards: ["2022-MATH-4101"]
    }
  ];

  const teachingResearch = [
    {
      topicId: "T_FRAC_01",
      pedagogy: {
        commonMisconceptions: [
          "분모가 더 크면 분수의 전체 크기도 더 크다고 생각함",
          "분자와 분모를 각각 독립된 자연수로 보고 따로 더하거나 비교함"
        ]
      }
    }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies: [], teachingResearch });
  const engine = new DiagnosticAssessmentEngine(graph);

  const item = engine.generateDiagnosticItem("T_FRAC_01");

  assert.equal(item.topicId, "T_FRAC_01");
  assert.equal(item.piagetStage, PiagetStage.CONCRETE_OPERATIONAL);
  assert.equal(item.recommendedManipulative.type, "fraction_bars");
  assert.ok(item.stem.length > 0);
  assert.equal(item.options.length, 4);

  // 정답 1개 검증
  const correctOptions = item.options.filter(o => o.isCorrect);
  assert.equal(correctOptions.length, 1);
  assert.equal(correctOptions[0].id, "A");

  // 오답 선택지 3개에 오개념 주입 여부 확인
  const distractors = item.options.filter(o => !o.isCorrect);
  assert.equal(distractors.length, 3);
  assert.ok(distractors.some(d => d.misconception.includes("분모가 더 크면")));
});

test("DiagnosticAssessmentEngine: evaluateStudentSubmission 정답 및 오답 처방 리포트 검증", () => {
  const topics = [
    { id: "T_COUNT_10", name: "10의 보수와 가르기", subject: "수학", ageRangeStart: 7, ageRangeEnd: 8 },
    { id: "T_ADD_CARRY_2DIGIT", name: "두 자리 수의 받아올림 덧셈", subject: "수학", ageRangeStart: 8, ageRangeEnd: 9 }
  ];

  const dependencies = [
    { topicId: "T_ADD_CARRY_2DIGIT", prerequisiteId: "T_COUNT_10", strength: "hard" }
  ];

  const graph = new TaxonomyGraphEngine({ topics, dependencies });
  const engine = new DiagnosticAssessmentEngine(graph);

  // 1. 정답 제출 테스트
  const passReport = engine.evaluateStudentSubmission("T_ADD_CARRY_2DIGIT", true, "A", ["T_COUNT_10"]);
  assert.equal(passReport.passed, true);
  assert.equal(passReport.status, "MASTERED");
  assert.equal(passReport.rootCauseTopic, null);
  assert.equal(passReport.scaffoldingPrescription.status, "READY_FOR_ADVANCEMENT");

  // 2. 오답 제출 테스트 (선수학습 T_COUNT_10 미마스터)
  const failReport = engine.evaluateStudentSubmission("T_ADD_CARRY_2DIGIT", false, "B", []);
  assert.equal(failReport.passed, false);
  assert.equal(failReport.rootCauseTopic.id, "T_COUNT_10");
  assert.equal(failReport.rootCauseTopic.isPrerequisiteDeficit, true);
  assert.deepEqual(failReport.deficitPath, ["T_ADD_CARRY_2DIGIT", "T_COUNT_10"]);

  // 피아제 관점 분석 포함 확인
  assert.equal(failReport.piagetStageAnalysis.stage, PiagetStage.CONCRETE_OPERATIONAL);
  assert.ok(failReport.piagetStageAnalysis.analysis.includes("피아제 구체적 조작기"));
  assert.ok(failReport.piagetStageAnalysis.analysis.includes("보존 개념"));

  // 비고츠키 ZPD 3단계 비계 처방 확인
  const presc = failReport.scaffoldingPrescription;
  assert.equal(presc.remediationStages.length, 3);
  assert.equal(presc.remediationStages[0].stageNumber, 1);
  assert.ok(presc.remediationStages[0].nameKo.includes("구체물 조작 비계"));
  assert.ok(presc.remediationStages[1].nameKo.includes("시각적 표상"));
  assert.ok(presc.remediationStages[2].nameKo.includes("비계 철거"));
  assert.equal(presc.stepByStepGuide.length, 3);

  // 추천 교구 확인
  assert.equal(failReport.recommendedManipulative.type, "10_frame_and_base10");
  assert.ok(failReport.pedagogicalReportSummary.includes("[학습 진단 처방서]"));
});

test("DiagnosticAssessmentEngine: 실제 os-taxonomy 데이터셋 통합 검증", () => {
  // 실제 data/os-taxonomy 파일들을 로드하여 통합 검증
  const graph = new TaxonomyGraphEngine();
  const engine = new DiagnosticAssessmentEngine(graph);

  // mt__00ZSLnB7p (Volume & Vibrations, Science)
  const topic = graph.getTopic("mt__00ZSLnB7p");
  assert.ok(topic != null);
  assert.equal(topic.id, "mt__00ZSLnB7p");

  // 문항 생성
  const item = engine.generateDiagnosticItem("mt__00ZSLnB7p");
  assert.equal(item.topicId, "mt__00ZSLnB7p");
  assert.equal(item.options.length, 4);
  assert.ok(item.misconceptionsTested.length > 0);

  // 오답 평가 및 역추적
  const report = engine.evaluateStudentSubmission("mt__00ZSLnB7p", false, "B", []);
  assert.equal(report.passed, false);
  assert.ok(report.rootCauseTopic != null);
  assert.ok(report.deficitPath.length >= 1);
  assert.ok(report.scaffoldingPrescription.remediationStages.length === 3);
});
