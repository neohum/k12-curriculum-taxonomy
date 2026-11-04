/**
 * GraphRAGCurriculumGuard.mjs
 * 
 * K-12 인지 위계 온톨로지 기반의 GraphRAG 필터 및 리랭커 (Curriculum Hierarchy Guard & Reranker)
 * 
 * edulinker-vec 및 edulinker_v2, nomos 생태계 전반에서 벡터 검색(Semantic Search) 수행 시
 * 발생하는 "초등학생 대상 검색에 고등학교 수식이 튀어나오는" 학교급 왜곡 및 인지 발달
 * 불일치 환각(Hallucination)을 방지합니다.
 * 
 * 핵심 기능:
 * 1. 검색 쿼리 및 학생 프로필로부터 대상 학교급(ES, MS, HS), 학년, 피아제 발달 단계 파악
 * 2. 벡터 검색 청크의 인지 위계 초과(Cognitive Level Violation) 엄격 필터링
 * 3. K12_SPIRAL_CHAINS(나선형 교육과정 체인) 기반 선수학습(비계)/후속학습 부스팅 및 리랭킹
 * 4. LLM 주입용 교육학적 위계 프롬프트 컨텍스트 생성기(enrichPromptWithCurriculumContext) 제공
 */

import {
  Korea2022K12CurriculumAdapter,
  K12_SPIRAL_CHAINS,
  K12_TERMINOLOGY_DICTIONARY
} from "./Korea2022K12CurriculumAdapter.mjs";
import { PiagetStage, TargetGradeGroup } from "./LessonTaxonomySchema.mjs";
import { determinePiagetStage } from "./DiagnosticAssessmentEngine.mjs";

/**
 * 학교급 및 인지 단계 상수 정의
 */
export const SchoolLevel = Object.freeze({
  ES: "ES", // 초등학교 (Elementary School)
  MS: "MS", // 중학교 (Middle School)
  HS: "HS"  // 고등학교 (High School)
});

export const SCHOOL_LEVEL_HIERARCHY = Object.freeze({
  [SchoolLevel.ES]: {
    rank: 1,
    nameKo: "초등학교",
    grades: [1, 2, 3, 4, 5, 6],
    defaultPiaget: PiagetStage.CONCRETE_OPERATIONAL,
    allowedPiagetStages: [PiagetStage.PREOPERATIONAL, PiagetStage.CONCRETE_OPERATIONAL]
  },
  [SchoolLevel.MS]: {
    rank: 2,
    nameKo: "중학교",
    grades: [7, 8, 9], // 중1, 중2, 중3
    defaultPiaget: PiagetStage.EARLY_FORMAL,
    allowedPiagetStages: [PiagetStage.PREOPERATIONAL, PiagetStage.CONCRETE_OPERATIONAL, PiagetStage.EARLY_FORMAL]
  },
  [SchoolLevel.HS]: {
    rank: 3,
    nameKo: "고등학교",
    grades: [10, 11, 12], // 고1, 고2, 고3
    defaultPiaget: PiagetStage.FORMAL_OPERATIONAL,
    allowedPiagetStages: [PiagetStage.PREOPERATIONAL, PiagetStage.CONCRETE_OPERATIONAL, PiagetStage.EARLY_FORMAL, PiagetStage.FORMAL_OPERATIONAL]
  }
});

/**
 * 고등학교 / 중학교 전용 핵심 추상 키워드 (인지 위계 위반 감지용)
 */
const HS_EXCLUSIVE_KEYWORDS = Object.freeze([
  "미적분", "미분계수", "순간변화율", "도함수", "접선의 방정식", "부정적분", "정적분",
  "수열의 극한", "함수의 극한", "다항식의 나머지정리", "조립제법", "복소수", "행렬",
  "삼각함수", "호도법", "등차수열", "등비수열", "수학적 귀납법", "벡터", "뉴턴 운동 법칙",
  "파동의 간섭", "광전 효과", "가정법", "분사구문", "롤스의 정의론", "무지의 베일",
  "공리주의", "의무론", "아보가드로수", "화학 평형", "오비탈", "상대성 이론"
]);

const MS_EXCLUSIVE_KEYWORDS = Object.freeze([
  "일차방정식", "연립방정식", "이차방정식", "일차함수", "이차함수", "피타고라스",
  "삼각비", "제곱근", "무리수", "실수", "순환소수", "소인수분해", "상자그림",
  "사분위수", "표준편차", "분산", "옴의 법칙", "주기율표"
]);

