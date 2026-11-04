import { TaxonomyGraphEngine } from "./TaxonomyGraphEngine.mjs";
import { determinePiagetStage, recommendConcreteManipulative } from "./DiagnosticAssessmentEngine.mjs";
import { TargetGradeGroup, PiagetStage } from "./LessonTaxonomySchema.mjs";

/**
 * LessonPlannerRAG (수업 설계 RAG 엔진)
 * 
 * 2022 개정 교육과정 및 인지 발달 이론에 입각하여 차시당:
 * - 3 도입 (동기유발, 인지갈등, 학습문제)
 * - 9 전개 (3개 트랙 × 3단계: 구체물 탐색, 개념 도입, 오개념 피하기, 조작 실습, 짝토의 등)
 * - 3 정리 (형성평가, 배움정리, 출구퀴즈)
 * 의 3-9-3 모듈형 비계 구조를 조립하고,
 * 
 * teaching-research.json의 오개념/수업활동 레코드와 topic.evidence(성취기준)를 주입(RAG)하여:
 * - 교사 1·2·3단계 발문
 * - 학생 2인 이상 다중 응답 대본
 * - 1:1 대조 평가 루브릭
 * 을 완결된 한국어 교사용 스크립트로 생성합니다.
 */
export class LessonPlannerRAG {
  constructor(graphEngine = null) {
    this.graph = graphEngine || new TaxonomyGraphEngine();
  }

  /**
   * 단일 주제에 대한 완결형 3-9-3 수업 지도안 생성
   * 
   * @param {string} topicId - 목표 주제 ID
   * @param {object} options - 옵션 ({ asModularScaffold: boolean })
   * @returns {object} 수업 지도안 객체
   */
  generateLessonPlan(topicId, options = {}) {
    this.graph.ensureLoaded();
    const topic = this.graph.getTopic(topicId);
    if (!topic) {
      throw new Error(`주제를 찾을 수 없습니다: ${topicId}`);
    }

    const research = this.graph.getResearch(topicId);
    const evidence = this.graph.getEvidence(topicId);
    const misconceptions = this.graph.getCommonMisconceptions(topicId);
    const activities = this.graph.getActivities(topicId);
    const manipulative = recommendConcreteManipulative(topic);
    const piagetStage = determinePiagetStage(topic.ageRangeStart, topic.ageRangeEnd);

    // 학교급 및 학년군 산출
    let targetGradeGroup = TargetGradeGroup.ELEMENTARY_MID;
    if (topic.ageRangeEnd && topic.ageRangeEnd <= 8) {
      targetGradeGroup = TargetGradeGroup.ELEMENTARY_LOW;
    } else if (topic.ageRangeStart && topic.ageRangeStart >= 12) {
      targetGradeGroup = TargetGradeGroup.MIDDLE;
    } else if (topic.ageRangeStart && topic.ageRangeStart >= 10) {
      targetGradeGroup = TargetGradeGroup.ELEMENTARY_HIGH;
    }

    // 1. 3-9-3 모듈러 비계 구조 조립
    const modular393 = this._build393ScaffoldStructure(topic, research, evidence, misconceptions, activities, manipulative);

    // 2. 교사 1·2·3단계 발문 및 학생 다중 응답 대본 생성
    const dialogScript = this._buildThreeTierDialogScript(topic, research, evidence, misconceptions, manipulative);

    // 3. 1:1 대조 평가 루브릭 생성
    const rubric = this._buildAssessmentRubric(topic, evidence, misconceptions, manipulative);

    const lessonPlan = {
      meta: {
        topicId: topic.id,
        title: `${topic.name} 탐구 수업`,
        topicName: topic.name,
        subject: topic.subject || "공통교과",
        domain: topic.domain || "일반영역",
        targetGradeGroup,
        piagetStage,
        ageRange: {
          start: topic.ageRangeStart,
          end: topic.ageRangeEnd
        },
        standards: topic.standards || [],
        manipulative
      },
      modular393,
      dialogScript,
      rubric,
      researchContext: {
        injectedMisconceptions: misconceptions,
        injectedActivities: activities.map(a => a.title || a.name || "표준 활동"),
        masteryCriteria: evidence,
        bestPractices: research?.pedagogy?.bestPractices || [],
        keyRepresentations: research?.pedagogy?.keyRepresentations || []
      }
    };

    if (options.asModularScaffold) {
      return this.toModularScaffold(lessonPlan);
    }

    return lessonPlan;
  }

