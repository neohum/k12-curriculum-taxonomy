import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EmpiricalWeightCalibrator } from '../src/core/taxonomy/EmpiricalWeightCalibrator.mjs';
import { TaxonomyGraphEngine } from '../src/core/taxonomy/TaxonomyGraphEngine.mjs';
import { K12TaxonomyServer } from '../src/server/K12TaxonomyServer.mjs';

test('Wave 3: EmpiricalWeightCalibrator updates IRT parameters b & a from telemetry', () => {
  const calibrator = new EmpiricalWeightCalibrator({ minKAnonymity: 5 });

  // Simulate 10 students attempting '4수01-08' with high failure rate (7 failures, 3 passes)
  const events = [];
  for (let i = 0; i < 10; i++) {
    events.push({
      curriculum: { standard_code: '4수01-08', taxonomy_node_id: 'math_fraction_add_sub' },
      interaction: {
        is_correct: i < 3, // only 3 correct (p = 0.30)
        latency_ms: 12000,
        error_pattern_code: i >= 3 ? 'ERR_DENOMINATOR_DIRECT_SUM' : null,
      },
    });
  }

  calibrator.ingestBatch(events);

  const snapshot = calibrator.toJSON();
  const metric = snapshot.nodes['math_fraction_add_sub'];
  assert.ok(metric);
  assert.equal(metric.attempts, 10);
  assert.equal(metric.correct, 3);
  assert.equal(metric.accuracy, 0.30);
  // High failure rate (p=0.30) must yield positive difficulty b > 0.5
  assert.ok(metric.calibratedB > 0.5, `Difficulty b should be > 0.5, got ${metric.calibratedB}`);

  // Check misconception heatmap
  const heatmap = calibrator.getMisconceptionHeatmap(5);
  assert.equal(heatmap.length, 1);
  assert.equal(heatmap[0].errorPatternCode, 'ERR_DENOMINATOR_DIRECT_SUM');
  assert.equal(heatmap[0].occurrenceCount, 7);
});

test('Wave 3: Calibrator computes empirical transition probability P(Fail Target | Fail Prereq)', () => {
  const calibrator = new EmpiricalWeightCalibrator({ minKAnonymity: 5 });

  const prereq = 'math_grade3_fraction_unit';
  const target = 'math_grade5_fraction_add';

  // 10 students who failed Prereq: 8 also failed Target, 2 passed Target
  for (let i = 0; i < 8; i++) {
    calibrator.recordCoupledAttempt(prereq, target, false, false);
  }
  for (let i = 0; i < 2; i++) {
    calibrator.recordCoupledAttempt(prereq, target, false, true);
  }

  const snapshot = calibrator.toJSON();
  const edge = snapshot.edges[`${prereq}->${target}`];
  assert.ok(edge);
  assert.equal(edge.bothFailed, 8);
  assert.equal(edge.total, 10);
  // 8 / (8 + 2) = 0.80 transition probability
  assert.equal(edge.transitionProb, 0.80);
});

test('Wave 3: GraphEngine receives empirical edge weights', () => {
  const graphEngine = new TaxonomyGraphEngine();
  graphEngine.ensureLoaded();
  graphEngine.ensureK12DependenciesLoaded();

  const calibrator = new EmpiricalWeightCalibrator({ minKAnonymity: 2 });
  // Record sample telemetry between 9수03-03 -> 12미적1-02-01
  calibrator.recordCoupledAttempt('9수03-03', '12미적1-02-01', false, false);
  calibrator.recordCoupledAttempt('9수03-03', '12미적1-02-01', false, false);
  calibrator.recordCoupledAttempt('9수03-03', '12미적1-02-01', true, true);

  calibrator.applyToGraph(graphEngine);

  const prereqs = graphEngine.getPrerequisites('12미적1-02-01') || [];
  assert.ok(prereqs.length > 0, 'Prerequisites should exist for 12미적1-02-01');
  // Check if transitionProbability field is populated
  const firstEdge = prereqs[0];
  assert.ok(typeof firstEdge.transitionProbability === 'number');
  assert.ok(firstEdge.transitionProbability > 0 && firstEdge.transitionProbability <= 1.0);
});

test('Wave 3: K12TaxonomyServer serves /api/taxonomy/empirical-stats endpoint', async () => {
  const server = new K12TaxonomyServer({ port: 9188 });
  await server.start();

  try {
    const res = await fetch('http://127.0.0.1:9188/api/taxonomy/empirical-stats');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.ok(data.calibrated);
    assert.ok(Array.isArray(data.topMisconceptions));
  } finally {
    await server.stop();
  }
});
