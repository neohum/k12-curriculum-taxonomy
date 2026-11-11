/**
 * @file MarketCurriculumTagger.mjs
 * @description all_market 교육 콘텐츠 위계 자동 태거 & 인지 발달 품질 검증 엔진
 *
 * 교재, PDF, 활동지, 워크시트 제목 및 본문 텍스트를 분석하여:
 * 1. 2022 개정 K-12 교육과정 성취기준 코드 ([6수01-06], [9사05-02] 등) 자동 추출
 * 2. all_market 표준 직교 택소노미 (Target Stage, Subject Domain, Major Category) 매핑
 * 3. 피아제 인지 발달 단계 (Preoperational -> Concrete Operational -> Early Formal -> Formal) 적합성 판별
 * 4. 나선형 교육과정(Spiral Curriculum) 기반 구매 교사용 선수 필수 지식(Prerequisites) 도출
 * 5. 초등 저학년 추상 기호 남용, 인지 과부하(Cognitive Overload) 감지 및 품질 검증 라벨/위험 플래그 생성
 *
 * 성취기준 후보는 기본으로 교육부 고시 원문(data/kr-2022/standards.json)에서 찾는다.
 * 아래 CORE_CURRICULUM_STANDARDS·PREREQUISITE_RULES·SPIRAL_TRAJECTORIES는 손작성 데이터라
 * 원문과 코드·문장이 다르다. `new MarketCurriculumTagger({ source: "handwritten" })`일 때만
 * 후보로 쓰고, 공식 모드에서는 사람이 확정한 연결(review/kr2022-remap/decisions.json)이 있을 때만
 * 선수학습·나선형 궤적을 빌려 온다.
 */

import { tagOfficial } from "../kr2022/official.mjs";
import {
  DEFAULT_DECISIONS_PATH,
  HANDWRITTEN_WARNING,
  handwrittenBasis,
  handwrittenFor,
  itemKey,
  loadDecisions
} from "../kr2022/handwritten-links.mjs";

export const PIAGET_STAGES = Object.freeze({
  PREOPERATIONAL: "Preoperational",                     // 전조작기 (유치원~초1)
  CONCRETE_OPERATIONAL: "Concrete Operational",         // 구체적 조작기 (초등 1~6학년)
  EARLY_FORMAL: "Early Formal Operational",             // 초기 형식적 조작기 (중학교 1~3학년)
  FORMAL_OPERATIONAL: "Formal Operational"              // 형식적 조작기 (고등학교 1~3학년)
});

/**
 * all_market 표준 학제 및 교과 택소노미 코드 매핑
 */
export const ALL_MARKET_TAXONOMY = Object.freeze({
  STAGES: {
    kindergarten: "kindergarten",
    elem_lower: "elem_lower",
    elem_upper: "elem_upper",
    middle: "middle",
    high_general: "high_general",
    high_vocational: "high_vocational"
  },
  DOMAINS: {
    math: "curriculum_math",
    social: "curriculum_social",
    science: "curriculum_science",
    korean: "curriculum_korean",
    english: "curriculum_english",
    arts_sports: "curriculum_arts_sports",
    tech_home: "curriculum_tech_home",
    info_ai: "curriculum_info_ai"
  },
  MAJOR_CATEGORIES: {
    elementary: "elementary",
    middle: "middle",
    highschool: "highschool",
    special_edu: "special_edu"
  }
});

/**
 * 손작성 성취기준 16개 (비공식 — 고시 원문 아님). source "handwritten" 모드에서만 후보로 쓴다.
 */