/**
 * GraphRAGCurriculumGuard 클래스
 */
export class GraphRAGCurriculumGuard {
  /**
   * @param {Object} [options]
   * @param {Korea2022K12CurriculumAdapter} [options.adapter]
   * @param {Object} [options.spiralChains]
   */
  constructor(options = {}) {
    this.adapter = options.adapter || new Korea2022K12CurriculumAdapter();
    this.spiralChains = options.spiralChains || K12_SPIRAL_CHAINS;
  }

  /**
   * 1. 쿼리 및 학생 프로필로부터 대상 학교급, 학년, 피아제 발달 단계를 지능적으로 파악
   * 
   * @param {string} query - 검색 질의어
   * @param {Object} [studentProfile] - 학생 프로필 ({ schoolLevel, grade, piagetStage, targetGradeGroup })
   * @returns {Object} 해석된 교육과정 컨텍스트
   */
  resolveCurriculumContext(query = "", studentProfile = {}) {
    const rawQuery = (query || "").trim();
    let schoolLevel = studentProfile.schoolLevel || null;
    let grade = typeof studentProfile.grade === "number" ? studentProfile.grade : null;
    let piagetStage = studentProfile.piagetStage || null;

    // A. studentProfile.targetGradeGroup 분석
    if (!schoolLevel && studentProfile.targetGradeGroup) {
      const tg = studentProfile.targetGradeGroup;
      if (tg === TargetGradeGroup.ELEMENTARY_LOW || tg === TargetGradeGroup.ELEMENTARY_MID || tg === TargetGradeGroup.ELEMENTARY_HIGH) {
        schoolLevel = SchoolLevel.ES;
      } else if (tg === TargetGradeGroup.MIDDLE) {
        schoolLevel = SchoolLevel.MS;
      } else if (tg === TargetGradeGroup.HIGH) {
        schoolLevel = SchoolLevel.HS;
      }
    }

    // B. 질의어(query) 텍스트 분석 (초·중·고 및 학년 키워드 감지)
    if (!schoolLevel) {
      if (/초등|초\s*[1-6]|초등학교|어린이/i.test(rawQuery)) {
        schoolLevel = SchoolLevel.ES;
      } else if (/중학|중\s*[1-3]|중등|중학교/i.test(rawQuery)) {
        schoolLevel = SchoolLevel.MS;
      } else if (/고등|고\s*[1-3]|고교|고등학교|수능|대입/i.test(rawQuery)) {
        schoolLevel = SchoolLevel.HS;
      }
    }

    // C. 학년(grade) 파악
    if (grade === null) {
      if (schoolLevel === SchoolLevel.HS || /고등|고\s*[1-3]|고교|고등학교/i.test(rawQuery)) {
        const hsMatch = rawQuery.match(/(?:고등학교|고등|고)\s*([1-3])(?:학년)?/);
        if (hsMatch) {
          grade = 9 + parseInt(hsMatch[1], 10);
          if (!schoolLevel) schoolLevel = SchoolLevel.HS;
        }
      } else if (schoolLevel === SchoolLevel.MS || /중학|중\s*[1-3]|중학교/i.test(rawQuery)) {
        const msMatch = rawQuery.match(/(?:중학교|중학|중)\s*([1-3])(?:학년)?/);
        if (msMatch) {
          grade = 6 + parseInt(msMatch[1], 10);
          if (!schoolLevel) schoolLevel = SchoolLevel.MS;
        }
      } else {
        const esMatch = rawQuery.match(/(?:초등학교|초등|초)\s*([1-6])(?:학년)?/);
        if (esMatch) {
          grade = parseInt(esMatch[1], 10);
          if (!schoolLevel) schoolLevel = SchoolLevel.ES;
        } else {
          const genMatch = rawQuery.match(/([1-6])학년/);
          if (genMatch) {
            grade = parseInt(genMatch[1], 10);
            if (!schoolLevel) schoolLevel = SchoolLevel.ES;
          }
        }
      }
    }

    // D. 기본값 설정 (학교급이 특정되지 않으면 기본 ES로 보수적 안전 가드 적용)
    if (!schoolLevel) {
      schoolLevel = SchoolLevel.ES;
    }

    // E. 피아제 발달 단계 자동 연성
    if (!piagetStage) {
      if (grade !== null) {
        if (grade <= 2) piagetStage = PiagetStage.PREOPERATIONAL;
        else if (grade <= 6) piagetStage = PiagetStage.CONCRETE_OPERATIONAL;
        else if (grade <= 9) piagetStage = PiagetStage.EARLY_FORMAL;
        else piagetStage = PiagetStage.FORMAL_OPERATIONAL;
      } else {
        piagetStage = SCHOOL_LEVEL_HIERARCHY[schoolLevel]?.defaultPiaget || PiagetStage.CONCRETE_OPERATIONAL;
      }
    }

    // F. 관련 나선형 교육과정 체인 탐색 (Active Spiral Chain)
    const matchedChains = this.findMatchingSpiralChains(rawQuery);

    return {
      query: rawQuery,
      schoolLevel,
      grade,
      piagetStage,
      levelRank: SCHOOL_LEVEL_HIERARCHY[schoolLevel]?.rank || 1,
      matchedChains,
      activeChain: matchedChains[0] || null
    };
  }

