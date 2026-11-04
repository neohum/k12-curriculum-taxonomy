import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TaxonomyGraphEngine } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";
import { 
  Korea2022K12CurriculumAdapter,
  K12_TERMINOLOGY_DICTIONARY,
  K12_STANDARDS,
  KOREA_2022_K12_STANDARDS,
  K12_CURRICULUM_DEPENDENCIES,
  SPIRAL_CURRICULUM_CHAINS,
  K12_SPIRAL_CHAINS
} from "../src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data/os-taxonomy");

test("Korea2022K12CurriculumAdapter - K-12 Terminology Localization Dictionary (초·중·고 연계)", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // 1. Elementary and Middle School terms
  const termsToCheck = [
    { ko: "소인수", en: "Prime Factor", level: "MS" },
    { ko: "유리수", en: "Rational Numbers", level: "MS" },
    { ko: "일차방정식", en: "Linear Equation", level: "MS" },
    { ko: "기울기", en: "Slope / Gradient", level: "MS" },
    { ko: "이차함수", en: "Quadratic Function", level: "MS" },
    { ko: "피타고라스", en: "Pythagorean Theorem", level: "MS" },
    { ko: "인수분해", en: "Factorization", level: "MS" },
    { ko: "극한", en: "Limit", level: "HS" },
    { ko: "미분계수", en: "Differential Coefficient", level: "HS" },
    { ko: "도함수", en: "Derivative", level: "HS" },
    { ko: "정적분", en: "Definite Integral", level: "HS" },
    { ko: "행렬", en: "Matrix", level: "HS" },
    { ko: "벡터", en: "Vector", level: "HS" },
    { ko: "뉴턴 역학", en: "Newtonian Mechanics", level: "HS" },
    { ko: "광합성", en: "Photosynthesis", level: "ES" },
    { ko: "인공지능", en: "Artificial Intelligence", level: "MS" }
  ];

  for (const item of termsToCheck) {
    const translated = adapter.translateTerm(item.ko);
    assert.ok(translated, `Expected translation for Korean term: ${item.ko}`);
    assert.equal(translated.en, item.en, `Mismatch for ${item.ko}`);
    if (item.level) {
      assert.equal(translated.schoolLevel, item.level, `School level mismatch for ${item.ko}`);
    }

    // Reverse lookup by English
    const reverse = adapter.translateTerm(item.en);
    assert.ok(reverse, `Expected reverse translation for English term: ${item.en}`);
    assert.ok(reverse.korean.includes(item.ko) || item.ko.includes(reverse.korean), `Reverse term mismatch for ${item.en}`);
  }
});

test("Korea2022K12CurriculumAdapter - Elementary Standards Coverage ([1수01-01]~[6수05-02], [3과01-01]~[6과08-03], [6실04-01]~[6실04-05])", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // Elementary Math
  const esMathCodes = [
    "[1수01-01]", "[2수01-01]", "[2수01-04]", "[2수01-05]", "[2수01-08]", "[2수01-09]",
    "[4수01-01]", "[4수01-07]", "[4수01-10]", "[4수05-02]",
    "[6수01-01]", "[6수01-04]", "[6수01-06]", "[6수02-01]", "[6수03-01]", "[6수05-02]"
  ];
  for (const code of esMathCodes) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing ES Math standard: ${code}`);
    assert.equal(std.schoolLevel, "ES");
    assert.equal(std.subject, "수학");
  }

  // Elementary Science
  const esSciCodes = [
    "[3과01-01]", "[4과02-01]", "[4과05-01]", "[4과07-01]", "[4과10-01]",
    "[6과01-01]", "[6과01-02]", "[6과07-01]", "[6과08-01]", "[6과08-03]"
  ];
  for (const code of esSciCodes) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing ES Science standard: ${code}`);
    assert.equal(std.schoolLevel, "ES");
    assert.equal(std.subject, "과학");
  }

  // Elementary SW / Computing: [6실04-01] ~ [6실04-05]
  for (let i = 1; i <= 5; i++) {
    const code = `[6실04-0${i}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing ES SW standard: ${code}`);
    assert.equal(std.schoolLevel, "ES");
  }
});

