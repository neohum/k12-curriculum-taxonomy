/**
 * K12TaxonomyServer
 *
 * High-performance standalone HTTP API server for K-12 Cognitive Hierarchy Ontology,
 * Prerequisite Diagnostic Backtracking, and 3-9-3 Lesson Scaffolding.
 *
 * Zero external npm dependencies (Node.js built-in http only), full CORS support,
 * and unified JSON input/output.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";
import { TaxonomyGraphEngine } from "../core/taxonomy/TaxonomyGraphEngine.mjs";
import {
  Korea2022K12CurriculumAdapter,
  K12_STANDARDS,
  K12_SPIRAL_CHAINS,
  K12_TERMINOLOGY_DICTIONARY
} from "../core/taxonomy/Korea2022K12CurriculumAdapter.mjs";
import { LessonPlannerRAG } from "../core/taxonomy/LessonPlannerRAG.mjs";
import { recommendConcreteManipulative } from "../core/taxonomy/DiagnosticAssessmentEngine.mjs";
import { EmpiricalWeightCalibrator } from "../core/taxonomy/EmpiricalWeightCalibrator.mjs";

const NEW_SPIRAL_CHAIN_KEYS = Object.freeze([
  "reading_comprehension",
  "english_grammar_ladder",
  "ratio_to_economy",
  "ethics_justice_evolution",
  "music_harmony_chain",
  "art_perspective_chain"
]);

/**
 * Helper to parse JSON body from incoming HTTP request.
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error("Request body exceeds 5MB limit"));
      }
    });
    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error(`Invalid JSON: ${err.message}`));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Helper to send JSON response.
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data, null, 2));
}

export class K12TaxonomyServer {
  /**
   * @param {Object} [options]
   * @param {TaxonomyGraphEngine} [options.graphEngine]
   * @param {Korea2022K12CurriculumAdapter} [options.adapter]
   * @param {LessonPlannerRAG} [options.lessonPlanner]
   * @param {number} [options.port=8088]
   * @param {string} [options.host="0.0.0.0"]
   */
  constructor(options = {}) {
    this.port = options.port || Number(process.env.PORT) || 8088;
    this.host = options.host || "0.0.0.0";
    this.server = null;
    this.startTime = Date.now();

    // Initialize engines
    this.graphEngine = options.graphEngine || new TaxonomyGraphEngine();
    this.graphEngine.ensureLoaded();
    this.graphEngine.ensureK12DependenciesLoaded();

    this.adapter = options.adapter || new Korea2022K12CurriculumAdapter({ graphEngine: this.graphEngine });
    this.lessonPlanner = options.lessonPlanner || new LessonPlannerRAG(this.graphEngine);
    this.calibrator = options.calibrator || new EmpiricalWeightCalibrator();

    const defaultPublicDir = fileURLToPath(new URL("../../public", import.meta.url));
    const cwdPublicDir = path.resolve(process.cwd(), "public");
    this.publicDir = options.publicDir || (fs.existsSync(cwdPublicDir) ? cwdPublicDir : defaultPublicDir);
  }

  /**
   * Serve static asset from public directory
   * @param {string} filePath
   * @param {http.ServerResponse} res
   * @returns {boolean}
   */
  serveStaticFile(filePath, res) {
    const safePath = path.normalize(path.join(this.publicDir, filePath));
    if (!safePath.startsWith(this.publicDir)) {
      return false;
    }
    if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
      return false;
    }

    const ext = path.extname(safePath).toLowerCase();
    const mimeTypes = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".mjs": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon"
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    const data = fs.readFileSync(safePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600"
    });
    res.end(data);
    return true;
  }

  /**
   * Start HTTP Server
   * @param {number} [customPort]
   * @returns {Promise<{ port: number, server: http.Server, url: string }>}
   */
  start(customPort) {
    if (customPort != null) {
      this.port = customPort;
    }

    return new Promise((resolve, reject) => {
      if (this.server) {
        return resolve({
          port: this.port,
          server: this.server,
          url: `http://${this.host === "0.0.0.0" ? "localhost" : this.host}:${this.port}`
        });
      }

      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch(err => {
          sendJson(res, 500, {
            error: "Internal Server Error",
            message: err.message
          });
        });
      });

      this.server.on("error", err => {
        reject(err);
      });

      this.server.listen(this.port, this.host, () => {
        const address = this.server.address();
        const actualPort = typeof address === "object" && address ? address.port : this.port;
        this.port = actualPort;
        const url = `http://${this.host === "0.0.0.0" ? "localhost" : this.host}:${actualPort}`;
        resolve({ port: actualPort, server: this.server, url });
      });
    });
  }

  /**
   * Stop HTTP Server
   * @returns {Promise<void>}
   */
  stop() {
    return new Promise(resolve => {
      if (!this.server) {
        return resolve();
      }
      this.server.close(() => {
        this.server = null;
        resolve();
      });
    });
  }

  /**
   * Main HTTP request router
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async handleRequest(req, res) {
    // 1. CORS Preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      });
      res.end();
      return;
    }

    const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = reqUrl.pathname;
    const method = req.method.toUpperCase();

    // 1-1. Static Web Dashboard & Assets
    if (method === "GET") {
      if (pathname === "/" || pathname === "/dashboard" || pathname === "/index.html") {
        if (this.serveStaticFile("index.html", res)) return;
      }
      if (pathname === "/taxonomy-dashboard.html") {
        if (this.serveStaticFile("taxonomy-dashboard.html", res)) return;
      }
      if (pathname.startsWith("/simulations/") || pathname.startsWith("/assets/")) {
        const relPath = pathname.slice(1);
        if (this.serveStaticFile(relPath, res)) return;
      }
    }

    // 2. GET /api/health
    if (method === "GET" && (pathname === "/api/health" || pathname === "/health")) {
      const standardsCount = K12_STANDARDS.length;
      return sendJson(res, 200, {
        status: "ok",
        uptime: (Date.now() - this.startTime) / 1000,
        timestamp: new Date().toISOString(),
        standardsCount
      });
    }

    // 2-1. Empirical Telemetry Stats & Ingestion
    if (method === "GET" && pathname === "/api/taxonomy/empirical-stats") {
      this.calibrator.applyToGraph(this.graphEngine);
      const snapshot = this.calibrator.toJSON();
      const topMisconceptions = this.calibrator.getMisconceptionHeatmap(10);
      return sendJson(res, 200, {
        status: "ok",
        calibrated: snapshot,
        topMisconceptions
      });
    }

    if (method === "POST" && pathname === "/api/taxonomy/empirical-ingest") {
      try {
        const body = await parseJsonBody(req);
        const events = body.events || (Array.isArray(body) ? body : [body]);
        this.calibrator.ingestBatch(events);
        this.calibrator.applyToGraph(this.graphEngine);
        return sendJson(res, 202, {
          status: "accepted",
          ingestedEventsCount: events.length
        });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // 3. GET /api/taxonomy/standards
    if (method === "GET" && pathname === "/api/taxonomy/standards") {
      const query = reqUrl.searchParams.get("query") || "";
      const subject = reqUrl.searchParams.get("subject") || null;
      const schoolLevel = reqUrl.searchParams.get("schoolLevel") || null;
      const limitParam = reqUrl.searchParams.get("limit");
      const limit = limitParam ? parseInt(limitParam, 10) : 20;

      const standards = this.adapter.searchK12Standards(query, {
        subject,
        schoolLevel,
        limit
      });

      return sendJson(res, 200, {
        total: standards.length,
        standards
      });
    }

    // 4. GET /api/taxonomy/chains
    if (method === "GET" && pathname === "/api/taxonomy/chains") {
      const allChains = Object.values(K12_SPIRAL_CHAINS).map(c => ({
        ...c,
        isNew: NEW_SPIRAL_CHAIN_KEYS.includes(c.key)
      }));
      const newChains = allChains.filter(c => c.isNew);

      return sendJson(res, 200, {
        chains: allChains,
        newChains,
        totalCount: allChains.length,
        newChainsCount: newChains.length
      });
    }

    // 5. GET /api/taxonomy/chain/:key
    if (method === "GET" && pathname.startsWith("/api/taxonomy/chain/")) {
      const chainKey = pathname.slice("/api/taxonomy/chain/".length).trim();
      if (!chainKey) {
        return sendJson(res, 400, { error: "Chain key must be provided in URL path" });
      }

      const chain = this.adapter.getSpiralCurriculumChain(chainKey);
      if (!chain) {
        return sendJson(res, 404, {
          error: `Spiral chain not found for key: '${chainKey}'`,
          availableKeys: Object.keys(K12_SPIRAL_CHAINS)
        });
      }

      return sendJson(res, 200, {
        key: chain.key,
        title: chain.title,
        description: chain.description,
        stages: chain.stages,
        stagesCount: chain.stagesCount,
        transitions: chain.transitions
      });
    }

    // 6. POST /api/taxonomy/diagnose
    if (method === "POST" && pathname === "/api/taxonomy/diagnose") {
      let body;
      try {
        body = await parseJsonBody(req);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }

      const { standardCode, mistakePattern, masteredCodes } = body;
      if (!standardCode) {
        return sendJson(res, 400, { error: "standardCode is required in request body" });
      }

      try {
        const mastered = Array.isArray(masteredCodes) ? masteredCodes : [];
        const diagnosis = this.graphEngine.diagnoseK12RemediationPath(standardCode, mastered);

        let remediationAdvice = null;
        if (mistakePattern) {
          const gapName = diagnosis.earliestFoundationalGap?.topic?.name || diagnosis.earliestFoundationalGap?.topicId || "선수 기초";
          remediationAdvice = `[오개념 패턴 분석] '${mistakePattern}' 교정을 위해 인지 결손 기초 단계 [${gapName}]부터 구체물 조작 비계를 적용한 재학습이 권장됩니다.`;
        }

        return sendJson(res, 200, {
          standardCode,
          mistakePattern: mistakePattern || null,
          remediationAdvice,
          ...diagnosis
        });
      } catch (err) {
        return sendJson(res, 400, {
          error: `Diagnosis failed: ${err.message}`,
          standardCode
        });
      }
    }

    // 7. POST /api/taxonomy/lesson-scaffold
    if (method === "POST" && pathname === "/api/taxonomy/lesson-scaffold") {
      let body;
      try {
        body = await parseJsonBody(req);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }

      const { standardCode, targetGrade, subject } = body;
      if (!standardCode) {
        return sendJson(res, 400, { error: "standardCode is required in request body" });
      }

      const standard = this.adapter.getK12Standard(standardCode);
      const normalizedCode = this.adapter.normalizeCode(standardCode);
      const resolvedSubject = subject || standard?.subject || "수학";
      const resolvedSchoolLevel = standard?.schoolLevel || "ES";

      // Ensure topic is indexed in graphEngine
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

      try {
        const topic = this.graphEngine.getTopic(topicId);
        const manipulative = recommendConcreteManipulative(topic || standard);
        const lessonPlan = this.lessonPlanner.generateLessonPlan(topicId);

        return sendJson(res, 200, {
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
        });
      } catch (err) {
        return sendJson(res, 500, {
          error: `Failed to generate lesson scaffold: ${err.message}`,
          standardCode
        });
      }
    }

    // 8. POST /api/taxonomy/tag-content
    if (method === "POST" && pathname === "/api/taxonomy/tag-content") {
      let body;
      try {
        body = await parseJsonBody(req);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }

      const { text, subject } = body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return sendJson(res, 400, { error: "text is required in request body" });
      }

      const cleanText = text.trim();
      const cleanSubject = subject ? subject.trim() : null;

      // 1. Check for explicit standard code in text (e.g. "[6수01-06]" or "6수01-06")
      const codeRegex = /\[?([1-9]|1[0-2])([가-힣]+)([0-9]{2})-([0-9]{2})\]?/g;
      const explicitCodes = [];
      let match;
      while ((match = codeRegex.exec(cleanText)) !== null) {
        explicitCodes.push(`[${match[1]}${match[2]}${match[3]}-${match[4]}]`);
      }

      // 2. Search standards matching query text
      const searchResults = this.adapter.searchK12Standards(cleanText, {
        subject: cleanSubject,
        limit: 10
      });

      // 3. Score standards based on explicit mention, keyword dictionary, and search
      const scoredMap = new Map();

      // Explicit code matches first
      for (const code of explicitCodes) {
        const std = this.adapter.getK12Standard(code);
        if (std) {
          scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 300 });
        }
      }

      // Search results
      for (const std of searchResults) {
        scoredMap.set(std.code, { standard: std, score: (scoredMap.get(std.code)?.score || 0) + 100 });
      }

      // Terminology dictionary matching
      const lowerText = cleanText.toLowerCase();
      for (const [term, meta] of Object.entries(K12_TERMINOLOGY_DICTIONARY)) {
        if (lowerText.includes(term.toLowerCase())) {
          // Find standards addressing this domain or subject
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

      // 4. Backtrack foundational prerequisites DAG if primary standard is identified
      let remediation = null;
      if (primaryStandard) {
        try {
          remediation = this.graphEngine.diagnoseK12RemediationPath(primaryStandard.code, []);
        } catch {
          remediation = null;
        }
      }

      return sendJson(res, 200, {
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
      });
    }

    // 9. Unknown route -> 404
    return sendJson(res, 404, {
      error: `Not Found: ${method} ${pathname}`,
      supportedEndpoints: [
        "GET /api/health",
        "GET /api/taxonomy/standards",
        "GET /api/taxonomy/chains",
        "GET /api/taxonomy/chain/:key",
        "POST /api/taxonomy/diagnose",
        "POST /api/taxonomy/lesson-scaffold",
        "POST /api/taxonomy/tag-content"
      ]
    });
  }
}

/**
 * Factory helper
 * @param {Object} [options]
 * @returns {K12TaxonomyServer}
 */
export function createK12TaxonomyServer(options = {}) {
  return new K12TaxonomyServer(options);
}