  /**
   * 나선형 교육과정 체인 매칭
   * 
   * @param {string} query
   * @returns {Array<Object>}
   */
  findMatchingSpiralChains(query = "") {
    const q = (query || "").toLowerCase();
    const hits = [];

    for (const [key, chain] of Object.entries(this.spiralChains)) {
      let matchScore = 0;
      if (q.includes("분수") || q.includes("기울기") || q.includes("함수") || q.includes("미분") || q.includes("적분")) {
        if (key === "fractions_to_calculus") matchScore += 10;
      }
      if (q.includes("방정식") || q.includes("문자와 식") || q.includes("인수분해") || q.includes("다항식")) {
        if (key === "arithmetic_to_algebra") matchScore += 10;
      }
      if (q.includes("비와 비율") || q.includes("비율") || q.includes("연립방정식") || q.includes("행렬")) {
        if (key === "balance_to_matrix") matchScore += 10;
      }
      if (q.includes("빛") || q.includes("렌즈") || q.includes("굴절") || q.includes("광학") || q.includes("광전")) {
        if (key === "light_to_optics") matchScore += 10;
      }
      if (q.includes("힘") || q.includes("속력") || q.includes("운동") || q.includes("뉴턴")) {
        if (key === "force_and_motion") matchScore += 10;
      }
      if (q.includes("코딩") || q.includes("프로그래밍") || q.includes("알고리즘") || q.includes("인공지능") || q.includes("머신러닝")) {
        if (key === "code_to_ai") matchScore += 10;
      }
      if (q.includes("독해") || q.includes("읽기") || q.includes("문장") || q.includes("글쓰기") || q.includes("설명문")) {
        if (key === "reading_comprehension") matchScore += 10;
      }
      if (q.includes("문법") || q.includes("5형식") || q.includes("관계대명사") || q.includes("파닉스") || q.includes("시제")) {
        if (key === "english_grammar_ladder") matchScore += 10;
      }
      if (q.includes("가격") || q.includes("수요") || q.includes("공급") || q.includes("환율") || q.includes("경제")) {
        if (key === "ratio_to_economy") matchScore += 10;
      }
      if (q.includes("정의") || q.includes("배려") || q.includes("규칙") || q.includes("롤스") || q.includes("윤리")) {
        if (key === "ethics_justice_evolution") matchScore += 10;
      }
      if (q.includes("음악") || q.includes("화음") || q.includes("계이름") || q.includes("대위법")) {
        if (key === "music_harmony_chain") matchScore += 10;
      }
      if (q.includes("원근법") || q.includes("소실점") || q.includes("조형") || q.includes("미술")) {
        if (key === "art_perspective_chain") matchScore += 10;
      }

      // Chain stages keyword inspection
      for (const st of chain.stages || []) {
        if (q.includes(st.standardTitle?.toLowerCase() || "") || (st.concept && q.includes(st.concept.toLowerCase()))) {
          matchScore += 5;
        }
      }

      if (matchScore > 0) {
        hits.push({ key, ...chain, matchScore });
      }
    }

    hits.sort((a, b) => b.matchScore - a.matchScore);
    return hits;
  }