test("Korea2022K12CurriculumAdapter - Middle School Standards Coverage ([9수01-01]~[9수05-08], [9과01-01]~[9과10-06], [9정01-01]~[9정04-06])", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // 1. Math 9수01: 01 to 14 (소인수분해, 정수와 유리수, 유리수의 사칙계산)
  for (let i = 1; i <= 14; i++) {
    const code = `[9수01-${String(i).padStart(2, "0")}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing MS Math 9수01 standard: ${code}`);
    assert.equal(std.schoolLevel, "MS");
    assert.equal(std.piagetStage, "Early Formal Operational");
  }

  // 2. Math 9수02: 01 to 13 (문자와 식, 일차방정식, 연립일차방정식, 일차부등식, 이차방정식, 인수분해)
  for (let i = 1; i <= 13; i++) {
    const code = `[9수02-${String(i).padStart(2, "0")}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing MS Math 9수02 standard: ${code}`);
    assert.equal(std.schoolLevel, "MS");
  }

  // 3. Math 9수03: 01 to 08 (좌표평면과 그래프, 일차함수와 그래프, 일차함수 기울기, 이차함수와 그래프)
  for (let i = 1; i <= 8; i++) {
    const code = `[9수03-${String(i).padStart(2, "0")}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing MS Math 9수03 standard: ${code}`);
    assert.equal(std.schoolLevel, "MS");
  }

  // 4. Math 9수04: 01 to 12 (기하, 피타고라스 정리, 삼각비)
  for (let i = 1; i <= 12; i++) {
    const code = `[9수04-${String(i).padStart(2, "0")}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing MS Math 9수04 standard: ${code}`);
    assert.equal(std.schoolLevel, "MS");
  }

  // 5. Math 9수05: 01 to 08 (확률과 통계, 상자그림)
  for (let i = 1; i <= 8; i++) {
    const code = `[9수05-${String(i).padStart(2, "0")}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing MS Math 9수05 standard: ${code}`);
    assert.equal(std.schoolLevel, "MS");
  }

  // 6. Science: 9과01-01 ~ 9과10-06
  const sciKeys = [
    "[9과01-01]", "[9과02-01]", "[9과02-02]", "[9과03-01]", "[9과04-01]",
    "[9과05-01]", "[9과06-01]", "[9과07-01]", "[9과08-01]", "[9과08-02]",
    "[9과09-01]", "[9과09-02]", "[9과10-01]", "[9과10-02]", "[9과10-06]"
  ];
  for (const code of sciKeys) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing MS Science standard: ${code}`);
    assert.equal(std.schoolLevel, "MS");
    assert.equal(std.subject, "과학");
  }

  // 7. Information / Computing: 9정01-01 ~ 9정04-06
  const compKeys = [
    "[9정01-01]", "[9정01-02]", "[9정02-01]", "[9정02-02]",
    "[9정03-01]", "[9정03-02]", "[9정03-03]", "[9정03-04]",
    "[9정04-01]", "[9정04-06]"
  ];
  for (const code of compKeys) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing MS Computing standard: ${code}`);
    assert.equal(std.schoolLevel, "MS");
    assert.equal(std.subject, "정보");
  }
});