export const CORE_CURRICULUM_STANDARDS = Object.freeze([
  // --- [초등 수학 (ES Math)] ---
  {
    code: "[2수01-01]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "ES",
    targetStage: "elem_lower",
    gradeCluster: "초등 1~2학년군",
    statement: "0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.",
    keywords: ["수 세기", "수 읽기", "수 쓰기", "자릿값", "두 자리 수", "100까지의 수"],
    piagetStage: PIAGET_STAGES.CONCRETE_OPERATIONAL,
    prohibitedAbstractSymbols: ["x", "y", "lim", "∫", "dx", "log", "f(x)"]
  },
  {
    code: "[2수01-05]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "ES",
    targetStage: "elem_lower",
    gradeCluster: "초등 1~2학년군",
    statement: "덧셈과 뺄셈의 역연산 관계를 이해하고 수 모으기와 가르기를 할 수 있다.",
    keywords: ["덧셈", "뺄셈", "수 모으기", "수 가르기", "역연산", "연산 감각"],
    piagetStage: PIAGET_STAGES.CONCRETE_OPERATIONAL,
    prohibitedAbstractSymbols: ["x", "y", "lim", "∫", "dx", "log"]
  },
  {
    code: "[4수01-01]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "ES",
    targetStage: "elem_upper",
    gradeCluster: "초등 3~4학년군",
    statement: "분수의 의미를 알고, 단위분수, 진분수, 가분수, 대분수를 이해하며 동분모 분수의 덧셈과 뺄셈을 할 수 있다.",
    keywords: ["분수", "단위분수", "진분수", "가분수", "대분수", "동분모", "동분모 덧셈", "동분모 뺄셈"],
    piagetStage: PIAGET_STAGES.CONCRETE_OPERATIONAL,
    prohibitedAbstractSymbols: ["lim", "∫", "dx", "sigma", "미분"]
  },
  {
    code: "[6수01-01]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "ES",
    targetStage: "elem_upper",
    gradeCluster: "초등 5~6학년군",
    statement: "약수, 공약수, 최대공약수의 개념과 배수, 공배수, 최소공배수의 개념을 이해하고 이를 구할 수 있다.",
    keywords: ["약수", "배수", "공약수", "공배수", "최대공약수", "최소공배수", "소인수"],
    piagetStage: PIAGET_STAGES.CONCRETE_OPERATIONAL,
    prohibitedAbstractSymbols: ["lim", "∫", "dx", "도함수"]
  },
  {
    code: "[6수01-06]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "ES",
    targetStage: "elem_upper",
    gradeCluster: "초등 5~6학년군",
    statement: "분모가 다른 분수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.",
    keywords: [
      "분모가 다른 분수", "이분모", "통분", "공통분모", "약분", "기약분수",
      "분수 덧셈", "분수 뺄셈", "대분수 덧셈", "수직선 분수", "분수 막대"
    ],
    piagetStage: PIAGET_STAGES.CONCRETE_OPERATIONAL,
    prohibitedAbstractSymbols: ["lim", "∫", "dx", "f'(x)", "편미분", "미분계수"]
  },
  {
    code: "[6수02-01]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "ES",
    targetStage: "elem_upper",
    gradeCluster: "초등 5~6학년군",
    statement: "두 양의 크기를 비교하여 비와 비율의 의미를 이해하고 비율을 분수와 소수로 나타낼 수 있다.",
    keywords: ["비와 비율", "기준량", "비교하는 양", "백분율", "할인율", "비례식"],
    piagetStage: PIAGET_STAGES.CONCRETE_OPERATIONAL,
    prohibitedAbstractSymbols: ["lim", "∫", "dx", "행렬", "다변수"]
  },

  // --- [중학 사회 / 경제 (MS Social)] ---
  {
    code: "[9사05-02]",
    subject: "사회",
    domain: "curriculum_social",
    schoolLevel: "MS",
    targetStage: "middle",
    gradeCluster: "중학교 1~3학년군",
    statement: "시장에서 가격이 결정되는 원리를 이해하고, 수요와 공급의 변동에 따른 균형 가격과 거래량의 변화를 설명할 수 있다.",
    keywords: [
      "시장 가격", "수요", "공급", "수요 곡선", "공급 곡선", "수요 법칙", "공급 법칙",
      "균형 가격", "균형 거래량", "초과 수요", "초과 공급", "시장 균형", "가격 변동",
      "우하향", "우상향", "수요량", "공급량"
    ],
    piagetStage: PIAGET_STAGES.EARLY_FORMAL,
    prohibitedAbstractSymbols: ["IS-LM", "솔로우 모형", "필립스 곡선", "헤지펀드 파생상품"]
  },
  {
    code: "[9사05-01]",
    subject: "사회",
    domain: "curriculum_social",
    schoolLevel: "MS",
    targetStage: "middle",
    gradeCluster: "중학교 1~3학년군",
    statement: "합리적 선택의 의미와 필요성을 이해하고, 기회비용과 매몰비용을 고려하여 합리적으로 소비를 설계할 수 있다.",
    keywords: ["합리적 선택", "기회비용", "매몰비용", "희소성", "자원 배분", "소비 생활"],
    piagetStage: PIAGET_STAGES.EARLY_FORMAL
  },

  // --- [중학 수학 (MS Math)] ---
  {
    code: "[9수02-04]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "MS",
    targetStage: "middle",
    gradeCluster: "중학교 1~3학년군",
    statement: "문자를 사용하여 식을 간단히 나타내고 일차방정식을 풀 수 있으며 이를 실생활 문제 해결에 활용할 수 있다.",
    keywords: ["문자와 식", "일차방정식", "등식의 성질", "이항", "미지수", "방정식의 해"],
    piagetStage: PIAGET_STAGES.EARLY_FORMAL
  },
  {
    code: "[9수03-03]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "MS",
    targetStage: "middle",
    gradeCluster: "중학교 1~3학년군",
    statement: "일차함수의 의미를 알고, 그 그래프를 그릴 수 있으며 그래프의 기울기와 절편의 성질을 설명할 수 있다.",
    keywords: ["일차함수", "기울기", "절편", "x절편", "y절편", "좌표평면", "평균변화율", "직선의 그래프"],
    piagetStage: PIAGET_STAGES.EARLY_FORMAL
  },

  // --- [중학 과학 (MS Science)] ---
  {
    code: "[9과05-02]",
    subject: "과학",
    domain: "curriculum_science",
    schoolLevel: "MS",
    targetStage: "middle",
    gradeCluster: "중학교 1~3학년군",
    statement: "생식세포 형성 과정에서 일어나는 감수분열을 관찰하고 멘델의 유전 원리를 설명할 수 있다.",
    keywords: ["유전", "멘델", "감수분열", "생식세포", "우열의 원리", "분리의 법칙", "독립의 법칙", "대립유전자"],
    piagetStage: PIAGET_STAGES.EARLY_FORMAL
  },
  {
    code: "[9과08-01]",
    subject: "과학",
    domain: "curriculum_science",
    schoolLevel: "MS",
    targetStage: "middle",
    gradeCluster: "중학교 1~3학년군",
    statement: "물체에 작용하는 여러 가지 힘의 효과를 이해하고 속력의 변화와 운동 상태를 설명할 수 있다.",
    keywords: ["속력", "등속 운동", "자유 낙하", "가속", "중력", "마찰력", "관성"],
    piagetStage: PIAGET_STAGES.EARLY_FORMAL
  },

  // --- [고등 수학 / 미적분 (HS Calculus)] ---
  {
    code: "[12미적1-01-01]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "HS",
    targetStage: "high_general",
    gradeCluster: "고등학교 1~3학년군",
    statement: "함수의 극한과 연속의 뜻을 알고, 여러 가지 함수의 극한값을 구할 수 있다.",
    keywords: ["함수의 극한", "수렴", "발산", "좌극한", "우극한", "연속함수", "불연속", "중간값 정리"],
    piagetStage: PIAGET_STAGES.FORMAL_OPERATIONAL
  },
  {
    code: "[12미적1-02-01]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "HS",
    targetStage: "high_general",
    gradeCluster: "고등학교 1~3학년군",
    statement: "미분계수의 뜻을 알고, 그 기하학적 의미를 이해하며 순간변화율과 접선의 기울기를 구할 수 있다.",
    keywords: [
      "미분계수", "순간변화율", "평균변화율", "도함수", "접선의 기울기", "접선의 방정식",
      "lim", "미분가능성", "f'(x)", "dx", "dy/dx", "미분법"
    ],
    piagetStage: PIAGET_STAGES.FORMAL_OPERATIONAL
  },
  {
    code: "[12미적1-03-06]",
    subject: "수학",
    domain: "curriculum_math",
    schoolLevel: "HS",
    targetStage: "high_general",
    gradeCluster: "고등학교 1~3학년군",
    statement: "정적분의 뜻을 알고, 곡선으로 둘러싸인 도형의 넓이와 연속 변화량의 누적을 구할 수 있다.",
    keywords: ["정적분", "부정적분", "구분구적법", "곡선의 넓이", "적분의 기본정리", "∫", "누적 변화량"],
    piagetStage: PIAGET_STAGES.FORMAL_OPERATIONAL
  },

  // --- [고등 경제 (HS Economics)] ---
  {
    code: "[12경제01-02]",
    subject: "사회",
    domain: "curriculum_social",
    schoolLevel: "HS",
    targetStage: "high_general",
    gradeCluster: "고등학교 1~3학년군",
    statement: "외환 시장의 원리를 이해하고, 환율과 이자율 변동이 국민 경제와 국제 수지에 미치는 영향을 분석할 수 있다.",
    keywords: ["환율", "이자율", "외환 시장", "거시경제", "국제 수지", "물가", "GDP", "통화 정책", "중앙은행"],
    piagetStage: PIAGET_STAGES.FORMAL_OPERATIONAL
  }
]);

