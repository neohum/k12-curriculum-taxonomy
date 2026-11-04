import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { 
  Korea2022K12CurriculumAdapter, 
  K12_STANDARDS, 
  K12_CURRICULUM_DEPENDENCIES 
} from "./Korea2022K12CurriculumAdapter.mjs";

/**
 * @typedef {Object} DependencyEdge
 * @property {string} topicId
 * @property {string} prerequisiteId
 * @property {"hard"|"soft"} strength
 * @property {string} reason
 */

/**
 * Fast in-memory graph indexing and pedagogical diagnostic engine
 * for withmarbleapp/os-taxonomy.
 */
export class TaxonomyGraphEngine {
  /**
   * @param {Object} [options]
   * @param {Array<Object>} [options.topics]
   * @param {Array<DependencyEdge>} [options.dependencies]
   * @param {Array<Object>} [options.clusters]
   * @param {Array<Object>|Object} [options.teachingResearch]
   * @param {string} [options.basePath]
   */
  constructor(options = {}) {
    this.topicsById = new Map();
    this.clustersByKey = new Map();
    this.clustersBySubjectDomain = new Map();
    this.teachingResearchByTopicId = new Map();

    // Adjacency lists
    // topicId -> Array<{ prerequisiteId, strength, reason }>
    this.prerequisitesByTopicId = new Map();
    // prerequisiteId -> Array<{ dependentId, strength, reason }>
    this.dependentsByTopicId = new Map();

    this._k12Loaded = false;
    this._k12Adapter = null;

    const defaultPackageDataDir = fileURLToPath(new URL("../../../data/os-taxonomy", import.meta.url));
    const cwdDataDir = path.resolve(process.cwd(), "data/os-taxonomy");
    this.dataDir = options.basePath || (fs.existsSync(cwdDataDir) ? cwdDataDir : defaultPackageDataDir);

    if (options.topics && options.dependencies) {
      this.initFromData(options);
    } else {
      this.loadFromDirectory(this.dataDir);
    }
  }

  /**
   * Ensure data is loaded from disk if not yet loaded.
   */
  ensureLoaded() {
    if (this.topicsById.size === 0) {
      this.loadFromDirectory(this.dataDir);
    }
    return this;
  }

  /**
   * Alias for in-memory or sync loading
   */
  loadSync() {
    return this.ensureLoaded();
  }

  loadInMemory({ topics = [], dependencies = [], clusters = [], teachingResearch = [] } = {}) {
    return this.initFromData({ topics, dependencies, clusters, teachingResearch });
  }

  getResearch(topicId) {
    return this.teachingResearchByTopicId.get(topicId) || null;
  }

  getCommonMisconceptions(topicId) {
    const research = this.getResearch(topicId);
    if (!research) return [];
    return research.pedagogy?.commonMisconceptions || [];
  }

  getActivities(topicId) {
    const research = this.getResearch(topicId);
    if (!research) return [];
    return research.learn?.activities || [];
  }

  getEvidence(topicId) {
    const topic = this.getTopic(topicId);
    return topic?.evidence || [];
  }