test("Korea2022K12CurriculumAdapter - High School Standards Coverage (공통수학1·2, 대수, 미적분1, 통합과학, 물리, AI)", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // 1. 공통수학 1: [10공수1-01] ~ [10공수1-06] (다항식, 나머지정리, 인수분해, 복소수, 이차함수, 행렬)
  for (let i = 1; i <= 6; i++) {
    const code = `[10공수1-${String(i).padStart(2, "0")}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing HS Common Math 1: ${code}`);
    assert.equal(std.schoolLevel, "HS");
    assert.equal(std.piagetStage, "Formal Operational");
  }

  // 2. 공통수학 2: [10공수2-01] ~ [10공수2-06] (평면좌표, 직선, 원, 도형이동, 집합과명제, 함수)
  for (let i = 1; i <= 6; i++) {
    const code = `[10공수2-${String(i).padStart(2, "0")}]`;
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing HS Common Math 2: ${code}`);
    assert.equal(std.schoolLevel, "HS");
  }

  // 3. 대수: [12대수01-01] ~ [12대수03-08]
  const algebraCodes = [
    "[12대수01-01]", "[12대수01-02]", "[12대수01-03]",
    "[12대수02-01]", "[12대수02-02]",
    "[12대수03-01]", "[12대수03-02]", "[12대수03-08]"
  ];
  for (const code of algebraCodes) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing HS Algebra: ${code}`);
    assert.equal(std.schoolLevel, "HS");
    assert.equal(std.subject, "대수");
  }

  // 4. 미적분1: [12미적1-01-01] ~ [12미적1-03-06]
  const calculusCodes = [
    "[12미적1-01-01]", "[12미적1-01-02]", "[12미적1-01-03]",
    "[12미적1-02-01]", "[12미적1-02-02]", "[12미적1-02-03]", "[12미적1-02-04]",
    "[12미적1-03-01]", "[12미적1-03-02]", "[12미적1-03-06]"
  ];
  for (const code of calculusCodes) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing HS Calculus: ${code}`);
    assert.equal(std.schoolLevel, "HS");
    assert.equal(std.subject, "미적분");
  }

  // 5. 통합과학: [10통과1-01] ~ [10통과2-08]
  const intSciCodes = [
    "[10통과1-01]", "[10통과1-02]", "[10통과1-04]",
    "[10통과2-01]", "[10통과2-02]", "[10통과2-08]"
  ];
  for (const code of intSciCodes) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing HS Integrated Science: ${code}`);
    assert.equal(std.schoolLevel, "HS");
  }

  // 6. 물리학: [12물리01-01] ~ [12물리03-05]
  const physicsCodes = [
    "[12물리01-01]", "[12물리01-02]", "[12물리02-01]", "[12물리02-02]",
    "[12물리03-01]", "[12물리03-05]"
  ];
  for (const code of physicsCodes) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing HS Physics: ${code}`);
    assert.equal(std.schoolLevel, "HS");
    assert.equal(std.subject, "물리학");
  }

  // 7. 인공지능 기초: [12인기01-01] ~ [12인기03-04]
  const aiCodes = [
    "[12인기01-01]", "[12인기02-01]", "[12인기02-02]", "[12인기03-04]"
  ];
  for (const code of aiCodes) {
    const std = adapter.getK12Standard(code);
    assert.ok(std, `Missing HS AI standard: ${code}`);
    assert.equal(std.schoolLevel, "HS");
    assert.equal(std.subject, "인공지능 기초");
  }
});

test("Korea2022K12CurriculumAdapter - Spiral Curriculum Progression Chains (초 ➔ 중 ➔ 고)", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // 1. Fractions to Calculus Chain
  const calcChain = adapter.getSpiralCurriculumChain("fractions_to_calculus");
  assert.ok(calcChain, "fractions_to_calculus chain should exist");
  assert.ok(calcChain.stages.length >= 3, "Should have at least 3 stages across ES, MS, HS");
  assert.equal(calcChain.stages[0].schoolLevel, "ES");
  assert.equal(calcChain.stages[1].schoolLevel, "MS");
  assert.equal(calcChain.stages[2].schoolLevel, "HS");
  assert.equal(calcChain.stages[0].standardCode, "[6수01-06]");
  assert.equal(calcChain.stages[1].standardCode, "[9수03-03]");
  assert.equal(calcChain.stages[2].standardCode, "[12미적1-02-01]");
  assert.ok(calcChain.transitions.length >= 2);
  assert.ok(calcChain.transitions[0].piagetTransition.includes("Concrete Operational ➔ Early Formal Operational"));

  // 2. Arithmetic to Algebra Chain
  const algChain = adapter.getSpiralCurriculumChain("arithmetic_to_algebra");
  assert.ok(algChain);
  assert.equal(algChain.stages[0].schoolLevel, "ES");
  assert.equal(algChain.stages[1].schoolLevel, "MS");
  assert.equal(algChain.stages[algChain.stages.length - 1].schoolLevel, "HS");

  // 3. Balance to Matrix Chain
  const matrixChain = adapter.getSpiralCurriculumChain("balance_to_matrix");
  assert.ok(matrixChain);
  assert.equal(matrixChain.stages[0].standardCode, "[6수02-01]");
  assert.equal(matrixChain.stages[1].standardCode, "[9수02-05]");
  assert.equal(matrixChain.stages[2].standardCode, "[10공수1-06]");

  // 4. Light to Optics Chain
  const opticsChain = adapter.getSpiralCurriculumChain("light_to_optics");
  assert.ok(opticsChain);
  assert.equal(opticsChain.stages[0].standardCode, "[4과07-01]");
  assert.equal(opticsChain.stages[1].standardCode, "[9과02-01]");
  assert.equal(opticsChain.stages[2].standardCode, "[12물리03-01]");

  // 5. Code to AI Chain
  const aiChain = adapter.getSpiralCurriculumChain("code_to_ai");
  assert.ok(aiChain);
  assert.equal(aiChain.stages[0].schoolLevel, "ES");
  assert.equal(aiChain.stages[1].schoolLevel, "MS");
  assert.equal(aiChain.stages[2].schoolLevel, "HS");
});

test("Korea2022K12CurriculumAdapter - searchK12Standards with schoolLevel and subject filters", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // Search '기울기' across all levels
  const slopeHits = adapter.searchK12Standards("기울기");
  assert.ok(slopeHits.length > 0);
  assert.ok(slopeHits.some(s => s.code === "[9수03-03]" || s.code === "[12미적1-02-01]"));

  // Search '인수분해' restricted to MS
  const msFactorHits = adapter.searchK12Standards("인수분해", { schoolLevel: "MS" });
  assert.ok(msFactorHits.length > 0);
  for (const hit of msFactorHits) {
    assert.equal(hit.schoolLevel, "MS");
  }

  // Search '미분' restricted to HS
  const hsCalculusHits = adapter.searchK12Standards("미분", { schoolLevel: "HS" });
  assert.ok(hsCalculusHits.length > 0);
  for (const hit of hsCalculusHits) {
    assert.equal(hit.schoolLevel, "HS");
  }

  // Search '광합성' in Science
  const photoHits = adapter.searchK12Standards("광합성", { subject: "과학" });
  assert.ok(photoHits.length >= 2, "Should find ES and MS photosynthesis standards");
  assert.ok(photoHits.some(s => s.schoolLevel === "ES"));
  assert.ok(photoHits.some(s => s.schoolLevel === "MS"));
});

test("Korea2022K12CurriculumAdapter - Backward compatibility export aliases", () => {
  assert.equal(KOREA_2022_K12_STANDARDS, K12_STANDARDS);
  assert.equal(K12_SPIRAL_CHAINS, SPIRAL_CURRICULUM_CHAINS);
});

test("Korea2022K12CurriculumAdapter - Full K-12 8 Subjects Coverage (초1~고3 전과목 국·수·영·사·도·과·정·체음미)", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // 1. 국어과 (Korean)
  const koreanCodes = [
    { code: "[2국01-01]", level: "ES", stage: "Concrete Operational" },
    { code: "[4국02-01]", level: "ES", stage: "Concrete Operational" },
    { code: "[6국03-02]", level: "ES", stage: "Concrete Operational" },
    { code: "[9국01-02]", level: "MS", stage: "Early Formal Operational" },
    { code: "[9국02-03]", level: "MS", stage: "Early Formal Operational" },
    { code: "[9국03-01]", level: "MS", stage: "Early Formal Operational" },
    { code: "[10공국01-02]", level: "HS", stage: "Formal Operational" },
    { code: "[12독작02-01]", level: "HS", stage: "Formal Operational" },
    { code: "[12화언03-02]", level: "HS", stage: "Formal Operational" },
    { code: "[12문학02-03]", level: "HS", stage: "Formal Operational" }
  ];
  for (const item of koreanCodes) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing Korean standard: ${item.code}`);
    assert.equal(std.schoolLevel, item.level, `Level mismatch for ${item.code}`);
    assert.equal(std.piagetStage, item.stage, `Piaget stage mismatch for ${item.code}`);
    assert.ok(std.keywords && std.keywords.length > 0);
    assert.ok(std.statement && std.statement.length > 0);
  }

  // 2. 수학과 추가 (Math additions: [4수01-03], [12확통01-01], [12기하01-01])
  const mathAdditions = [
    { code: "[4수01-03]", level: "ES", stage: "Concrete Operational" },
    { code: "[12확통01-01]", level: "HS", stage: "Formal Operational" },
    { code: "[12기하01-01]", level: "HS", stage: "Formal Operational" }
  ];
  for (const item of mathAdditions) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing Math addition: ${item.code}`);
    assert.equal(std.schoolLevel, item.level);
    assert.equal(std.piagetStage, item.stage);
  }

  // 3. 영어과 (English)
  const englishCodes = [
    { code: "[4영01-01]", level: "ES" },
    { code: "[6영02-02]", level: "ES" },
    { code: "[9영01-03]", level: "MS" },
    { code: "[9영02-02]", level: "MS" },
    { code: "[9영03-01]", level: "MS" },
    { code: "[10공영01-02]", level: "HS" },
    { code: "[12영1-02-01]", level: "HS" },
    { code: "[12영독작03-01]", level: "HS" }
  ];
  for (const item of englishCodes) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing English standard: ${item.code}`);
    assert.equal(std.schoolLevel, item.level);
  }

  // 4. 사회·역사과 (Social Studies / History)
  const socialCodes = [
    { code: "[4사01-01]", level: "ES" },
    { code: "[6사02-01]", level: "ES" },
    { code: "[6사03-02]", level: "ES" },
    { code: "[9사01-01]", level: "MS" },
    { code: "[9사05-02]", level: "MS" },
    { code: "[9역01-03]", level: "MS" },
    { code: "[9역04-02]", level: "MS" },
    { code: "[10통사1-01-01]", level: "HS" },
    { code: "[10통사2-01-02]", level: "HS" },
    { code: "[12한사01-02]", level: "HS" },
    { code: "[12경제01-02]", level: "HS" },
    { code: "[12정법01-01]", level: "HS" },
    { code: "[12사문01-01]", level: "HS" }
  ];
  for (const item of socialCodes) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing Social standard: ${item.code}`);
    assert.equal(std.schoolLevel, item.level);
  }

  // 5. 도덕·윤리과 (Ethics)
  const ethicsCodes = [
    { code: "[4도01-01]", level: "ES" },
    { code: "[6도02-02]", level: "ES" },
    { code: "[9도01-01]", level: "MS" },
    { code: "[9도03-02]", level: "MS" },
    { code: "[12생윤01-02]", level: "HS" },
    { code: "[12윤사02-01]", level: "HS" }
  ];
  for (const item of ethicsCodes) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing Ethics standard: ${item.code}`);
    assert.equal(std.schoolLevel, item.level);
  }

  // 6. 과학과 심화 (Chemistry, Biology, Earth Science)
  const sciAdditions = [
    { code: "[12화학01-01]", level: "HS" },
    { code: "[12생명01-01]", level: "HS" },
    { code: "[12지구01-01]", level: "HS" }
  ];
  for (const item of sciAdditions) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing Science standard: ${item.code}`);
    assert.equal(std.schoolLevel, item.level);
  }

  // 7. 정보·기술·AI (Tech / Informatics / AI)
  const techCodes = [
    { code: "[6실04-01]", level: "ES" },
    { code: "[9정01-02]", level: "MS" },
    { code: "[9정03-01]", level: "MS" },
    { code: "[9기01-02]", level: "MS" },
    { code: "[12정02-01]", level: "HS" },
    { code: "[12인기01-02]", level: "HS" }
  ];
  for (const item of techCodes) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing Tech/Informatics standard: ${item.code}`);
    assert.equal(std.schoolLevel, item.level);
  }

  // 8. 체육·음악·미술 (Arts & Physical Education)
  const artsPeCodes = [
    { code: "[4체01-01]", level: "ES" },
    { code: "[6음01-01]", level: "ES" },
    { code: "[6미01-01]", level: "ES" },
    { code: "[9체02-01]", level: "MS" },
    { code: "[9음02-01]", level: "MS" },
    { code: "[9미02-01]", level: "MS" },
    { code: "[10체01-02]", level: "HS" },
    { code: "[12음01-02]", level: "HS" },
    { code: "[12미02-01]", level: "HS" }
  ];
  for (const item of artsPeCodes) {
    const std = adapter.getK12Standard(item.code);
    assert.ok(std, `Missing Arts/PE standard: ${item.code}`);
    assert.equal(std.schoolLevel, item.level);
  }
});