/**
 * K-12 나선형 선수학습 위계 그래프 (Prerequisite Knowledge Graph)
 */
export const PREREQUISITE_RULES = Object.freeze([
  {
    standardCode: "[6수01-06]",
    prerequisites: [
      {
        code: "[4수01-01]",
        title: "동분모 분수의 덧셈과 뺄셈 및 분수 개념",
        schoolLevel: "ES",
        strength: "hard",
        reason: "이분모 분수를 통분하여 계산하기 위해서는 진분수·대분수 개념 및 동분모 연산 숙달이 필수입니다.",
        readinessCheck: "동분모 분수 3/8 + 2/8 = 5/8 연산을 막힘없이 수행할 수 있는가?"
      },
      {
        code: "[6수01-01]",
        title: "약수, 배수, 최대공약수, 최소공배수",
        schoolLevel: "ES",
        strength: "hard",
        reason: "분모가 다른 두 분수의 공통분모를 구하고 기약분수로 약분하기 위해 최소공배수와 최대공약수가 필수입니다.",
        readinessCheck: "두 수(예: 6과 8)의 최소공배수(24)를 찾아 통분할 수 있는가?"
      }
    ]
  },
  {
    standardCode: "[9사05-02]",
    prerequisites: [
      {
        code: "[6수01-06]",
        title: "초등 분수 연산 및 비와 비율",
        schoolLevel: "ES",
        strength: "hard",
        reason: "수요·공급 곡선에서 가격 변화에 따른 수요량·공급량의 상대적 변화율(탄력성 기초)을 이해하기 위해 비와 비율 계산이 필수입니다.",
        readinessCheck: "가격이 10% 상승할 때 거래량 변동률의 비례 관계를 분수와 백분율로 해석할 수 있는가?"
      },
      {
        code: "[9사05-01]",
        title: "합리적 선택과 기회비용",
        schoolLevel: "MS",
        strength: "soft",
        reason: "소비자와 생산자가 시장 가격에 반응하여 수요량과 공급량을 조절하는 행동 원리의 이론적 배경입니다.",
        readinessCheck: "소비자가 가격 상승 시 다른 재화로 눈을 돌리는 기회비용 원리를 이해하는가?"
      }
    ]
  },
  {
    standardCode: "[12미적1-02-01]",
    prerequisites: [
      {
        code: "[9수03-03]",
        title: "중학 일차함수의 기울기와 좌표평면",
        schoolLevel: "MS",
        strength: "hard",
        reason: "미분계수는 평균변화율(Δy/Δx)의 극한이므로, 좌표평면 상에서 두 점 사이의 기울기 개념이 직관적으로 정립되어 있어야 합니다.",
        readinessCheck: "두 점 (x1, y1), (x2, y2)를 잇는 직선의 기울기 공식 (y2 - y1) / (x2 - x1)을 유도하고 적용할 수 있는가?"
      },
      {
        code: "[12미적1-01-01]",
        title: "함수의 극한과 연속",
        schoolLevel: "HS",
        strength: "hard",
        reason: "순간변화율은 Δx가 0으로 갈 때의 극한값이므로 함수의 극한 계산 원리가 선행되어야 합니다.",
        readinessCheck: "0/0 꼴의 부정형 극한값을 약분과 인수분해를 통해 계산할 수 있는가?"
      },
      {
        code: "[6수01-06]",
        title: "초등 분수 연산 및 변화율 기초 (나선형 기원)",
        schoolLevel: "ES",
        strength: "soft",
        reason: "모든 분수 형태의 변화율 표현식의 수리적 연산 기초를 형성합니다.",
        readinessCheck: "분수 형태의 증분 비례식을 오차 없이 사칙연산할 수 있는가?"
      }
    ]
  },
  {
    standardCode: "[12미적1-03-06]",
    prerequisites: [
      {
        code: "[12미적1-02-01]",
        title: "미분계수와 도함수",
        schoolLevel: "HS",
        strength: "hard",
        reason: "정적분은 미분과 역연산 관계(미적분의 기본정리)에 있으므로 도함수 개념이 선행되어야 합니다.",
        readinessCheck: "부정적분이 미분의 역연산임을 설명하고 기본 다항함수를 적분할 수 있는가?"
      }
    ]
  },
  {
    standardCode: "[12경제01-02]",
    prerequisites: [
      {
        code: "[9사05-02]",
        title: "중학 시장 가격의 결정 (수요·공급 곡선)",
        schoolLevel: "MS",
        strength: "hard",
        reason: "환율은 외환 시장에서의 외환 수요와 공급이 교차하는 균형 가격이므로, 수요·공급 곡선의 이동 메커니즘 숙지가 필수입니다.",
        readinessCheck: "외환 공급 증가 시 외환 가치(환율)가 하락하는 원리를 수요·공급 곡선 그래프로 도해할 수 있는가?"
      }
    ]
  }
]);

