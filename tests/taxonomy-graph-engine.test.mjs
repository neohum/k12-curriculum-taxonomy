import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TaxonomyGraphEngine } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data/os-taxonomy");

test("TaxonomyGraphEngine - Fast in-memory graph indexing from disk", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  assert.ok(engine.topicCount >= 1800, `Expected at least 1800 topics, got ${engine.topicCount}`);
  assert.ok(engine.prerequisitesByTopicId.size >= 1800);
  assert.ok(engine.dependentsByTopicId.size >= 1800);
});

test("TaxonomyGraphEngine - getTopic resolves cluster and teaching research", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // Test topic with known teaching research: mt__00ZSLnB7p (Volume & Vibrations)
  const topic = engine.getTopic("mt__00ZSLnB7p");
  assert.ok(topic, "Topic should exist");
  assert.equal(topic.id, "mt__00ZSLnB7p");
  assert.equal(topic.subject, "Science");
  assert.equal(topic.domain, "Waves, Light & Sound");
  assert.ok(topic.prerequisitesCount > 0, "Should have prerequisites");

  // Check cluster resolution
  assert.ok(topic.cluster, "Should resolve primary cluster");
  assert.equal(topic.cluster.subject, "Science");
  assert.equal(topic.cluster.domain, "Waves, Light & Sound");
  assert.ok(topic.clusters.length > 0, "Should list domain clusters");

  // Check teaching research resolution
  assert.ok(topic.teachingResearch, "Should have teaching research attached");
  assert.ok(topic.teachingResearch.summary, "Teaching research should include summary");
  assert.ok(Array.isArray(topic.teachingResearch.bestPractices), "Should include bestPractices");
  assert.ok(Array.isArray(topic.teachingResearch.commonMisconceptions), "Should include commonMisconceptions");

  // Non-existent topic
  assert.equal(engine.getTopic("non-existent-topic-id"), null);
});

test("TaxonomyGraphEngine - searchTopics with subject filter and limit", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // Search 'algorithm' in Computing
  const computingHits = engine.searchTopics("algorithm", { subject: "Computing", limit: 5 });
  assert.ok(computingHits.length > 0, "Should find computing algorithm topics");
  assert.ok(computingHits.length <= 5, "Should respect limit");
  for (const hit of computingHits) {
    assert.equal(hit.subject, "Computing");
  }

  // Search 'fraction' in Mathematics
  const mathHits = engine.searchTopics("fraction", { subject: "Mathematics", limit: 10 });
  assert.ok(mathHits.length > 0, "Should find fraction topics");
  for (const hit of mathHits) {
    assert.equal(hit.subject, "Mathematics");
  }
});

test("TaxonomyGraphEngine - getPrerequisites returns DAG with depth and flags", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // mt__00ZSLnB7p depends on mt_VBl1T1sFCM and mt_YPSx5pbpVl
  const prereqs = engine.getPrerequisites("mt__00ZSLnB7p", { recursive: true, depth: 5 });
  assert.ok(prereqs.length >= 2, "Should return prerequisite nodes");

  const vblNode = prereqs.find(p => p.topicId === "mt_VBl1T1sFCM");
  assert.ok(vblNode, "mt_VBl1T1sFCM should be in prerequisites");
  assert.equal(vblNode.strength, "hard");
  assert.ok(vblNode.reason.length > 0);
  assert.equal(vblNode.depth, 1);
  assert.ok(vblNode.topic, "Resolved topic should be attached");

  // Check edge array attached
  assert.ok(Array.isArray(prereqs.edges));
  assert.ok(prereqs.edges.length >= 2);

  // Test hardOnly flag
  const hardOnlyPrereqs = engine.getPrerequisites("mt__00ZSLnB7p", { hardOnly: true });
  for (const p of hardOnlyPrereqs) {
    assert.equal(p.strength, "hard");
  }
});

test("TaxonomyGraphEngine - getDependents returns topics unlocked downstream", () => {
  const engine = new TaxonomyGraphEngine({ basePath: DATA_DIR });

  // mt_VBl1T1sFCM is required by mt__00ZSLnB7p
  const dependents = engine.getDependents("mt_VBl1T1sFCM", { recursive: false });
  assert.ok(dependents.length > 0, "Should have dependents");

  const unlockedTarget = dependents.find(d => d.topicId === "mt__00ZSLnB7p");
  assert.ok(unlockedTarget, "mt__00ZSLnB7p should be unlocked by mt_VBl1T1sFCM");
  assert.equal(unlockedTarget.depth, 1);
});