  /**
   * 2. 개별 청크가 학습자의 인지 위계를 초과하는지(Cognitive Level Violation) 정밀 판별
   * 
   * @param {Object} chunk - 벡터 검색 청크
   * @param {Object} context - resolveCurriculumContext 결과
   * @returns {Object} { isViolation, chunkLevel, reason, violationType }
   */
  evaluateChunkViolation(chunk = {}, context) {
    const text = `${chunk.title || ""} ${chunk.content || ""} ${chunk.text || ""} ${chunk.statement || ""}`.toLowerCase();
    const meta = chunk.metadata || {};
    let chunkLevel = chunk.schoolLevel || meta.schoolLevel || null;
    const stdCode = chunk.standardCode || meta.standardCode || chunk.code || "";

    // A. 성취기준 코드 기반 학교급 자동 식별
    if (!chunkLevel && stdCode) {
      if (/^\[?[1-6]/.test(stdCode)) {
        chunkLevel = SchoolLevel.ES;
      } else if (/^\[?9/.test(stdCode)) {
        chunkLevel = SchoolLevel.MS;
      } else if (/^\[?(10|12)/.test(stdCode)) {
        chunkLevel = SchoolLevel.HS;
      }
    }

    // B. 키워드 기반 학교급 자동 추론
    if (!chunkLevel) {
      if (HS_EXCLUSIVE_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))) {
        chunkLevel = SchoolLevel.HS;
      } else if (MS_EXCLUSIVE_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))) {
        chunkLevel = SchoolLevel.MS;
      } else {
        chunkLevel = SchoolLevel.ES;
      }
    }

    const chunkRank = SCHOOL_LEVEL_HIERARCHY[chunkLevel]?.rank || 1;
    const studentRank = context.levelRank || 1;

    // C. 초등학생(ES) 대상 검색 시 고등학교(HS) 내용 노출은 절대적 인지 위계 위반 (Critical Violation)
    if (context.schoolLevel === SchoolLevel.ES && chunkRank === 3) {
      const violatedKeyword = HS_EXCLUSIVE_KEYWORDS.find(kw => text.includes(kw.toLowerCase())) || "고등학교 교육과정";
      return {
        isViolation: true,
        chunkLevel,
        violationType: "HIGH_SCHOOL_ON_ELEMENTARY",
        reason: `초등 발달 단계(구체적 조작기)에 고등학교 형식적 추상 개념('${violatedKeyword}') 노출 차단`
      };
    }

