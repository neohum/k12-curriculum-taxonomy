import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TaxonomyGraphEngine } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";
import {
  Korea2022K12CurriculumAdapter,
  K12_STANDARDS,
  KOREA_2022_K12_STANDARDS,
  K12_CURRICULUM_DEPENDENCIES,
  SPIRAL_CURRICULUM_CHAINS,
  K12_SPIRAL_CHAINS,
  SUBJECT_TO_CLUSTER
} from "../src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data/os-taxonomy");

/**
 * 8 Subject Areas of the Korea 2022 Revised Curriculum
 */
const EXPECTED_SUBJECT_AREAS = [
  {
    name: "국어",
    aliases: ["국어", "공통국어", "독서", "문학", "화법과 작문", "화법과 언어", "독서와 작문"],
    schoolLevels: ["ES", "MS", "HS"]
  },
  {
    name: "수학",
    aliases: ["수학", "공통수학", "대수", "미적분", "확률과 통계", "기하"],
    schoolLevels: ["ES", "MS", "HS"]
  },
  {
    name: "영어",
    aliases: ["영어", "공통영어", "영어Ⅰ", "영어 독해와 작문", "영어회화"],
    schoolLevels: ["ES", "MS", "HS"]
  },
  {
    name: "사회",
    aliases: ["사회", "통합사회", "역사", "한국사", "지리", "경제", "정치와 법", "사회·문화"],
    schoolLevels: ["ES", "MS", "HS"]
  },
  {
    name: "도덕",
    aliases: ["도덕", "윤리와 사상", "생활과 윤리", "윤리"],
    schoolLevels: ["ES", "MS", "HS"]
  },
  {
    name: "과학",
    aliases: ["과학", "통합과학", "물리학", "화학", "생명과학", "지구과학"],
    schoolLevels: ["ES", "MS", "HS"]
  },
  {
    name: "실과/기술·가정/정보",
    aliases: ["실과", "기술·가정", "기술", "정보", "인공지능 기초", "인공지능"],
    schoolLevels: ["ES", "MS", "HS"]
  },
  {
    name: "체육/음악/미술",
    aliases: ["체육", "음악", "미술", "예술"],
    schoolLevels: ["ES", "MS", "HS"]
  }
];

// Helper to check if a standard belongs to a given subject area
function matchesSubjectArea(standard, area) {
  const stdSubject = (standard.subject || "").toLowerCase();
  const stdDomain = (standard.domain || "").toLowerCase();
  const stdCode = (standard.code || "").toLowerCase();

  return area.aliases.some(alias => {
    const a = alias.toLowerCase();
    return stdSubject.includes(a) || stdDomain.includes(a) || stdCode.includes(a);
  });
}

test("Korea 2022 K-12 - Export Signatures and Collections Integrity", () => {
  assert.ok(Array.isArray(KOREA_2022_K12_STANDARDS), "KOREA_2022_K12_STANDARDS must be an array");
  assert.ok(KOREA_2022_K12_STANDARDS.length >= 50, "KOREA_2022_K12_STANDARDS must contain substantial standards");

  // Verify compatibility alias between K12_STANDARDS and KOREA_2022_K12_STANDARDS
  assert.ok(Array.isArray(K12_STANDARDS), "K12_STANDARDS must be an array");
  assert.equal(
    KOREA_2022_K12_STANDARDS.length,
    K12_STANDARDS.length,
    "KOREA_2022_K12_STANDARDS and K12_STANDARDS must have matching counts"
  );

  // Verify SPIRAL_CURRICULUM_CHAINS and K12_SPIRAL_CHAINS
  assert.ok(typeof K12_SPIRAL_CHAINS === "object" && K12_SPIRAL_CHAINS !== null, "K12_SPIRAL_CHAINS must be an object");
  assert.ok(typeof SPIRAL_CURRICULUM_CHAINS === "object" && SPIRAL_CURRICULUM_CHAINS !== null, "SPIRAL_CURRICULUM_CHAINS must be an object");

  // Verify K12_CURRICULUM_DEPENDENCIES
  assert.ok(Array.isArray(K12_CURRICULUM_DEPENDENCIES), "K12_CURRICULUM_DEPENDENCIES must be an array");
  assert.ok(K12_CURRICULUM_DEPENDENCIES.length > 0, "K12_CURRICULUM_DEPENDENCIES must not be empty");
});