test("TaxonomyGraphEngine - diagnoseRemediationPath identifies gaps and scaffolds path", () => {
  // Use controlled synthetic taxonomy graph to verify diagnostic and topological logic
  const mockTopics = [
    { id: "foundational-number", name: "Counting 1 to 10", subject: "Math", domain: "Number", centrality: 0.1 },
    { id: "addition-basic", name: "Single Digit Addition", subject: "Math", domain: "Number", centrality: 0.2 },
    { id: "multiplication-concept", name: "Equal Groups & Multiplication", subject: "Math", domain: "Number", centrality: 0.3 },
    { id: "multi-digit-mult", name: "Multi-digit Multiplication", subject: "Math", domain: "Number", centrality: 0.4 }
  ];

  const mockDeps = [
    { topicId: "addition-basic", prerequisiteId: "foundational-number", strength: "hard", reason: "Need counting to add" },
    { topicId: "multiplication-concept", prerequisiteId: "addition-basic", strength: "hard", reason: "Repeated addition leads to multiplication" },
    { topicId: "multi-digit-mult", prerequisiteId: "multiplication-concept", strength: "hard", reason: "Algorithm builds on concept" }
  ];

  const engine = new TaxonomyGraphEngine({ topics: mockTopics, dependencies: mockDeps });

  // Student failed multi-digit-mult, mastered nothing
  const diag1 = engine.diagnoseRemediationPath("multi-digit-mult", []);
  assert.equal(diag1.isBlocked, true);
  assert.equal(diag1.unmasteredPrerequisites.length, 3);
  assert.equal(diag1.rootCauses.length, 1);
  assert.equal(diag1.rootCauseGap.topicId, "foundational-number");

  // Steps should be ordered from foundation up to target:
  // 1: foundational-number -> 2: addition-basic -> 3: multiplication-concept -> 4: multi-digit-mult
  assert.equal(diag1.remediationPath.length, 4);
  assert.equal(diag1.remediationPath[0].topicId, "foundational-number");
  assert.equal(diag1.remediationPath[1].topicId, "addition-basic");
  assert.equal(diag1.remediationPath[2].topicId, "multiplication-concept");
  assert.equal(diag1.remediationPath[3].topicId, "multi-digit-mult");

  // Student already mastered counting and basic addition
  const diag2 = engine.diagnoseRemediationPath("multi-digit-mult", ["foundational-number", "addition-basic"]);
  assert.equal(diag2.unmasteredPrerequisites.length, 1);
  assert.equal(diag2.rootCauseGap.topicId, "multiplication-concept");
  assert.equal(diag2.remediationPath.length, 2);
  assert.equal(diag2.remediationPath[0].topicId, "multiplication-concept");
  assert.equal(diag2.remediationPath[1].topicId, "multi-digit-mult");
});

test("TaxonomyGraphEngine - computeReadyToLearn finds topics whose hard prereqs are met", () => {
  const mockTopics = [
    { id: "T1", name: "Entry 1 (No prereq)", subject: "Computing", domain: "Intro", centrality: 0.1 },
    { id: "T2", name: "Entry 2 (No prereq)", subject: "Computing", domain: "Intro", centrality: 0.2 },
    { id: "T3", name: "Next (Requires T1)", subject: "Computing", domain: "Core", centrality: 0.3 },
    { id: "T4", name: "Advanced (Requires T1 & T2)", subject: "Computing", domain: "Core", centrality: 0.5 }
  ];

  const mockDeps = [
    { topicId: "T3", prerequisiteId: "T1", strength: "hard", reason: "T1 required" },
    { topicId: "T4", prerequisiteId: "T1", strength: "hard", reason: "T1 required" },
    { topicId: "T4", prerequisiteId: "T2", strength: "hard", reason: "T2 required" }
  ];

  const engine = new TaxonomyGraphEngine({ topics: mockTopics, dependencies: mockDeps });

  // When nothing is mastered, only T1 and T2 are ready to learn
  const initialReady = engine.computeReadyToLearn([], { subject: "Computing" });
  const readyIds = initialReady.map(t => t.id);
  assert.ok(readyIds.includes("T1"));
  assert.ok(readyIds.includes("T2"));
  assert.ok(!readyIds.includes("T3"));
  assert.ok(!readyIds.includes("T4"));

  // When T1 is mastered, T3 becomes ready (and T2 remains ready), but T4 still waits for T2
  const readyAfterT1 = engine.computeReadyToLearn(["T1"], { subject: "Computing" });
  const readyIdsAfterT1 = readyAfterT1.map(t => t.id);
  assert.ok(readyIdsAfterT1.includes("T3"), "T3 should now be ready to learn");
  assert.ok(readyIdsAfterT1.includes("T2"), "T2 remains ready");
  assert.ok(!readyIdsAfterT1.includes("T4"), "T4 still needs T2");

  // When both T1 and T2 are mastered, T4 becomes ready to learn!
  const readyAfterBoth = engine.computeReadyToLearn(["T1", "T2"], { subject: "Computing" });
  const readyIdsAfterBoth = readyAfterBoth.map(t => t.id);
  assert.ok(readyIdsAfterBoth.includes("T4"), "T4 is now ready to learn!");
});
