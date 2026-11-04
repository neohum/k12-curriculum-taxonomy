/**
 * all-market 437종 및 K-12 전 학년 교육 자료를 위한
 * K-12 인지 위계 온톨로지, 오답 인과 역추적(DAG Backtracking) 및
 * 피아제·비고츠키 기반 구체 조작기/발문 비계(Scaffolding) 스키마
 */

export const TargetGradeGroup = Object.freeze({
  ELEMENTARY_LOW: "elementary_low",   // 초등 1~2학년
  ELEMENTARY_MID: "elementary_mid",   // 초등 3~4학년
  ELEMENTARY_HIGH: "elementary_high", // 초등 5~6학년
  MIDDLE: "middle",                   // 중학교 1~3학년
  HIGH: "high"                        // 고등학교 1~3학년
});

export const PiagetStage = Object.freeze({
  PREOPERATIONAL: "preoperational",                 // 전조작기 (만 6~7세)
  CONCRETE_OPERATIONAL: "concrete_operational",     // 구체적 조작기 (만 8~11세)
  EARLY_FORMAL: "early_formal",                     // 형식적 조작기 초기 (만 12~14세)
  FORMAL_OPERATIONAL: "formal_operational"          // 형식적 조작기 심화 (만 15~18세)
});

export const BrunerRepresentation = Object.freeze({
  ENACTIVE: "enactive",   // 활동적/구체물 조작 표상 (손과 신체, 3D 실물 교구)
  ICONIC: "iconic",       // 영상적/시각 표상 (그림, 다이어그램, 10칸 상자 격자)
  SYMBOLIC: "symbolic"    // 상징적 기호 표상 (수식, 기호, 추상 규칙)
});

export const LessonPhase = Object.freeze({
  INTRODUCTION: "introduction",   // 도입 (생각 열기, 호기심 유발)
  EXPLORATION: "exploration",     // 전개 (조작, 시뮬레이션, 탐구)
  CONSOLIDATION: "consolidation"  // 정리 (형성평가, 개념 다지기)
});

/**
 * 공용 렌더링 엔진 도구 바인딩 표준
 */
export const ManipulativeEngineType = Object.freeze({
  THREE_RIGGED_HAND: "three_rigged_hand",       // Three.js 21개 관절 3D 손
  THREE_POLY_ASSETS: "three_poly_assets",       // Poly.pizza/Quaternius 3D 사과·바구니·주사위
  PHET_BALANCE_SCALE: "phet_balance_scale",     // PhET 토크 물리 양팔 저울
  PHET_TEN_FRAME: "phet_ten_frame",             // PhET 10칸 상자 스프링 스냅
  PHET_ANALOG_CLOCK: "phet_analog_clock",       // PhET 12:1 기어비 연동 아날로그 시계
  PHET_FRACTION_RODS: "phet_fraction_rods",     // PhET 퀴즈네어 수막대 및 분수 원판
  MEDIAPIPE_HAND_2D: "mediapipe_hand_2d",       // MediaPipe 21 관절 황금비율 손
  ZDOG_PSEUDO_3D: "zdog_pseudo_3d"              // Zdog 28KB 의사 3D 벡터 사물
});

/**
 * 스키마 검증기 및 인지 비계 유효성 평가
 */
export class LessonTaxonomySchema {
  static validate(lessonMeta) {
    const errors = [];

    // 1. targetGradeGroup 검증
    const validGroups = Object.values(TargetGradeGroup);
    if (!lessonMeta.targetGradeGroup || !validGroups.includes(lessonMeta.targetGradeGroup)) {
      errors.push(`유효하지 않은 targetGradeGroup: ${lessonMeta.targetGradeGroup}. 허용값: ${validGroups.join(", ")}`);
    }

    // 2. piagetStage 검증
    const validStages = Object.values(PiagetStage);
    if (!lessonMeta.piagetStage || !validStages.includes(lessonMeta.piagetStage)) {
      errors.push(`유효하지 않은 piagetStage: ${lessonMeta.piagetStage}. 허용값: ${validStages.join(", ")}`);
    }

    // 3. recommendedPeriod 검증
    if (!lessonMeta.recommendedPeriod || typeof lessonMeta.recommendedPeriod !== "object") {
      errors.push("recommendedPeriod 객체 필수 누락");
    } else {
      const rp = lessonMeta.recommendedPeriod;
      if (!rp.unit || typeof rp.unit !== "string") {
        errors.push("recommendedPeriod.unit (단원명) 누락");
      }
      if (typeof rp.period !== "number" || rp.period < 1) {
        errors.push("recommendedPeriod.period (차시 번호 1 이상) 누락");
      }
      const validPhases = Object.values(LessonPhase);
      if (!rp.phase || !validPhases.includes(rp.phase)) {
        errors.push(`유효하지 않은 recommendedPeriod.phase: ${rp.phase}. 허용값: ${validPhases.join(", ")}`);
      }
    }

    // 4. 광역 학교급 뭉뚱그림 방지 불변식 (Hard rule: Zero Broad Range)
    if (Array.isArray(lessonMeta.levels)) {
      const schoolLevels = ["초등", "중학교", "고등학교"];
      const overlapping = lessonMeta.levels.filter(lvl => schoolLevels.includes(lvl));
      if (overlapping.length >= 2) {
        errors.push(`광역 학교급 중복 금지 위반: [${overlapping.join(", ")}] 2개 이상 학교급 포괄 불가`);
      }
    }

    // 5. 오답 인과 역추적 체인(misconceptionCausalChains) 선택적 검증
    if (lessonMeta.misconceptionCausalChains) {
      if (!Array.isArray(lessonMeta.misconceptionCausalChains)) {
        errors.push("misconceptionCausalChains는 배열이어야 합니다.");
      } else {
        lessonMeta.misconceptionCausalChains.forEach((chain, idx) => {
          if (!chain.triggerError || !chain.causalSteps || !Array.isArray(chain.causalSteps)) {
            errors.push(`misconceptionCausalChains[${idx}]: triggerError 및 causalSteps 배열 필수`);
          }
        });
      }
    }

    // 6. 피아제·브루너 조작기 및 비고츠키 비계(scaffoldingSpec) 선택적 검증
    if (lessonMeta.scaffoldingSpec) {
      const spec = lessonMeta.scaffoldingSpec;
      if (!spec.enactive || !spec.iconic || !spec.symbolic) {
        errors.push("scaffoldingSpec: enactive, iconic, symbolic 3단계 필수");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