test("Korea 2022 K-12 - All 8 Subject Areas Across All 3 School Levels (ES, MS, HS)", () => {
  const standards = KOREA_2022_K12_STANDARDS;
  assert.ok(standards.length > 0, "Standards array should not be empty");

  const levels = ["ES", "MS", "HS"];

  for (const area of EXPECTED_SUBJECT_AREAS) {
    const areaStandards = standards.filter(std => matchesSubjectArea(std, area));
    assert.ok(
      areaStandards.length > 0,
      `Subject area '${area.name}' should have standards in KOREA_2022_K12_STANDARDS`
    );

    for (const lvl of levels) {
      const levelStandards = areaStandards.filter(std => std.schoolLevel === lvl);
      assert.ok(
        levelStandards.length > 0,
        `Subject area '${area.name}' must have standards for level '${lvl}' (found 0)`
      );

      // Verify each standard has required metadata
      for (const std of levelStandards) {
        assert.ok(std.code && std.code.startsWith("[") && std.code.endsWith("]"), `Standard code format invalid: ${std.code}`);
        assert.ok(std.subject, `Standard ${std.code} missing subject`);
        assert.ok(std.statement, `Standard ${std.code} missing statement`);
        assert.equal(std.schoolLevel, lvl, `Standard ${std.code} level mismatch`);
      }
    }
  }
});

test("Korea 2022 K-12 - searchK12Standards Supports Filtering Across All 8 Subjects", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // Test subject filter for all 8 subjects
  const subjectsToFilter = [
    { query: "국어", expectedCluster: "국어" },
    { query: "수학", expectedCluster: "수학" },
    { query: "영어", expectedCluster: "영어" },
    { query: "사회", expectedCluster: "사회" },
    { query: "도덕", expectedCluster: "도덕" },
    { query: "과학", expectedCluster: "과학" },
    { query: "실과", expectedCluster: "정보" },
    { query: "음악", expectedCluster: "음악" }
  ];

  for (const { query } of subjectsToFilter) {
    const results = adapter.searchK12Standards("", { subject: query, limit: 50 });
    assert.ok(
      results.length > 0,
      `searchK12Standards with subject='${query}' should return results (got 0)`
    );

    // Verify all returned standards match the requested subject filter directly or via cluster
    for (const std of results) {
      const subLower = (std.subject || "").toLowerCase();
      const cluster = (SUBJECT_TO_CLUSTER?.[std.subject] || "").toLowerCase();
      const queryCluster = (SUBJECT_TO_CLUSTER?.[query] || query).toLowerCase();
      const matched = subLower.includes(query.toLowerCase()) || cluster.includes(query.toLowerCase()) || (cluster && cluster === queryCluster);
      assert.ok(
        matched,
        `Expected standard subject '${std.subject}' (cluster: '${cluster}') to include filter '${query}'`
      );
    }
  }

  // Combined subject and schoolLevel filter
  const hsMath = adapter.searchK12Standards("", { subject: "수학", schoolLevel: "HS" });
  assert.ok(hsMath.length > 0, "Should return High School Math standards");
  for (const std of hsMath) {
    assert.equal(std.schoolLevel, "HS");
    const sub = std.subject;
    const cluster = SUBJECT_TO_CLUSTER?.[sub] || "";
    assert.ok(
      sub.includes("수학") || cluster === "수학",
      `Expected standard ${std.code} subject '${sub}' to be in Math`
    );
  }

  const esKorean = adapter.searchK12Standards("", { subject: "국어", schoolLevel: "ES" });
  assert.ok(esKorean.length > 0, "Should return Elementary Korean standards");
  for (const std of esKorean) {
    assert.equal(std.schoolLevel, "ES");
    const sub = std.subject;
    const cluster = SUBJECT_TO_CLUSTER?.[sub] || "";
    assert.ok(
      sub.includes("국어") || cluster === "국어",
      `Expected standard ${std.code} subject '${sub}' to be in Korean`
    );
  }
});