/**
 * 나선형 교육과정 메타 체인 (Cross-Grade Spiral Trajectory)
 */
export const SPIRAL_TRAJECTORIES = Object.freeze({
  fractions_to_calculus: {
    key: "fractions_to_calculus",
    title: "분수 연산 -> 일차함수 기울기 -> 미분계수/적분 변화율 나선형 체계",
    chain: ["[6수01-06]", "[9수03-03]", "[12미적1-02-01]", "[12미적1-03-06]"],
    cognitiveTransition: "구체물 분할 조작(초등) -> 좌표평면 평균변화율(중학) -> 무한소 순간변화율 및 누적(고등)"
  },
  ratio_to_economy: {
    key: "ratio_to_economy",
    title: "비와 비율 -> 시장 수요공급 곡선 균형 -> 거시경제 외환/환율 나선형 체계",
    chain: ["[6수01-06]", "[6수02-01]", "[9사05-02]", "[12경제01-02]"],
    cognitiveTransition: "수치 비례 조작(초등) -> 가격-수량 평면 균형점 교차(중학) -> 다변수 개방경제 거시 메커니즘(고등)"
  }
});

/**
 * 인지 발달 단계별 위험 감지 규칙
 */
const DEVELOPMENTAL_RISK_RULES = [
  {
    id: "RISK_EARLY_SYMBOLIC_OVERLOAD",
    appliesToStage: ["elem_lower"],
    forbiddenPattern: /([xyz]\s*=|lim|f\(x\)|∫|dx|dy|∑|log|tan|cos|sin|√)/i,
    severity: "CRITICAL",
    message: "초등 저학년(1~2학년) 구체적 조작기 이전 단계에 고난도 추상 문자/기호(x, y, lim, 미적분 등)가 노출되었습니다.",
    action: "문자 변수(x, y) 대신 그림 칸(□, 빈 상자, 실물 과일)을 사용하고, 구체적 조작(Enactive/Iconic) 표상으로 전환하세요."
  },
  {
    id: "RISK_UPPER_ELEMENTARY_ABSTRACTION",
    appliesToStage: ["elem_upper"],
    forbiddenPattern: /(lim|∫|dx|dy|도함수|편미분|순간변화율|거시경제|환율변동)/i,
    severity: "WARNING",
    message: "초등 고학년(3~6학년) 구체적 조작기 단계에 중고등 수준의 형식적 추상 용어(미적분, 거시경제 등)가 포함되었습니다.",
    action: "실생활 맥락(용액 농도, 속력 비례, 피자 나누기)의 비계(Scaffolding)를 강화하고, 기호적 공식을 축소하세요."
  },
  {
    id: "RISK_MIDDLE_ABSTRACT_JUMP",
    appliesToStage: ["middle"],
    forbiddenPattern: /(다변수\s*해석|텐서|리만\s*적분|IS-LM|헤지\s*파생)/i,
    severity: "CRITICAL",
    message: "중학교 초기 형식적 조작기 단계에 대학/고급 수준의 추상 다변수 이론이 조기 노출되었습니다.",
    action: "1변수 일차/이차 관계 및 2차원 좌표평면 그래프 직관화에 집중하세요."
  }
];

