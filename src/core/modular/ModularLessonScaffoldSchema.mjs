/**
 * ModularLessonScaffoldSchema.mjs
 * 
 * 2022 개정 교육과정 기준 차시당 도입 3개 · 전개 9개 · 정리 3개 모듈형 수업 시나리오 및
 * 종이 학습지(1장/2장)와 디지털 교구 프롬프트(PromptCraft) 메타데이터 정규 스키마.
 */

export const LessonStageTypes = {
  INTRO: "intro",
  MAIN: "main",
  WRAPUP: "wrapup",
  WORKSHEET: "worksheet"
};

export const IntroArchetypes = {
  REAL_WORLD_HOOK: "real_world_hook",       // 실생활 호기심 유발 및 시각적 현상 제시
  PRIOR_KNOWLEDGE_WARMUP: "prior_warmup",   // 선수학습 진단 및 구체물 조작 예열
  COGNITIVE_CONFLICT: "cognitive_conflict"  // 인지 갈등 유발 및 가설 설정/예측
};

export const MainTracks = {
  FOUNDATION_CONCRETE: "foundation_concrete", // 트랙 A: 기초 구체물 조작 트랙
  CORE_INQUIRY: "core_inquiry",               // 트랙 B: 핵심 원리 탐구 및 상호작용 트랙
  DEEP_CHALLENGE: "deep_challenge"            // 트랙 C: 심화 확장 및 응용 챌린지 트랙
};

export const WrapupArchetypes = {
  PEER_HABRUTA: "peer_habruta",             // 짝 하브루타 대화 및 개념 상호 설명
  LIVE_PULSE_QUIZ: "live_pulse_quiz",       // 실시간 출구 퀴즈 (ClassPulse/Exit Ticket)
  META_LEARNING_LOG: "meta_learning_log"    // 배움 공책 기록 및 메타인지 자기 성찰
};

export const WorksheetFormats = {
  SINGLE_PAGE: "1_page", // 간이 요약형 1장 (핵심 4문항 + 배움일기)
  DUPLEX_PAGE: "2_page"  // 양면 탐구형 2장 (1면: 도입/전개 탐구 조작, 2면: 정리/심화 형성평가)
};

export const PromptPatterns = {
  INTERACTIVE_MANIPULATIVE: "interactive_manipulative", // 인터랙티브 구체 조작기 및 가상 랩
  MOTION_VIDEO_STIMULUS: "motion_video_stimulus",       // 영상/애니메이션 인물·장면 인지 자극
  COLLABORATIVE_PULSE: "collaborative_pulse",           // 실시간 학급 협력 펄스 및 투표
  SMART_BOARD_CANVAS: "smart_board_canvas",             // 스마트 판서 및 칠판 드로잉
  WORKSHEET_LAYOUT: "worksheet_layout"                  // 종이 활동지 A4 인쇄 조판
};

export const AvailableEduEngines = [
  // 차세대 공용엔진 4종
  "eduboard_canvas",     // 스마트 판서 및 칠판 모눈 드로잉 (tldraw 철학)
  "classpulse_live",     // 실시간 상호작용 펄스/투표/단어구름 (Mentimeter 철학)
  "matter_physics_lab",  // 2D 물리 시뮬레이션 랩 (PhET/Matter.js 철학)
  "promptcraft_studio",  // 교사용 노코드 수업도구 생성기 (prompt.chat 철학)
  // 문제 제작 4대 공용엔진
  "engine_cut",          // 도형·수식 분할 및 직관적 시각화
  "engine_flap",         // 개념 탐구 및 아코디언 질의응답 플랩
  "engine_iso",          // 톱니·카운터·X-Ray 단면 투시 롤러
  "engine_lab",          // 인터랙티브 조작 랩
  // 표준 교구 플러그인 6종
  "fraction_sim",        // 분수 막대 겹치기 및 수직선
  "thinking_canvas",     // 비주얼 씽킹 개념망 및 카드 마인드맵
  "timeline_flow",       // 인터랙티브 역사/순서 타임라인
  "circuit_sim",         // 직·병렬 전기 회로 시뮬레이션
  "live_poll_quiz",      // 선다형/OX 형성평가
  "gamified_board"       // 게이미피케이션 주사위/말판 보드
];

