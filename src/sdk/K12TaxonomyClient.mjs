/**
 * K12TaxonomyClient (Universal SDK)
 *
 * Universal client for K-12 Cognitive Hierarchy Ontology, Cross-Grade Diagnostic Backtracking,
 * and 3-9-3 Lesson Scaffolding.
 *
 * Supports two operational modes:
 * 1. "remote": High-performance HTTP client utilizing standard `fetch` against K12TaxonomyServer.
 * 2. "in-process": Embedded zero-latency direct execution using local ontology graph and RAG engines.
 */

import { TaxonomyGraphEngine } from "../core/taxonomy/TaxonomyGraphEngine.mjs";
import {
  Korea2022K12CurriculumAdapter,
  K12_SPIRAL_CHAINS,
  K12_TERMINOLOGY_DICTIONARY,
  K12_STANDARDS
} from "../core/taxonomy/Korea2022K12CurriculumAdapter.mjs";
import { LessonPlannerRAG } from "../core/taxonomy/LessonPlannerRAG.mjs";
import { recommendConcreteManipulative } from "../core/taxonomy/DiagnosticAssessmentEngine.mjs";

export class K12TaxonomyClient {
  /**
   * @param {Object} [options]
   * @param {"remote"|"in-process"} [options.mode] - Defaults to "remote" if baseUrl is provided, otherwise "in-process"
   * @param {string} [options.baseUrl] - Base URL of K12TaxonomyServer (e.g. "http://localhost:8088")
   * @param {Function} [options.fetch] - Custom fetch implementation (defaults to globalThis.fetch)
   * @param {TaxonomyGraphEngine} [options.graphEngine] - In-process graph engine instance
   * @param {Korea2022K12CurriculumAdapter} [options.adapter] - In-process curriculum adapter instance
   * @param {LessonPlannerRAG} [options.lessonPlanner] - In-process lesson planner instance
   */
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || options.url || "").replace(/\/+$/, "");
    this.mode = options.mode || (this.baseUrl ? "remote" : "in-process");
    this.fetchFn = options.fetch || globalThis.fetch;

    if (this.mode === "in-process") {
      this.graphEngine = options.graphEngine || new TaxonomyGraphEngine();
      this.graphEngine.ensureLoaded();
      this.graphEngine.ensureK12DependenciesLoaded();

      this.adapter = options.adapter || new Korea2022K12CurriculumAdapter({ graphEngine: this.graphEngine });
      this.lessonPlanner = options.lessonPlanner || new LessonPlannerRAG(this.graphEngine);
    } else {
      this.graphEngine = options.graphEngine || null;
      this.adapter = options.adapter || null;
      this.lessonPlanner = options.lessonPlanner || null;
    }
  }

  /**
   * Remote HTTP request helper
   * @private
   */
  async _remoteRequest(path, { method = "GET", body = null, query = null } = {}) {
    if (!this.fetchFn) {
      throw new Error("fetch is not available in current environment");
    }

    let urlStr = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    if (query && typeof query === "object") {
      const searchParams = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v != null && v !== "") {
          searchParams.append(k, String(v));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        urlStr += (urlStr.includes("?") ? "&" : "?") + qs;
      }
    }

    const headers = {
      "Accept": "application/json"
    };

    const init = {
      method,
      headers
    };

    if (body != null) {
      headers["Content-Type"] = "application/json";
      init.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const res = await this.fetchFn(urlStr, init);
    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { responseText: text };
      }
    }

    if (!res.ok) {
      const errMsg = data?.error || data?.message || `HTTP ${res.status} ${res.statusText}`;
      const err = new Error(errMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  /**
   * Check service health and standards count
   * @returns {Promise<Object>}
   */
  async getHealth() {
    if (this.mode === "remote") {
      return this._remoteRequest("/api/health");
    }
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      standardsCount: K12_STANDARDS.length
    };
  }

  /**
   * Search 2022 Revised K-12 Standards
   *
   * @param {string} query - Keyword, code, or topic
   * @param {Object} [options]
   * @param {string} [options.subject]
   * @param {"ES"|"MS"|"HS"|"ALL"} [options.schoolLevel]
   * @param {number} [options.limit=20]
   * @returns {Promise<Array<Object>|Object>}
   */
  async searchStandards(query = "", options = {}) {
    if (this.mode === "remote") {
      const data = await this._remoteRequest("/api/taxonomy/standards", {
        query: {
          query,
          subject: options.subject,
          schoolLevel: options.schoolLevel,
          limit: options.limit
        }
      });
      return data.standards || data;
    }

    return this.adapter.searchK12Standards(query, {
      subject: options.subject,
      schoolLevel: options.schoolLevel,
      limit: options.limit || 20
    });
  }

  /**
   * Retrieve all spiral curriculum chains
   * @returns {Promise<Object>}
   */
  async getChains() {
    if (this.mode === "remote") {
      return this._remoteRequest("/api/taxonomy/chains");
    }
    const newKeys = [
      "reading_comprehension",
      "english_grammar_ladder",
      "ratio_to_economy",
      "ethics_justice_evolution",
      "music_harmony_chain",
      "art_perspective_chain"
    ];
    const allChains = Object.values(K12_SPIRAL_CHAINS).map(c => ({
      ...c,
      isNew: newKeys.includes(c.key)
    }));
    return {
      chains: allChains,
      newChains: allChains.filter(c => c.isNew),
      totalCount: allChains.length,
      newChainsCount: newKeys.length
    };
  }

  /**
   * Retrieve a specific spiral curriculum chain by key
   * @param {string} key
   * @returns {Promise<Object>}
   */
  async getChain(key) {
    if (!key) throw new Error("key is required");
    if (this.mode === "remote") {
      return this._remoteRequest(`/api/taxonomy/chain/${encodeURIComponent(key)}`);
    }

    const chain = this.adapter.getSpiralCurriculumChain(key);
    if (!chain) {
      throw new Error(`Spiral chain not found for key: ${key}`);
    }
    return chain;
  }

  /**
   * Cross-grade remediation diagnostic backtracking
   *
   * @param {Object} params
   * @param {string} params.standardCode - Target standard code (e.g. "[12미적1-02-01]")
   * @param {string} [params.mistakePattern] - Observed misconception or error description
   * @param {Array<string>} [params.masteredCodes=[]] - List of already mastered standards
   * @returns {Promise<Object>}
   */
  async diagnoseRemediation({ standardCode, mistakePattern, masteredCodes = [] } = {}) {
    if (!standardCode) {
      throw new Error("standardCode is required");
    }

    if (this.mode === "remote") {
      return this._remoteRequest("/api/taxonomy/diagnose", {
        method: "POST",
        body: {
          standardCode,
          mistakePattern,
          masteredCodes
        }
      });
    }

    const mastered = Array.isArray(masteredCodes) ? masteredCodes : [];
    const diagnosis = this.graphEngine.diagnoseK12RemediationPath(standardCode, mastered);

    let remediationAdvice = null;
    if (mistakePattern) {
      const gapName = diagnosis.earliestFoundationalGap?.topic?.name || diagnosis.earliestFoundationalGap?.topicId || "선수 기초";
      remediationAdvice = `[오개념 패턴 분석] '${mistakePattern}' 교정을 위해 인지 결손 기초 단계 [${gapName}]부터 구체물 조작 비계를 적용한 재학습이 권장됩니다.`;
    }

    return {
      standardCode,
      mistakePattern: mistakePattern || null,
      remediationAdvice,
      ...diagnosis
    };
  }

  /**
   * Generates a 3-9-3 scaffold structure and recommended concrete manipulative
   *
   * @param {Object} params
   * @param {string} params.standardCode
   * @param {string} [params.targetGrade]
   * @param {string} [params.subject]
   * @returns {Promise<Object>}
   */
  async getLessonScaffold({ standardCode, targetGrade, subject } = {}) {
    if (!standardCode) {
      throw new Error("standardCode is required");
    }

    if (this.mode === "remote") {
      return this._remoteRequest("/api/taxonomy/lesson-scaffold", {
        method: "POST",
        body: {
          standardCode,
          targetGrade,
          subject
        }
      });
    }

    const standard = this.adapter.getK12Standard(standardCode);
    const normalizedCode = this.adapter.normalizeCode(standardCode);
    const resolvedSubject = subject || standard?.subject || "수학";
    const resolvedSchoolLevel = standard?.schoolLevel || "ES";

    const topicId = standard?.code || normalizedCode;
    if (!this.graphEngine.topicsById.has(topicId)) {
      this.graphEngine.topicsById.set(topicId, {
        id: topicId,
        name: standard?.statement || standardCode,
        subject: resolvedSubject,
        domain: standard?.domain || "공통영역",
        schoolLevel: resolvedSchoolLevel,
        grade: targetGrade || standard?.grade,
        gradeCluster: standard?.gradeCluster,
        piagetStage: standard?.piagetStage,
        standards: [topicId]
      });
    }

    const topic = this.graphEngine.getTopic(topicId);
    const manipulative = recommendConcreteManipulative(topic || standard);
    const lessonPlan = this.lessonPlanner.generateLessonPlan(topicId);

    return {
      standardCode: topicId,
      standard: standard || null,
      targetGrade: targetGrade || standard?.grade || "초등",
      subject: resolvedSubject,
      schoolLevel: resolvedSchoolLevel,
      manipulative,
      scaffold393: lessonPlan.modular393,
      dialogScript: lessonPlan.dialogScript,
      rubric: lessonPlan.rubric,
      lessonPlan
    };
  }

  /**
   * Tags arbitrary lesson text with related 2022 Revised Standards and backtracks cognitive prerequisites
   *
   * @param {Object} params
   * @param {string} params.text
   * @param {string} [params.subject]
   * @returns {Promise<Object>}
   */
  async tagContent({ text, subject } = {}) {
    if (!text || typeof text !== "string" || !text.trim()) {
      throw new Error("text is required");
    }

    if (this.mode === "remote") {
      return this._remoteRequest("/api/taxonomy/tag-content", {
        method: "POST",
        body: {
          text,
          subject
        }
      });
    }

    const cleanText = text.trim();
    const cleanSubject = subject ? subject.trim() : null;

    // 1. Detect explicit code
    const codeRegex = /\[?([1-9]|1[0-2])([가-힣]+)([0-9]{2})-([0-9]{2})\]?/g;
    const explicitCodes = [];
    let match;
    while ((match = codeRegex.exec(cleanText)) !== null) {
      explicitCodes.push(`[${match[1]}${match[2]}${match[3]}-${match[4]}]`);
    }

    const searchResults = this.adapter.searchK12Standards(cleanText, {
      subject: cleanSubject,
      limit: 10
    });

    const scoredMap = new Map();

    for (const code of explicitCodes) {
      const std = this.adapter.getK12Standard(code);
      if (std) {
        scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 300 });
      }
    }

    for (const std of searchResults) {
      scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 100 });
    }

    const lowerText = cleanText.toLowerCase();
    for (const [term, meta] of Object.entries(K12_TERMINOLOGY_DICTIONARY)) {
      if (lowerText.includes(term.toLowerCase())) {
        const matched = this.adapter.searchK12Standards(term, {
          subject: cleanSubject || meta.subject,
          limit: 3
        });
        for (const std of matched) {
          scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 50 });
        }
      }
    }

    const scoredStandards = Array.from(scoredMap.values()).sort((a, b) => b.score - a.score);
    const matchedStandards = scoredStandards.map(s => s.standard);
    const primaryStandard = matchedStandards[0] || null;

    let remediation = null;
    if (primaryStandard) {
      try {
        remediation = this.graphEngine.diagnoseK12RemediationPath(primaryStandard.code, []);
      } catch {
        remediation = null;
      }
    }

    return {
      text: cleanText,
      subject: cleanSubject || primaryStandard?.subject || null,
      matchedStandardsCount: matchedStandards.length,
      matchedStandards,
      primaryStandard,
      foundationalPrerequisites: remediation?.unmasteredPrerequisites || [],
      earliestFoundationalGap: remediation?.earliestFoundationalGap || null,
      remediationPath: remediation?.remediationPath || [],
      piagetStageProgression: remediation?.piagetStageProgression || null,
      schoolLevelsTraversed: remediation?.schoolLevelsTraversed || []
    };
  }
}