  /**
   * 3-9-3 모듈형 수업 비계 조립
   */
  _build393ScaffoldStructure(topic, research, evidence, misconceptions, activities, manipulative) {
    const primaryEvidence = evidence[0] || `${topic.name}의 기본 개념과 원리를 설명할 수 있다.`;
    const primaryMisconception = misconceptions[0] || "직관적 외형만 보고 원리를 반대로 해석하는 오개념";
    const primaryActivity = activities[0]?.title || `${manipulative.nameKo} 조작 탐구`;

    // [3 도입]
    const intro = [
      {
        id: "intro_1_real_world_hook",
        archetype: "real_world_hook",
        title: "실생활 호기심 열기",
        description: `일상생활 속에서 '${topic.name}'과 관련된 현상이나 문제를 사진·영상으로 관찰하고 호기심을 갖습니다.`,
        teacherAction: "학생들의 일상 경험과 직결되는 시각적 상황을 제시하여 배움의 필요성을 환기합니다."
      },
      {
        id: "intro_2_cognitive_conflict",
        archetype: "cognitive_conflict",
        title: "생각 뒤집기 인지 갈등",
        description: `학생들의 직관적 예상과 반대되는 현상('${primaryMisconception}')을 제시하여 인지적 갈등을 유도합니다.`,
        teacherAction: "학생들의 흔한 오개념을 직접 겨냥하는 질문을 던져 '왜 그럴까?'라는 지적 호기심을 극대화합니다."
      },
      {
        id: "intro_3_learning_goal",
        archetype: "prior_warmup",
        title: "배움 문제 정립 및 선수학습 확인",
        description: `오늘 해결할 핵심 배움 문제: "${manipulative.nameKo}를 활용하여 ${topic.name}의 규칙을 찾아 설명해 보자."`,
        teacherAction: "선수학습 지식을 점검하고 오늘의 배움 목표를 명확히 판서합니다."
      }
    ];

    // [9 전개] (3개 트랙 × 3단계)
    const development = [
      // 트랙 A: 기초 구체물 조작 트랙 (Foundation Concrete)
      {
        id: "dev_1_concrete_explore",
        track: "foundation_concrete",
        stepNumber: 1,
        title: `구체 교구(${manipulative.nameKo}) 자유 탐색`,
        description: "교구를 직접 만지고 관찰하며 조작 규칙과 물리적 속성을 파악합니다.",
        manipulativeGuide: manipulative.guide
      },
      {
        id: "dev_2_hands_on_practice",
        track: "foundation_concrete",
        stepNumber: 2,
        title: "단계별 구체물 조작 실습",
        description: `조건을 하나씩 바꾸어가며 교구를 조작하고 나타나는 변화를 손으로 체험합니다. (추천 활동: ${primaryActivity})`,
        manipulativeGuide: manipulative.guide
      },
      {
        id: "dev_3_sensory_discovery",
        track: "foundation_concrete",
        stepNumber: 3,
        title: "감각적 직관과 패턴 발견",
        description: "조작 결과 나타나는 시각적·공간적 패턴을 관찰하고 활동지에 기록합니다.",
        manipulativeGuide: "물리적 조작 결과의 불변량과 변화량을 직관적으로 대조합니다."
      },

      // 트랙 B: 핵심 원리 탐구 및 개념 도입 트랙 (Core Inquiry)
      {
        id: "dev_4_concept_intro",
        track: "core_inquiry",
        stepNumber: 4,
        title: "원리 발견 및 수학적/과학적 개념 도입",
        description: `조작 활동에서 발견한 공통 패턴을 바탕으로 '${topic.name}'의 핵심 개념과 용어를 명명하고 정립합니다.`,
        pedagogicalFocus: "구체적 조작 경험을 추상적 학문 용어 및 기호와 매끄럽게 연결합니다."
      },
      {
        id: "dev_5_misconception_buster",
        track: "core_inquiry",
        stepNumber: 5,
        title: "오개념 집중 해체 및 반례 검증",
        description: `연구된 대표 오개념('${primaryMisconception}')을 칠판에 제시하고, 교구 조작으로 반례를 증명하여 오개념을 해체합니다.`,
        pedagogicalFocus: "오개념이 왜 생겼는지 스스로 논리적 모순을 깨닫게 돕습니다."
      },
      {
        id: "dev_6_visual_representation",
        track: "core_inquiry",
        stepNumber: 6,
        title: "시각적 표상화 (수직선 및 다이어그램)",
        description: "구체물 조작을 종이 위의 그림 모델, 수직선, 도식 다이어그램으로 시각화하여 표현합니다.",
        pedagogicalFocus: "피아제 구체적 조작에서 비고츠키 기호적 표상으로의 비계 설정"
      },

      // 트랙 C: 심화 확장 및 협력 토의 트랙 (Deep Challenge)
      {
        id: "dev_7_peer_habruta",
        track: "deep_challenge",
        stepNumber: 7,
        title: "짝 하브루타 상호 설명 토의",
        description: "자신이 발견한 개념 원리를 짝에게 설명하고, 짝의 질문과 반론에 답하며 배움을 공고히 합니다.",
        pedagogicalFocus: "외적 언어화를 통한 메타인지 활성화 및 동료 비계(Peer Scaffolding)"
      },
      {
        id: "dev_8_real_world_app",
        track: "deep_challenge",
        stepNumber: 8,
        title: "새로운 실생활 상황에 개념 전이 적용",
        description: "교실 밖 실생활 상황 문제에 오늘 배운 원리를 적용하여 해결 전략을 세웁니다.",
        pedagogicalFocus: "단순 암기를 넘어선 지식의 전이(Transfer)와 실천적 문제 해결"
      },
      {
        id: "dev_9_generalization",
        track: "deep_challenge",
        stepNumber: 9,
        title: "배움의 일반화 및 성취기준 도달",
        description: `핵심 성취기준('${primaryEvidence}')을 바탕으로 원리를 스스로 일반화하여 문장으로 완성합니다.`,
        pedagogicalFocus: "형식적 조작으로의 완결 및 학습 주도권 회수"
      }
    ];

    // [3 정리]
    const wrapup = [
      {
        id: "wrapup_1_formative_eval",
        archetype: "live_pulse_quiz",
        title: "1:1 대조 형성평가",
        description: `성취기준('${primaryEvidence}')에 기반한 핵심 확인 문제를 개별 해결하고 이해도를 측정합니다.`,
        teacherAction: "개별 학생의 풀이 과정을 관찰하며 즉각적인 1:1 피드백을 제공합니다."
      },
      {
        id: "wrapup_2_learning_log",
        archetype: "meta_learning_log",
        title: "배움 공책 정리 및 메타인지 성찰",
        description: "오늘 새롭게 알게 된 점, 헷갈렸던 오개념, 스스로 터득한 팁을 배움 공책에 3줄로 기록합니다.",
        teacherAction: "배움의 궤적을 돌아보고 성공 경험을 강화합니다."
      },
      {
        id: "wrapup_3_exit_ticket",
        archetype: "live_pulse_quiz",
        title: "실시간 1분 출구 퀴즈 (Exit Ticket)",
        description: "수업 종료 전 1분 내외로 핵심 개념을 묻는 즉각 퀴즈에 참여하고 수업을 마무리합니다.",
        teacherAction: "응답 결과를 실시간 집계하여 다음 차시 복습 비계의 기초 자료로 활용합니다."
      }
    ];

    return {
      intro,
      development,
      wrapup
    };
  }