test("Korea2022K12CurriculumAdapter - All Standards Data Integrity Contract", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  for (const std of K12_STANDARDS) {
    assert.ok(std.code && std.code.startsWith("[") && std.code.endsWith("]"), `Invalid code format: ${std.code}`);
    assert.ok(std.subject && typeof std.subject === "string", `Missing subject: ${std.code}`);
    assert.ok(["ES", "MS", "HS"].includes(std.schoolLevel), `Invalid schoolLevel: ${std.code}`);
    assert.ok(std.gradeCluster && typeof std.gradeCluster === "string", `Missing gradeCluster: ${std.code}`);
    assert.ok(std.grade && typeof std.grade === "string", `Missing grade: ${std.code}`);
    assert.ok(std.domain && typeof std.domain === "string", `Missing domain: ${std.code}`);
    assert.ok(std.statement && std.statement.length > 5, `Missing statement: ${std.code}`);
    assert.ok(Array.isArray(std.keywords) && std.keywords.length > 0, `Missing keywords: ${std.code}`);
    assert.ok(Array.isArray(std.mappedTopicIds), `Missing mappedTopicIds: ${std.code}`);
    assert.ok(["Concrete Operational", "Early Formal Operational", "Formal Operational"].includes(std.piagetStage), `Invalid piagetStage: ${std.code}`);
  }
});