/**
 * MarketCurriculumTagger 엔진
 */
const OFFICIAL_SUBJECT_DOMAINS = Object.freeze({
  "수학": ALL_MARKET_TAXONOMY.DOMAINS.math,
  "사회": ALL_MARKET_TAXONOMY.DOMAINS.social,
  "과학": ALL_MARKET_TAXONOMY.DOMAINS.science,
  "과학 계열 선택 과목": ALL_MARKET_TAXONOMY.DOMAINS.science,
  "국어": ALL_MARKET_TAXONOMY.DOMAINS.korean,
  "영어": ALL_MARKET_TAXONOMY.DOMAINS.english,
  "체육": ALL_MARKET_TAXONOMY.DOMAINS.arts_sports,
  "체육 계열 선택 과목": ALL_MARKET_TAXONOMY.DOMAINS.arts_sports,
  "음악": ALL_MARKET_TAXONOMY.DOMAINS.arts_sports,
  "미술": ALL_MARKET_TAXONOMY.DOMAINS.arts_sports,
  "예술 계열 선택 교과": ALL_MARKET_TAXONOMY.DOMAINS.arts_sports,
  "실과": ALL_MARKET_TAXONOMY.DOMAINS.tech_home,
  "기술·가정": ALL_MARKET_TAXONOMY.DOMAINS.tech_home,
  "정보": ALL_MARKET_TAXONOMY.DOMAINS.info_ai
});

/** 공식 gradeBand("초등학교 1~2학년" 등) → all_market 학제 */
function officialTargetStage(std) {
  if (std.schoolLevel === "MS") return ALL_MARKET_TAXONOMY.STAGES.middle;
  if (std.schoolLevel === "HS") return ALL_MARKET_TAXONOMY.STAGES.high_general;
  return /1~2/.test(std.gradeBand) ? ALL_MARKET_TAXONOMY.STAGES.elem_lower : ALL_MARKET_TAXONOMY.STAGES.elem_upper;
}

/** tagOfficial 결과를 이 클래스의 내부 후보 형태로 바꾼다. 손작성 전용 필드(keywords, piagetStage)는 붙이지 않는다. */
function officialCandidate(item) {
  return {
    ...item,
    targetStage: officialTargetStage(item),
    // all_market 택소노미의 domain 키. 대응표에 없는 교과는 null로 두고 지어내지 않는다.
    domain: OFFICIAL_SUBJECT_DOMAINS[item.subject] ?? null,
    curriculumDomain: item.domain,
    gradeCluster: item.gradeBand
  };
}

export class MarketCurriculumTagger {
  /**
   * @param {Object} [options]
   * @param {"official"|"handwritten"} [options.source] 기본 "official". standards를 직접 넘기면 "handwritten".
   * @param {string} [options.decisionsPath] 손작성↔공식 확정 연결 파일 경로
   */
  constructor(options = {}) {
    this.source = options.source || (options.standards ? "handwritten" : "official");
    if (!["official", "handwritten"].includes(this.source)) {
      throw new Error(`source는 official 또는 handwritten만 쓸 수 있습니다: '${this.source}'`);
    }
    this.standards = options.standards || CORE_CURRICULUM_STANDARDS;
    this.prerequisiteRules = options.prerequisiteRules || PREREQUISITE_RULES;
    this.trajectories = options.trajectories || SPIRAL_TRAJECTORIES;
    this.decisionsPath = options.decisionsPath || DEFAULT_DECISIONS_PATH;
  }

