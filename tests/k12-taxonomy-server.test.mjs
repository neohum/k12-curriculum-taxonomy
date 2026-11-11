import test from "node:test";
import assert from "node:assert/strict";
import { K12TaxonomyServer } from "../src/server/K12TaxonomyServer.mjs";
import { K12TaxonomyClient } from "../src/sdk/K12TaxonomyClient.mjs";
import os from "node:os";
import path from "node:path";

// decisions.json이 생겨도 이 테스트가 흔들리지 않도록 없는 경로를 쓴다(연결 없음 상태).
const NO_DECISIONS = path.join(os.tmpdir(), "k12-no-decisions-" + process.pid, "decisions.json");

const TEST_PORT = 8991;
const BASE_URL = `http://localhost:${TEST_PORT}`;

test("K12TaxonomyServer & Universal SDK Integration Suite", async (t) => {
  const server = new K12TaxonomyServer({ port: TEST_PORT, host: "127.0.0.1", decisionsPath: NO_DECISIONS });
  await server.start();

  t.after(async () => {
    await server.stop();
  });

  // --------------------------------------------------------------------------
  // 1. GET /api/health
  // --------------------------------------------------------------------------
  await t.test("GET /api/health returns status, uptime, and standardsCount", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(res.headers.get("access-control-allow-origin"), "*");

    const data = await res.json();
    assert.equal(data.status, "ok");
    assert.ok(typeof data.uptime === "number");
    assert.ok(typeof data.timestamp === "string");
    assert.equal(data.standardsCount, 4296, "공식 고시 원문 성취기준 수");
    assert.equal(data.standardsSource, "official");
    assert.equal(data.handwrittenStandardsCount, 316);
  });

  // --------------------------------------------------------------------------
  // 2. GET /api/taxonomy/standards
  // --------------------------------------------------------------------------
  await t.test("GET /api/taxonomy/standards filters by query, subject, schoolLevel, limit", async () => {
    // 2-1. Search by query '미적분'
    const resQuery = await fetch(`${BASE_URL}/api/taxonomy/standards?query=미적분`);
    assert.equal(resQuery.status, 200);
    const dataQuery = await resQuery.json();
    assert.ok(Array.isArray(dataQuery.standards));
    assert.ok(dataQuery.total > 0);
    assert.ok(dataQuery.standards.some(s => s.code.includes("미적") || s.statement.includes("미적")));
    assert.equal(dataQuery.source, "official");
    for (const s of dataQuery.standards) {
      assert.equal(s.source, "official");
      assert.equal(s.statement, s.text, "statement는 원문 text의 하위 호환 별칭");
      assert.match(s.id, /^b\d+:\[/);
    }

    // 2-2. Filter by schoolLevel ES and subject 수학
    const resElem = await fetch(`${BASE_URL}/api/taxonomy/standards?subject=수학&schoolLevel=ES&limit=5`);
    const dataElem = await resElem.json();
    assert.ok(dataElem.standards.length <= 5);
    for (const std of dataElem.standards) {
      assert.equal(std.schoolLevel, "ES");
      assert.equal(std.subject, "수학");
    }

    // 2-3. Empty query returns list up to limit
    const resAll = await fetch(`${BASE_URL}/api/taxonomy/standards?limit=10`);
    const dataAll = await resAll.json();
    assert.equal(dataAll.standards.length, 10);
  });

  // --------------------------------------------------------------------------
  // 3. GET /api/taxonomy/chains
  // --------------------------------------------------------------------------
  await t.test("GET /api/taxonomy/chains returns 6 new spiral chains and all chains", async () => {
    const res = await fetch(`${BASE_URL}/api/taxonomy/chains`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.totalCount, 12, "Should have 12 total spiral chains");
    assert.equal(data.newChainsCount, 6, "Should have 6 new spiral chains");
    assert.equal(data.newChains.length, 6);

    const expectedNewKeys = [
      "reading_comprehension",
      "english_grammar_ladder",
      "ratio_to_economy",
      "ethics_justice_evolution",
      "music_harmony_chain",
      "art_perspective_chain"
    ];

    for (const key of expectedNewKeys) {
      assert.ok(
        data.newChains.some(c => c.key === key),
        `Missing new chain: ${key}`
      );
    }
  });

  // --------------------------------------------------------------------------
  // 4. GET /api/taxonomy/chain/:key
  // --------------------------------------------------------------------------
  await t.test("GET /api/taxonomy/chain/:key returns chain details and handles 404", async () => {
    // 4-1. Valid STEM chain
    const resCalc = await fetch(`${BASE_URL}/api/taxonomy/chain/fractions_to_calculus`);
    assert.equal(resCalc.status, 200);
    const dataCalc = await resCalc.json();
    assert.equal(dataCalc.key, "fractions_to_calculus");
    assert.ok(dataCalc.stages.length >= 3);
    assert.ok(dataCalc.transitions.length >= 2);

    // 4-2. Valid Humanities chain
    const resReading = await fetch(`${BASE_URL}/api/taxonomy/chain/reading_comprehension`);
    assert.equal(resReading.status, 200);
    const dataReading = await resReading.json();
    assert.equal(dataReading.key, "reading_comprehension");
    assert.ok(dataReading.stages.length >= 3);

    // 4-3. Invalid key returns 404
    const res404 = await fetch(`${BASE_URL}/api/taxonomy/chain/invalid_chain_key_xyz`);
    assert.equal(res404.status, 404);
    const data404 = await res404.json();
    assert.ok(data404.error.includes("not found"));
  });

  // --------------------------------------------------------------------------
  // 5. POST /api/taxonomy/diagnose
  // --------------------------------------------------------------------------
  await t.test("POST /api/taxonomy/diagnose backtracks HS Calculus to ES Fraction Division", async () => {
    const res = await fetch(`${BASE_URL}/api/taxonomy/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        standardCode: "[12미적1-02-01]",
        mistakePattern: "평균변화율 계산 시 분모 분자 차분 순서 역전",
        masteredCodes: []
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.standardCode, "[12미적1-02-01]");
    assert.equal(data.isBlocked, true);
    assert.equal(data.targetSchoolLevel, "HS");
    assert.equal(data.targetPiagetStage, "Formal Operational");

    // Earliest foundational gap must be Elementary Fraction Division [6수01-06]
    assert.ok(data.earliestFoundationalGap);
    assert.equal(data.earliestFoundationalGap.topicId, "[6수01-06]");
    assert.equal(data.earliestFoundationalGap.schoolLevel, "ES");
    assert.equal(data.earliestFoundationalGap.piagetStage, "Concrete Operational");

    // Remediation path ordering: ES -> MS -> HS
    assert.equal(data.stepsCount, 3);
    assert.equal(data.remediationPath[0].topicId, "[6수01-06]");
    assert.equal(data.remediationPath[1].topicId, "[9수03-03]");
    assert.equal(data.remediationPath[2].topicId, "[12미적1-02-01]");

    // Mistake pattern advice generated
    assert.ok(data.remediationAdvice);
    assert.ok(data.remediationAdvice.includes("오개념 패턴"));
    assert.equal(data.dataBasis.official, false);
    assert.equal(data.dataBasis.label, "비공식 손작성 성취기준 기반");
  });

  // --------------------------------------------------------------------------
  // 6. POST /api/taxonomy/lesson-scaffold
  // --------------------------------------------------------------------------
  await t.test("POST /api/taxonomy/lesson-scaffold returns 3-9-3 scaffold and manipulative", async () => {
    const res = await fetch(`${BASE_URL}/api/taxonomy/lesson-scaffold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        standardCode: "[6수01-06]",
        targetGrade: "초6",
        subject: "수학"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.standardCode, "[6수01-06]");
    assert.equal(data.schoolLevel, "ES");

    // Manipulative recommendation
    assert.ok(data.manipulative, "Should recommend concrete manipulative");
    assert.ok(data.manipulative.nameKo.includes("분수 막대") || data.manipulative.type.includes("fraction"));

    // 3-9-3 Modular Scaffold structure verification
    assert.ok(data.scaffold393, "Should have 3-9-3 scaffold");
    assert.equal(data.scaffold393.intro.length, 3, "Intro must have 3 steps");
    assert.equal(data.scaffold393.development.length, 9, "Development must have 9 steps (3 tracks x 3 steps)");
    assert.equal(data.scaffold393.wrapup.length, 3, "Wrapup must have 3 steps");

    // Verify 3 Development Tracks
    const devTracks = data.scaffold393.development.map(d => d.track);
    assert.equal(devTracks.filter(t => t === "foundation_concrete").length, 3);
    assert.equal(devTracks.filter(t => t === "core_inquiry").length, 3);
    assert.equal(devTracks.filter(t => t === "deep_challenge").length, 3);

    // Dialog script and Rubric
    assert.ok(data.dialogScript);
    assert.ok(data.rubric);
    assert.equal(data.dataBasis.official, false);
  });

  // --------------------------------------------------------------------------
  // 7. POST /api/taxonomy/tag-content
  // --------------------------------------------------------------------------
  await t.test("POST /api/taxonomy/tag-content maps educational content to 2022 standards and prerequisites", async () => {
    const res = await fetch(`${BASE_URL}/api/taxonomy/tag-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "고등학교 미적분 단원에서 순간변화율과 미분계수의 기하학적 의미를 접선의 기울기로 파악하고 정적분의 넓이를 계산하는 원리를 탐구한다.",
        subject: "수학"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.source, "official");
    assert.ok(data.matchedStandardsCount > 0);
    assert.ok(data.primaryStandard);
    assert.ok(data.primaryStandard.code.includes("미적"));
    assert.equal(data.primaryStandard.source, "official");
    assert.equal(data.primaryStandard.citation.book, "별책 8");

    // 선수학습 역추적은 손작성 그래프에만 있어, 확정 연결(decisions.json)이 없으면 비워 둔다.
    assert.deepEqual(data.foundationalPrerequisites, []);
    assert.deepEqual(data.remediationPath, []);
    assert.equal(data.remediationBasis.official, false);
    assert.equal(data.remediationBasis.decisionsFile, "absent");
  });

  await t.test("POST /api/taxonomy/tag-content?source=handwritten keeps legacy backtracking with warning", async () => {
    const res = await fetch(`${BASE_URL}/api/taxonomy/tag-content?source=handwritten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "고등학교 미적분 단원에서 순간변화율과 미분계수의 기하학적 의미를 접선의 기울기로 파악하고 정적분의 넓이를 계산하는 원리를 탐구한다.",
        subject: "수학"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.source, "handwritten");
    assert.equal(data.official, false);
    assert.ok(data.warning.includes("손으로 쓴 성취기준"));
    assert.ok(data.primaryStandard.code.includes("미적"));
    assert.equal(data.primaryStandard.official, false);

    // Foundational prerequisites should be backtracked
    assert.ok(data.foundationalPrerequisites.length > 0);
    assert.ok(data.earliestFoundationalGap);
    assert.ok(data.remediationPath.length >= 2);
    assert.ok(data.piagetStageProgression);
  });

  // --------------------------------------------------------------------------
  // 8. CORS OPTIONS and Error Handling
  // --------------------------------------------------------------------------
  await t.test("CORS preflight and 404/400 error handling", async () => {
    // OPTIONS
    const resOpt = await fetch(`${BASE_URL}/api/taxonomy/diagnose`, { method: "OPTIONS" });
    assert.equal(resOpt.status, 204);
    assert.equal(resOpt.headers.get("access-control-allow-origin"), "*");

    // 404 Route
    const res404 = await fetch(`${BASE_URL}/api/unknown/endpoint`);
    assert.equal(res404.status, 404);
    const data404 = await res404.json();
    assert.ok(data404.error.includes("Not Found"));

    // 400 Bad Request (missing required body parameter)
    const res400 = await fetch(`${BASE_URL}/api/taxonomy/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    assert.equal(res400.status, 400);
    const data400 = await res400.json();
    assert.ok(data400.error.includes("standardCode is required"));
  });

  // --------------------------------------------------------------------------
  // 9. Universal SDK - Remote Mode Verification
  // --------------------------------------------------------------------------
  await t.test("Universal SDK - Remote HTTP Mode works against live server", async () => {
    const client = new K12TaxonomyClient({ baseUrl: BASE_URL });
    assert.equal(client.mode, "remote");

    // Health
    const health = await client.getHealth();
    assert.equal(health.status, "ok");

    // Search standards
    const standards = await client.searchStandards("일차함수", { subject: "수학" });
    assert.ok(Array.isArray(standards));
    assert.ok(standards.length > 0);

    // Get chains
    const chainsData = await client.getChains();
    assert.equal(chainsData.totalCount, 12);
    assert.equal(chainsData.newChainsCount, 6);

    // Get specific chain
    const chain = await client.getChain("ethics_justice_evolution");
    assert.equal(chain.key, "ethics_justice_evolution");

    // Diagnose
    const diag = await client.diagnoseRemediation({
      standardCode: "[10공수1-03]",
      mistakePattern: "인수분해 공식을 반대로 적용함"
    });
    assert.equal(diag.standardCode, "[10공수1-03]");
    assert.ok(diag.remediationPath.length > 0);

    // Lesson scaffold
    const scaffold = await client.getLessonScaffold({
      standardCode: "[4수01-03]",
      subject: "수학"
    });
    assert.equal(scaffold.scaffold393.intro.length, 3);
    assert.equal(scaffold.scaffold393.development.length, 9);
    assert.equal(scaffold.scaffold393.wrapup.length, 3);

    // Tag content
    const tagged = await client.tagContent({
      text: "자석의 성질과 나침반의 바늘이 가리키는 방향을 관찰하는 초등학교 과학 실험"
    });
    assert.ok(tagged.primaryStandard);
  });

  // --------------------------------------------------------------------------
  // 10. Universal SDK - In-Process Mode Verification
  // --------------------------------------------------------------------------
  await t.test("Universal SDK - In-Process Mode works with direct local engines", async () => {
    const client = new K12TaxonomyClient({ mode: "in-process" });
    assert.equal(client.mode, "in-process");

    // Health
    const health = await client.getHealth();
    assert.equal(health.status, "ok");
    assert.ok(health.standardsCount >= 50);

    // Search standards
    const standards = await client.searchStandards("행렬", { subject: "수학" });
    assert.ok(Array.isArray(standards));
    assert.ok(standards.length > 0);

    // Get chains
    const chainsData = await client.getChains();
    assert.equal(chainsData.totalCount, 12);

    // Specific chain
    const chain = await client.getChain("code_to_ai");
    assert.equal(chain.key, "code_to_ai");

    // Diagnose
    const diag = await client.diagnoseRemediation({
      standardCode: "[12인기02-01]"
    });
    assert.equal(diag.targetSchoolLevel, "HS");
    assert.equal(diag.earliestFoundationalGap.topicId, "[6실04-01]");

    // Lesson scaffold
    const scaffold = await client.getLessonScaffold({
      standardCode: "[6실04-03]",
      subject: "실과"
    });
    assert.equal(scaffold.scaffold393.development.length, 9);

    // Tag content
    const tagged = await client.tagContent({
      text: "시장 경제에서 수요곡선과 공급곡선이 만나는 균형 가격의 형성과 변동"
    });
    assert.ok(tagged.matchedStandardsCount > 0);
  });
});
