/**
 * LessonLabCurriculumBridge.mjs
 *
 * Bridge module between nomos K-12 Cognitive Hierarchy Ontology
 * and the lessonlab teacher lesson planning engine.
 *
 * Connects:
 * 1. 2022 Revised K-12 Curriculum Standards Search & Taxonomy Graph
 * 2. 3-9-3 Modular Lesson Scaffold Generator (Intro 3 · Main 9 · Wrapup 3)
 * 3. Three-Tier Teacher Prompts, Multi-Student Dialogue, and Assessment Rubric
 * 4. Piaget Manipulative Simulation Matching (fraction-bars, ten-frame, balance-scale, light-reflection)
 */

import { Korea2022K12CurriculumAdapter } from "./Korea2022K12CurriculumAdapter.mjs";
import { AVAILABLE_TEMPLATES } from "./ManipulativeSimulationGenerator.mjs";
import { TargetGradeGroup, PiagetStage } from "./LessonTaxonomySchema.mjs";

/**
 * Standard manipulative catalog definitions with embed URLs and guides
 */
export const MANIPULATIVE_SPECS = Object.freeze({
  "fraction-bars": {
    id: "fraction-bars",
    name: "fraction-bars",
    title: "분수 막대 분할 및 크기 비교 조작기",
    subject: "수학 (수와 연산)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_MID,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL,
    embedUrl: "/simulations/fraction-bars.html",
    component: "FractionBarsManipulative",
    description: "분수 막대 분할 및 직관적 크기 비교, 동치분수 및 통분 탐구 시뮬레이션",
    recommendedPhase: "exploration",
    guide: "두 분수 막대의 눈금을 나란히 배치하여 크기를 직접 비교하고, 분모가 다를 때 공통 분모(통분)의 필요성을 시각적으로 확인하도록 안내합니다."
  },
  "ten-frame": {
    id: "ten-frame",
    name: "ten-frame",
    title: "10칸 상자 바둑알 놓기 및 묶음 수세기 조작기",
    subject: "수학 (수와 연산)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_LOW,
    piagetStage: PiagetStage.PREOPERATIONAL,
    embedUrl: "/simulations/ten-frame.html",
    component: "TenFrameManipulative",
    description: "10칸 상자(Ten-frame)를 통한 5·10 묶음 수세기 및 10의 보수(가르기와 모으기) 조작기",
    recommendedPhase: "exploration",
    guide: "빨간색과 파란색 바둑알을 10칸 상자에 채우며 5의 묶음과 10의 보수 관계를 감각적으로 체득하게 합니다."
  },
  "balance-scale": {
    id: "balance-scale",
    name: "balance-scale",
    title: "2D 양팔 저울 수식 등호 균형 물리 조작기",
    subject: "수학 / 과학 (등식의 성질)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_MID,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL,
    embedUrl: "/simulations/balance-scale.html",
    component: "BalanceScaleManipulative",
    description: "2D 물리 기반 양팔 저울 조작을 통한 등호(=)와 방정식 기초 균형 시뮬레이션",
    recommendedPhase: "exploration",
    guide: "좌변과 우변의 추를 올리고 내리며 수평 균형을 맞추는 과정을 통해 등호의 양변에 같은 수를 더하거나 빼도 등식이 성립함을 발견하게 합니다."
  },
  "light-reflection": {
    id: "light-reflection",
    name: "light-reflection",
    title: "과학 빛의 반사와 굴절 레이 실험실",
    subject: "과학 (빛과 렌즈 / 광학)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_HIGH,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL,
    embedUrl: "/simulations/light-reflection.html",
    component: "LightReflectionManipulative",
    description: "평면 거울의 반사의 법칙 및 매질 경계면 굴절·전반사 레이 트레이싱 가상 실험실",
    recommendedPhase: "exploration",
    guide: "광원의 입사각 슬라이더를 조절하여 입사각과 반사각이 항상 같음을 관찰하고, 볼록렌즈와 오목렌즈를 통과할 때 빛이 모이거나 퍼지는 경로를 확인하게 합니다."
  }
});

export class LessonLabCurriculumBridge {
  constructor(k12Adapter = null) {
    this.adapter = k12Adapter || new Korea2022K12CurriculumAdapter();
  }

