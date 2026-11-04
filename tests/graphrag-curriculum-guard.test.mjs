import test from "node:test";
import assert from "node:assert/strict";
import {
  GraphRAGCurriculumGuard,
  SchoolLevel,
  SCHOOL_LEVEL_HIERARCHY
} from "../src/core/taxonomy/GraphRAGCurriculumGuard.mjs";
import { PiagetStage } from "../src/core/taxonomy/LessonTaxonomySchema.mjs";

test("GraphRAGCurriculumGuard: 1. 대상 학교급, 학년, 피아제 발달 단계 파악 검증", () => {
  const guard = new GraphRAGCurriculumGuard();

  // 초등 3학년 쿼리
  const esContext = guard.resolveCurriculumContext("초등 3학년 분수 개념");
  assert.equal(esContext.schoolLevel, SchoolLevel.ES);
  assert.equal(esContext.grade, 3);
  assert.equal(esContext.piagetStage, PiagetStage.CONCRETE_OPERATIONAL);
  assert.equal(esContext.levelRank, 1);
  assert.ok(esContext.matchedChains.length > 0);
  assert.equal(esContext.activeChain?.key, "fractions_to_calculus");

  // 중2 쿼리
  const msContext = guard.resolveCurriculumContext("중2 일차함수 기울기");
  assert.equal(msContext.schoolLevel, SchoolLevel.MS);
  assert.equal(msContext.grade, 8);
  assert.equal(msContext.piagetStage, PiagetStage.EARLY_FORMAL);
  assert.equal(msContext.levelRank, 2);
  assert.ok(msContext.matchedChains.length > 0);
  assert.equal(msContext.activeChain?.key, "fractions_to_calculus");

  // 고등학교 미적분 쿼리
  const hsContext = guard.resolveCurriculumContext("고등학교 2학년 미적분 순간변화율");
  assert.equal(hsContext.schoolLevel, SchoolLevel.HS);
  assert.equal(hsContext.piagetStage, PiagetStage.FORMAL_OPERATIONAL);
  assert.equal(hsContext.levelRank, 3);

  // studentProfile 명시적 주입 검증
  const overrideContext = guard.resolveCurriculumContext("빛의 성질 탐구", {
    schoolLevel: SchoolLevel.ES,
    grade: 4,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL
  });
  assert.equal(overrideContext.schoolLevel, SchoolLevel.ES);
  assert.equal(overrideContext.grade, 4);
  assert.equal(overrideContext.piagetStage, PiagetStage.CONCRETE_OPERATIONAL);
});

test("GraphRAGCurriculumGuard: 2. '초등 3학년 분수 개념' 검색 쿼리에 고등학교 미적분 청크 필터링(Cognitive Violation) 검증", () => {
  const guard = new GraphRAGCurriculumGuard();

  const query = "초등 3학년 분수 개념";
  const candidateChunks = [
    {
      id: "chunk_es_01",
      title: "초등 분수 기초: 1을 똑같이 나누기",
      content: "전체 1을 똑같이 4개로 나눈 것 중의 1을 1/4이라 하고, 분수 막대로 크기를 비교합니다.",
      standardCode: "[3수01-07]",
      schoolLevel: "ES",
      similarity: 0.88
    },
    {
      id: "chunk_hs_01",
      title: "고등학교 미적분학: 도함수와 순간변화율",
      content: "미분계수는 평균변화율의 극한 lim Δx->0 (Δy/Δx) = f'(a) 로 정의되는 순간변화율입니다.",
      standardCode: "[12미적1-02-01]",
      schoolLevel: "HS",
      similarity: 0.94 // 시맨틱 유사도는 매우 높으나 인지 위계 초과!
    },
    {
      id: "chunk_es_02",
      title: "단위분수의 합과 수직선 모델",
      content: "1/4이 3개 모이면 3/4이 되며 수직선 위에서 그 위치를 찾아 점을 찍습니다.",
      standardCode: "[3수01-08]",
      schoolLevel: "ES",
      similarity: 0.82
    },
    {
      id: "chunk_hs_02",
      title: "정적분의 정의와 곡선 아래의 넓이",
      content: "구분구적법의 극한을 이용하여 연속함수의 정적분 넓이를 구합니다.",
      similarity: 0.89 // 학교급 메타가 없어도 내용 키워드(정적분, 구분구적법)로 고교 감지
    }
  ];

  const result = guard.rerank(candidateChunks, query, { schoolLevel: "ES", grade: 3 });

  // 1. 고등학교 청크 2건이 모두 필터링되었는지 확인
  assert.equal(result.filteredOut.length, 2, "고등학교 미적분 및 정적분 청크 2건이 필터링되어야 함");
  const filteredIds = result.filteredOut.map(c => c.id || c.title);
  assert.ok(filteredIds.includes("chunk_hs_01"), "도함수 순간변화율 청크가 필터링 목록에 있어야 함");
  assert.ok(result.filteredOut.some(c => c.title.includes("정적분")), "정적분 청크가 필터링 목록에 있어야 함");

  // 2. 필터링 사유(Reason) 확인
  for (const filtered of result.filteredOut) {
    assert.equal(filtered.violation.isViolation, true);
    assert.equal(filtered.violation.chunkLevel, SchoolLevel.HS);
    assert.ok(filtered.violation.reason.includes("초등 발달 단계"));
  }

  // 3. 최종 반환된 리랭킹 목록에는 초등 청크만 남았는지 확인
  assert.equal(result.reranked.length, 2, "초등 청크 2건만 리랭킹 목록에 남아있어야 함");
  for (const chunk of result.reranked) {
    assert.equal(chunk.schoolLevel, SchoolLevel.ES);
  }
});

