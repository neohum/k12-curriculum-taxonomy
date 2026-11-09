/**
 * EmpiricalWeightCalibrator.mjs
 * 
 * Bayesian Knowledge Tracing & IRT 2PL Edge Weight Calibration Engine.
 * Converts real anonymous learning telemetry into dynamic graph edge weights
 * and empirical misconception transition probabilities for K-12 Curriculum Taxonomy.
 */

export class EmpiricalWeightCalibrator {
  constructor(options = {}) {
    this.minKAnonymity = options.minKAnonymity ?? 5; // k-anonymity gate
    this.nodeMetrics = new Map(); // standard_code or node_id -> NodeMetric
    this.edgeMetrics = new Map(); // "fromNode->toNode" -> EdgeMetric
  }

  /**
   * Ingests a batch of zero-PII learning telemetry events.
   * @param {Array<Object>} events 
   */
  ingestBatch(events) {
    if (!Array.isArray(events)) return;

    for (const ev of events) {
      const standardCode = ev.curriculum?.standard_code;
      const nodeId = ev.curriculum?.taxonomy_node_id || standardCode;
      if (!nodeId) continue;

      // 1. Update Node Metric
      let nm = this.nodeMetrics.get(nodeId);
      if (!nm) {
        nm = {
          nodeId,
          standardCode,
          subject: ev.curriculum?.subject || "통합",
          attempts: 0,
          correct: 0,
          totalLatencyMs: 0,
          errorPatterns: new Map(), // code -> count
          calibratedB: 0.0, // difficulty
          calibratedA: 1.0, // discrimination
        };
        this.nodeMetrics.set(nodeId, nm);
      }

      nm.attempts++;
      if (ev.interaction?.is_correct) {
        nm.correct++;
      }
      nm.totalLatencyMs += (ev.interaction?.latency_ms || 1000);

      const errCode = ev.interaction?.error_pattern_code;
      if (errCode) {
        nm.errorPatterns.set(errCode, (nm.errorPatterns.get(errCode) || 0) + 1);
      }

      // Re-calibrate IRT 2PL parameters
      this._calibrateNodeIRT(nm);
    }
  }

  /**
   * Records a coupled student interaction across a prerequisite pair (A -> B).
   * Used to estimate P(Fail B | Fail A).
   */
  recordCoupledAttempt(prereqId, targetId, prereqCorrect, targetCorrect) {
    const key = `${prereqId}->${targetId}`;
    let em = this.edgeMetrics.get(key);
    if (!em) {
      em = {
        prereqId,
        targetId,
        bothFailed: 0,
        prereqFailedTargetPassed: 0,
        prereqPassedTargetFailed: 0,
        bothPassed: 0,
        total: 0,
        transitionProb: 0.5, // Bayesian prior
      };
      this.edgeMetrics.set(key, em);
    }

    em.total++;
    if (!prereqCorrect && !targetCorrect) em.bothFailed++;
    else if (!prereqCorrect && targetCorrect) em.prereqFailedTargetPassed++;
    else if (prereqCorrect && !targetCorrect) em.prereqPassedTargetFailed++;
    else em.bothPassed++;

    // Empirical conditional probability: P(Fail B | Fail A)
    const prereqFailures = em.bothFailed + em.prereqFailedTargetPassed;
    if (prereqFailures >= this.minKAnonymity) {
      // Evidence-based calibration
      em.transitionProb = Math.round((em.bothFailed / prereqFailures) * 100) / 100;
    } else {
      // Prior smoothing
      const smoothed = (em.bothFailed + 1) / (prereqFailures + 2);
      em.transitionProb = Math.round(smoothed * 100) / 100;
    }
  }

