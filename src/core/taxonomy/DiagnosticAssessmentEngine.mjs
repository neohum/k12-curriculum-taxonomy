import { TaxonomyGraphEngine } from "./TaxonomyGraphEngine.mjs";
import { PiagetStage } from "./LessonTaxonomySchema.mjs";

/**
 * 피아제 인지 발달 단계 판별 헬퍼
 */
export function determinePiagetStage(ageStart, ageEnd) {
  const midAge = (ageStart != null && ageEnd != null) 
    ? (ageStart + ageEnd) / 2 
    : (ageStart ?? ageEnd ?? 9);

  if (midAge <= 7) {
    return PiagetStage.PREOPERATIONAL;
  }
  if (midAge <= 11) {
    return PiagetStage.CONCRETE_OPERATIONAL;
  }
  if (midAge <= 14) {
    return PiagetStage.EARLY_FORMAL;
  }
  return PiagetStage.FORMAL_OPERATIONAL;
}

/**
 * 주제 특성 및 도메인 기반 추천 구체적 조작물(Concrete Manipulative) 도출
 */
export function recommendConcreteManipulative(topic) {
  if (!topic) {
    return {
      type: "concrete_counters_and_tiles",
      nameKo: "구체물 조작 칩 (Concrete Counters) 및 시각화 모델",
      guide: "물리적 조작물을 직접 손으로 배치하며 개념의 보존성과 변화 원리를 체득합니다."
    };
  }

  const text = `${topic.name || ""} ${topic.description || ""} ${topic.subject || ""} ${topic.domain || ""}`.toLowerCase();

  // 1. 분수 (Fractions)
  if (text.includes("fraction") || text.includes("분수")) {
    return {
      type: "fraction_bars",
      nameKo: "분수 막대 (Fraction Bars) 및 원형 분수판 (Fraction Circles)",
      guide: "전체에 대한 부분의 크기를 막대를 포개어 비교하고, 등가분수 및 덧셈·뺄셈의 양감을 직관적으로 형성합니다."
    };
  }

  // 2. 자릿값 및 덧셈/뺄셈, 10의 보수 (Place Value, Addition, Subtraction, 10-Frame)
  if (text.includes("place value") || text.includes("자릿값") || text.includes("addition") || text.includes("subtraction") || text.includes("덧셈") || text.includes("뺄셈") || text.includes("10-frame") || text.includes("보수") || text.includes("가르기") || text.includes("모으기")) {
    return {
      type: "10_frame_and_base10",
      nameKo: "10칸 프레임 (10-Frame) 및 십진 수모형 (Base-10 Blocks)",
      guide: "10 만들기, 십진법 자리올림과 자릿수 내림을 수모형 칩의 물리적 묶음과 치환으로 시각화합니다."
    };
  }

  // 3. 곱셈 및 나눗셈 (Multiplication, Division)
  if (text.includes("multiplication") || text.includes("division") || text.includes("곱셈") || text.includes("나눗셈") || text.includes("배열")) {
    return {
      type: "array_grid_counters",
      nameKo: "바둑판 배열 격자 (Array Grid) 및 묶음 바둑돌",
      guide: "행과 열의 직사각형 넓이 모델 및 묶어 세기, 똑같이 나누기 조작을 통해 곱셈구구와 몫의 구조를 이해합니다."
    };
  }

  // 4. 등식 및 방정식, 저울 (Balance, Equality, Equation)
  if (text.includes("balance") || text.includes("equation") || text.includes("저울") || text.includes("등식") || text.includes("방정식") || text.includes("동치")) {
    return {
      type: "balance_scale",
      nameKo: "수학 양팔 저울 (Math Balance Scale)",
      guide: "등호(=)의 본질인 양변의 물리적 수평 평형 관계를 추를 매달고 빼보며 동치 원리를 직접 체험합니다."
    };
  }

  // 5. 기하 및 도형, 각도 (Geometry, Shape, Angle)
  if (text.includes("geometry") || text.includes("shape") || text.includes("angle") || text.includes("도형") || text.includes("각도") || text.includes("삼각형") || text.includes("사각형")) {
    return {
      type: "pattern_blocks_geoboard",
      nameKo: "패턴 블록 (Pattern Blocks) 및 점판 (Geoboard)",
      guide: "다양한 다각형 조각 맞추기와 고무줄 걸기를 통해 변, 꼭짓점, 각의 공간적 보존성을 탐색합니다."
    };
  }

  // 6. 소리와 진동 (Sound, Vibration)
  if (text.includes("sound") || text.includes("vibration") || text.includes("소리") || text.includes("진동") || text.includes("음")) {
    return {
      type: "sound_drum_rice",
      nameKo: "소리 북과 쌀알 (Drum with Rice) 및 탄성 밴드",
      guide: "북면의 쌀알 튐 높이를 통해 진폭(소리의 크기)과 진동수(소리의 높낮이)를 시각적으로 분리 관찰합니다."
    };
  }

  // 7. 전기 회로 (Circuit, Electricity)
  if (text.includes("circuit") || text.includes("electricity") || text.includes("전기") || text.includes("회로")) {
    return {
      type: "circuit_lab_kit",
      nameKo: "꼬마전구·건전지 회로 조작 키트 (Circuit Lab Kit)",
      guide: "스위치 개폐 및 직·병렬 연결에 따른 전류의 흐름을 전구 불빛 밝기와 모터 회전으로 확인합니다."
    };
  }

  // 8. 알고리즘 및 코딩 (Algorithm, Instructions)
  if (text.includes("algorithm") || text.includes("instruction") || text.includes("programming") || text.includes("순서") || text.includes("알고리즘") || text.includes("명령")) {
    return {
      type: "unplugged_arrow_cards",
      nameKo: "언플러그드 화살표 명령 카드 (Unplugged Arrow Cards)",
      guide: "바닥 격자판 위에서 화살표 카드를 차례대로 놓으며 순차와 반복, 조건 분기를 신체적으로 체험합니다."
    };
  }

  return {
    type: "concrete_counters_and_tiles",
    nameKo: "구체물 조작 칩 (Concrete Counters) 및 시각화 모델",
    guide: "물리적 조작물을 직접 손으로 배치하며 개념의 보존성과 변화 원리를 체득합니다."
  };
}