  /**
   * 1. K-12 온톨로지 성취기준 검색
   * 
   * @param {string} query 검색어 (성취기준 코드, 키워드, 단원명 등)
   * @param {Object} [options]
   * @param {"ES"|"MS"|"HS"|"ALL"} [options.schoolLevel]
   * @param {string} [options.subject]
   * @param {number} [options.limit=20]
   * @returns {Array<Object>}
   */
  searchStandards(query = "", options = {}) {
    return this.adapter.searchK12Standards(query, options);
  }

  /**
   * 단일 성취기준 상세 조회
   * 
   * @param {string} code 성취기준 코드 (예: "[6수01-06]", "4국02-01")
   * @returns {Object|null}
   */
  getStandard(code = "") {
    return this.adapter.getK12Standard(code);
  }

  /**
   * 2. 차시에 적합한 피아제 조작기 메타데이터 매칭
   * 
   * @param {Object} standard 성취기준 객체
   * @returns {Object} 조작기 메타데이터
   */
  recommendManipulative(standard) {
    if (!standard) return MANIPULATIVE_SPECS["fraction-bars"];

    const text = `${standard.subject || ""} ${standard.domain || ""} ${standard.statement || ""} ${(standard.keywords || []).join(" ")}`.toLowerCase();

    // 1. Ten-Frame: 초등 저학년 기초 수, 10의 보수, 모으기/가르기
    if (
      standard.schoolLevel === "ES" &&
      (text.includes("100까지") || text.includes("가르기") || text.includes("모으기") || text.includes("10칸") || text.includes("수 세기") || text.includes("한 자리 수") || standard.grade === "초1" || standard.grade === "초2") &&
      !text.includes("분수") && !text.includes("곱셈")
    ) {
      return MANIPULATIVE_SPECS["ten-frame"];
    }

    // 2. Light Reflection: 빛, 반사, 굴절, 거울, 렌즈, 광학
    if (
      text.includes("빛") || text.includes("반사") || text.includes("굴절") || text.includes("거울") || text.includes("렌즈") || text.includes("광학") || text.includes("파동") || text.includes("광전")
    ) {
      return MANIPULATIVE_SPECS["light-reflection"];
    }

    // 3. Balance Scale: 등식의 성질, 방정식, 무게 비교, 미지수, 부등식, 수평, 문장 성분(주어-서술어 균형)
    if (
      text.includes("방정식") || text.includes("등식") || text.includes("미지수") || text.includes("저울") || text.includes("무게 비교") || text.includes("양의 비교") || text.includes("부등식") || text.includes("행렬") || text.includes("문장 성분") || text.includes("호응") || text.includes("주어") || text.includes("서술어") || text.includes("균형")
    ) {
      return MANIPULATIVE_SPECS["balance-scale"];
    }

    // 4. Fraction Bars: 분수, 소수, 동치분수, 통분, 약분, 비율
    if (
      text.includes("분수") || text.includes("소수") || text.includes("통분") || text.includes("약분") || text.includes("비율") || text.includes("비와") || text.includes("미분") || text.includes("적분")
    ) {
      return MANIPULATIVE_SPECS["fraction-bars"];
    }

    // 기본값: 수학 계열은 balance-scale/fraction-bars, 과학 계열은 light-reflection
    if (standard.subject === "과학" || standard.subject === "물리학") {
      return MANIPULATIVE_SPECS["light-reflection"];
    }
    if (standard.schoolLevel === "ES") {
      return MANIPULATIVE_SPECS["fraction-bars"];
    }
    return MANIPULATIVE_SPECS["balance-scale"];
  }

