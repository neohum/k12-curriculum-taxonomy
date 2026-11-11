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
  K12_SPIRAL_CHAINS
} from "../core/taxonomy/Korea2022K12CurriculumAdapter.mjs";
import { LessonPlannerRAG } from "../core/taxonomy/LessonPlannerRAG.mjs";
import { recommendConcreteManipulative } from "../core/taxonomy/DiagnosticAssessmentEngine.mjs";
import { EmpiricalWeightCalibrator } from "../core/taxonomy/EmpiricalWeightCalibrator.mjs";
import { loadOfficial } from "../core/kr2022/official.mjs";
import { DEFAULT_DECISIONS_PATH, handwrittenBasis, loadConfirmedLinks } from "../core/kr2022/handwritten-links.mjs";
import { searchStandards, tagContent, UnknownSourceError } from "../core/kr2022/standards-service.mjs";

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
    this.decisionsPath = options.decisionsPath || DEFAULT_DECISIONS_PATH;

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
      return sendJson(res, 200, {
        status: "ok",
        uptime: (Date.now() - this.startTime) / 1000,
        timestamp: new Date().toISOString(),
        standardsCount: loadOfficial().dataset.count,
        standardsSource: "official",
        handwrittenStandardsCount: K12_STANDARDS.length
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
      const p = reqUrl.searchParams;
      const limitParam = p.get("limit");
      try {
        return sendJson(res, 200, searchStandards({
          query: p.get("query") || "",
          id: p.get("id") || null,
          subject: p.get("subject") || null,
          schoolLevel: p.get("schoolLevel") || null,
          gradeBand: p.get("gradeBand") || null,
          limit: limitParam ? parseInt(limitParam, 10) : 20,
          source: p.get("source")
        }, { adapter: this.adapter, decisionsPath: this.decisionsPath }));
      } catch (err) {
        if (err instanceof UnknownSourceError) return sendJson(res, 400, { error: err.message });
        throw err;
      }
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
        newChainsCount: newChains.length,
        dataBasis: handwrittenBasis(loadConfirmedLinks(this.decisionsPath))
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
        transitions: chain.transitions,
        dataBasis: handwrittenBasis(
          loadConfirmedLinks(this.decisionsPath),
          (chain.stages || []).map(st => st.standardCode)
        )
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
          ...diagnosis,
          dataBasis: handwrittenBasis(loadConfirmedLinks(this.decisionsPath), [standardCode])
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
          lessonPlan,
          dataBasis: handwrittenBasis(loadConfirmedLinks(this.decisionsPath), [topicId])
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

      try {
        return sendJson(res, 200, tagContent(
          { text, subject, source: reqUrl.searchParams.get("source") ?? body.source },
          { adapter: this.adapter, graphEngine: this.graphEngine, decisionsPath: this.decisionsPath }
        ));
      } catch (err) {
        if (err instanceof UnknownSourceError) return sendJson(res, 400, { error: err.message });
        throw err;
      }
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
