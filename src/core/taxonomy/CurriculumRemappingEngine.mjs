import { TargetGradeGroup, PiagetStage, LessonPhase } from "./LessonTaxonomySchema.mjs";

/**
 * 437종 교육 자료 지능형 교육과정 재매핑 엔진
 */
export class CurriculumRemappingEngine {
  constructor() {
    this.highKeywords = [
      "미적분", "미분", "적분", "벡터", "행렬", "삼각함수", "로그", "극한",
      "상대성", "양자", "전자기 유도", "광전효과", "스펙트럼", "열역학", "엔트로피",
      "화학 평형", "오비탈", "산화 환원", "세포 호흡", "광합성 명반응", "DNA 복제",
      "유전", "도플러", "RLC", "파동 간섭", "유체 역학", "케플러", "뉴턴 역학 심화"
    ];

    this.middleKeywords = [
      "일차방정식", "연립방정식", "이차방정식", "일차함수", "이차함수", "피타고라스",
      "확률과 통계", "힘과 운동", "작용 반작용", "관성", "옴의 법칙", "전기 저항",
      "빛의 굴절", "전반사", "원소 기호", "주기율표", "이온", "지각 변동", "판 구조론",
      "광합성", "소화계", "순환계", "호흡계", "배설계", "기권과 날씨", "수권"
    ];

    this.elemHighKeywords = [
      "태양계", "행성", "달의 위상", "계절의 변화", "지층과 화석", "화산과 지진",
      "산과 염기", "용해와 용액", "비와 비율", "분수의 곱셈", "분수의 나눗셈", "원의 넓이",
      "직육면체", "소수의 곱셈", "소수의 나눗셈", "생태계", "인체", "전기 회로", "렌즈"
    ];

    this.elemMidKeywords = [
      "자석", "그림자와 거울", "소리의 성질", "지표의 변화", "동물의 생활", "식물의 생활",
      "물질의 상태", "혼합물의 분리", "분수 기초", "소수 기초", "평면도형", "각도",
      "삼각형", "사각형", "나눗셈", "곱셈구구", "길이와 시간", "무게와 들이"
    ];

    this.elemLowKeywords = [
      "글자", "한글", "자음", "모음", "받침", "소리내어", "낱말", "문장부호", "말놀이",
      "100까지의 수", "덧셈", "뺄셈", "시계", "모양", "감각", "안전", "가족", "봄", "가을"
    ];
  }

  /**
   * 단일 수업 자료 메타데이터 재매핑
   */
  remap(lesson) {
    const textBlob = `${lesson.title || ""} ${lesson.description || ""} ${(lesson.tags || []).join(" ")} ${lesson.subject || ""}`.toLowerCase();

    let targetGroup = TargetGradeGroup.ELEMENTARY_MID;
    let piaget = PiagetStage.CONCRETE_OPERATIONAL;
    let resolvedLevel = "초등";
    let periodPhase = LessonPhase.EXPLORATION;

    // 1. 고등학교 키워드 검사
    if (this.highKeywords.some(kw => textBlob.includes(kw.toLowerCase()))) {
      targetGroup = TargetGradeGroup.HIGH;
      piaget = PiagetStage.FORMAL_OPERATIONAL;
      resolvedLevel = "고등학교";
    }
    // 2. 중학교 키워드 검사
    else if (this.middleKeywords.some(kw => textBlob.includes(kw.toLowerCase()))) {
      targetGroup = TargetGradeGroup.MIDDLE;
      piaget = PiagetStage.EARLY_FORMAL;
      resolvedLevel = "중학교";
    }
    // 3. 초등 저학년 검사
    else if (this.elemLowKeywords.some(kw => textBlob.includes(kw.toLowerCase()))) {
      targetGroup = TargetGradeGroup.ELEMENTARY_LOW;
      piaget = PiagetStage.PREOPERATIONAL;
      resolvedLevel = "초등";
      periodPhase = LessonPhase.INTRODUCTION;
    }
    // 4. 초등 고학년 검사
    else if (this.elemHighKeywords.some(kw => textBlob.includes(kw.toLowerCase()))) {
      targetGroup = TargetGradeGroup.ELEMENTARY_HIGH;
      piaget = PiagetStage.CONCRETE_OPERATIONAL;
      resolvedLevel = "초등";
    }
    // 5. 기존 grades/levels 힌트 보정
    else if ((lesson.grades || "").includes("고")) {
      targetGroup = TargetGradeGroup.HIGH;
      piaget = PiagetStage.FORMAL_OPERATIONAL;
      resolvedLevel = "고등학교";
    } else if ((lesson.grades || "").includes("중")) {
      targetGroup = TargetGradeGroup.MIDDLE;
      piaget = PiagetStage.EARLY_FORMAL;
      resolvedLevel = "중학교";
    } else {
      targetGroup = TargetGradeGroup.ELEMENTARY_MID;
      piaget = PiagetStage.CONCRETE_OPERATIONAL;
      resolvedLevel = "초등";
    }

    // 특수 교육/행정 레벨 보존
    const preservedSpecial = (lesson.levels || []).filter(l => ["교무·행정", "유치원", "특수교육"].includes(l));
    const finalLevels = preservedSpecial.length > 0 ? [...preservedSpecial, resolvedLevel] : [resolvedLevel];

    // 단원 및 추천 차시 자동 생성
    const defaultUnit = lesson.subject ? `${lesson.subject} 탐구 단원` : "공통 역량 단원";
    const recommendedPeriod = {
      unit: defaultUnit,
      period: targetGroup === TargetGradeGroup.ELEMENTARY_LOW ? 1 : 2,
      phase: periodPhase,
      durationMinutes: resolvedLevel === "초등" ? 40 : (resolvedLevel === "중학교" ? 45 : 50),
      touchTargetMinPx: targetGroup === TargetGradeGroup.ELEMENTARY_LOW ? 56 : 44
    };

    return {
      ...lesson,
      targetGradeGroup: targetGroup,
      piagetStage: piaget,
      levels: finalLevels, // 뭉뚱그림 해소: 단일 정밀 학교급
      recommendedPeriod,
      remediatedAt: new Date().toISOString()
    };
  }

  /**
   * 437종 전수 배치 재매핑
   */
  remapAll(lessons) {
    return lessons.map(l => this.remap(l));
  }
}