    // D. 초등학생(ES) 대상 검색 시 중학교(MS) 심화 수식 노출 위반 검사
    if (context.schoolLevel === SchoolLevel.ES && chunkRank === 2) {
      // 나선형 체인의 선행 비계가 아닌 순수 중학교 대수/기호식 청크는 위반으로 필터링
      const isIntroScaffold = text.includes("기초") || text.includes("도입") || text.includes("비계") || text.includes("구체물");
      if (!isIntroScaffold && MS_EXCLUSIVE_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))) {
        const violatedKeyword = MS_EXCLUSIVE_KEYWORDS.find(kw => text.includes(kw.toLowerCase()));
        return {
          isViolation: true,
          chunkLevel,
          violationType: "MIDDLE_SCHOOL_ON_ELEMENTARY",
          reason: `초등 구체적 조작기에 중학교 형식적 기호 개념('${violatedKeyword}') 직접 노출 차단`
        };
      }
    }

    // E. 중학생(MS) 대상 검색 시 고등학교(HS) 극심한 추상 수식 노출 위반 검사
    if (context.schoolLevel === SchoolLevel.MS && chunkRank === 3) {
      const isCalculusOrFormal = ["미적분", "도함수", "순간변화율", "정적분", "수열의 극한", "복소수", "벡터"].some(kw => text.includes(kw));
      if (isCalculusOrFormal) {
        return {
          isViolation: true,
          chunkLevel,
          violationType: "ADVANCED_HS_ON_MIDDLE",
          reason: `중학교 단계(형식적 조작기 초기)에 고교 미적분·형식적 극한 심화 개념 노출 차단`
        };
      }
    }

    return {
      isViolation: false,
      chunkLevel,
      violationType: null,
      reason: null
    };
  }

  /**
   * 3. 나선형 교육과정 체인에 따른 청크 가중치 계산 (선수학습 비계 부스팅 & 후속학습 조정)
   * 
   * @param {Object} chunk
   * @param {Object} context
   * @returns {Object} { boostFactor, isPrerequisiteScaffold, isTargetStage, scaffoldNote }
   */
  calculateSpiralBoost(chunk, context) {
    const text = `${chunk.title || ""} ${chunk.content || ""} ${chunk.text || ""} ${chunk.statement || ""}`.toLowerCase();
    const activeChain = context.activeChain;

    if (!activeChain || !activeChain.stages) {
      return {
        boostFactor: 1.0,
        isPrerequisiteScaffold: false,
        isTargetStage: false,
        scaffoldNote: null
      };
    }

    // 현재 학생 학교급에 대응되는 목표 단계(targetStage) 탐색
    const currentStageIndex = activeChain.stages.findIndex(st => st.schoolLevel === context.schoolLevel);
    
    // 청크가 나선형 체인의 어느 단계에 부합하는지 매칭
    let matchedStageIndex = -1;
    for (let i = 0; i < activeChain.stages.length; i++) {
      const st = activeChain.stages[i];
      const stdCode = (st.standardCode || "").replace(/[[\]]/g, "").toLowerCase();
      const chunkCode = (chunk.standardCode || chunk.code || "").replace(/[[\]]/g, "").toLowerCase();
      
      if (chunkCode && stdCode && chunkCode.includes(stdCode)) {
        matchedStageIndex = i;
        break;
      }
      if (st.concept && text.includes(st.concept.toLowerCase())) {
        matchedStageIndex = i;
        break;
      }
      if (st.standardTitle && text.includes(st.standardTitle.toLowerCase())) {
        matchedStageIndex = i;
        break;
      }
    }

    // 특정 주요 개념 키워드 매칭 보정 (예: 중2 일차함수 기울기 ➔ 초등 비와 비율 선수학습)
    if (matchedStageIndex === -1 && currentStageIndex > 0) {
      if (activeChain.key === "fractions_to_calculus" || activeChain.key === "balance_to_matrix" || activeChain.key === "ratio_to_economy") {
        if (text.includes("비와 비율") || text.includes("기준량") || text.includes("비율") || text.includes("분수")) {
          matchedStageIndex = 0; // 초등 선수학습 단계로 인식
        }
      }
    }

    // 1. 선수학습 비계 (Prerequisite Scaffolding)
    // 청크가 학생 현재 단계(currentStageIndex)보다 이전 단계(i < currentStageIndex)인 경우
    if (matchedStageIndex !== -1 && currentStageIndex !== -1 && matchedStageIndex < currentStageIndex) {
      const stageInfo = activeChain.stages[matchedStageIndex];
      return {
        boostFactor: 1.3, // 30% 부스팅
        isPrerequisiteScaffold: true,
        isTargetStage: false,
        scaffoldNote: `비고츠키 근접발달영역(ZPD) 선수학습 비계: '${stageInfo.standardTitle || stageInfo.concept}' 기초 개념 연계`
      };
    }

    // 2. 현재 목표 단계 (Target Stage)
    if (matchedStageIndex === currentStageIndex) {
      return {
        boostFactor: 1.4, // 목표 학년 일치 40% 부스팅
        isPrerequisiteScaffold: false,
        isTargetStage: true,
        scaffoldNote: `현재 학년 교육과정 핵심 성취기준 일치`
      };
    }

    // 3. 일반 청크
    return {
      boostFactor: 1.0,
      isPrerequisiteScaffold: false,
      isTargetStage: false,
      scaffoldNote: null
    };
  }

  /**
   * 4. GraphRAG 리랭킹 및 인지 위계 필터링 메인 함수
   * 
   * @param {Array<Object>} chunks - 벡터 검색 결과 청크 목록
   * @param {string} query - 사용자 검색 질의어
   * @param {Object} [studentProfile] - 학생 프로필
   * @param {Object} [options] - 옵션 ({ filterViolations: true, topK: null })
   * @returns {Object} { reranked: Array, filteredOut: Array, context: Object }
   */
  rerank(chunks = [], query = "", studentProfile = {}, options = {}) {
    const filterViolations = options.filterViolations !== false; // 기본 true
    const context = this.resolveCurriculumContext(query, studentProfile);

    const reranked = [];
    const filteredOut = [];

    for (const chunk of chunks) {
      const originalScore = typeof chunk.score === "number" ? chunk.score : (chunk.similarity || 1.0);
      
      // 인지 위계 위반 평가
      const violationEval = this.evaluateChunkViolation(chunk, context);

      if (violationEval.isViolation) {
        filteredOut.push({
          ...chunk,
          originalScore,
          violation: violationEval
        });
        if (filterViolations) {
          continue; // 위반 청크 제외
        }
      }

      // 나선형 체인 부스팅 가중치 계산
      const spiralBoost = this.calculateSpiralBoost(chunk, context);
      
      // 최종 점수 산출
      let finalScore = originalScore * spiralBoost.boostFactor;
      if (spiralBoost.isPrerequisiteScaffold) {
        finalScore += 0.15; // 선수학습 비계 가산점 부여로 상위 노출 보장
      }

      reranked.push({
        ...chunk,
        originalScore,
        score: finalScore,
        schoolLevel: violationEval.chunkLevel,
        isPrerequisiteScaffold: spiralBoost.isPrerequisiteScaffold,
        scaffoldNote: spiralBoost.scaffoldNote,
        curriculumContext: {
          targetSchoolLevel: context.schoolLevel,
          piagetStage: context.piagetStage
        }
      });
    }

    // 점수 내림차순 정렬
    reranked.sort((a, b) => b.score - a.score);

    const topK = typeof options.topK === "number" && options.topK > 0 ? options.topK : reranked.length;
    const finalResults = reranked.slice(0, topK);

    return {
      reranked: finalResults,
      filteredOut,
      context
    };
  }

  /**
   * 5. LLM 주입용 교육학적 위계 프롬프트 컨텍스트 생성기
   * 
   * @param {string} query - 검색 질의어
   * @param {Object} [studentProfile] - 학생 프로필
   * @returns {string} LLM System/User Prompt에 주입할 마크다운 문자열
   */
  enrichPromptWithCurriculumContext(query = "", studentProfile = {}) {
    const context = this.resolveCurriculumContext(query, studentProfile);
    const levelInfo = SCHOOL_LEVEL_HIERARCHY[context.schoolLevel];

    let lines = [];
    lines.push(`### [K-12 교육과정 위계 가드 및 인지 비계 컨텍스트 (GraphRAG Guard)]`);
    lines.push(`- **학습자 학교급**: ${levelInfo.nameKo} (${context.schoolLevel}) ${context.grade ? `| ${context.grade}학년` : ""}`);
    lines.push(`- **피아제 인지 발달 단계**: ${context.piagetStage}`);
    lines.push(`- **인지 발달 가이드라인**:`);

    if (context.schoolLevel === SchoolLevel.ES) {
      lines.push(`  * **구체적 조작기(Concrete Operational) 준수**: 고등학교 미적분, 극한, 형식적 복소수 및 중학교 고차 대수식 노출을 엄격히 금지합니다.`);
      lines.push(`  * **구체물 기반 직관적 비계**: 분수 막대, 수모형, 수평 저울, 격자 배열 등 감각적 조작물과 일상적 맥락(피자, 사과, 줄자)을 활용해 설명하세요.`);
    } else if (context.schoolLevel === SchoolLevel.MS) {
      lines.push(`  * **형식적 조작기 초기(Early Formal) 비계**: 미지수(x), 좌표평면, 비와 비율의 기호적 함수 전환을 체계적으로 돕되, 고등학교 미적분 순간변화율 등의 초과 수식은 지양합니다.`);
      lines.push(`  * **선수학습 연결**: 초등학교 비와 비율, 등식의 직관적 성질을 선수 비계로 소환하여 새로운 추상 개념을 정초합니다.`);
    } else {
      lines.push(`  * **형식적 조작기(Formal Operational) 심화**: 연역적 증명, 다변수 복합 모델, 원리적 탐구를 논리적 엄밀성을 갖추어 설명하세요.`);
    }

    if (context.activeChain) {
      lines.push(`- **나선형 교육과정 연계 경로 (${context.activeChain.title})**:`);
      for (const st of context.activeChain.stages || []) {
        const isCurrent = st.schoolLevel === context.schoolLevel;
        const marker = isCurrent ? "▶ [현재 목표]" : "  * [나선 연계]";
        lines.push(`  ${marker} [${st.schoolLevel}] ${st.standardTitle || st.standardCode}: ${st.concept || ""}`);
      }
    }

    lines.push(`- **수업 설계 3단계 비계 원칙**: 도입(동기유발/인지갈등) ➔ 전개(구체물 탐색/개념도입) ➔ 정리(형성평가/배움정리) 구조를 준수하세요.`);

    return lines.join("\n");
  }
}