test("Korea 2022 K-12 - Verification of 6 Spiral Curriculum Chains in K12_SPIRAL_CHAINS", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  const requiredChains = [
    {
      key: "reading_comprehension",
      desc: "국어: 초등 한글/독해 ➔ 고등 학술 텍스트 분석"
    },
    {
      key: "english_grammar_ladder",
      desc: "영어: 초등 파닉스 ➔ 고등 학술 지문 구문 독해"
    },
    {
      key: "ratio_to_economy",
      desc: "수학 비와 비율 ➔ 중등 수요공급 ➔ 고등 경제 환율/이자율"
    },
    {
      key: "ethics_justice_evolution",
      desc: "초등 배려 ➔ 중등 사회정의 ➔ 고등 롤스/칸트"
    },
    {
      key: "music_harmony_chain",
      desc: "초등 리듬/계이름 ➔ 중등 화음 ➔ 고등 악곡 분석"
    },
    {
      key: "art_perspective_chain",
      desc: "초등 조형요소 ➔ 중등 원근법 ➔ 고등 시각문화비평"
    }
  ];

  for (const { key, desc } of requiredChains) {
    // 1. Check in K12_SPIRAL_CHAINS direct export
    const rawChain = K12_SPIRAL_CHAINS[key];
    assert.ok(rawChain, `Chain '${key}' (${desc}) must exist in K12_SPIRAL_CHAINS`);
    assert.equal(rawChain.key, key);
    assert.ok(rawChain.title, `Chain '${key}' must have a title`);
    assert.ok(rawChain.description, `Chain '${key}' must have a description`);
    assert.ok(Array.isArray(rawChain.stages) && rawChain.stages.length >= 3, `Chain '${key}' must have at least 3 stages`);
    assert.ok(Array.isArray(rawChain.transitions) && rawChain.transitions.length >= 2, `Chain '${key}' must have transitions`);

    // Verify progression across all 3 school levels: ES, MS, HS
    const levelsInChain = new Set(rawChain.stages.map(s => s.schoolLevel));
    assert.ok(levelsInChain.has("ES"), `Chain '${key}' must include Elementary (ES) stage`);
    assert.ok(levelsInChain.has("MS"), `Chain '${key}' must include Middle School (MS) stage`);
    assert.ok(levelsInChain.has("HS"), `Chain '${key}' must include High School (HS) stage`);

    // 2. Check resolution via adapter.getSpiralCurriculumChain(key)
    const resolvedChain = adapter.getSpiralCurriculumChain(key);
    assert.ok(resolvedChain, `adapter.getSpiralCurriculumChain('${key}') must return resolved chain`);
    assert.equal(resolvedChain.stagesCount, rawChain.stages.length);

    for (const stage of resolvedChain.stages) {
      assert.ok(stage.standardCode, `Stage in '${key}' missing standardCode`);
      assert.ok(stage.concept, `Stage in '${key}' missing concept`);
      assert.ok(stage.piagetStage, `Stage in '${key}' missing piagetStage`);
      assert.ok(stage.pedagogicalScaffolding, `Stage in '${key}' missing pedagogicalScaffolding`);

      // Verify that the standardCode resolves to an actual standard in K12_STANDARDS
      assert.ok(
        stage.standard,
        `Stage standard code '${stage.standardCode}' in chain '${key}' must resolve to a valid standard`
      );
      assert.equal(stage.standard.schoolLevel, stage.schoolLevel);
    }
  }
});

