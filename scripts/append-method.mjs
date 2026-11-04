import fs from "node:fs";

const p = "src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs";
let c = fs.readFileSync(p, "utf8");

const methodCode = `
  /**
   * Builds the complete K-12 cognitive hierarchy ontology DAG spanning Grade 1 to Grade 12 (초1~고3).
   * @returns {Object} { totalNodes, totalEdges, nodes, edges, summary }
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

const lastClose = c.lastIndexOf("}");
if (lastClose !== -1) {
  c = c.slice(0, lastClose) + methodCode + "\n}\n";
  fs.writeFileSync(p, c, "utf8");
  console.log("Successfully appended buildK12OntologyHierarchy to class!");
} else {
  console.error("Could not find class closing brace");
}