test("Korea2022K12CurriculumAdapter - Expanded Spiral Curriculum Progression Chains (Reading, English, Economy, Ethics, Music, Art)", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // 1. Reading Comprehension Chain
  const readChain = adapter.getSpiralCurriculumChain("reading_comprehension");
  assert.ok(readChain, "reading_comprehension chain should exist");
  assert.equal(readChain.stages.length, 6);
  assert.equal(readChain.stages[0].standardCode, "[2국01-01]");
  assert.equal(readChain.stages[1].standardCode, "[4국02-01]");
  assert.equal(readChain.stages[2].standardCode, "[6국03-02]");
  assert.equal(readChain.stages[3].standardCode, "[9국03-01]");
  assert.equal(readChain.stages[4].standardCode, "[10공국01-02]");
  assert.equal(readChain.stages[5].standardCode, "[12독작02-01]");
  assert.ok(readChain.transitions.length >= 2);

  // Alias lookup
  const koreanAliasChain = adapter.getSpiralCurriculumChain("korean");
  assert.ok(koreanAliasChain);
  assert.equal(koreanAliasChain.key, "reading_comprehension");

  // 2. English Grammar Ladder
  const engChain = adapter.getSpiralCurriculumChain("english_grammar_ladder");
  assert.ok(engChain);
  assert.equal(engChain.stages.length, 6);
  assert.equal(engChain.stages[0].standardCode, "[4영01-01]");
  assert.equal(engChain.stages[1].standardCode, "[6영02-02]");
  assert.equal(engChain.stages[2].standardCode, "[9영01-03]");
  assert.equal(engChain.stages[3].standardCode, "[9영02-02]");
  assert.equal(engChain.stages[4].standardCode, "[10공영01-02]");
  assert.equal(engChain.stages[5].standardCode, "[12영1-02-01]");

  // 3. Ratio to Economy Chain
  const econChain = adapter.getSpiralCurriculumChain("ratio_to_economy");
  assert.ok(econChain);
  assert.equal(econChain.stages.length, 3);
  assert.equal(econChain.stages[0].standardCode, "[6수01-06]");
  assert.equal(econChain.stages[1].standardCode, "[9사05-02]");
  assert.equal(econChain.stages[2].standardCode, "[12경제01-02]");

  // 4. Ethics Justice Evolution Chain
  const ethicsChain = adapter.getSpiralCurriculumChain("ethics_justice_evolution");
  assert.ok(ethicsChain);
  assert.equal(ethicsChain.stages.length, 4);
  assert.equal(ethicsChain.stages[0].standardCode, "[4도01-01]");
  assert.equal(ethicsChain.stages[1].standardCode, "[9도03-02]");
  assert.equal(ethicsChain.stages[2].standardCode, "[10통사2-01-02]");
  assert.equal(ethicsChain.stages[3].standardCode, "[12윤사02-01]");

  // 5. Music Harmony Chain
  const musicChain = adapter.getSpiralCurriculumChain("music_harmony_chain");
  assert.ok(musicChain);
  assert.equal(musicChain.stages.length, 3);
  assert.equal(musicChain.stages[0].standardCode, "[6음01-01]");
  assert.equal(musicChain.stages[1].standardCode, "[9음02-01]");
  assert.equal(musicChain.stages[2].standardCode, "[12음01-02]");

  // 6. Art Perspective Chain
  const artChain = adapter.getSpiralCurriculumChain("art_perspective_chain");
  assert.ok(artChain);
  assert.equal(artChain.stages.length, 3);
  assert.equal(artChain.stages[0].standardCode, "[6미01-01]");
  assert.equal(artChain.stages[1].standardCode, "[9미02-01]");
  assert.equal(artChain.stages[2].standardCode, "[12미02-01]");
});