test("Korea 2022 K-12 - Cross-Grade Causal Remediation Paths via diagnoseK12RemediationPath", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // 1. Cross-Disciplinary Chain: High School Economy [12경제01-02] ➔ Middle School ➔ Elementary Ratio [6수01-06]
  const econDiag = engine.diagnoseK12RemediationPath("[12경제01-02]", []);
  assert.equal(econDiag.isBlocked, true, "Remediation should indicate student is blocked");
  assert.equal(econDiag.targetSchoolLevel, "HS", "Target should be High School");

  // Earliest foundational gap must trace back to Elementary Ratio [6수01-06]
  assert.ok(econDiag.earliestFoundationalGap, "Should identify earliest foundational cognitive gap");
  const econRootId = econDiag.earliestFoundationalGap.topicId.replace(/[[\]]/g, "");
  assert.equal(econRootId, "6수01-06", "HS Economy gap should trace to Elementary Ratio [6수01-06]");
  assert.equal(econDiag.earliestFoundationalGap.schoolLevel, "ES");
  assert.equal(econDiag.earliestFoundationalGap.piagetStage, "Concrete Operational");

  // Traversed school levels should include ES, MS, and HS
  assert.ok(econDiag.schoolLevelsTraversed.includes("ES"), "Traversed levels must include ES");
  assert.ok(econDiag.schoolLevelsTraversed.includes("MS"), "Traversed levels must include MS");
  assert.ok(econDiag.schoolLevelsTraversed.includes("HS"), "Traversed levels must include HS");

  // Check remediation path ordering from ES root to HS target
  const econPath = econDiag.remediationPath;
  assert.ok(econPath.length >= 3, "Remediation path should have at least 3 steps");
  assert.equal(econPath[0].topicId.replace(/[[\]]/g, ""), "6수01-06");
  assert.equal(econPath[0].isRootCause, true);
  assert.equal(econPath[econPath.length - 1].topicId.replace(/[[\]]/g, ""), "12경제01-02");
  assert.equal(econPath[econPath.length - 1].isTargetTopic, true);

  // Incremental mastery: When [6수01-06] is mastered, root cause advances past ES
  const econDiagMastered = engine.diagnoseK12RemediationPath("[12경제01-02]", ["[6수01-06]"]);
  assert.notEqual(
    econDiagMastered.earliestFoundationalGap?.topicId.replace(/[[\]]/g, ""),
    "6수01-06",
    "Once [6수01-06] is mastered, earliest foundational gap should move to next unmastered prerequisite"
  );

  // 2. Cross-Disciplinary Chain: High School Reading [12독작02-01] ➔ Middle School ➔ Elementary Word Phonics [2국01-01]
  const readingDiag = engine.diagnoseK12RemediationPath("[12독작02-01]", []);
  assert.equal(readingDiag.isBlocked, true);
  assert.equal(readingDiag.targetSchoolLevel, "HS");

  assert.ok(readingDiag.earliestFoundationalGap, "Should identify earliest foundational gap for Reading");
  const readingRootId = readingDiag.earliestFoundationalGap.topicId.replace(/[[\]]/g, "");
  assert.equal(readingRootId, "2국01-01", "HS Reading gap should trace to Elementary Phonics/Word [2국01-01]");
  assert.equal(readingDiag.earliestFoundationalGap.schoolLevel, "ES");

  // Traversed school levels should include ES, MS, and HS
  assert.ok(readingDiag.schoolLevelsTraversed.includes("ES"), "Traversed levels must include ES");
  assert.ok(readingDiag.schoolLevelsTraversed.includes("MS"), "Traversed levels must include MS");
  assert.ok(readingDiag.schoolLevelsTraversed.includes("HS"), "Traversed levels must include HS");

  const readingPath = readingDiag.remediationPath;
  assert.ok(readingPath.length >= 3, "Remediation path should have at least 3 steps");
  assert.equal(readingPath[0].topicId.replace(/[[\]]/g, ""), "2국01-01");
  assert.equal(readingPath[readingPath.length - 1].topicId.replace(/[[\]]/g, ""), "12독작02-01");
});