  /**
   * 교사 1·2·3단계 발문 및 학생 다중 응답 대본 생성
   */
  _buildThreeTierDialogScript(topic, research, evidence, misconceptions, manipulative) {
    const primaryEvidence = evidence[0] || `${topic.name}의 규칙을 바르게 설명하기`;
    const primaryMisconception = misconceptions[0] || "겉보기 모양에만 의존하여 반대로 판단하는 직관적 오류";

    return [
      {
        tier: 1,
        tierName: "1단계: 관찰 및 직관 유도 발문 (Fact & Observation)",
        teacher: `[교사 1단계 발문] 여러분, 책상 위에 놓인 ${manipulative.nameKo} 교구를 자유롭게 조작해 보면서 어떤 점이 눈에 띄는지 말해볼까요?`,
        students: [
          {
            name: "민수",
            response: "선생님, 교구를 손으로 직접 움직여보니까 한쪽을 조작하면 다른 쪽 모습도 변해요!"
          },
          {
            name: "지우",
            response: "맞아요, 겉모양은 달라지는 것처럼 보여도 전체 크기나 양은 그대로 유지되는 것 같아요."
          },
          {
            name: "서연",
            response: "저도 눈금과 칸을 맞춰보았더니 일정한 규칙으로 칸이 채워지는 것이 보여요."
          }
        ]
      },
      {
        tier: 2,
        tierName: "2단계: 인지 갈등 및 관계 추론 발문 (Cognitive Conflict & Reasoning)",
        teacher: `[교사 2단계 발문] 아주 날카로운 관찰이에요. 그렇다면 만약 '${primaryMisconception}'처럼 조건을 바꾼다면 어떻게 될까요? 왜 그렇게 생각하나요?`,
        students: [
          {
            name: "민수 (오개념 반응)",
            response: `제 생각에는 ${primaryMisconception}처럼 당연히 더 커지거나 변할 것 같아요!`
          },
          {
            name: "지우 (반례 제시 반응)",
            response: `민수야, ${manipulative.nameKo} 교구로 직접 확인해 보면 그렇지 않아. 겉보기로는 커 보여도 기준 단위로 비교해 보면 실제 양은 같거나 더 작아.`
          },
          {
            name: "민수 (오개념 자각 반응)",
            response: "어라? 정말이네! 교구로 포개어 보니까 내 생각이 틀렸다는 걸 눈으로 확인할 수 있었어."
          }
        ]
      },
      {
        tier: 3,
        tierName: "3단계: 일반화 및 메타인지 발문 (Generalization & Meta-cognition)",
        teacher: `[교사 3단계 발문] 지우가 교구를 활용해 훌륭한 반례를 증명해 주었군요. 그렇다면 오늘 우리가 발견한 핵심 원리를 '나만의 말'로 한 문장으로 정리해볼까요?`,
        students: [
          {
            name: "지우 (일반화 반응)",
            response: `선생님, '${primaryEvidence}'처럼 외형에 속지 않고 구체물 조작을 통해 일정한 수학적·과학적 보존 규칙이 성립한다는 것을 알게 되었어요.`
          },
          {
            name: "민수 (개념 정착 반응)",
            response: "이제는 헷갈리는 오개념에 속지 않고, 교구의 조작 원리를 기호와 수식으로 정확히 설명할 수 있어요!"
          },
          {
            name: "서연 (확장 반응)",
            response: "교실 밖 실생활에서도 이 원리가 적용되는 장면을 찾아보고 싶어요."
          }
        ]
      }
    ];
  }