/**
 * DiagnosticAssessmentEngine (진단 평가 및 비계 처방 엔진)
 * 
 * - TaxonomyGraphEngine과 연결되어 교육과정 노드의 진단 문항을 자동 생성.
 * - 학습자 응답 평가 시 오답에 대해 DAG 역추적(Backtracking)을 수행하여 선수 결손을 특정.
 * - 피아제(Piaget) 인지 발달 단계 및 비고츠키(Vygotsky) ZPD 이론 기반 구조화 처방 리포트 발행.
 */
export class DiagnosticAssessmentEngine {
  constructor(graphEngine = null) {
    this.graph = graphEngine || new TaxonomyGraphEngine();
  }

  /**
   * 단일 주제에 대한 진단 평가 문항(Diagnostic Item) 자동 생성
   * 
   * @param {string} topicId
   * @returns {object} 진단 문항 객체 (stem, options, evidence, misconceptionsTested, manipulative)
   */
  generateDiagnosticItem(topicId) {
    this.graph.ensureLoaded();
    const topic = this.graph.getTopic(topicId);
    if (!topic) {
      throw new Error(`주제를 찾을 수 없습니다: ${topicId}`);
    }

    const evidenceList = this.graph.getEvidence(topicId);
    const misconceptions = this.graph.getCommonMisconceptions(topicId);
    const manipulative = recommendConcreteManipulative(topic);
    const piagetStage = determinePiagetStage(topic.ageRangeStart, topic.ageRangeEnd);

    // 1. 발문(Stem) 생성
    let stem = "";
    if (topic.assessmentPrompt) {
      stem = topic.assessmentPrompt
        .replace(/\{\{name\}\}/g, "학생")
        .trim();
    } else if (evidenceList.length > 0) {
      stem = `[${topic.name}] 다음 상황에서 '${evidenceList[0]}'을(를) 확인하고자 합니다. 올바른 설명이나 결과를 고르시오.`;
    } else {
      stem = `[${topic.name}] 다음 중 '${topic.description}'에 대해 가장 올바르게 설명한 것을 고르시오.`;
    }

    // 2. 정답 선택지 생성 (Evidence 기반 올바른 개념 명제)
    const correctStatement = evidenceList.length > 0
      ? `${evidenceList[0]}에 부합하도록 현상을 바르게 설명한다.`
      : `${topic.name}의 핵심 원리에 따라 올바른 규칙을 적용한다.`;

    const options = [
      {
        id: "A",
        text: correctStatement,
        isCorrect: true,
        misconception: null,
        rationale: "성취기준에 부합하는 올바른 개념적 이해입니다."
      }
    ];

    // 3. 오답 선택지(Distractors) 생성 (teaching-research.json의 commonMisconceptions 기반)
    const usedMisconceptions = [];
    const distractorLetters = ["B", "C", "D"];

    if (misconceptions.length > 0) {
      for (let i = 0; i < Math.min(3, misconceptions.length); i++) {
        const misc = misconceptions[i];
        usedMisconceptions.push(misc);
        options.push({
          id: distractorLetters[i],
          text: `[오개념] ${misc}`,
          isCorrect: false,
          misconception: misc,
          rationale: `흔한 오개념 반영: ${misc}`
        });
      }
    }

    // 4. 선택지가 부족할 경우 표준적인 인지적 오류 보완
    while (options.length < 4) {
      const idx = options.length - 1;
      const genericMisc = `직관적 겉보기 모양만으로 판단하여 원리를 반대로 적용하는 오류 #${idx + 1}`;
      usedMisconceptions.push(genericMisc);
      options.push({
        id: distractorLetters[idx],
        text: `외형적 변화에만 집중하여 ${topic.name}의 규칙과 반대로 결론을 내린다.`,
        isCorrect: false,
        misconception: genericMisc,
        rationale: "직관적 인지 편향에 따른 오답 선택지입니다."
      });
    }

    return {
      itemId: `diag_${topic.id}_${Date.now()}`,
      topicId: topic.id,
      topicName: topic.name,
      subject: topic.subject,
      domain: topic.domain,
      stem,
      options,
      correctOptionId: "A",
      evidence: evidenceList,
      misconceptionsTested: usedMisconceptions,
      piagetStage,
      recommendedManipulative: manipulative,
      targetAge: {
        start: topic.ageRangeStart,
        end: topic.ageRangeEnd
      },
      standards: topic.standards || []
    };
  }

