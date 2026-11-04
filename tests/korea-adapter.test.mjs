import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TaxonomyGraphEngine } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";
import { 
  Korea2022CurriculumAdapter,
  KOREAN_TERMINOLOGY_DICTIONARY,
  KOREA_2022_STANDARDS 
} from "../src/core/taxonomy/Korea2022CurriculumAdapter.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data/os-taxonomy");

test("Korea2022CurriculumAdapter - Terminology Localization Dictionary", () => {
  const adapter = new Korea2022CurriculumAdapter();

  // Korean to English translations
  const frac = adapter.translateTerm("분수");
  assert.ok(frac);
  assert.equal(frac.en, "Fractions");
  assert.equal(frac.domain, "Fractions");
  assert.equal(frac.subject, "Mathematics");

  const photo = adapter.translateTerm("광합성");
  assert.ok(photo);
  assert.equal(photo.en, "Photosynthesis");
  assert.equal(photo.domain, "Organisms & Life Processes");
  assert.equal(photo.subject, "Science");

  const circuit = adapter.translateTerm("전기 회로");
  assert.ok(circuit);
  assert.equal(circuit.en, "Electric Circuit");
  assert.equal(circuit.domain, "Energy");

  const algo = adapter.translateTerm("알고리즘");
  assert.ok(algo);
  assert.equal(algo.en, "Algorithm");
  assert.equal(algo.domain, "Algorithms & Programming");

  // English to Korean reverse translation
  const rev = adapter.translateTerm("Fractions");
  assert.ok(rev);
  assert.equal(rev.korean, "분수");

  const revCircuit = adapter.translateTerm("Electric Circuit");
  assert.ok(revCircuit);
  assert.equal(revCircuit.korean, "전기 회로");
});

test("Korea2022CurriculumAdapter - Standards Coverage across Math, Science, SW", () => {
  const adapter = new Korea2022CurriculumAdapter();

  // Elementary Math coverage: 1~2, 3~4, 5~6 grade bands
  assert.ok(adapter.getKoreanStandard("[2수01-01]"), "Should have [2수01-01]");
  assert.ok(adapter.getKoreanStandard("[2수01-05]"), "Should have [2수01-05]");
  assert.ok(adapter.getKoreanStandard("[4수01-07]"), "Should have [4수01-07] (분수)");
  assert.ok(adapter.getKoreanStandard("[4수01-10]"), "Should have [4수01-10] (동분모 덧셈)");
  assert.ok(adapter.getKoreanStandard("[6수01-01]"), "Should have [6수01-01] (약수/배수)");
  assert.ok(adapter.getKoreanStandard("[6수01-06]"), "Should have [6수01-06] (이분모 덧셈)");
  assert.ok(adapter.getKoreanStandard("[6수03-01]"), "Should have [6수03-01] (직육면체)");
  assert.ok(adapter.getKoreanStandard("[6수05-02]"), "Should have [6수05-02] (비율그래프)");

  // Elementary Science coverage: 3~4, 5~6 grade bands
  assert.ok(adapter.getKoreanStandard("[4과02-01]"), "Should have [4과02-01] (자석)");
  assert.ok(adapter.getKoreanStandard("[4과05-01]"), "Should have [4과05-01] (소리)");
  assert.ok(adapter.getKoreanStandard("[6과01-01]"), "Should have [6과01-01] (전기 회로)");
  assert.ok(adapter.getKoreanStandard("[6과07-01]"), "Should have [6과07-01] (광합성)");
  assert.ok(adapter.getKoreanStandard("[6과08-01]"), "Should have [6과08-01] (인체 기관계)");

  // Elementary Computing/SW coverage: [6실04-01] ~ [6실04-05]
  assert.ok(adapter.getKoreanStandard("[6실04-01]"), "Should have [6실04-01] (알고리즘)");
  assert.ok(adapter.getKoreanStandard("[6실04-02]"), "Should have [6실04-02] (블록 코딩)");
  assert.ok(adapter.getKoreanStandard("[6실04-03]"), "Should have [6실04-03] (제어 구조)");
  assert.ok(adapter.getKoreanStandard("[6실04-04]"), "Should have [6실04-04] (디버깅)");
  assert.ok(adapter.getKoreanStandard("[6실04-05]"), "Should have [6실04-05] (정보 윤리)");
});

test("Korea2022CurriculumAdapter - getKoreanStandard resolves with TaxonomyGraphEngine", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });
  const adapter = new Korea2022CurriculumAdapter({ graphEngine: engine });

  // Look up fraction standard [4수01-07]
  const std = adapter.getKoreanStandard("[4수01-07]");
  assert.ok(std);
  assert.equal(std.code, "[4수01-07]");
  assert.equal(std.subject, "수학");
  assert.equal(std.domain, "수와 연산");
  assert.ok(std.mappedTopics.length > 0, "Should have mapped micro-topics");

  // Check resolved topic details
  const firstTopic = std.mappedTopics[0];
  assert.ok(firstTopic.name, "Resolved topic should have name");
  assert.equal(firstTopic.subject, "Mathematics");
  assert.ok(firstTopic.domain === "Fractions" || firstTopic.domain.includes("Number"));

  // Stripped code lookup without brackets
  const bareStd = adapter.getKoreanStandard("4수01-07");
  assert.ok(bareStd);
  assert.equal(bareStd.code, "[4수01-07]");
});

test("Korea2022CurriculumAdapter - searchByKoreanStandardOrKeyword for Korean teachers", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });
  const adapter = new Korea2022CurriculumAdapter({ graphEngine: engine });

  // 1. Search by exact code
  const codeSearch = adapter.searchByKoreanStandardOrKeyword("6실04-01");
  assert.ok(codeSearch.standards.length >= 1);
  assert.equal(codeSearch.standards[0].code, "[6실04-01]");
  assert.ok(codeSearch.topics.length > 0, "Should retrieve mapped SW topics");

  // 2. Search by Korean term '분수'
  const fracSearch = adapter.searchByKoreanStandardOrKeyword("분수");
  assert.ok(fracSearch.standards.length >= 3, "Should match multiple fraction standards");
  assert.ok(fracSearch.topics.length >= 2, "Should resolve taxonomy topics for fractions");
  assert.ok(fracSearch.matchedTerms.some(t => t.korean === "분수"));

  // 3. Search by Korean term '광합성'
  const photoSearch = adapter.searchByKoreanStandardOrKeyword("광합성");
  assert.ok(photoSearch.standards.some(s => s.code === "[6과07-01]"));
  assert.ok(photoSearch.topics.length > 0);

  // 4. Search by Korean term '알고리즘'
  const algoSearch = adapter.searchByKoreanStandardOrKeyword("알고리즘");
  assert.ok(algoSearch.standards.some(s => s.code === "[6실04-01]"));
  assert.ok(algoSearch.topics.length > 0);
});

test("Korea2022CurriculumAdapter - mapTopicToStandards reverse lookup", () => {
  const adapter = new Korea2022CurriculumAdapter();

  // mt_a1FdAsRKOF is mapped to [4수01-10] (동분모 분수의 덧셈과 뺄셈)
  const standards = adapter.mapTopicToStandards("mt_a1FdAsRKOF");
  assert.ok(standards.length > 0);
  assert.ok(standards.some(s => s.code === "[4수01-10]"));

  // mt_5UtPmgdoQ9 is mapped to [6실04-04] (디버깅)
  const swStandards = adapter.mapTopicToStandards("mt_5UtPmgdoQ9");
  assert.ok(swStandards.length > 0);
  assert.ok(swStandards.some(s => s.code === "[6실04-04]"));
});