  /**
   * 1:1 대조 평가 루브릭 생성 (상·중·하)
   */
  _buildAssessmentRubric(topic, evidence, misconceptions, manipulative) {
    const primaryEvidence = evidence[0] || `${topic.name}의 개념을 명확히 이해하고 바르게 적용함`;
    const primaryMisconception = misconceptions[0] || "직관적 외형에 의존하는 오류";

    return [
      {
        level: "상",
        levelEn: "Exemplary",
        criteria: `${primaryEvidence} 성취기준을 완전히 달성하였으며, 구체물 조작과 추상적 개념을 연결하여 논리적으로 설명하고 일반화할 수 있음`,
        studentResponseSample: `'${topic.name}'의 규칙은 구체물 교구(${manipulative.nameKo})로 확인했을 때도 예외 없이 일치하며, 수식과 기호로도 완벽하게 증명할 수 있습니다.`,
        teacherFeedbackGuide: "개념적 이해와 설명 능력이 매우 탁월합니다. 실생활 심화 응용 과제에 도전하여 지식의 전이력을 더욱 키워보세요."
      },
      {
        level: "중",
        levelEn: "Proficient",
        criteria: `교사의 발문이나 ${manipulative.nameKo} 교구의 조작 비계가 제공될 때 기본 원리를 바르게 파악하고 문제를 해결할 수 있으나, 형식적 기호 설명에 부분적 보완이 필요함`,
        studentResponseSample: "교구를 손으로 직접 조작하면서 풀 때는 원리를 알겠는데, 기호나 말로만 설명하려니 조금 헷갈려요.",
        teacherFeedbackGuide: "구체물 조작 과정을 그림이나 수직선 다이어그램으로 먼저 그려보며 사적 언어화(하브루타)를 거친 후 기호로 연결해 보세요."
      },
      {
        level: "하",
        levelEn: "Developing",
        criteria: `대표 오개념('${primaryMisconception}')을 여전히 지속하거나 기초 선수 개념 결손으로 인해 독립적인 과제 해결이 어려움`,
        studentResponseSample: `"${primaryMisconception}라고 생각해요. 왜 다른 결과가 나오는지 잘 모르겠어요."`,
        teacherFeedbackGuide: `${manipulative.nameKo} 교구를 활용하여 1:1 맞춤형 구체물 탐색(10~15분)을 우선 진행하고, 하위 선수 개념을 즉각 재지도하세요.`
      }
    ];
  }