  /**
   * 교재/학습지 텍스트를 종합 분석하여 성취기준, 택소노미, 선수학습, 인지 발달 품질 라벨을 생성
   *
   * @param {Object} input
   * @param {string} input.title 교재/활동지 제목
   * @param {string} input.content 교재/활동지 본문 텍스트 (OCR 또는 텍스트)
   * @param {string} [input.declaredStage] 판매자가 명시한 학제 (선택)
   * @param {string} [input.declaredSubject] 판매자가 명시한 과목 (선택)
   * @returns {Object} 태깅 및 검증 리포트
   */
  tag(input = {}) {
    const title = (input.title || "").trim();
    const content = (input.content || "").trim();
    const fullText = `${title}\n${content}`;

    if (!fullText.trim()) {
      return {
        success: false,
        error: "분석할 텍스트(제목 또는 본문)가 비어 있습니다."
      };
    }

    const official = this.source === "official";
    const linkState = loadDecisions(this.decisionsPath);

    // 1. 성취기준 후보: 공식 모드는 고시 원문에서, 손작성 모드는 손작성 16개에서 찾는다.
    const scoredMatches = official
      ? tagOfficial(fullText, { subject: input.declaredSubject || null, limit: 10 }).map(officialCandidate)
      : this._scoreCandidateStandards(fullText, this._extractExplicitCodes(fullText));

    // 최고 득점 성취기준 선정
    const primaryStandard = scoredMatches.length > 0 ? scoredMatches[0] : null;

    // 선수학습·나선형 궤적·피아제 단계 정보는 손작성 데이터에만 있다. 공식 모드에서는
    // 사람이 확정한 연결로 찾은 손작성 성취기준이 있을 때만 그 정보를 빌려 온다.
    // 연결은 검토 화면과 같은 키(코드+손작성 문장)로 이 파일의 손작성 항목과 맞춘다.
    const linkedKeys = official && primaryStandard ? new Set(handwrittenFor(primaryStandard.id, linkState).map(h => h.key)) : new Set();
    const handwrittenRef = official
      ? this.standards.find(s => linkedKeys.has(itemKey(s.code, s.statement))) || null
      : primaryStandard;

    // 2. 학제(Target Stage), 교과(Subject Domain), 대분류(Major Category) 도출
    const taxonomy = this._resolveTaxonomy(primaryStandard, input.declaredStage, input.declaredSubject, fullText);

    // 3. 피아제 인지 발달 단계(Piaget Stage) 매핑
    const piagetStage = this._resolvePiagetStage(taxonomy.targetStage, handwrittenRef);

    // 4. 구매 교사용 필수 선수학습(Prerequisites) 자동 도출
    const prerequisites = this._derivePrerequisites(handwrittenRef, scoredMatches);

    // 5. 나선형 교육과정 궤적(Spiral Trajectory) 연결 확인
    const spiralTrajectory = this._identifySpiralTrajectory(handwrittenRef, prerequisites);

    // 6. 인지 발달 적합성 검증 및 위험 플래그 생성
    const cognitiveAudit = this._auditCognitiveDevelopment(taxonomy.targetStage, fullText, primaryStandard);

    // 7. 교사용 품질 검증 뱃지 및 액션 가이드 발급
    const qualityLabel = this._generateQualityLabel(cognitiveAudit, primaryStandard, prerequisites, official);

    const report = {
      success: true,
      source: this.source,
      official,
      timestamp: new Date().toISOString(),
      metadata: {
        title,
        textLength: fullText.length,
        analyzedAt: new Date().toISOString()
      },
      curriculum: {
        source: this.source,
        primaryCode: primaryStandard ? primaryStandard.code : null,
        primaryId: official && primaryStandard ? primaryStandard.id : null,
        standardTitle: primaryStandard ? primaryStandard.statement : null,
        schoolLevel: primaryStandard ? primaryStandard.schoolLevel : taxonomy.schoolLevel,
        gradeCluster: primaryStandard ? primaryStandard.gradeCluster : null,
        confidenceScore: primaryStandard ? primaryStandard.confidence : 0,
        citation: official && primaryStandard ? primaryStandard.citation : null,
        candidateStandards: scoredMatches.slice(0, 4).map(s => ({
          ...(official ? { id: s.id, text: s.text, citation: s.citation } : {}),
          code: s.code,
          statement: s.statement,
          confidence: s.confidence,
          schoolLevel: s.schoolLevel
        }))
      },
      taxonomy: {
        targetStage: taxonomy.targetStage,
        subjectDomain: taxonomy.subjectDomain,
        majorCategory: taxonomy.majorCategory,
        piagetStage
      },
      prerequisites: {
        count: prerequisites.length,
        list: prerequisites,
        teacherSummaryKo: official && !handwrittenRef
          ? "선수학습 정보가 없습니다. 선수학습 규칙은 손작성 성취기준에만 있고, 이 공식 성취기준과 사람이 확정한 연결이 아직 없습니다."
          : this._buildPrerequisiteSummary(prerequisites, primaryStandard)
      },
      spiralTrajectory,
      cognitiveAudit,
      qualityLabel,
      // 선수학습·나선형 궤적·피아제 단계가 손작성 데이터에서 왔는지 표시한다.
      handwrittenBasis: {
        ...handwrittenBasis(linkState, handwrittenRef ? [{ code: handwrittenRef.code, text: handwrittenRef.statement }] : []),
        handwrittenCode: handwrittenRef?.code ?? null,
        used: Boolean(handwrittenRef),
        appliesTo: ["prerequisites", "spiralTrajectory", "taxonomy.piagetStage"]
      }
    };
    if (!official) report.warning = HANDWRITTEN_WARNING;
    return report;
  }

  /**
   * 텍스트 내에 명시된 성취기준 코드 ([6수01-06], 9사05-02 등) 정규식 추출
   */
  _extractExplicitCodes(text) {
    const codePattern = /\[?([1-9]|1[0-2])([가-힣]{1,4})\d{2}-\d{2}\]?/g;
    const matches = new Set();
    let m;
    while ((m = codePattern.exec(text)) !== null) {
      let code = m[0];
      if (!code.startsWith("[")) code = `[${code}`;
      if (!code.endsWith("]")) code = `${code}]`;
      matches.add(code);
    }
    return Array.from(matches);
  }

