import fs from "node:fs";
import { ADDITIONAL_K12_DEPENDENCIES } from "./build-k12-full-ontology.mjs";

const p = "src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs";
let c = fs.readFileSync(p, "utf8");

// Export ADDITIONAL_K12_DEPENDENCIES
const addDepsStr = `\n/**\n * Additional K-12 Spiral Progression Dependencies (초1~고3 나선형 연계)\n */\nexport const ADDITIONAL_K12_DEPENDENCIES = Object.freeze(${JSON.stringify(ADDITIONAL_K12_DEPENDENCIES, null, 2)});\n`;

if (!c.includes("export const ADDITIONAL_K12_DEPENDENCIES")) {
  c = c.replace("export const K12_CURRICULUM_DEPENDENCIES = Object.freeze([", addDepsStr + "\nexport const K12_CURRICULUM_DEPENDENCIES = Object.freeze([\n  ...ADDITIONAL_K12_DEPENDENCIES,");
  fs.writeFileSync(p, c, "utf8");
  console.log("Successfully added ADDITIONAL_K12_DEPENDENCIES to K12_CURRICULUM_DEPENDENCIES!");
} else {
  console.log("Already included ADDITIONAL_K12_DEPENDENCIES");
}