  /**
   * 3. 3-9-3 모듈러 수업 지도안 자동 포맷팅
   * 
   * @param {string|Object} standardOrCode 성취기준 코드 또는 성취기준 객체
   * @param {Object} [options]
   * @returns {Object} 완결된 수업 지도안
   */
  generateLessonPlan(standardOrCode, options = {}) {
    let standard = null;
    if (typeof standardOrCode === "string") {
      standard = this.getStandard(standardOrCode);
      if (!standard) {
        // Fallback: 임의 코드 지원
        const clean = standardOrCode.replace(/[[\]]/g, "");
        standard = {
          code: `[${clean}]`,
          statement: `${clean} 관련 핵심 개념 탐구`,
          subject: clean.includes("수") ? "수학" : clean.includes("과") ? "과학" : "국어",
          schoolLevel: clean.startsWith("1") ? "HS" : clean.startsWith("9") ? "MS" : "ES",
          gradeCluster: clean.startsWith("1") ? "고등학교 1~3학년군" : clean.startsWith("9") ? "중학교 1~3학년군" : "초등 5~6학년군",
          domain: "핵심 개념 영역",
          keywords: [clean],
          piagetStage: clean.startsWith("1") ? "Formal Operational" : clean.startsWith("9") ? "Early Formal Operational" : "Concrete Operational"
        };
      }
    } else {
      standard = standardOrCode;
    }

    const manipulative = this.recommendManipulative(standard);
    const subject = standard.subject || "일반 교과";
    const statement = standard.statement || "개념 이해 및 탐구";
    const piagetStage = standard.piagetStage || "Concrete Operational";
    const schoolLevel = standard.schoolLevel || "ES";
    const gradeCluster = standard.gradeCluster || "초등";

    // 도메인 맞춤형 발문/오개념 파라미터 생성
    const context = this._extractPedagogicalContext(standard, manipulative);

    // [1단계: 3 도입 (Intro)]
    const introOptions = [
      {
        id: "intro_1_real_world_hook",
        archetype: "real_world_hook",
        title: "1. 실생활 호기심 열기",
        goal: "일상생활 속 구체적 현상 관찰을 통한 학습 동기 유발",
        description: context.hookDescription,
        teacherAction: "학생들의 일상 경험과 직결되는 시각적 미디어 또는 질문을 제시하여 '왜 그럴까?'라는 지적 호기심을 유도합니다."
      },
      {
        id: "intro_2_cognitive_conflict",
        archetype: "cognitive_conflict",
        title: "2. 생각 뒤집기 인지 갈등",
        goal: "직관적 오류 직면을 통한 인지적 불평형 형성",
        description: `대표적인 직관적 오류("${context.primaryMisconception}")를 직접 관찰하게 하여 기존 생각의 한계를 인식합니다.`,
        teacherAction: "학생들이 흔히 저지르는 오답을 칠판에 적고, '정말 이것이 항상 맞을까요?'라고 반문하여 인지 갈등을 유발합니다."
      },
      {
        id: "intro_3_learning_goal",
        archetype: "prior_warmup",
        title: "3. 배움 문제 정립 및 선수학습 점검",
        goal: "선행 지식 활성화 및 오늘의 학습 목표 선언",
        description: `오늘의 배움 문제: "${manipulative.title}를 활용하여 ${context.conceptName}의 원리를 발견하고 설명해 봅시다."`,
        teacherAction: "선수학습 개념을 1분간 회상하고, 본 차시에서 도달해야 할 핵심 배움 문제를 판서합니다."
      }
    ];

    // [2단계: 9 전개 (Main Activities) - 3개 트랙 × 3단계]
    const mainActivities = [
      // 트랙 A: 기초 구체물 조작 (Foundation Concrete)
      {
        id: "main_track_a_step_1",
        track: "foundation_concrete",
        trackName: "트랙 A: 기초 구체물 조작",
        stepNumber: 1,
        title: `1단계: 디지털 조작기(${manipulative.name}) 자유 조작 및 인터랙션 탐색`,
        description: `학생 개별 태블릿에서 ${manipulative.title} 화면을 열고 슬라이더, 드래그 등 기본 인터랙션을 자유롭게 조작합니다.`,
        pedagogyFocus: "피아제 구체적 조작기 감각 접촉 및 인터페이스 적응"
      },
      {
        id: "main_track_a_step_2",
        track: "foundation_concrete",
        trackName: "트랙 A: 기초 구체물 조작",
        stepNumber: 2,
        title: "2단계: 조건 변형에 따른 상태 변화 관찰",
        description: `수치나 조건을 한 단계씩 변경하면서 화면의 시각적·물리적 반응(${context.manipulativeResponse})을 관찰합니다.`,
        pedagogyFocus: "변인 통제 기초 및 구체물 조작 실습"
      },
      {
        id: "main_track_a_step_3",
        track: "foundation_concrete",
        trackName: "트랙 A: 기초 구체물 조작",
        stepNumber: 3,
        title: "3단계: 조작 결과의 시각적·표상적 스케치 기록",
        description: "조작기에서 확인한 결과를 활동지에 그림, 수직선, 표 형태로 스케치하여 시각화합니다.",
        pedagogyFocus: "브루너의 영상적 표상(Iconic Representation) 정착"
      },

      // 트랙 B: 핵심 원리 탐구 (Core Inquiry)
      {
        id: "main_track_b_step_4",
        track: "core_inquiry",
        trackName: "트랙 B: 핵심 원리 탐구 및 상호작용",
        stepNumber: 4,
        title: "4단계: 패턴 분석 및 공통 규칙성 발견",
        description: `여러 번의 조작 결과에서 반복되는 공통 규칙("${context.coreRule}")을 모둠원과 함께 찾아냅니다.`,
        pedagogyFocus: "귀납적 추론 및 패턴 일반화"
      },
      {
        id: "main_track_b_step_5",
        track: "core_inquiry",
        trackName: "트랙 B: 핵심 원리 탐구 및 상호작용",
        stepNumber: 5,
        title: "5단계: 흔한 오개념 직면 및 반례 탐색",
        description: `"${context.primaryMisconception}"이 성립하지 않는 명확한 반례를 조작기로 직접 재현하여 확인합니다.`,
        pedagogyFocus: "Reflexion 기반 언어적 반성 및 오개념 능동적 수정"
      },
      {
        id: "main_track_b_step_6",
        track: "core_inquiry",
        trackName: "트랙 B: 핵심 원리 탐구 및 상호작용",
        stepNumber: 6,
        title: "6단계: 개념 형식화 및 수학적·과학적 기호화",
        description: `구체물 조작으로 발견한 원리를 공식, 기호, 전문 용어("${context.formalConcept}")로 명료화하여 정리합니다.`,
        pedagogyFocus: "브루너의 상징적 표상(Symbolic Representation) 완성"
      },

      // 트랙 C: 심화 확장 챌린지 (Deep Challenge)
      {
        id: "main_track_c_step_7",
        track: "deep_challenge",
        trackName: "트랙 C: 심화 확장 및 응용 챌린지",
        stepNumber: 7,
        title: "7단계: 실생활 맥락 변형 챌린지 문제 해결",
        description: `교실 밖 실생활 상황에 배운 원리를 전이(Transfer)하여 복합적인 응용 과제를 해결합니다.`,
        pedagogyFocus: "상황 학습(Situated Learning) 및 지식 전이"
      },
      {
        id: "main_track_c_step_8",
        track: "deep_challenge",
        trackName: "트랙 C: 심화 확장 및 응용 챌린지",
        stepNumber: 8,
        title: "8단계: 짝 하브루타 상호 개념 설명",
        description: "자신이 이해한 문제 해결 과정을 짝에게 교사처럼 단계별로 설명하고 상호 질문합니다.",
        pedagogyFocus: "비고츠키 비계 설정(Scaffolding) 및 메타인지 언어화"
      },
      {
        id: "main_track_c_step_9",
        track: "deep_challenge",
        trackName: "트랙 C: 심화 확장 및 응용 챌린지",
        stepNumber: 9,
        title: "9단계: 심화 융합 과제 및 확장 탐구",
        description: `나선형 교육과정의 다음 단계 발전 개념("${context.spiralNext}")과 연결되는 고난도 융합 질문을 탐색합니다.`,
        pedagogyFocus: "형식적 조작기 도약 및 학제간 융합 사고"
      }
    ];

    // [3단계: 3 정리 (Wrapup)]
    const wrapupOptions = [
      {
        id: "wrapup_1_peer_habruta",
        archetype: "peer_habruta",
        title: "1. 짝 하브루타 1분 개념 상호 설명",
        goal: "배운 핵심 개념을 상대방에게 자신의 언어로 명확히 전달",
        description: "1분 동안 번갈아 가며 오늘 배운 핵심 원리를 설명하고 상대방의 오개념을 바로잡아 줍니다."
      },
      {
        id: "wrapup_2_live_pulse_quiz",
        archetype: "live_pulse_quiz",
        title: "2. 실시간 형성평가 출구 퀴즈 (ClassPulse Exit Ticket)",
        goal: "학습 목표 도달도 즉각 진단 및 오답 피드백",
        description: `핵심 3문항(기초 1문항, 원리 1문항, 오답 함정 1문항) 실시간 응답을 통해 반 전체의 이해도를 시각화합니다.`
      },
      {
        id: "wrapup_3_meta_learning_log",
        archetype: "meta_learning_log",
        title: "3. 배움 공책 기록 및 메타인지 자기 성찰",
        goal: "오늘 새롭게 알게 된 점과 추가로 궁금한 점 메타인지 기록",
        description: "'오늘 내가 오개념을 극복한 순간'과 '조작기를 통해 알게 된 새로운 사실'을 배움 공책에 2줄로 요약 정리합니다."
      }
    ];

    // [교사 1·2·3단계 발문 (Three-Tier Questioning)]
    const teacherPrompts = {
      tier1_observation: {
        tier: 1,
        tierName: "1단계: 관찰 및 직관 확인",
        prompt: context.teacherTier1,
        intent: "감각적 관찰 및 기초 사실 확인으로 모든 학생이 부담 없이 발문에 참여하도록 유도"
      },
      tier2_cognitive_conflict: {
        tier: 2,
        tierName: "2단계: 인지 갈등 및 조건 변화 분석",
        prompt: context.teacherTier2,
        intent: "조건이 달라질 때 발생하는 현상의 인과관계를 묻고 직관적 오개념을 깨뜨리도록 자극"
      },
      tier3_generalization: {
        tier: 3,
        tierName: "3단계: 원리 일반화 및 추론",
        prompt: context.teacherTier3,
        intent: "구체적 조작 결과를 수학적·과학적 형식 언어로 일반화하고 다른 상황에 적용하도록 촉진"
      }
    };

    // [학생 예상 다중 응답 대본 (Student Expected Responses)]
    const studentResponses = [
      {
        studentId: "student_1_intuitive",
        studentName: "학생 1 (직관적 응답 / 흔한 오개념)",
        response: context.studentResponse1,
        diagnosis: "직관적 외형만 보고 결과를 판단함 (피아제 전조작기/구체적 조작기 초기 특성)",
        teacherFeedback: "직접 조작기에서 해당 수치를 넣어보고 눈금이 맞는지 함께 관찰해 볼까요?"
      },
      {
        studentId: "student_2_partial",
        studentName: "학생 2 (조작 기반 부분 이해)",
        response: context.studentResponse2,
        diagnosis: "조작기를 통해 오개념은 감지했으나 정확한 원리 형식화에 도달하지 못함",
        teacherFeedback: "좋은 관찰이에요! 그렇다면 두 조건이 일치하도록 만들려면 어떤 기준을 같게 해주어야 할까요?"
      },
      {
        studentId: "student_3_mastery",
        studentName: "학생 3 (원리적 정답 도달)",
        response: context.studentResponse3,
        diagnosis: "핵심 원리와 기호화된 공식을 정확히 연결하여 설명함 (형식적 조작기 도달)",
        teacherFeedback: "정확해요! 그 원리를 짝에게 알기 쉽게 한 문장으로 다시 설명해 줄 수 있나요?"
      }
    ];

    // [1:1 대조 평가 루브릭 (Assessment Rubric)]
    const rubric = {
      standardCode: standard.code,
      statement: standard.statement,
      levels: {
        proficient: {
          level: "상 (Proficient / 도달)",
          scoreRange: "90~100",
          criteria: context.rubricProficient,
          pedagogicalSupport: "다음 차시 심화 탐구 과제 및 실생활 복합 문제 해결 비계 제공"
        },
        developing: {
          level: "중 (Developing / 보통)",
          scoreRange: "70~89",
          criteria: context.rubricDeveloping,
          pedagogicalSupport: "조작기 힌트 카드 및 또래 짝 하브루타 설명을 통한 형식화 보완"
        },
        beginning: {
          level: "하 (Beginning / 노력요함)",
          scoreRange: "0~69",
          criteria: context.rubricBeginning,
          pedagogicalSupport: "교사의 1:1 맞춤형 구체물 조작 재시연 및 단계별 스캐폴딩 집중 지원"
        }
      }
    };

    return {
      success: true,
      meta: {
        lessonId: `lesson_${(standard.code || "std").replace(/[[\]-]/g, "_")}`,
        standardCode: standard.code,
        subject: standard.subject,
        schoolLevel: standard.schoolLevel,
        gradeCluster: standard.gradeCluster,
        domain: standard.domain,
        statement: standard.statement,
        piagetStage,
        targetGradeGroup: schoolLevel === "HS" ? TargetGradeGroup.HIGH : schoolLevel === "MS" ? TargetGradeGroup.MIDDLE : TargetGradeGroup.ELEMENTARY_MID
      },
      scaffold: {
        intro: introOptions,
        main: mainActivities,
        wrapup: wrapupOptions,
        teacherPrompts,
        studentResponses,
        rubric
      },
      manipulative: {
        ...manipulative,
        matchedStandard: standard.code
      }
    };
  }

