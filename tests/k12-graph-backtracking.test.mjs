import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TaxonomyGraphEngine, getTopicsBySchoolLevel } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data/os-taxonomy");

test("TaxonomyGraphEngine - getTopicsBySchoolLevel ('ES', 'MS', 'HS', 'ALL')", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // 1. Elementary topics
  const esTopics = engine.getTopicsBySchoolLevel("ES");
  assert.ok(esTopics.length > 0, "Should have elementary topics");
  for (const t of esTopics.slice(0, 50)) {
    assert.equal(engine.resolveSchoolLevel(t), "ES");
  }

  // 2. Middle school topics
  const msTopics = engine.getTopicsBySchoolLevel("MS");
  assert.ok(msTopics.length > 0, "Should have middle school topics");
  for (const t of msTopics.slice(0, 50)) {
    assert.equal(engine.resolveSchoolLevel(t), "MS");
  }

  // 3. High school topics
  const hsTopics = engine.getTopicsBySchoolLevel("HS");
  assert.ok(hsTopics.length > 0, "Should have high school topics");
  for (const t of hsTopics.slice(0, 50)) {
    assert.equal(engine.resolveSchoolLevel(t), "HS");
  }

  // 4. ALL topics
  const allTopics = engine.getTopicsBySchoolLevel("ALL");
  assert.equal(allTopics.length, engine.topicCount);

  // 5. Standalone helper function
  const helperEs = getTopicsBySchoolLevel(engine, "ES");
  assert.equal(helperEs.length, esTopics.length);

  const helperMs = getTopicsBySchoolLevel(engine, "MS");
  assert.equal(helperMs.length, msTopics.length);
});

test("TaxonomyGraphEngine - diagnoseK12RemediationPath traces HS Calculus [12미적1-02-01] back to ES Fraction Division [6수01-06]", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // High School student fails Calculus [12미적1-02-01] with nothing mastered
  const diag = engine.diagnoseK12RemediationPath("[12미적1-02-01]", []);

  // 1. Blocked status and unmastered prerequisites
  assert.equal(diag.isBlocked, true);
  assert.equal(diag.targetSchoolLevel, "HS");
  assert.equal(diag.targetPiagetStage, "Formal Operational");
  assert.equal(diag.unmasteredPrerequisites.length, 2);

  // 2. Earliest Foundational Gap should be Elementary School Fraction [6수01-06]
  assert.ok(diag.earliestFoundationalGap, "Should identify earliest foundational cognitive gap");
  assert.equal(diag.earliestFoundationalGap.topicId, "[6수01-06]");
  assert.equal(diag.earliestFoundationalGap.schoolLevel, "ES");
  assert.equal(diag.earliestFoundationalGap.piagetStage, "Concrete Operational");

  // 3. School levels traversed
  assert.deepEqual(diag.backtrackSchoolLevels, ["HS", "MS", "ES"]);
  assert.deepEqual(diag.schoolLevelsTraversed, ["ES", "MS", "HS"]);

  // 4. Piaget developmental transitions
  assert.equal(diag.backtrackProgression, "Formal Operational ➔ Early Formal Operational ➔ Concrete Operational");
  assert.equal(diag.piagetStageProgression, "Concrete Operational ➔ Early Formal Operational ➔ Formal Operational");

  // 5. Step-by-step remediation path
  assert.equal(diag.stepsCount, 3);
  const [step1, step2, step3] = diag.remediationPath;

  // Step 1: ES Concrete Operational
  assert.equal(step1.step, 1);
  assert.equal(step1.topicId, "[6수01-06]");
  assert.equal(step1.schoolLevel, "ES");
  assert.equal(step1.piagetStage, "Concrete Operational");
  assert.equal(step1.isRootCause, true);
  assert.ok(step1.scaffoldingStrategy.includes("구체적 조작기"));

  // Step 2: MS Early Formal Operational
  assert.equal(step2.step, 2);
  assert.equal(step2.topicId, "[9수03-03]");
  assert.equal(step2.schoolLevel, "MS");
  assert.equal(step2.piagetStage, "Early Formal Operational");
  assert.equal(step2.isRootCause, false);
  assert.ok(step2.scaffoldingStrategy.includes("초기 형식적 조작기"));

  // Step 3: HS Formal Operational
  assert.equal(step3.step, 3);
  assert.equal(step3.topicId, "[12미적1-02-01]");
  assert.equal(step3.schoolLevel, "HS");
  assert.equal(step3.piagetStage, "Formal Operational");
  assert.equal(step3.isTargetTopic, true);
  assert.ok(step3.scaffoldingStrategy.includes("형식적 조작기"));

  // 6. Cross-grade transitions metadata
  assert.equal(diag.crossGradeTransitions.length, 2);
  assert.equal(diag.crossGradeTransitions[0].from, "ES");
  assert.equal(diag.crossGradeTransitions[0].to, "MS");
  assert.equal(diag.crossGradeTransitions[1].from, "MS");
  assert.equal(diag.crossGradeTransitions[1].to, "HS");
});