test("Korea2022K12CurriculumAdapter - searchK12Standards across diverse subjects", () => {
  const adapter = new Korea2022K12CurriculumAdapter();

  // Search in 국어
  const koreanHits = adapter.searchK12Standards("독해", { subject: "국어" });
  assert.ok(koreanHits.length > 0);
  assert.ok(koreanHits.some(s => s.code === "[6국03-02]" || s.code === "[9국03-01]" || s.code === "[12독작02-01]"));

  // Search in 영어
  const engHits = adapter.searchK12Standards("문장", { subject: "영어" });
  assert.ok(engHits.length > 0);

  // Search in 사회
  const socHits = adapter.searchK12Standards("가격", { subject: "사회" });
  assert.ok(socHits.length > 0);
  assert.ok(socHits.some(s => s.code === "[9사05-02]"));

  // Search in 도덕
  const ethicsHits = adapter.searchK12Standards("정의", { subject: "도덕" });
  assert.ok(ethicsHits.length > 0);
  assert.ok(ethicsHits.some(s => s.code === "[9도03-02]" || s.code === "[12윤사02-01]"));

  // Search in 음악
  const musicHits = adapter.searchK12Standards("화음", { subject: "음악" });
  assert.ok(musicHits.length > 0);
  assert.ok(musicHits.some(s => s.code === "[9음02-01]" || s.code === "[12음01-02]"));

  // Search in 미술
  const artHits = adapter.searchK12Standards("원근법", { subject: "미술" });
  assert.ok(artHits.length > 0);
  assert.ok(artHits.some(s => s.code === "[9미02-01]"));
});