  /**
   * ModularLessonScaffoldSchema 규격 객체로의 양방향 변환
   */
  toModularScaffold(lessonPlan) {
    const { meta, modular393, dialogScript, rubric } = lessonPlan;

    // 대화 턴 확장 (최소 10턴 규격 충족)
    const classroomTurns = [];
    
    // 3개 기본 턴 확장
    for (let i = 0; i < 3; i++) {
      const d = dialogScript[i];
      classroomTurns.push({
        turnNumber: classroomTurns.length + 1,
        phase: i === 0 ? "intro" : (i === 1 ? "main" : "wrapup"),
        teacherPrompt: d.teacher,
        studentResponses: d.students.map(s => `[${s.name}] ${s.response}`)
      });
    }

    // 전개 및 정리 보조 턴 7개 추가 생성 (총 10턴)
    const extraPrompts = [
      { prompt: "교구의 양쪽 균형을 맞추려면 어떤 조작이 필요할까요?", phase: "main" },
      { prompt: "활동지에 적은 숫자의 패턴에서 무엇을 발견했나요?", phase: "main" },
      { prompt: "짝과 서로 다른 결과가 나온 모둠이 있나요?", phase: "main" },
      { prompt: "오개념을 바로잡기 위해 가장 결정적인 단서는 무엇이었나요?", phase: "main" },
      { prompt: "이제 교구 없이 머릿속으로 이 과정을 시각화해 볼까요?", phase: "main" },
      { prompt: "형성평가 1번 문제를 풀면서 어떤 원리를 적용했나요?", phase: "wrapup" },
      { prompt: "오늘 배운 내용을 집에 가서 가족에게 어떻게 한 줄로 소개할 수 있을까요?", phase: "wrapup" }
    ];

    extraPrompts.forEach(ep => {
      classroomTurns.push({
        turnNumber: classroomTurns.length + 1,
        phase: ep.phase,
        teacherPrompt: `[교사 보조 발문] ${ep.prompt}`,
        studentResponses: [
          "[학생 1] 교구를 관찰해보니 기준에 맞게 조정할 수 있었습니다.",
          "[학생 2] 짝과 토의하며 발견한 규칙을 그대로 적용해 보았습니다."
        ]
      });
    });

    return {
      lessonId: `scaffold_${meta.topicId}`,
      title: meta.title,
      standards: meta.standards.length > 0 ? meta.standards : ["STD-DEFAULT-2022"],
      introOptions: modular393.intro.map((opt, idx) => ({
        id: opt.id,
        title: opt.title,
        digitalPrompt: `도입 ${idx + 1}: ${opt.description}`,
        teacherAction: opt.teacherAction
      })),
      mainActivities: modular393.development.map(act => ({
        id: act.id,
        track: act.track,
        title: act.title,
        engine: "fraction_sim",
        digitalPrompt: `전개 활동: ${act.description}`,
        manipulativeGuide: act.manipulativeGuide
      })),
      wrapupOptions: modular393.wrapup.map((opt, idx) => ({
        id: opt.id,
        title: opt.title,
        digitalPrompt: `정리 ${idx + 1}: ${opt.description}`,
        teacherAction: opt.teacherAction
      })),
      worksheet: {
        singlePage: {
          layout: "1_page",
          itemsCount: 4,
          rubricRef: rubric[0].level
        },
        duplexPage: {
          layout: "2_page",
          frontItemsCount: 5,
          backItemsCount: 5
        }
      },
      classroomDialog: {
        turns: classroomTurns
      }
    };
  }
}