  /**
   * Calibrates Item Response Theory (IRT 2PL) parameters:
   * Difficulty (b) and Discrimination (a).
   */
  _calibrateNodeIRT(nm) {
    if (nm.attempts < 1) return;
    const p = Math.max(0.01, Math.min(0.99, nm.correct / nm.attempts));
    
    // Logit transformation for difficulty parameter b:
    // b = -ln(p / (1 - p))
    // A high failure rate yields a high positive difficulty b (+2.0)
    // A high success rate yields an easy negative difficulty b (-2.0)
    const logit = -Math.log(p / (1.0 - p));
    nm.calibratedB = Math.round(Math.max(-3.0, Math.min(3.0, logit)) * 100) / 100;

    // Discrimination (a) estimates steepness based on error concentration
    const topErrorCount = Math.max(0, ...Array.from(nm.errorPatterns.values()));
    const errorEntropyRatio = nm.attempts > nm.correct ? topErrorCount / (nm.attempts - nm.correct) : 0.5;
    nm.calibratedA = Math.round((0.8 + errorEntropyRatio * 1.2) * 100) / 100;
  }

  /**
   * Applies calibrated empirical metrics directly onto TaxonomyGraphEngine adjacency lists.
   * @param {Object} graphEngine TaxonomyGraphEngine instance
   */
  applyToGraph(graphEngine) {
    if (!graphEngine || !graphEngine.prerequisitesByTopicId) return;

    for (const [topicId, prereqList] of graphEngine.prerequisitesByTopicId.entries()) {
      const cleanTopic = String(topicId).replace(/[[\]]/g, "");
      for (const edge of prereqList) {
        const prereqId = edge.prerequisiteId;
        const cleanPrereq = String(prereqId).replace(/[[\]]/g, "");

        // Match exact, cleaned, or bracketed
        const em = this.edgeMetrics.get(`${prereqId}->${topicId}`) ||
                   this.edgeMetrics.get(`${cleanPrereq}->${cleanTopic}`) ||
                   this.edgeMetrics.get(`[${cleanPrereq}]->[${cleanTopic}]`);

        if (em && em.total >= this.minKAnonymity) {
          edge.transitionProbability = em.transitionProb;
          edge.empiricalWeight = em.transitionProb;
          edge.empiricalSampleSize = em.total;
        } else {
          // Default heuristic prior based on strength
          edge.transitionProbability = edge.strength === "hard" ? 0.70 : 0.40;
          edge.empiricalWeight = edge.transitionProbability;
        }

        // Inject node difficulties if available
        const targetMetric = this.nodeMetrics.get(topicId) || this.nodeMetrics.get(cleanTopic);
        if (targetMetric && targetMetric.attempts >= this.minKAnonymity) {
          edge.targetDifficultyB = targetMetric.calibratedB;
        }
      }
    }
  }

  /**
   * Returns top misconceptions across standards.
   */
  getMisconceptionHeatmap(limit = 10) {
    const list = [];
    for (const [nodeId, nm] of this.nodeMetrics.entries()) {
      if (nm.attempts < this.minKAnonymity) continue;
      for (const [patternCode, count] of nm.errorPatterns.entries()) {
        list.push({
          nodeId,
          standardCode: nm.standardCode,
          subject: nm.subject,
          errorPatternCode: patternCode,
          occurrenceCount: count,
          misconceptionRate: Math.round((count / nm.attempts) * 100) / 100,
          difficultyB: nm.calibratedB,
        });
      }
    }

    list.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
    return list.slice(0, limit);
  }

  /**
   * Returns serializable snapshot for API endpoints.
   */
  toJSON() {
    const nodes = {};
    for (const [id, nm] of this.nodeMetrics.entries()) {
      nodes[id] = {
        ...nm,
        accuracy: nm.attempts > 0 ? Math.round((nm.correct / nm.attempts) * 100) / 100 : 0,
        errorPatterns: Object.fromEntries(nm.errorPatterns),
      };
    }

    const edges = {};
    for (const [k, em] of this.edgeMetrics.entries()) {
      edges[k] = em;
    }

    return {
      totalCalibratedNodes: this.nodeMetrics.size,
      totalCalibratedEdges: this.edgeMetrics.size,
      nodes,
      edges,
    };
  }
}