  /**
   * 학생의 진단 제출 응답 평가 및 위계 역추적 비계 처방
   * 
   * @param {string} topicId - 평가 대상 주제 ID
   * @param {boolean} isCorrect - 정답 여부
   * @param {any} studentAnswer - 학생이 제출한 답안
   * @param {string[]} masteredTopicIds - 학생이 이미 마스터한 선수 주제 ID 목록
   * @returns {object} 교육학적 진단 처방 리포트
   */
  evaluateStudentSubmission(topicId, isCorrect, studentAnswer, masteredTopicIds = []) {
    this.graph.ensureLoaded();
    const topic = this.graph.getTopic(topicId);
    if (!topic) {
      throw new Error(`주제를 찾을 수 없습니다: ${topicId}`);
    }

    const manipulative = recommendConcreteManipulative(topic);
    const topicPiaget = determinePiagetStage(topic.ageRangeStart, topic.ageRangeEnd);

    // [CASE 1] 정답 통과 시
    if (isCorrect) {
      const dependents = this.graph.getDependents(topicId);
      return {
        passed: true,
        topicId,
        topicName: topic.name,
        rootCauseTopic: null,
        status: "MASTERED",
        studentAnswer,
        piagetStageAnalysis: {
          stage: topicPiaget,
          status: "COMPLIANT",
          observation: `학습자가 ${topicPiaget} 단계의 인지적 조작 능력을 충실히 발휘하여 문제를 성공적으로 해결하였습니다.`
        },
        scaffoldingPrescription: {
          status: "READY_FOR_ADVANCEMENT",
          zpdTarget: "NEXT_STAGE",
          nextRecommendedTopics: dependents.map(d => ({
            id: d.topicId,
            name: this.graph.getTopic(d.topicId)?.name || d.topicId,
            strength: d.strength
          }))
        },
        recommendedManipulative: manipulative,
        pedagogicalReportSummary: `[진단 통과] 학습자가 '${topic.name}'의 핵심 성취 기준을 성공적으로 달성하였습니다. 다음 상위 위계 학습으로의 확장을 권장합니다.`
      };
    }

    // [CASE 2] 오답 발생 시: 인지 위계 그래프 역추적(Backtracking) 실행
    const backtrackResult = this.graph.backtrackRootCause(topicId, masteredTopicIds);
    const rootCauseTopic = backtrackResult.rootCauseTopic;
    const rootCauseManipulative = recommendConcreteManipulative(rootCauseTopic);
    const rootCausePiaget = determinePiagetStage(rootCauseTopic.ageRangeStart, rootCauseTopic.ageRangeEnd);
    const isPrerequisiteDeficit = rootCauseTopic.id !== topicId;

    // 1. 피아제(Piaget) 인지 발달 단계 분석 (구체적 조작기 vs 형식적 조작기 관점)
    let piagetAnalysisText = "";
    if (rootCausePiaget === PiagetStage.CONCRETE_OPERATIONAL) {
      piagetAnalysisText = `피아제 구체적 조작기(만 8~11세) 관점 분석: 학습자가 구체물 조작을 통한 보존 개념(conservation)과 가역적 사고(reversibility)를 충분히 체화하지 못한 상태에서, 형식적 기호나 추상적 연산 규칙으로 조기 진입하여 인지적 불균형(disequilibrium)이 발생했습니다. ${rootCauseManipulative.nameKo} 교구를 활용하여 직관적인 물리적 조작 경험을 선행해야 합니다.`;
    } else if (rootCausePiaget === PiagetStage.PREOPERATIONAL) {
      piagetAnalysisText = `피아제 전조작기(만 6~7세) 관점 분석: 지각적 중심화(centration) 및 직관적 판단으로 인해 사물의 단일 외형적 속성에만 주의를 빼앗겨 인지 오류가 유발되었습니다. 다감각적 구체물 비교를 통한 비계 설정이 필요합니다.`;
    } else {
      piagetAnalysisText = `피아제 형식적 조작기(만 12세 이상) 관점 분석: 가설 연역적 사고 및 변인 통제 논리가 요구되는 문맥이나, 하위 구체적 모델의 표상이 불안정하여 추상적 규칙을 일반화하는 과정에서 인지 과부하가 발생했습니다.`;
    }

    // 2. 비고츠키(Vygotsky) ZPD 기반 점진적 비계 처방
    const scaffoldingPrescription = {
      theory: "비고츠키 근접발달영역(ZPD, Zone of Proximal Development) 기반 3단계 비계 설정",
      zpdTarget: {
        id: rootCauseTopic.id,
        name: rootCauseTopic.name,
        deficitType: isPrerequisiteDeficit ? "PREREQUISITE_FOUNDATION_DEFICIT" : "CURRENT_CONCEPT_DEFICIT"
      },
      recommendedManipulative: rootCauseManipulative,
      remediationStages: [
        {
          stageNumber: 1,
          nameKo: "1단계: 구체물 조작 비계 (Enactive Stage)",
          guide: `${rootCauseManipulative.nameKo} 교구를 사용하여 물리적으로 직접 만지고 조작하며 원리를 신체화합니다. (${rootCauseManipulative.guide})`
        },
        {
          stageNumber: 2,
          nameKo: "2단계: 시각적 표상 및 대화 비계 (Iconic Stage / Habruta)",
          guide: "구체물 조작 과정을 그림, 수직선, 다이어그램으로 시각화하고, 교사의 힌트 발문과 또래 상호작용을 통해 사적 언어로 생각을 말로 표현합니다."
        },
        {
          stageNumber: 3,
          nameKo: "3단계: 상징적 기호화 및 비계 철거 (Symbolic Stage / Fading)",
          guide: "시각 모델을 수학적·과학적 공식 및 기호로 치환하고, 제공되던 힌트를 점진적으로 철거(Fading)하여 스스로 문제를 해결하도록 유도합니다."
        }
      ],
      stepByStepGuide: [
        `1. 선수 결손 노드 [${rootCauseTopic.name}]에 대한 ${rootCauseManipulative.nameKo} 1:1 조작 실습을 10~15분간 진행합니다.`,
        "2. 조작 과정에서 발견한 규칙을 학습자의 언어로 설명하도록 유도 발문을 제시합니다.",
        `3. 본래 평가 문항 [${topic.name}]과 연결되는 변형 확인 문제를 제공하여 결손 치유 여부를 재점검합니다.`
      ]
    };

    // 3. 교사용 구조화 리포트 요약문
    const pedagogicalReportSummary = `[학습 진단 처방서]
- 평가 대상 주제: ${topic.name}
- 진단 상태: 미도달 (보완 요망)
- 학생 응답: ${JSON.stringify(studentAnswer)}
- 근본 원인 결손 노드: ${rootCauseTopic.name} (${isPrerequisiteDeficit ? "하위 선수학습 결손" : "해당 주제 직접 결손"})
- 결손 추적 경로: ${backtrackResult.path.join(" ➔ ")}
- 인지 발달 단계 분석: ${piagetAnalysisText}
- 비고츠키 ZPD 처방: ${rootCauseManipulative.nameKo}를 활용한 3단계 점진적 비계 복습 가이드 적용`;

    return {
      passed: false,
      topicId,
      topicName: topic.name,
      studentAnswer,
      rootCauseTopic: {
        id: rootCauseTopic.id,
        name: rootCauseTopic.name,
        description: rootCauseTopic.description,
        isPrerequisiteDeficit
      },
      deficitPath: backtrackResult.path,
      piagetStageAnalysis: {
        stage: rootCausePiaget,
        viewpoint: "피아제 구체적 조작기 vs 형식적 조작기 관점",
        analysis: piagetAnalysisText
      },
      scaffoldingPrescription,
      recommendedManipulative: rootCauseManipulative,
      pedagogicalReportSummary
    };
  }
}