test("GraphRAGCurriculumGuard: 3. '중2 일차함수 기울기' 쿼리에 초등 비와 비율 기초 개념이 선수학습 비계로 상위 랭킹 부스팅 검증", () => {
  const guard = new GraphRAGCurriculumGuard();

  const query = "중2 일차함수 기울기";
  const candidateChunks = [
    {
      id: "chunk_target_ms",
      title: "일차함수의 의미와 그래프 기울기",
      content: "일차함수 y = ax + b에서 기울기 a는 x의 증가량에 대한 y의 증가량의 비율이다.",
      standardCode: "[9수03-03]",
      schoolLevel: "MS",
      similarity: 0.85
    },
    {
      id: "chunk_scaffold_es",
      title: "초등 비와 비율 기초 개념",
      content: "기준량과 비교하는 양: 두 양의 크기를 비교할 때 기준량에 대한 비교하는 양의 비와 비율을 분수로 나타낸다.",
      standardCode: "[6수01-06]",
      schoolLevel: "ES",
      similarity: 0.72 // 초기 유사도는 낮음!
    },
    {
      id: "chunk_unrelated_ms",
      title: "중학교 원과 현의 길이 성질",
      content: "원의 중심에서 현에 내린 수선은 그 현을 수직이등분한다.",
      standardCode: "[9수04-05]",
      schoolLevel: "MS",
      similarity: 0.78 // 비와 비율(0.72)보다 초기 유사도가 높음
    }
  ];

  const result = guard.rerank(candidateChunks, query, { schoolLevel: "MS", grade: 8 });

  // 1. 초등 비와 비율 청크가 선수학습 비계(Prerequisite Scaffold)로 인식되었는지 확인
  const scaffoldChunk = result.reranked.find(c => c.id === "chunk_scaffold_es");
  assert.ok(scaffoldChunk, "비와 비율 청크가 리랭킹 결과에 존재해야 함");
  assert.equal(scaffoldChunk.isPrerequisiteScaffold, true, "초등 비와 비율 청크는 선수학습 비계로 표시되어야 함");
  assert.ok(scaffoldChunk.scaffoldNote.includes("비고츠키 근접발달영역"), "비고츠키 비계 안내 노트가 포함되어야 함");

  // 2. 선수학습 부스팅 가중치로 인해 무관한 중학교 청크(0.78)를 제치고 상위 랭크로 승격되었는지 확인
  const unrelatedChunk = result.reranked.find(c => c.id === "chunk_unrelated_ms");
  assert.ok(scaffoldChunk.score > unrelatedChunk.score, "선수학습 비계 청크의 최종 점수가 무관 중학 청크보다 높아야 함");
  
  // 랭킹 순위 확인 (1위는 목표 중학 함수 청크, 2위는 선수 비계 청크, 3위는 무관 청크)
  assert.equal(result.reranked[0].id, "chunk_target_ms");
  assert.equal(result.reranked[1].id, "chunk_scaffold_es");
  assert.equal(result.reranked[2].id, "chunk_unrelated_ms");
});

test("GraphRAGCurriculumGuard: 4. enrichPromptWithCurriculumContext 프롬프트 생성 검증", () => {
  const guard = new GraphRAGCurriculumGuard();

  // 초등 프롬프트 컨텍스트
  const esPrompt = guard.enrichPromptWithCurriculumContext("초등 3학년 분수 개념", {
    schoolLevel: SchoolLevel.ES,
    grade: 3
  });

  assert.ok(esPrompt.includes("초등학교 (ES) | 3학년"));
  assert.ok(esPrompt.includes("구체적 조작기(Concrete Operational) 준수"));
  assert.ok(esPrompt.includes("고등학교 미적분, 극한, 형식적 복소수"));
  assert.ok(esPrompt.includes("분수 막대, 수모형"));
  assert.ok(esPrompt.includes("나선형 교육과정 연계 경로"));

  // 중학교 프롬프트 컨텍스트
  const msPrompt = guard.enrichPromptWithCurriculumContext("중2 일차함수 기울기", {
    schoolLevel: SchoolLevel.MS,
    grade: 8
  });

  assert.ok(msPrompt.includes("중학교 (MS) | 8학년"));
  assert.ok(msPrompt.includes("형식적 조작기 초기(Early Formal)"));
  assert.ok(msPrompt.includes("초등학교 비와 비율"));
});

test("GraphRAGCurriculumGuard: 5. filterViolations=false 옵션 시 위반 청크 점수 패널티 검증", () => {
  const guard = new GraphRAGCurriculumGuard();

  const candidateChunks = [
    {
      id: "chunk_es",
      title: "초등 분수 기초",
      content: "분수 막대로 크기 비교",
      schoolLevel: "ES",
      similarity: 0.80
    },
    {
      id: "chunk_hs",
      title: "고교 미적분 도함수",
      content: "순간변화율과 극한식 lim",
      schoolLevel: "HS",
      similarity: 0.95
    }
  ];

  // filterViolations를 false로 설정하면 필터링 대신 filteredOut 기록 및 상태 전달
  const result = guard.rerank(candidateChunks, "초등 3학년 분수", {}, { filterViolations: false });
  assert.equal(result.filteredOut.length, 1);
  assert.equal(result.reranked.length, 2);
});