test("TaxonomyGraphEngine - diagnoseK12RemediationPath partial mastery adapts remediation starting point", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // Student has already mastered Elementary Fraction Division [6수01-06]
  const diag = engine.diagnoseK12RemediationPath("[12미적1-02-01]", ["[6수01-06]"]);

  assert.equal(diag.isBlocked, true);
  assert.equal(diag.unmasteredPrerequisites.length, 1);
  assert.equal(diag.unmasteredPrerequisites[0].topicId, "[9수03-03]");

  // Root cause shifts up to Middle School [9수03-03]
  assert.equal(diag.earliestFoundationalGap.topicId, "[9수03-03]");
  assert.equal(diag.earliestFoundationalGap.schoolLevel, "MS");
  assert.equal(diag.earliestFoundationalGap.piagetStage, "Early Formal Operational");

  // Remediation now has 2 steps: [9수03-03] ➔ [12미적1-02-01]
  assert.equal(diag.stepsCount, 2);
  assert.equal(diag.remediationPath[0].topicId, "[9수03-03]");
  assert.equal(diag.remediationPath[1].topicId, "[12미적1-02-01]");
  assert.equal(diag.piagetStageProgression, "Early Formal Operational ➔ Formal Operational");

  // When both prerequisites are mastered: target is unblocked!
  const diagFull = engine.diagnoseK12RemediationPath("[12미적1-02-01]", ["[6수01-06]", "[9수03-03]"]);
  assert.equal(diagFull.isBlocked, false);
  assert.equal(diagFull.unmasteredPrerequisites.length, 0);
  assert.equal(diagFull.stepsCount, 1);
  assert.equal(diagFull.remediationPath[0].topicId, "[12미적1-02-01]");
});

test("TaxonomyGraphEngine - diagnoseK12RemediationPath across Algebra, Physics, AI, Matrix", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // 1. Algebra: HS [10공수1-03] ➔ MS [9수02-06] ➔ MS [9수02-01] ➔ ES [6수01-01]
  const algDiag = engine.diagnoseK12RemediationPath("[10공수1-03]", []);
  assert.equal(algDiag.targetSchoolLevel, "HS");
  assert.equal(algDiag.earliestFoundationalGap.topicId, "[6수01-01]");
  assert.equal(algDiag.earliestFoundationalGap.schoolLevel, "ES");
  assert.equal(algDiag.remediationPath[0].topicId, "[6수01-01]");
  assert.equal(algDiag.remediationPath[algDiag.stepsCount - 1].topicId, "[10공수1-03]");

  // 2. Balance to Matrix: HS [10공수1-06] ➔ MS [9수02-05] ➔ ES [6수02-01]
  const matrixDiag = engine.diagnoseK12RemediationPath("[10공수1-06]", []);
  assert.equal(matrixDiag.earliestFoundationalGap.topicId, "[6수02-01]");
  assert.equal(matrixDiag.earliestFoundationalGap.schoolLevel, "ES");

  // 3. Optics: HS [12물리03-01] ➔ MS [9과02-01] ➔ ES [4과07-01]
  const opticsDiag = engine.diagnoseK12RemediationPath("[12물리03-01]", []);
  assert.equal(opticsDiag.earliestFoundationalGap.topicId, "[4과07-01]");
  assert.equal(opticsDiag.earliestFoundationalGap.schoolLevel, "ES");

  // 4. AI & Computing: HS [12인기02-01] ➔ MS [9정03-03] ➔ ES [6실04-01]
  const aiDiag = engine.diagnoseK12RemediationPath("[12인기02-01]", []);
  assert.equal(aiDiag.earliestFoundationalGap.topicId, "[6실04-01]");
  assert.equal(aiDiag.earliestFoundationalGap.schoolLevel, "ES");
});

test("TaxonomyGraphEngine - diagnoseK12RemediationPath on custom in-memory mock DAG with explicit school levels", () => {
  const customTopics = [
    { id: "HS_QUANTUM", name: "Quantum Physics", schoolLevel: "HS" },
    { id: "MS_WAVES", name: "Wave Fundamentals", schoolLevel: "MS" },
    { id: "ES_LIGHT", name: "Light and Shadows", schoolLevel: "ES" }
  ];

  const customDeps = [
    { topicId: "HS_QUANTUM", prerequisiteId: "MS_WAVES", strength: "hard", reason: "Wave foundation needed" },
    { topicId: "MS_WAVES", prerequisiteId: "ES_LIGHT", strength: "hard", reason: "Light observation needed" }
  ];

  const engine = new TaxonomyGraphEngine({ topics: customTopics, dependencies: customDeps });

  const diag = engine.diagnoseK12RemediationPath("HS_QUANTUM", []);
  assert.equal(diag.isBlocked, true);
  assert.equal(diag.earliestFoundationalGap.topicId, "ES_LIGHT");
  assert.equal(diag.earliestFoundationalGap.schoolLevel, "ES");
  assert.equal(diag.earliestFoundationalGap.piagetStage, "Concrete Operational");

  assert.equal(diag.stepsCount, 3);
  assert.equal(diag.remediationPath[0].topicId, "ES_LIGHT");
  assert.equal(diag.remediationPath[1].topicId, "MS_WAVES");
  assert.equal(diag.remediationPath[2].topicId, "HS_QUANTUM");

  assert.equal(diag.piagetStageProgression, "Concrete Operational ➔ Early Formal Operational ➔ Formal Operational");
  assert.equal(diag.backtrackProgression, "Formal Operational ➔ Early Formal Operational ➔ Concrete Operational");
});