  /**
   * 키워드 매칭 및 가중치 계산으로 후보 성취기준 채점
   */
  _scoreCandidateStandards(fullText, explicitCodes) {
    const lowerText = fullText.toLowerCase();
    const results = [];

    for (const std of this.standards) {
      let score = 0;
      const matchedKeywords = [];

      // A. 명시적 코드 일치 (최우선 +1000점)
      if (explicitCodes.includes(std.code) || fullText.includes(std.code)) {
        score += 1000;
        matchedKeywords.push(`EXPLICIT_CODE:${std.code}`);
      }

      // B. 성취기준 진술문 내 핵심 명사 일치
      const statementWords = std.statement.split(/\s+/).filter(w => w.length >= 2);
      for (const word of statementWords) {
        if (lowerText.includes(word.toLowerCase())) {
          score += 15;
        }
      }

      // C. 등록된 교육과정 키워드 매칭 (+30~50점)
      if (Array.isArray(std.keywords)) {
        for (const kw of std.keywords) {
          const kwLower = kw.toLowerCase();
          if (lowerText.includes(kwLower)) {
            // 키워드 길이에 따른 가중치
            const kwWeight = kw.length >= 4 ? 40 : 25;
            score += kwWeight;
            matchedKeywords.push(kw);
          }
        }
      }

      // D. 교과목 일치 보너스
      if (lowerText.includes(std.subject.toLowerCase())) {
        score += 10;
      }

      if (score > 20) {
        const confidence = Math.min(100, Math.round((score / 150) * 100));
        results.push({
          ...std,
          score,
          confidence: score >= 1000 ? 100 : confidence,
          matchedKeywords: Array.from(new Set(matchedKeywords))
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }

  /**
   * all_market 3대 직교 택소노미(Stage, Domain, Category) 결정
   */
  _resolveTaxonomy(primaryStandard, declaredStage, declaredSubject, fullText) {
    let targetStage = declaredStage;
    let subjectDomain = ALL_MARKET_TAXONOMY.DOMAINS.math;
    let majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.elementary;
    let schoolLevel = "ES";

    if (declaredStage && Object.values(ALL_MARKET_TAXONOMY.STAGES).includes(declaredStage)) {
      targetStage = declaredStage;
      if (declaredStage.includes("elem")) schoolLevel = "ES";
      else if (declaredStage.includes("middle")) schoolLevel = "MS";
      else schoolLevel = "HS";
    } else if (primaryStandard) {
      targetStage = primaryStandard.targetStage;
      schoolLevel = primaryStandard.schoolLevel;
    }

    if (primaryStandard) {
      subjectDomain = primaryStandard.domain;
      if (!declaredStage) schoolLevel = primaryStandard.schoolLevel;

      if (schoolLevel === "ES") {
        majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.elementary;
      } else if (schoolLevel === "MS") {
        majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.middle;
      } else {
        majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.highschool;
      }
    } else {
      // 텍스트 기반 휴리스틱 추론
      const t = fullText.toLowerCase();
      if (t.includes("고등") || t.includes("미적분") || t.includes("수능") || t.includes("환율")) {
        targetStage = ALL_MARKET_TAXONOMY.STAGES.high_general;
        majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.highschool;
        schoolLevel = "HS";
      } else if (t.includes("중학") || t.includes("수요") || t.includes("공급") || t.includes("일차함수")) {
        targetStage = ALL_MARKET_TAXONOMY.STAGES.middle;
        majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.middle;
        schoolLevel = "MS";
      } else if (t.includes("1학년") || t.includes("2학년") || t.includes("저학년")) {
        targetStage = ALL_MARKET_TAXONOMY.STAGES.elem_lower;
        majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.elementary;
        schoolLevel = "ES";
      } else {
        targetStage = ALL_MARKET_TAXONOMY.STAGES.elem_upper;
        majorCategory = ALL_MARKET_TAXONOMY.MAJOR_CATEGORIES.elementary;
        schoolLevel = "ES";
      }

      if (t.includes("사회") || t.includes("경제") || t.includes("수요") || t.includes("공급") || t.includes("환율")) {
        subjectDomain = ALL_MARKET_TAXONOMY.DOMAINS.social;
      } else if (t.includes("과학") || t.includes("물리") || t.includes("생물") || t.includes("유전")) {
        subjectDomain = ALL_MARKET_TAXONOMY.DOMAINS.science;
      } else if (t.includes("국어") || t.includes("문학") || t.includes("독서")) {
        subjectDomain = ALL_MARKET_TAXONOMY.DOMAINS.korean;
      }
    }

    return {
      targetStage,
      subjectDomain,
      majorCategory,
      schoolLevel
    };
  }

  /**
   * 피아제 인지 발달 단계 매핑
   */
  _resolvePiagetStage(targetStage, primaryStandard) {
    if (primaryStandard && primaryStandard.piagetStage) {
      return primaryStandard.piagetStage;
    }
    switch (targetStage) {
      case "kindergarten":
        return PIAGET_STAGES.PREOPERATIONAL;
      case "elem_lower":
      case "elem_upper":
        return PIAGET_STAGES.CONCRETE_OPERATIONAL;
      case "middle":
        return PIAGET_STAGES.EARLY_FORMAL;
      case "high_general":
      case "high_vocational":
        return PIAGET_STAGES.FORMAL_OPERATIONAL;
      default:
        return PIAGET_STAGES.CONCRETE_OPERATIONAL;
    }
  }

  /**
   * 성취기준 의존성 그래프에 기반한 선수학습 도출
   */
  _derivePrerequisites(primaryStandard, candidateStandards) {
    if (!primaryStandard) return [];

    const rule = this.prerequisiteRules.find(r => r.standardCode === primaryStandard.code);
    if (!rule) {
      return [];
    }

    return rule.prerequisites.map(p => ({
      code: p.code,
      title: p.title,
      schoolLevel: p.schoolLevel,
      strength: p.strength,
      reason: p.reason,
      readinessCheck: p.readinessCheck
    }));
  }

  /**
   * 나선형 교육과정 궤적(Spiral Trajectory) 연결 확인
   */
  _identifySpiralTrajectory(primaryStandard, prerequisites) {
    if (!primaryStandard) return null;

    for (const [key, traj] of Object.entries(this.trajectories)) {
      if (traj.chain.includes(primaryStandard.code)) {
        const currentIdx = traj.chain.indexOf(primaryStandard.code);
        return {
          key,
          title: traj.title,
          stepIndex: currentIdx + 1,
          totalSteps: traj.chain.length,
          precedingStandards: traj.chain.slice(0, currentIdx),
          succeedingStandards: traj.chain.slice(currentIdx + 1),
          cognitiveTransition: traj.cognitiveTransition
        };
      }
    }
    return null;
  }

  /**
   * 인지 발달 단계 적합성 검증 및 위험 플래그 생성
   */
  _auditCognitiveDevelopment(targetStage, text, primaryStandard) {
    const riskFlags = [];
    const recommendations = [];

    // 규칙 기반 검사
    for (const rule of DEVELOPMENTAL_RISK_RULES) {
      if (rule.appliesToStage.includes(targetStage)) {
        if (rule.forbiddenPattern.test(text)) {
          riskFlags.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.message
          });
          recommendations.push(rule.action);
        }
      }
    }

    // 초등 저학년인데 성취기준이 중고등 성취기준으로 매칭된 경우의 극심한 부조화 검사
    if (targetStage === "elem_lower" && primaryStandard && primaryStandard.schoolLevel !== "ES") {
      riskFlags.push({
        ruleId: "RISK_GRADE_STANDARD_MISMATCH",
        severity: "CRITICAL",
        message: `초등 저학년 대상 자료로 지정되었으나, 고난도 중/고등학교 성취기준(${primaryStandard.code})이 감지되었습니다.`
      });
      recommendations.push("대상 학년을 중/고등학교로 상향 조정하거나, 초등 1~2학년 교육과정에 맞는 내용으로 재구성하세요.");
    }

    const passed = riskFlags.filter(r => r.severity === "CRITICAL").length === 0;

    return {
      status: passed ? (riskFlags.length > 0 ? "WARNING" : "PASS") : "FAIL",
      isAppropriate: passed,
      riskFlags,
      recommendations: Array.from(new Set(recommendations))
    };
  }

  /**
   * 품질 검증 라벨 및 뱃지 발급
   */
  _generateQualityLabel(audit, primaryStandard, prerequisites, official = this.source === "official") {
    // 성취기준 후보는 문자열 유사도·키워드로 고른 자동 추정이고, 인지 발달 검사는 정규식 규칙이다.
    // 사람이 적합성을 확인한 결과가 아니므로 "공인"·"완벽히 부합" 같은 표현을 쓰지 않는다.
    // badge 값(GOLD/SILVER/FLAGGED/BRONZE)은 기존 호출부 호환을 위해 그대로 둔다.
    const basisKo = official ? "고시 원문 성취기준 후보" : "비공식 손작성 성취기준 후보";
    let badge = "GOLD";
    let titleKo = "자동 추정: 성취기준 후보 있음, 위험 신호 없음";
    let descriptionKo = `텍스트와 가장 비슷한 ${basisKo}를 자동으로 골랐고, 규칙 기반 인지 발달 검사에서 위험 신호가 나오지 않았습니다.`;

    if (audit.status === "FAIL") {
      badge = "FLAGGED";
      titleKo = "자동 검사: 인지 발달 부적합 신호 (검토 필요)";
      descriptionKo = "규칙 기반 검사에서 학습 대상의 인지 발달 단계를 넘는 추상 기호나 학교급 불일치 신호가 나왔습니다.";
    } else if (audit.status === "WARNING") {
      badge = "SILVER";
      titleKo = "자동 추정: 성취기준 후보 있음, 비계 보강 권장";
      descriptionKo = `${basisKo}를 자동으로 골랐고, 규칙 기반 검사에서 일부 고난도 어휘나 기호가 감지되어 비계 보강을 권합니다.`;
    } else if (!primaryStandard) {
      badge = "BRONZE";
      titleKo = "성취기준 후보 없음";
      descriptionKo = "자동 추정으로 2022 개정 성취기준 후보를 찾지 못했습니다. 교육과정과 무관하다는 뜻은 아닙니다.";
    }
    descriptionKo += " 교육과정 적합성을 사람이 확인한 결과가 아닙니다.";

    return {
      badge,
      titleKo,
      descriptionKo,
      basis: official ? "official-automatic-estimate" : "handwritten-automatic-estimate",
      humanVerified: false,
      hasPrerequisitesVerified: prerequisites.length > 0,
      piagetCompliant: audit.isAppropriate
    };
  }

  /**
   * 교사용 선수학습 요약문 생성
   */
  _buildPrerequisiteSummary(prerequisites, primaryStandard) {
    if (!prerequisites || prerequisites.length === 0) {
      return "이 성취기준에 등록된 선수학습 규칙이 없습니다(선수학습이 필요 없다는 뜻은 아닙니다).";
    }
    const hardReqs = prerequisites.filter(p => p.strength === "hard");
    const reqTitles = hardReqs.map(p => `[${p.code}] ${p.title}`).join(", ");
    return `본 단원(${primaryStandard ? primaryStandard.code : ""})을 지도하기 전, 학생들의 ${reqTitles} 성취 여부를 반드시 사전 진단하세요.`;
  }
}

export default MarketCurriculumTagger;