export class ModularLessonScaffoldSchema {
  /**
   * 단일 차시 메타데이터가 모듈형 3-9-3 및 학습지 규격을 준수하는지 검증
   */
  static validate(scaffold) {
    const errors = [];

    if (!scaffold.lessonId || typeof scaffold.lessonId !== "string") {
      errors.push("lessonId 누락 또는 형식 오류");
    }
    if (!scaffold.title || typeof scaffold.title !== "string") {
      errors.push("title 누락 또는 형식 오류");
    }
    if (!Array.isArray(scaffold.standards) || scaffold.standards.length === 0) {
      errors.push("standards(성취기준 코드 배열) 누락");
    }

    // 1. 도입 3개 검증
    if (!scaffold.introOptions || scaffold.introOptions.length !== 3) {
      errors.push(`도입 옵션은 정확히 3개여야 합니다. (현재: ${scaffold.introOptions?.length || 0}개)`);
    } else {
      scaffold.introOptions.forEach((opt, idx) => {
        if (!opt.id || !opt.title || !opt.digitalPrompt) {
          errors.push(`도입 옵션 #${idx + 1}: 필수 필드(id, title, digitalPrompt) 누락`);
        }
        if (opt.dialogScript) {
          this.validateThreeTierDialog(opt.dialogScript, `도입 옵션 #${idx + 1}`, errors);
        }
        if (opt.productionPromptSpec) {
          this.validatePromptSpec(opt.productionPromptSpec, `도입 옵션 #${idx + 1} 정밀 프롬프트`, errors);
        }
      });
    }

    // 2. 전개 9개 검증 (3개 트랙 각 3개)
    if (!scaffold.mainActivities || scaffold.mainActivities.length !== 9) {
      errors.push(`전개 활동 옵션은 정확히 9개(3개 트랙 × 3개)여야 합니다. (현재: ${scaffold.mainActivities?.length || 0}개)`);
    } else {
      scaffold.mainActivities.forEach((act, idx) => {
        if (!act.id || !act.track || !act.title || !act.engine || !act.digitalPrompt) {
          errors.push(`전개 활동 #${idx + 1}: 필수 필드(id, track, title, engine, digitalPrompt) 누락`);
        }
        if (act.engine && !AvailableEduEngines.includes(act.engine)) {
          errors.push(`전개 활동 #${idx + 1}: 미등록 교구 엔진 '${act.engine}' 사용`);
        }
        if (act.dialogScript) {
          this.validateThreeTierDialog(act.dialogScript, `전개 활동 #${idx + 1}`, errors);
        }
        if (act.productionPromptSpec) {
          this.validatePromptSpec(act.productionPromptSpec, `전개 활동 #${idx + 1} 정밀 프롬프트`, errors);
        }
      });
    }

    // 3. 정리 3개 검증
    if (!scaffold.wrapupOptions || scaffold.wrapupOptions.length !== 3) {
      errors.push(`정리 옵션은 정확히 3개여야 합니다. (현재: ${scaffold.wrapupOptions?.length || 0}개)`);
    } else {
      scaffold.wrapupOptions.forEach((opt, idx) => {
        if (!opt.id || !opt.title || !opt.digitalPrompt) {
          errors.push(`정리 옵션 #${idx + 1}: 필수 필드(id, title, digitalPrompt) 누락`);
        }
        if (opt.dialogScript) {
          this.validateThreeTierDialog(opt.dialogScript, `정리 옵션 #${idx + 1}`, errors);
        }
        if (opt.productionPromptSpec) {
          this.validatePromptSpec(opt.productionPromptSpec, `정리 옵션 #${idx + 1} 정밀 프롬프트`, errors);
        }
      });
    }

    // 4. 종이 학습지 메타데이터 검증
    if (!scaffold.worksheet || !scaffold.worksheet.singlePage || !scaffold.worksheet.duplexPage) {
      errors.push("종이 학습지 메타데이터(singlePage 및 duplexPage 명세) 누락");
    }

    // 5. 교실 실전 대화 시나리오 검증 (최소 10턴 교대 & 질문당 최소 2인 이상 학생 응답)
    if (scaffold.classroomDialog) {
      if (!Array.isArray(scaffold.classroomDialog.turns) || scaffold.classroomDialog.turns.length < 10) {
        errors.push(`교실 대화 시나리오는 최소 10회 이상의 턴(교사 발문-학생 응답)을 포함해야 합니다. (현재: ${scaffold.classroomDialog?.turns?.length || 0}턴)`);
      } else {
        scaffold.classroomDialog.turns.forEach((turn, idx) => {
          if (!turn.teacherPrompt || !Array.isArray(turn.studentResponses) || turn.studentResponses.length < 2) {
            errors.push(`대화 턴 #${idx + 1}: 교사의 1회 질문에 최소 2명 이상의 학생 응답이 필수입니다. (현재 응답 수: ${turn.studentResponses?.length || 0})`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 정밀 프롬프트 규격 검증 (외형, 움직임, 색상, 음향, 검증 루브릭 키 필수)
   */
  static validatePromptSpec(spec, contextName, errors) {
    if (!spec || typeof spec !== "object") {
      errors.push(`${contextName}: 정밀 프롬프트 규격(productionPromptSpec) 객체가 필요합니다.`);
      return;
    }
    if (!spec.pattern) {
      errors.push(`${contextName}: 프롬프트 패턴(pattern) 누락`);
    }
    if (!spec.appearance || typeof spec.appearance !== "object") {
      errors.push(`${contextName}: 외형(appearance) 정밀 묘사 키 누락`);
    }
    if (!spec.motion || typeof spec.motion !== "object") {
      errors.push(`${contextName}: 움직임/인터랙션(motion) 정밀 묘사 키 누락`);
    }
    if (!spec.palette || typeof spec.palette !== "object") {
      errors.push(`${contextName}: 색상(palette) 정밀 토큰 키 누락`);
    }
    if (!spec.audio || typeof spec.audio !== "object") {
      errors.push(`${contextName}: 음향(audio) 규격 키 누락`);
    }
    if (!Array.isArray(spec.verificationRubric) || spec.verificationRubric.length < 3) {
      errors.push(`${contextName}: 결과물 합격 판정을 위한 검증 루브릭(verificationRubric) 최소 3개 키 필수`);
    }
  }

  /**
   * 교사 1, 2, 3 (3단계 발문) 및 각 질문당 최소 2인 이상 학생 응답 검증
   */
  static validateThreeTierDialog(dialogScript, contextName, errors) {
    if (!Array.isArray(dialogScript) || dialogScript.length < 3) {
      errors.push(`${contextName}: 3단계 교사 발문(교사1, 2, 3) 대화 스크립트가 필요합니다. (현재: ${dialogScript?.length || 0}개)`);
      return;
    }
    dialogScript.forEach((turn, tIdx) => {
      if (!turn.teacher || typeof turn.teacher !== "string") {
        errors.push(`${contextName} - 턴 #${tIdx + 1}: 교사 발문(teacher) 누락`);
      }
      if (!Array.isArray(turn.students) || turn.students.length < 2) {
        errors.push(`${contextName} - 턴 #${tIdx + 1}: 교사 질문당 최소 2인 이상 학생 응답(students)이 필수입니다. (현재: ${turn.students?.length || 0}인)`);
      }
    });
  }
}