  /**
   * 내부 헬퍼: 성취기준별 맞춤형 교육학적 맥락 추출
   */
  _extractPedagogicalContext(standard, manipulative) {
    const code = standard.code || "";
    const text = `${standard.subject || ""} ${standard.domain || ""} ${standard.statement || ""} ${(standard.keywords || []).join(" ")}`;

    // 1. 초등 수학: 분모가 다른 분수의 덧셈과 뺄셈 [6수01-06]
    if (code.includes("6수01-06") || text.includes("이분모") || (text.includes("분수") && text.includes("덧셈"))) {
      return {
        conceptName: "분모가 다른 분수의 덧셈과 뺄셈",
        hookDescription: "피자 1/2판과 1/3판을 합치면 모두 몇 판일까요? 눈대중으로 더할 수 있을까요?",
        primaryMisconception: "분모는 분모끼리 더하고 분자는 분자끼리 더한다 (예: 1/2 + 1/3 = 2/5)",
        manipulativeResponse: "분모가 다른 두 분수 막대의 눈금이 서로 맞지 않아 직접 합쳐지지 않음",
        coreRule: "분수 막대의 눈금을 공배수로 잘게 쪼개어(통분) 단위분수의 크기를 같게 맞추어야 한다.",
        formalConcept: "통분(공통분모) 및 이분모 분수의 덧셈·뺄셈 계산 원리",
        spiralNext: "분수의 곱셈과 나눗셈 및 비와 비율",
        teacherTier1: "분수 막대에서 1/2 막대와 1/3 막대를 나란히 붙였을 때, 1막대와 비교하면 어느 정도 크기인가요?",
        teacherTier2: "분모끼리 더해서 2/5라고 생각하면 왜 원래 1/2보다도 작아지는 모순이 생길까요?",
        teacherTier3: "두 막대의 눈금을 모두 일치시키려면 분모 2와 3의 어떤 공통 수를 분모로 만들어야 할까요?",
        studentResponse1: "분모끼리 더해서 2+3=5이고 분자끼리 더해서 1+1=2니까 2/5인 것 같아요.",
        studentResponse2: "막대를 대어보니까 2/5는 1/2보다 작아서 말이 안 돼요. 눈금을 더 쪼개서 맞춰봐야 해요.",
        studentResponse3: "2와 3의 최소공배수인 6으로 통분하면 1/2은 3/6이고 1/3은 2/6이므로 더하면 5/6가 됩니다.",
        rubricProficient: "분모가 다른 분수의 덧셈·뺄셈 원리를 통분(공통분모)과 분수 막대 조작 모델을 병행하여 정확히 설명하고 계산할 수 있다.",
        rubricDeveloping: "분수 막대 조작을 통해 통분의 필요성은 인지하나, 분모의 공배수를 구하거나 기약분수로 정리하는 과정에 교사의 안내가 필요하다.",
        rubricBeginning: "분모끼리 더하는 오개념(1/2+1/3=2/5)을 보이며 분수 막대 구체물 조작을 통한 크기 비교 지원이 필수적이다."
      };
    }

    // 2. 중학 과학: 빛과 파동 / 빛의 반사와 굴절 [9과02-01]
    if (code.includes("9과02-01") || text.includes("빛") || text.includes("반사") || text.includes("거울")) {
      return {
        conceptName: "빛의 반사와 굴절의 법칙",
        hookDescription: "물속에 담근 빨대가 왜 꺾여 보일까요? 잠망경 속 거울은 왜 정확히 45도로 기울여 놓았을까요?",
        primaryMisconception: "거울에 비친 상은 거울 표면에 실제로 맺혀 있는 실체이다.",
        manipulativeResponse: "입사각 슬라이더를 돌릴 때마다 법선을 기준으로 반사각이 정확히 대칭으로 회전함",
        coreRule: "입사 광선과 반사 광선은 같은 평면 위에 있으며, 입사각의 크기와 반사각의 크기는 항상 같다 (반사의 법칙).",
        formalConcept: "반사의 법칙 (입사각 = 반사각) 및 매질에 따른 굴절 현상",
        spiralNext: "파동의 간섭·회절 및 전자기파 스펙트럼",
        teacherTier1: "레이저 포인터의 각도를 30도로 거울에 비추었을 때, 튕겨 나가는 빛의 각도는 몇 도를 가리키나요?",
        teacherTier2: "거울을 통과하지 못하는 빛이 왜 다른 각도가 아니라 정확히 입사각과 같은 각도로만 반사될까요?",
        teacherTier3: "빛이 공기에서 물로 들어갈 때 속력이 느려진다면, 빛의 경로는 법선 쪽으로 꺾일까요 바깥쪽으로 꺾일까요?",
        studentResponse1: "거울에 비친 물체는 거울 표면에 그림처럼 붙어 있는 것 같아요.",
        studentResponse2: "레이저 빛이 거울에 닿을 때 튀어나오는 각도가 입사한 각도와 같아 보이는데 왜 그런지는 잘 모르겠어요.",
        studentResponse3: "법선을 기준으로 입사각과 반사각이 항상 같고, 물속으로 들어갈 때는 매질의 밀도 차이로 인해 법선 쪽으로 굴절됩니다.",
        rubricProficient: "빛의 반사의 법칙과 굴절 현상을 레이 트레이싱 가상 실험 결과를 바탕으로 수학적 각도 관계와 함께 명확히 설명할 수 있다.",
        rubricDeveloping: "실험을 통해 입사각과 반사각이 같음을 확인하지만, 법선의 정의나 굴절의 인과관계 설명에 부분적 지원이 필요하다.",
        rubricBeginning: "빛의 경로를 직선으로 이해하지 못하거나 반사각의 기준을 표면으로 착각하여 기초 조작 안내가 필요하다."
      };
    }

    // 3. 고등 미적분: 미분계수의 기하학적 의미 [12미적1-02-01]
    if (code.includes("12미적1-02-01") || text.includes("미분계수") || text.includes("순간변화율")) {
      return {
        conceptName: "미분계수와 순간변화율의 기하학적 의미",
        hookDescription: "자동차 속도계의 바늘은 1초 동안 달린 거리가 아니라 어떻게 지금 '순간'의 속도를 가리킬 수 있을까요?",
        primaryMisconception: "한 점에서는 변화가 일어날 수 없으므로 0으로 나누어 순간변화율을 구할 수 없다.",
        manipulativeResponse: "두 점 사이의 거리를 0에 한없이 가깝게 줄일 때 할선이 한 점에서의 접선으로 수렴함",
        coreRule: "평균변화율의 극한값(h->0)이 바로 곡선 위 한 점에서의 접선의 기울기(미분계수)이다.",
        formalConcept: "미분계수 f'(a)의 정의 및 접선의 기울기",
        spiralNext: "도함수의 활용 (극대·극소 판정 및 함수의 그래프 개형)",
        teacherTier1: "곡선 위의 두 점 A, B를 잇는 직선의 기울기는 무엇을 의미하나요?",
        teacherTier2: "점 B가 점 A로 한없이 다가갈 때 두 점을 잇던 할선은 최종적으로 어떤 선의 모양에 가까워지나요?",
        teacherTier3: "이 극한값(접선의 기울기)을 물리에서의 속도 개념과 연결하면 어떤 의미를 갖게 되나요?",
        studentResponse1: "한 점에서는 거리가 0이고 시간도 0이니까 0/0이 되어서 속도를 구할 수 없을 것 같아요.",
        studentResponse2: "두 점 사이 간격을 좁히면 직선이 점점 곡선에 착 달라붙는 접선 모양이 돼요.",
        studentResponse3: "평균변화율의 극한값이 바로 곡선 위의 그 점에서의 접선의 기울기이며, 이것이 바로 순간변화율(미분계수)입니다.",
        rubricProficient: "미분계수의 정의식을 할선의 극한을 통한 접선의 기울기로 기하학적·대수적으로 완벽히 증명하고 설명할 수 있다.",
        rubricDeveloping: "접선의 기울기가 미분계수임을 그래프로 인지하나, 극한 기호(lim)를 사용한 엄밀한 수식 전개에 어려움을 겪는다.",
        rubricBeginning: "순간변화율과 평균변화율을 구분하지 못하고 0/0 부정형의 극한 개념에 혼란을 보여 기초 비계가 필요하다."
      };
    }

    // 4. 초등/고등 국어: 문장 성분 [4국02-01] 또는 문장 표현과 담화 [10국01-02]
    if (code.includes("국02-01") || code.includes("국01-02") || text.includes("문장 성분") || text.includes("담화")) {
      return {
        conceptName: "문장의 기본 성분과 담화 표지",
        hookDescription: "'코끼리가 코가 손이래'라는 문장에서 주어는 과연 '코끼리가'일까요, '코가'일까요?",
        primaryMisconception: "문장에 등장하는 명사는 모두 주어이거나 목적어이다.",
        manipulativeResponse: "양팔 저울의 한쪽에 주어, 반대쪽에 서술어 카드를 올려놓아 문장 성분의 균형을 확인",
        coreRule: "문장은 주어, 서술어, 목적어 등 문장 성분 간의 호응과 담화 맥락에 따라 의미가 완결된다.",
        formalConcept: "문장 성분의 체계 (주성분, 부속성분, 독립성분) 및 문장 구조",
        spiralNext: "복합 문장의 짜임 (안은문장과 이어진문장) 및 문학적 표현",
        teacherTier1: "문장에서 '누가/무엇이'에 해당하는 말과 '어찌하다/어떠하다'에 해당하는 말은 각각 무엇인가요?",
        teacherTier2: "서술어가 요구하는 필수 문장 성분이 빠지면 문장의 의미 전달에 어떤 문제가 생길까요?",
        teacherTier3: "두 문장을 연결할 때 적절한 담화 표지('하지만', '따라서')를 선택하면 글의 응결성이 어떻게 달라지나요?",
        studentResponse1: "단어가 여러 개 있으면 앞에 있는 건 다 주어인 것 같아요.",
        studentResponse2: "서술어가 '먹었다'이면 누가 먹었는지와 무엇을 먹었는지가 둘 다 꼭 있어야 문장이 자연스러워져요.",
        studentResponse3: "서술어의 자릿수에 따라 필수 성분(주어, 목적어, 보어)이 결정되며 문맥에 맞는 담화 표지로 연결해야 합니다.",
        rubricProficient: "문장의 기본 성분을 분석하고 서술어의 자릿수 및 담화 표지의 역할을 명확히 설명하며 바른 문장을 작성할 수 있다.",
        rubricDeveloping: "주어와 서술어는 찾을 수 있으나 필수적 부사어나 보어의 구별에 혼동을 보여 피드백이 필요하다.",
        rubricBeginning: "단어의 품사와 문장 성분을 혼동하여 주어와 서술어의 기본 호응 관계 파악에 기초 지도가 필요하다."
      };
    }

    // 기본 일반 템플릿
    return {
      conceptName: standard.statement || "핵심 학습 개념",
      hookDescription: `우리 일상 속에서 '${standard.statement}'와 관련된 실제 상황을 떠올려 봅시다.`,
      primaryMisconception: "단편적인 경험이나 외형적 특징에 의존한 직관적 판단 오류",
      manipulativeResponse: "시뮬레이션 조작을 통한 조건별 수치 및 시각적 반응 확인",
      coreRule: "체계적인 조작과 관찰을 통해 보편적 원리를 발견한다.",
      formalConcept: `${standard.domain || "교과"} 영역 핵심 표준 개념`,
      spiralNext: "상위 학교급 및 차기 학년 연계 심화 개념",
      teacherTier1: `화면에서 관찰할 수 있는 가장 눈에 띄는 특징은 무엇인가요?`,
      teacherTier2: `조건을 다르게 변경했을 때 이전 상태와 어떤 차이점이 생기나요?`,
      teacherTier3: `이 원리를 일반적인 수학적·과학적 규칙으로 요약하면 어떻게 표현할 수 있을까요?`,
      studentResponse1: "처음 봤을 때는 그냥 단순하게 생각했는데 조작해보니 결과가 다릅니다.",
      studentResponse2: "변화하는 규칙이 있는 것 같은데 정확한 공식으로 설명하기는 아직 어렵습니다.",
      studentResponse3: "조건의 인과관계를 종합해 볼 때 핵심 원리에 따라 일정한 규칙으로 정리됩니다.",
      rubricProficient: "해당 성취기준의 핵심 개념을 구체물 조작과 개념어를 활용하여 논리적으로 설명할 수 있다.",
      rubricDeveloping: "개념의 대략적인 원리는 파악하나 세부적인 형식화나 적용에 부분적 도움이 필요하다.",
      rubricBeginning: "기초 개념에 대한 오개념을 보이며 단계별 조작 및 교사의 개별 지도가 필요하다."
    };
  }
}
