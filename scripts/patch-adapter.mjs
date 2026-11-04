import fs from "node:fs";
import { GRADE_COMPLETION_STANDARDS, ADDITIONAL_K12_DEPENDENCIES } from "./build-k12-full-ontology.mjs";

const adapterPath = "src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs";
let content = fs.readFileSync(adapterPath, "utf8");

// 1. Check if GRADE_COMPLETION_STANDARDS already added
if (!content.includes("export const GRADE_COMPLETION_STANDARDS =")) {
  // Format standards string
  const stdsStr = `\n/**\n * Grade Completion Standards (초1, 초2, 초4, 초6, 고3 전주기 완비 성취기준)\n */\nexport const GRADE_COMPLETION_STANDARDS = Object.freeze(${JSON.stringify(GRADE_COMPLETION_STANDARDS, null, 2)});\n`;

  // Insert before export const K12_STANDARDS
  content = content.replace("export const K12_STANDARDS = Object.freeze([", stdsStr + "\nexport const K12_STANDARDS = Object.freeze([\n  ...GRADE_COMPLETION_STANDARDS,");
}

// 2. Add dependencies before the closing of K12_CURRICULUM_DEPENDENCIES
if (!content.includes("// ADDITIONAL K-12 PROGRESSION DEPENDENCIES")) {
  const depsFormatted = ADDITIONAL_K12_DEPENDENCIES.map(d => `  {\n    topicId: ${JSON.stringify(d.topicId)},\n    prerequisiteId: ${JSON.stringify(d.prerequisiteId)},\n    strength: ${JSON.stringify(d.strength)},\n    reason: ${JSON.stringify(d.reason)}\n  }`).join(",\n");
  const insertDeps = `,\n\n  // ADDITIONAL K-12 PROGRESSION DEPENDENCIES (초1~고3 나선형 연계)\n${depsFormatted}\n]);`;

  content = content.replace(/  \}\n\]\);\n\n\/\*\*\n \* Spiral Curriculum Progression Chains/, `  }${insertDeps}\n\n/**\n * Spiral Curriculum Progression Chains`);
}

// 3. Add buildK12OntologyHierarchy method to class if not present
if (!content.includes("buildK12OntologyHierarchy()")) {
  const methodCode = `
  /**
   * Builds the complete K-12 cognitive hierarchy ontology DAG spanning Grade 1 to Grade 12 (초1~고3).
   * @returns {Object} { totalNodes, nodes, edges, summary }
   */
  buildK12OntologyHierarchy() {
    const standards = K12_STANDARDS;
    const dependencies = K12_CURRICULUM_DEPENDENCIES;

    const prereqsByCode = new Map();
    const depsByCode = new Map();
    for (const s of standards) {
      prereqsByCode.set(s.code, []);
      depsByCode.set(s.code, []);
    }

    for (const dep of dependencies) {
      if (prereqsByCode.has(dep.topicId)) {
        prereqsByCode.get(dep.topicId).push({
          prerequisiteId: dep.prerequisiteId,
          strength: dep.strength,
          reason: dep.reason
        });
      }
      if (depsByCode.has(dep.prerequisiteId)) {
        depsByCode.get(dep.prerequisiteId).push({
          dependentId: dep.topicId,
          strength: dep.strength,
          reason: dep.reason
        });
      }
    }

    const nodes = standards.map(s => {
      const pList = prereqsByCode.get(s.code) || [];
      const dList = depsByCode.get(s.code) || [];
      return {
        ...s,
        k12Prerequisites: pList.map(p => p.prerequisiteId),
        k12Successors: dList.map(d => d.dependentId),
        prerequisitesCount: pList.length,
        successorsCount: dList.length
      };
    });

    const summary = {
      totalStandards: standards.length,
      totalDependencies: dependencies.length,
      bySchoolLevel: {},
      byGrade: {},
      bySubject: {}
    };

    for (const s of standards) {
      const lvl = s.schoolLevel || "ES";
      const grd = s.grade || s.gradeCluster || "전체";
      const sub = s.subject || "공통";

      summary.bySchoolLevel[lvl] = (summary.bySchoolLevel[lvl] || 0) + 1;
      summary.byGrade[grd] = (summary.byGrade[grd] || 0) + 1;
      summary.bySubject[sub] = (summary.bySubject[sub] || 0) + 1;
    }

    return {
      totalNodes: nodes.length,
      totalEdges: dependencies.length,
      nodes,
      edges: dependencies,
      summary
    };
  }
`;

  // Insert right before the last closing brace of the class
  content = content.replace(/\n\}\n\s*$/, `${methodCode}\n}\n`);
}

fs.writeFileSync(adapterPath, content, "utf8");
console.log("Successfully patched Korea2022K12CurriculumAdapter.mjs!");