  /**
   * Load JSON datasets from directory and index into graph structures.
   * @param {string} dirPath
   */
  loadFromDirectory(dirPath) {
    const topicsPath = path.join(dirPath, "topics.json");
    const dependenciesPath = path.join(dirPath, "dependencies.json");
    const clustersPath = path.join(dirPath, "clusters.json");
    const researchPath = path.join(dirPath, "teaching-research.json");

    const topicsData = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));
    const dependenciesData = JSON.parse(fs.readFileSync(dependenciesPath, "utf-8"));
    
    let clustersData = { clusters: [] };
    if (fs.existsSync(clustersPath)) {
      clustersData = JSON.parse(fs.readFileSync(clustersPath, "utf-8"));
    }

    let researchData = { records: [] };
    if (fs.existsSync(researchPath)) {
      researchData = JSON.parse(fs.readFileSync(researchPath, "utf-8"));
    }

    this.initFromData({
      topics: topicsData.topics || [],
      dependencies: dependenciesData.dependencies || [],
      clusters: clustersData.clusters || [],
      teachingResearch: researchData.records || []
    });
  }

  /**
   * In-memory indexing initialization
   */
  initFromData({ topics = [], dependencies = [], clusters = [], teachingResearch = [] }) {
    this.topicsById.clear();
    this.clustersByKey.clear();
    this.clustersBySubjectDomain.clear();
    this.teachingResearchByTopicId.clear();
    this.prerequisitesByTopicId.clear();
    this.dependentsByTopicId.clear();
    this._k12Loaded = false;

    // 1. Index topics
    for (const topic of topics) {
      this.topicsById.set(topic.id, topic);
      this.prerequisitesByTopicId.set(topic.id, []);
      this.dependentsByTopicId.set(topic.id, []);
    }

    // 2. Index clusters
    for (const cluster of clusters) {
      const key = `${cluster.subject}::${cluster.domain}::${cluster.ageRangeStart}`;
      this.clustersByKey.set(key, cluster);

      const sdKey = `${cluster.subject}::${cluster.domain}`;
      if (!this.clustersBySubjectDomain.has(sdKey)) {
        this.clustersBySubjectDomain.set(sdKey, []);
      }
      this.clustersBySubjectDomain.get(sdKey).push(cluster);
    }

    // 3. Index teaching research
    const records = Array.isArray(teachingResearch) 
      ? teachingResearch 
      : (teachingResearch.records || []);
    for (const record of records) {
      if (record && record.topicId) {
        this.teachingResearchByTopicId.set(record.topicId, record);
      }
    }

    // 4. Index dependencies into incoming prerequisites and outgoing dependents
    for (const dep of dependencies) {
      const { topicId, prerequisiteId, strength = "hard", reason = "" } = dep;

      // Incoming: topicId depends on prerequisiteId
      if (!this.prerequisitesByTopicId.has(topicId)) {
        this.prerequisitesByTopicId.set(topicId, []);
      }
      this.prerequisitesByTopicId.get(topicId).push({
        prerequisiteId,
        strength,
        reason
      });

      // Outgoing: prerequisiteId unlocks / is required by topicId
      if (!this.dependentsByTopicId.has(prerequisiteId)) {
        this.dependentsByTopicId.set(prerequisiteId, []);
      }
      this.dependentsByTopicId.get(prerequisiteId).push({
        dependentId: topicId,
        strength,
        reason
      });
    }
  }

  /**
   * Lazily loads K-12 Korean standards and cross-grade prerequisite dependencies into graph.
   */
  ensureK12DependenciesLoaded() {
    if (this._k12Loaded) return;
    this._k12Loaded = true;

    // 1. Index K-12 standards as topics if not already present
    for (const std of K12_STANDARDS) {
      if (!this.topicsById.has(std.code)) {
        this.topicsById.set(std.code, {
          id: std.code,
          name: std.statement,
          subject: std.subject,
          domain: std.domain,
          schoolLevel: std.schoolLevel,
          grade: std.grade,
          gradeCluster: std.gradeCluster,
          piagetStage: std.piagetStage,
          standards: [std.code],
          centrality: 0.05
        });
        if (!this.prerequisitesByTopicId.has(std.code)) {
          this.prerequisitesByTopicId.set(std.code, []);
        }
        if (!this.dependentsByTopicId.has(std.code)) {
          this.dependentsByTopicId.set(std.code, []);
        }
      }
    }

    // 2. Index K-12 cross-grade prerequisite dependencies
    for (const dep of K12_CURRICULUM_DEPENDENCIES) {
      const { topicId, prerequisiteId, strength = "hard", reason = "" } = dep;

      if (!this.prerequisitesByTopicId.has(topicId)) {
        this.prerequisitesByTopicId.set(topicId, []);
      }
      const prereqs = this.prerequisitesByTopicId.get(topicId);
      if (!prereqs.some(p => p.prerequisiteId === prerequisiteId)) {
        prereqs.push({ prerequisiteId, strength, reason });
      }

      if (!this.dependentsByTopicId.has(prerequisiteId)) {
        this.dependentsByTopicId.set(prerequisiteId, []);
      }
      const deps = this.dependentsByTopicId.get(prerequisiteId);
      if (!deps.some(d => d.dependentId === topicId)) {
        deps.push({ dependentId: topicId, strength, reason });
      }
    }
  }

  getK12Adapter() {
    if (!this._k12Adapter) {
      this._k12Adapter = new Korea2022K12CurriculumAdapter({ graphEngine: this });
    }
    return this._k12Adapter;
  }

  /**
   * Total indexed topic count
   */
  get topicCount() {
    return this.topicsById.size;
  }

  /**
   * Retrieve topic metadata with resolved clusters and teaching research.
   * @param {string} id
   * @returns {Object|null}
   */
  getTopic(id) {
    if (!id) return null;
    let raw = this.topicsById.get(id);

    if (!raw && typeof id === "string") {
      this.ensureK12DependenciesLoaded();
      raw = this.topicsById.get(id) || 
            this.topicsById.get(`[${id}]`) || 
            this.topicsById.get(id.replace(/[[\]]/g, ""));
    }

    if (!raw) return null;

    const clusterKey = `${raw.subject}::${raw.domain}::${raw.ageRangeStart}`;
    const primaryCluster = this.clustersByKey.get(clusterKey) || null;
    const relatedClusters = this.clustersBySubjectDomain.get(`${raw.subject}::${raw.domain}`) || [];
    const research = this.teachingResearchByTopicId.get(id) || null;

    const prereqEdges = this.prerequisitesByTopicId.get(raw.id || id) || [];
    const depEdges = this.dependentsByTopicId.get(raw.id || id) || [];

    return {
      ...raw,
      cluster: primaryCluster,
      clusters: relatedClusters,
      teachingResearch: research ? (research.pedagogy || research) : null,
      prerequisitesCount: prereqEdges.length,
      dependentsCount: depEdges.length
    };
  }

  /**
   * Search topics with optional subject, domain filters and ranking.
   * @param {string} query
   * @param {Object} [options]
   * @param {string} [options.subject]
   * @param {string} [options.domain]
   * @param {number} [options.limit=20]
   * @returns {Array<Object>}
   */
  searchTopics(query = "", { subject = null, domain = null, limit = 20 } = {}) {
    const cleanQuery = (query || "").trim().toLowerCase();
    const cleanSubject = subject ? subject.trim().toLowerCase() : null;
    const cleanDomain = domain ? domain.trim().toLowerCase() : null;

    const results = [];

    for (const [id, topic] of this.topicsById.entries()) {
      // Filter subject
      if (cleanSubject && (!topic.subject || topic.subject.toLowerCase() !== cleanSubject)) {
        continue;
      }

      // Filter domain
      if (cleanDomain && (!topic.domain || !topic.domain.toLowerCase().includes(cleanDomain))) {
        continue;
      }

      // If query is empty, add with baseline centrality score
      if (!cleanQuery) {
        results.push({
          topicId: id,
          score: (topic.centrality || 0) * 10
        });
        continue;
      }

      const name = (topic.name || "").toLowerCase();
      const desc = (topic.description || "").toLowerCase();
      const evidence = (topic.evidence || []).join(" ").toLowerCase();
      const standards = (topic.standards || []).join(" ").toLowerCase();

      let score = 0;
      if (id.toLowerCase() === cleanQuery) {
        score += 150;
      } else if (name === cleanQuery) {
        score += 100;
      } else if (name.startsWith(cleanQuery)) {
        score += 80;
      } else if (name.includes(cleanQuery)) {
        score += 60;
      } else if (desc.includes(cleanQuery)) {
        score += 35;
      } else if (evidence.includes(cleanQuery)) {
        score += 20;
      } else if (standards.includes(cleanQuery)) {
        score += 15;
      }

      if (score > 0) {
        score += (topic.centrality || 0) * 10;
        results.push({ topicId: id, score });
      }
    }

    results.sort((a, b) => b.score - a.score);

    const sliced = (typeof limit === "number" && limit > 0)
      ? results.slice(0, limit)
      : results;

    return sliced.map(r => this.getTopic(r.topicId));
  }

  /**
   * Returns prerequisite DAG for a topic with depth, strength, and reason.
   * @param {string} topicId
   * @param {Object|boolean} [options]
   * @param {boolean} [options.recursive=true]
   * @param {number} [options.depth=10]
   * @param {boolean} [options.hardOnly=false]
   * @returns {Array<Object>}
   */
  getPrerequisites(topicId, options = {}) {
    let resolvedId = topicId;
    if (!this.topicsById.has(resolvedId)) {
      this.ensureK12DependenciesLoaded();
      if (this.topicsById.has(`[${resolvedId}]`)) {
        resolvedId = `[${resolvedId}]`;
      } else if (this.topicsById.has(String(resolvedId).replace(/[[\]]/g, ""))) {
        resolvedId = String(resolvedId).replace(/[[\]]/g, "");
      }
    }

    if (!this.topicsById.has(resolvedId)) return [];

    const opts = typeof options === "boolean" ? { recursive: options } : (options || {});
    const { recursive = true, depth = 10, hardOnly = false } = opts;

    const maxDepth = recursive ? depth : 1;
    const visited = new Set();
    const result = [];
    const edges = [];

    // Queue holds { id, currentDepth }
    const queue = [{ id: resolvedId, currentDepth: 0 }];
    visited.add(resolvedId);

    while (queue.length > 0) {
      const { id: currentId, currentDepth } = queue.shift();
      if (currentDepth >= maxDepth) continue;

      const incoming = this.prerequisitesByTopicId.get(currentId) || [];
      for (const edge of incoming) {
        if (hardOnly && edge.strength !== "hard") continue;

        const prereqId = edge.prerequisiteId;
        const nextDepth = currentDepth + 1;

        edges.push({
          source: prereqId,
          target: currentId,
          strength: edge.strength,
          reason: edge.reason,
          depth: nextDepth
        });

        if (!visited.has(prereqId)) {
          visited.add(prereqId);
          const prereqTopic = this.getTopic(prereqId);
          result.push({
            topicId: prereqId,
            prerequisiteId: prereqId,
            topic: prereqTopic,
            depth: nextDepth,
            strength: edge.strength,
            reason: edge.reason,
            parentId: currentId
          });

          if (nextDepth < maxDepth) {
            queue.push({ id: prereqId, currentDepth: nextDepth });
          }
        }
      }
    }

    result.edges = edges;
    result.nodes = result.map(r => r.topic);
    return result;
  }

  /**
   * Returns topics unlocked by this topic (outgoing dependents).
   * @param {string} topicId
   * @param {Object|boolean} [options]
   * @param {boolean} [options.recursive=false]
   * @param {number} [options.depth=10]
   * @param {boolean} [options.hardOnly=false]
   * @returns {Array<Object>}
   */
  getDependents(topicId, options = {}) {
    let resolvedId = topicId;
    if (!this.topicsById.has(resolvedId)) {
      this.ensureK12DependenciesLoaded();
      if (this.topicsById.has(`[${resolvedId}]`)) {
        resolvedId = `[${resolvedId}]`;
      } else if (this.topicsById.has(String(resolvedId).replace(/[[\]]/g, ""))) {
        resolvedId = String(resolvedId).replace(/[[\]]/g, "");
      }
    }

    if (!this.topicsById.has(resolvedId)) return [];

    const opts = typeof options === "boolean" ? { recursive: options } : (options || {});
    const { recursive = false, depth = 10, hardOnly = false } = opts;

    const maxDepth = recursive ? depth : 1;
    const visited = new Set();
    const result = [];
    const edges = [];

    const queue = [{ id: resolvedId, currentDepth: 0 }];
    visited.add(resolvedId);

    while (queue.length > 0) {
      const { id: currentId, currentDepth } = queue.shift();
      if (currentDepth >= maxDepth) continue;

      const outgoing = this.dependentsByTopicId.get(currentId) || [];
      for (const edge of outgoing) {
        if (hardOnly && edge.strength !== "hard") continue;

        const depId = edge.dependentId;
        const nextDepth = currentDepth + 1;

        edges.push({
          source: currentId,
          target: depId,
          strength: edge.strength,
          reason: edge.reason,
          depth: nextDepth
        });

        if (!visited.has(depId)) {
          visited.add(depId);
          const depTopic = this.getTopic(depId);
          result.push({
            topicId: depId,
            dependentId: depId,
            topic: depTopic,
            depth: nextDepth,
            strength: edge.strength,
            reason: edge.reason,
            parentId: currentId
          });

          if (nextDepth < maxDepth) {
            queue.push({ id: depId, currentDepth: nextDepth });
          }
        }
      }
    }

    result.edges = edges;
    result.nodes = result.map(r => r.topic);
    return result;
  }

  /**
   * Backtrack along prerequisite hierarchy to find the root-cause deficit node.
   * @param {string} topicId
   * @param {Array<string>|Set<string>} [masteredTopicIds=[]]
   * @returns {{ rootCauseTopic: Object, path: Array<string> }}
   */
  backtrackRootCause(topicId, masteredTopicIds = []) {
    const mastered = new Set(Array.isArray(masteredTopicIds) ? masteredTopicIds : []);
    const path = [topicId];
    let currentId = topicId;

    while (true) {
      const prereqs = this.prerequisitesByTopicId.get(currentId) || [];
      const unmasteredPrereq = prereqs.find(p => !mastered.has(p.prerequisiteId));
      if (!unmasteredPrereq) {
        break;
      }
      currentId = unmasteredPrereq.prerequisiteId;
      path.push(currentId);
    }

    return {
      rootCauseTopic: this.getTopic(currentId) || { id: currentId, name: currentId },
      path
    };
  }

  /**
   * Traverses backward through prerequisites, identifies unmastered dependency nodes,
   * detects root-cause foundational gaps, and returns a step-by-step remediation path.
   *
   * @param {string} failedTopicId
   * @param {Array<string>} [masteredTopicIds=[]]
   * @returns {Object}
   */
  diagnoseRemediationPath(failedTopicId, masteredTopicIds = []) {
    const failedTopic = this.getTopic(failedTopicId);
    if (!failedTopic) {
      throw new Error(`Topic not found: ${failedTopicId}`);
    }

    const masteredSet = new Set(masteredTopicIds || []);

    // 1. Collect all prerequisite nodes recursively
    const allPrereqEntries = this.getPrerequisites(failedTopicId, { recursive: true, depth: 20 });
    const prereqNodesMap = new Map();
    for (const entry of allPrereqEntries) {
      if (!prereqNodesMap.has(entry.topicId)) {
        prereqNodesMap.set(entry.topicId, entry);
      }
    }

    // 2. Identify unmastered prerequisite nodes
    const unmasteredPrereqs = [];
    for (const [id, entry] of prereqNodesMap.entries()) {
      if (!masteredSet.has(id)) {
        unmasteredPrereqs.push(entry);
      }
    }

    // 3. Detect Root-Cause Foundational Gaps
    const unmasteredIds = new Set(unmasteredPrereqs.map(p => p.topicId));
    const rootCauses = [];

    for (const entry of unmasteredPrereqs) {
      const ownPrereqs = this.prerequisitesByTopicId.get(entry.topicId) || [];
      const hasUnmasteredPrereq = ownPrereqs.some(edge => 
        edge.strength === "hard" && !masteredSet.has(edge.prerequisiteId)
      );

      if (!hasUnmasteredPrereq) {
        rootCauses.push({
          topicId: entry.topicId,
          topic: entry.topic,
          depth: entry.depth,
          reason: entry.reason
        });
      }
    }

    // If the failedTopic itself has no unmastered prerequisites, it is its own gap
    if (unmasteredPrereqs.length === 0 && !masteredSet.has(failedTopicId)) {
      rootCauses.push({
        topicId: failedTopicId,
        topic: failedTopic,
        depth: 0,
        reason: "Target topic itself is unmastered with all prerequisites met"
      });
    }

    // 4. Generate topologically sorted remediation path
    const nodesToOrder = new Set(unmasteredIds);
    nodesToOrder.add(failedTopicId);

    const inDegree = new Map();
    const adjList = new Map();

    for (const id of nodesToOrder) {
      inDegree.set(id, 0);
      adjList.set(id, []);
    }

    for (const targetId of nodesToOrder) {
      const incomingEdges = this.prerequisitesByTopicId.get(targetId) || [];
      for (const edge of incomingEdges) {
        const sourceId = edge.prerequisiteId;
        if (nodesToOrder.has(sourceId)) {
          adjList.get(sourceId).push(targetId);
          inDegree.set(targetId, inDegree.get(targetId) + 1);
        }
      }
    }

    // Kahn's algorithm
    const topoQueue = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) {
        topoQueue.push(id);
      }
    }

    topoQueue.sort((a, b) => {
      const aRoot = rootCauses.some(r => r.topicId === a) ? 1 : 0;
      const bRoot = rootCauses.some(r => r.topicId === b) ? 1 : 0;
      if (aRoot !== bRoot) return bRoot - aRoot;
      const aDepth = prereqNodesMap.get(a)?.depth || 0;
      const bDepth = prereqNodesMap.get(b)?.depth || 0;
      return bDepth - aDepth;
    });

    const orderedIds = [];
    while (topoQueue.length > 0) {
      const current = topoQueue.shift();
      orderedIds.push(current);

      for (const next of adjList.get(current) || []) {
        inDegree.set(next, inDegree.get(next) - 1);
        if (inDegree.get(next) === 0) {
          topoQueue.push(next);
        }
      }
    }

    // Build step-by-step remediation path
    const remediationPath = orderedIds.map((id, index) => {
      const topicObj = this.getTopic(id);
      const isRoot = rootCauses.some(r => r.topicId === id);
      const isTarget = id === failedTopicId;
      const prereqMeta = prereqNodesMap.get(id);

      return {
        step: index + 1,
        topicId: id,
        name: topicObj?.name || id,
        subject: topicObj?.subject,
        domain: topicObj?.domain,
        isRootCause: isRoot,
        isTargetTopic: isTarget,
        depthFromTarget: isTarget ? 0 : (prereqMeta?.depth || 1),
        reason: prereqMeta?.reason || (isTarget ? "Target objective to achieve" : "Foundational prerequisite"),
        pedagogyGuidance: topicObj?.teachingResearch?.summary || null,
        topic: topicObj
      };
    });

    return {
      failedTopicId,
      failedTopic,
      isBlocked: unmasteredPrereqs.length > 0,
      unmasteredPrerequisites: unmasteredPrereqs.map(p => ({
        topicId: p.topicId,
        name: p.topic?.name || p.topicId,
        depth: p.depth,
        strength: p.strength,
        reason: p.reason,
        topic: p.topic
      })),
      rootCauses,
      rootCauseGap: rootCauses[0] || null,
      remediationPath,
      stepsCount: remediationPath.length,
      scaffoldingSummary: rootCauses.length > 0
        ? `Remediation begins at foundational gap [${rootCauses[0].topic?.name || rootCauses[0].topicId}], progressing through ${remediationPath.length} steps to master [${failedTopic.name}].`
        : `Target [${failedTopic.name}] has all prerequisites mastered and is ready for focused reteaching.`
    };
  }

  /**
   * Resolves the school level ('ES' | 'MS' | 'HS') for a topic or standard.
   * @param {Object|string} topicOrId
   * @returns {"ES"|"MS"|"HS"}
   */
  resolveSchoolLevel(topicOrId) {
    if (!topicOrId) return "ES";
    let topic = typeof topicOrId === "object" ? topicOrId : this.topicsById.get(topicOrId);

    if (!topic && typeof topicOrId === "string") {
      this.ensureK12DependenciesLoaded();
      topic = this.topicsById.get(topicOrId) || 
              this.topicsById.get(`[${topicOrId}]`) || 
              this.topicsById.get(topicOrId.replace(/[[\]]/g, "")) || 
              { id: topicOrId };
    }

    if (!topic) topic = { id: String(topicOrId) };

    // 1. Explicit schoolLevel attribute
    if (topic.schoolLevel) {
      const sl = String(topic.schoolLevel).toUpperCase();
      if (sl.includes("HIGH") || sl.includes("HS") || sl.includes("고등")) return "HS";
      if (sl.includes("MID") || sl.includes("MS") || sl.includes("중학")) return "MS";
      if (sl.includes("ELEM") || sl.includes("ES") || sl.includes("초등")) return "ES";
    }

    // 2. Check standards or topic ID for Korean curriculum codes
    const codes = [...(topic.standards || [])];
    if (topic.id) codes.push(topic.id);

    for (const code of codes) {
      const clean = String(code).trim().replace(/[[\]]/g, "");
      if (clean.startsWith("10") || clean.startsWith("11") || clean.startsWith("12") || clean.startsWith("고")) {
        return "HS";
      }
      if (clean.startsWith("9") || clean.startsWith("중") || clean.startsWith("MS")) {
        return "MS";
      }
      if (/^[1-6]/.test(clean) || clean.startsWith("초") || clean.startsWith("ES")) {
        return "ES";
      }
    }

    // 3. Target grade group or levels
    const gradeGroup = String(topic.targetGradeGroup || "").toUpperCase();
    if (gradeGroup.includes("HIGH") || gradeGroup.includes("고등")) return "HS";
    if (gradeGroup.includes("MID") || gradeGroup.includes("중학")) return "MS";
    if (gradeGroup.includes("ELEM") || gradeGroup.includes("초등")) return "ES";

    if (Array.isArray(topic.levels)) {
      if (topic.levels.some(l => String(l).includes("고등"))) return "HS";
      if (topic.levels.some(l => String(l).includes("중학"))) return "MS";
      if (topic.levels.some(l => String(l).includes("초등"))) return "ES";
    }

    // 4. Age range
    if (typeof topic.ageRangeStart === "number") {
      if (topic.ageRangeStart >= 15) return "HS";
      if (topic.ageRangeStart >= 12) return "MS";
      return "ES";
    }
    if (typeof topic.ageRangeEnd === "number") {
      if (topic.ageRangeEnd <= 12) return "ES";
      if (topic.ageRangeEnd <= 15) return "MS";
      return "HS";
    }

    return "ES";
  }

  /**
   * Resolves developmental Piaget stage for a topic.
   * @param {Object|string} topicOrId
   * @returns {string}
   */
  resolvePiagetStage(topicOrId) {
    const topic = typeof topicOrId === "object" ? topicOrId : (this.getTopic(topicOrId) || { id: topicOrId });
    if (topic && topic.piagetStage) {
      return topic.piagetStage;
    }
    const level = this.resolveSchoolLevel(topic);
    switch (level) {
      case "ES":
        return "Concrete Operational";
      case "MS":
        return "Early Formal Operational";
      case "HS":
        return "Formal Operational";
      default:
        return "Concrete Operational";
    }
  }

  /**
   * Scaffolding strategy aligned with Piagetian stage and Korean classroom pedagogy.
   */
  getPiagetScaffolding(schoolLevel, topicName = "") {
    switch (schoolLevel) {
      case "ES":
        return `[구체적 조작기 비계설정] 구체물(교구), 시각화 모델(수직선, 분수 막대, 영역 모델), 일상생활 조작 활동을 통한 직관적 개념 형성`;
      case "MS":
        return `[초기 형식적 조작기 비계설정] 구체적 모델에서 기호화/대수적 표상으로의 전이 비계, 그래프와 식의 상호 연계, 패턴 일반화`;
      case "HS":
        return `[형식적 조작기 비계설정] 형식적 정의, 추상적 기호 조작, 가설 연역적 추론, 엄밀한 논리 전개 및 수학적 증명/모델링`;
      default:
        return `단계별 맞춤형 비계설정 제공`;
    }
  }

  /**
   * Retrieves all topics matching the specified school level.
   *
   * @param {"ES"|"MS"|"HS"|"ALL"} [schoolLevel="ALL"]
   * @returns {Array<Object>}
   */
  getTopicsBySchoolLevel(schoolLevel = "ALL") {
    this.ensureLoaded();
    this.ensureK12DependenciesLoaded();
    const level = (schoolLevel || "ALL").toUpperCase();
    const allTopics = Array.from(this.topicsById.values());
    if (level === "ALL") {
      return allTopics;
    }
    return allTopics.filter(t => this.resolveSchoolLevel(t) === level);
  }

  /**
   * Cross-Grade K-12 Remediation Path Diagnostic Engine
   *
   * Traces prerequisite DAG across school levels (HS ➔ MS ➔ ES).
   * Identifies the earliest foundational cognitive gap (e.g. Failure in High School Calculus [12미적1-02-01]
   * ➔ traced back to Middle School Linear Function [9수03-03] ➔ traced back to Elementary Fraction Division [6수01-06]).
   * Returns step-by-step cross-grade remediation plan with Piagetian stage transitions
   * (Formal ➔ Early Formal ➔ Concrete Operational).
   *
   * @param {string} failedTopicId
   * @param {Array<string>} [masteredTopicIds=[]]
   * @returns {Object}
   */
  diagnoseK12RemediationPath(failedTopicId, masteredTopicIds = []) {
    this.ensureK12DependenciesLoaded();

    if (!failedTopicId) {
      throw new Error("failedTopicId must be provided");
    }

    let targetId = failedTopicId;
    if (!this.topicsById.has(targetId)) {
      if (this.topicsById.has(`[${targetId}]`)) {
        targetId = `[${targetId}]`;
      } else if (this.topicsById.has(String(targetId).replace(/[[\]]/g, ""))) {
        targetId = String(targetId).replace(/[[\]]/g, "");
      }
    }

    const failedTopic = this.getTopic(targetId);
    if (!failedTopic) {
      throw new Error(`Topic not found: ${failedTopicId}`);
    }

    const targetSchoolLevel = this.resolveSchoolLevel(failedTopic);
    const targetPiagetStage = this.resolvePiagetStage(failedTopic);

    // Build mastered set with both bare and bracketed forms
    const masteredSet = new Set();
    for (const m of (masteredTopicIds || [])) {
      masteredSet.add(m);
      if (typeof m === "string") {
        masteredSet.add(m.trim());
        masteredSet.add(`[${m.replace(/[[\]]/g, "").trim()}]`);
        masteredSet.add(m.replace(/[[\]]/g, "").trim());
      }
    }

    // 1. Collect all prerequisite nodes recursively
    const allPrereqEntries = this.getPrerequisites(targetId, { recursive: true, depth: 25 });
    const prereqNodesMap = new Map();
    for (const entry of allPrereqEntries) {
      if (!prereqNodesMap.has(entry.topicId)) {
        prereqNodesMap.set(entry.topicId, entry);
      }
    }

    // 2. Identify unmastered prerequisite nodes
    const unmasteredPrereqs = [];
    for (const [id, entry] of prereqNodesMap.entries()) {
      if (!masteredSet.has(id)) {
        unmasteredPrereqs.push(entry);
      }
    }

    // 3. Detect root-cause foundational gaps
    const unmasteredIds = new Set(unmasteredPrereqs.map(p => p.topicId));
    const rootCauses = [];

    for (const entry of unmasteredPrereqs) {
      const ownPrereqs = this.prerequisitesByTopicId.get(entry.topicId) || [];
      const hasUnmasteredPrereq = ownPrereqs.some(edge => 
        edge.strength === "hard" && !masteredSet.has(edge.prerequisiteId)
      );

      if (!hasUnmasteredPrereq) {
        const topicObj = this.getTopic(entry.topicId) || entry.topic;
        rootCauses.push({
          topicId: entry.topicId,
          topic: topicObj,
          schoolLevel: this.resolveSchoolLevel(topicObj || entry.topicId),
          piagetStage: this.resolvePiagetStage(topicObj || entry.topicId),
          depth: entry.depth,
          reason: entry.reason
        });
      }
    }

    // If target itself has no unmastered prerequisites, it is its own gap
    if (unmasteredPrereqs.length === 0 && !masteredSet.has(targetId)) {
      rootCauses.push({
        topicId: targetId,
        topic: failedTopic,
        schoolLevel: targetSchoolLevel,
        piagetStage: targetPiagetStage,
        depth: 0,
        reason: "Target topic itself is unmastered with all prerequisites met"
      });
    }

    // Sort root causes by school level hierarchy (ES < MS < HS) and then depth descending
    const levelOrder = { ES: 1, MS: 2, HS: 3 };
    rootCauses.sort((a, b) => {
      const aOrder = levelOrder[a.schoolLevel] || 2;
      const bOrder = levelOrder[b.schoolLevel] || 2;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.depth - a.depth;
    });

    const earliestFoundationalGap = rootCauses[0] || null;

    // 4. Topological sort (Kahn's Algorithm)
    const nodesToOrder = new Set(unmasteredIds);
    nodesToOrder.add(targetId);

    const inDegree = new Map();
    const adjList = new Map();

    for (const id of nodesToOrder) {
      inDegree.set(id, 0);
      adjList.set(id, []);
    }

    for (const currentTarget of nodesToOrder) {
      const incomingEdges = this.prerequisitesByTopicId.get(currentTarget) || [];
      for (const edge of incomingEdges) {
        const sourceId = edge.prerequisiteId;
        if (nodesToOrder.has(sourceId)) {
          adjList.get(sourceId).push(currentTarget);
          inDegree.set(currentTarget, inDegree.get(currentTarget) + 1);
        }
      }
    }

    const topoQueue = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) {
        topoQueue.push(id);
      }
    }

    topoQueue.sort((a, b) => {
      const aLevel = levelOrder[this.resolveSchoolLevel(a)] || 2;
      const bLevel = levelOrder[this.resolveSchoolLevel(b)] || 2;
      if (aLevel !== bLevel) return aLevel - bLevel;
      const aDepth = prereqNodesMap.get(a)?.depth || 0;
      const bDepth = prereqNodesMap.get(b)?.depth || 0;
      return bDepth - aDepth;
    });

    const orderedIds = [];
    while (topoQueue.length > 0) {
      const current = topoQueue.shift();
      orderedIds.push(current);

      for (const next of adjList.get(current) || []) {
        inDegree.set(next, inDegree.get(next) - 1);
        if (inDegree.get(next) === 0) {
          topoQueue.push(next);
        }
      }
    }

    // 5. Build step-by-step remediation path
    const remediationPath = orderedIds.map((id, index) => {
      const topicObj = this.getTopic(id);
      const isRoot = rootCauses.some(r => r.topicId === id);
      const isTarget = id === targetId;
      const prereqMeta = prereqNodesMap.get(id);
      const schoolLevel = this.resolveSchoolLevel(topicObj || id);
      const piagetStage = this.resolvePiagetStage(topicObj || id);

      return {
        step: index + 1,
        topicId: id,
        name: topicObj?.name || id,
        subject: topicObj?.subject,
        domain: topicObj?.domain,
        schoolLevel,
        piagetStage,
        isRootCause: isRoot,
        isTargetTopic: isTarget,
        depthFromTarget: isTarget ? 0 : (prereqMeta?.depth || 1),
        reason: prereqMeta?.reason || (isTarget ? "Target objective to achieve" : "Foundational prerequisite"),
        scaffoldingStrategy: this.getPiagetScaffolding(schoolLevel, topicObj?.name || id),
        pedagogyGuidance: topicObj?.teachingResearch?.summary || null,
        topic: topicObj
      };
    });

    // 6. Compute Cross-Grade and Piaget Stage Transitions
    const schoolLevelsTraversed = [];
    for (const step of remediationPath) {
      if (!schoolLevelsTraversed.includes(step.schoolLevel)) {
        schoolLevelsTraversed.push(step.schoolLevel);
      }
    }

    const backtrackSchoolLevels = [...schoolLevelsTraversed].reverse();

    const piagetStageProgression = remediationPath
      .map(s => s.piagetStage)
      .filter((stage, idx, arr) => arr.indexOf(stage) === idx)
      .join(" ➔ ");

    const backtrackProgression = remediationPath
      .map(s => s.piagetStage)
      .filter((stage, idx, arr) => arr.indexOf(stage) === idx)
      .reverse()
      .join(" ➔ ");

    const crossGradeTransitions = [];
    for (let i = 0; i < schoolLevelsTraversed.length - 1; i++) {
      const from = schoolLevelsTraversed[i];
      const to = schoolLevelsTraversed[i + 1];
      crossGradeTransitions.push({
        from,
        to,
        transition: `${from} ➔ ${to}`,
        piagetTransition: `${from === "ES" ? "Concrete Operational" : "Early Formal Operational"} ➔ ${to === "HS" ? "Formal Operational" : "Early Formal Operational"}`
      });
    }

    const summary = earliestFoundationalGap
      ? `Cross-grade diagnostic: Failure in [${failedTopic.name}] (${targetSchoolLevel}, ${targetPiagetStage}) traced back across school levels (${backtrackSchoolLevels.join(" ➔ ")}) to foundational cognitive gap [${earliestFoundationalGap.topic?.name || earliestFoundationalGap.topicId}] (${earliestFoundationalGap.schoolLevel}, ${earliestFoundationalGap.piagetStage}). Remediation progresses through ${remediationPath.length} steps (${piagetStageProgression}).`
      : `Target [${failedTopic.name}] has all prerequisites mastered and is ready for focused reteaching.`;

    return {
      failedTopicId: targetId,
      failedTopic,
      targetSchoolLevel,
      targetPiagetStage,
      isBlocked: unmasteredPrereqs.length > 0,
      unmasteredPrerequisites: unmasteredPrereqs.map(p => {
        const topicObj = this.getTopic(p.topicId) || p.topic;
        return {
          topicId: p.topicId,
          name: topicObj?.name || p.topicId,
          schoolLevel: this.resolveSchoolLevel(topicObj || p.topicId),
          piagetStage: this.resolvePiagetStage(topicObj || p.topicId),
          depth: p.depth,
          strength: p.strength,
          reason: p.reason,
          topic: topicObj
        };
      }),
      rootCauses,
      rootCauseGap: earliestFoundationalGap,
      earliestFoundationalGap,
      schoolLevelsTraversed,
      backtrackSchoolLevels,
      piagetStageProgression,
      backtrackProgression,
      crossGradeTransitions,
      remediationPath,
      stepsCount: remediationPath.length,
      scaffoldingSummary: summary
    };
  }

  /**
   * Computes all unmastered topics whose hard prerequisites are completely satisfied
   * by masteredTopicIds.
   *
   * @param {Array<string>} masteredTopicIds
   * @param {Object} [options]
   * @param {string} [options.subject=null]
   * @param {string} [options.domain=null]
   * @param {number} [options.limit=100]
   * @returns {Array<Object>}
   */
  computeReadyToLearn(masteredTopicIds = [], { subject = null, domain = null, limit = 100 } = {}) {
    const masteredSet = new Set(masteredTopicIds || []);
    const cleanSubject = subject ? subject.trim().toLowerCase() : null;
    const cleanDomain = domain ? domain.trim().toLowerCase() : null;

    const readyTopics = [];

    for (const [id, topic] of this.topicsById.entries()) {
      // Must not be already mastered
      if (masteredSet.has(id)) continue;

      // Filter subject if requested
      if (cleanSubject && (!topic.subject || topic.subject.toLowerCase() !== cleanSubject)) {
        continue;
      }

      // Filter domain if requested
      if (cleanDomain && (!topic.domain || !topic.domain.toLowerCase().includes(cleanDomain))) {
        continue;
      }

      // Check all hard prerequisites
      const prereqs = this.prerequisitesByTopicId.get(id) || [];
      const hardPrereqs = prereqs.filter(p => p.strength === "hard");

      const allHardSatisfied = hardPrereqs.every(p => masteredSet.has(p.prerequisiteId));

      if (allHardSatisfied) {
        const depEdges = this.dependentsByTopicId.get(id) || [];
        readyTopics.push({
          topicId: id,
          topic: this.getTopic(id),
          prerequisitesCount: prereqs.length,
          hardPrerequisitesCount: hardPrereqs.length,
          unlockedDependentsCount: depEdges.length,
          centrality: topic.centrality || 0
        });
      }
    }

    // Sort by pedagogical leverage: unlocks more future concepts first, then centrality
    readyTopics.sort((a, b) => {
      if (b.unlockedDependentsCount !== a.unlockedDependentsCount) {
        return b.unlockedDependentsCount - a.unlockedDependentsCount;
      }
      return b.centrality - a.centrality;
    });

    const sliced = (typeof limit === "number" && limit > 0)
      ? readyTopics.slice(0, limit)
      : readyTopics;

    return sliced.map(r => r.topic);
  }
}

/**
 * Standalone helper to retrieve topics by school level
 * @param {TaxonomyGraphEngine|string} engineOrSchoolLevel
 * @param {"ES"|"MS"|"HS"|"ALL"} [maybeSchoolLevel]
 * @returns {Array<Object>}
 */
export function getTopicsBySchoolLevel(engineOrSchoolLevel, maybeSchoolLevel) {
  if (engineOrSchoolLevel && typeof engineOrSchoolLevel.getTopicsBySchoolLevel === "function") {
    return engineOrSchoolLevel.getTopicsBySchoolLevel(maybeSchoolLevel);
  }
  const defaultEngine = new TaxonomyGraphEngine();
  return defaultEngine.getTopicsBySchoolLevel(engineOrSchoolLevel);
}
