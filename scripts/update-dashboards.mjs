import fs from "node:fs";

// 1. Re-generate latest ontology nodes with exact mapping
const adapter = await import("../src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs");
const { GRADE_COMPLETION_STANDARDS, ADDITIONAL_K12_DEPENDENCIES } = await import("./build-k12-full-ontology.mjs");

const allStandards = adapter.K12_STANDARDS;
const allDependencies = adapter.K12_CURRICULUM_DEPENDENCIES;

console.log(`Standards from adapter: ${allStandards.length}`);
console.log(`Dependencies from adapter: ${allDependencies.length}`);

// Map of code -> standard
const stdMap = new Map();
allStandards.forEach(s => stdMap.set(s.code, s));

// Build adjacency list for prerequisites
const prereqsByCode = new Map();
const depsByCode = new Map();
allStandards.forEach(s => {
  prereqsByCode.set(s.code, []);
  depsByCode.set(s.code, []);
});

for (const dep of allDependencies) {
  if (prereqsByCode.has(dep.topicId)) {
    prereqsByCode.get(dep.topicId).push(dep.prerequisiteId);
  }
  if (depsByCode.has(dep.prerequisiteId)) {
    depsByCode.get(dep.prerequisiteId).push(dep.topicId);
  }
}

// Grade X positions
const GRADE_X_BASE = {
  "초1": 80,
  "초1~2": 130,
  "초2": 190,
  "초3": 290,
  "초3~4": 340,
  "초4": 400,
  "초5": 500,
  "초5~6": 550,
  "초6": 610,
  "중1": 730,
  "중1~3": 790,
  "중2": 850,
  "중2~3": 910,
  "중3": 970,
  "고1": 1100,
  "고2": 1230,
  "고2~3": 1290,
  "고3": 1360
};

// Subject Y bands
const SUBJECT_Y_BANDS = {
  "수학": { min: 140, max: 480 },
  "공통수학": { min: 200, max: 320 },
  "대수": { min: 250, max: 400 },
  "미적분": { min: 320, max: 480 },
  "확률과 통계": { min: 140, max: 240 },
  "기하": { min: 380, max: 480 },
  
  "과학": { min: 540, max: 820 },
  "통합과학": { min: 580, max: 760 },
  "물리학": { min: 540, max: 640 },
  "화학": { min: 640, max: 720 },
  "생명과학": { min: 720, max: 800 },
  "지구과학": { min: 780, max: 840 },

  "국어": { min: 880, max: 1040 },
  "공통국어": { min: 900, max: 980 },
  "문학": { min: 940, max: 1040 },
  "독서와 작문": { min: 880, max: 960 },
  "화법과 언어": { min: 920, max: 1000 },

  "영어": { min: 1080, max: 1200 },
  "공통영어": { min: 1100, max: 1160 },
  "영어Ⅰ": { min: 1120, max: 1180 },
  "영어 독해와 작문": { min: 1140, max: 1200 },

  "사회": { min: 1260, max: 1420 },
  "통합사회": { min: 1280, max: 1360 },
  "역사": { min: 1320, max: 1400 },
  "한국사": { min: 1340, max: 1420 },
  "경제": { min: 1260, max: 1340 },
  "정치와 법": { min: 1300, max: 1380 },
  "사회·문화": { min: 1360, max: 1440 },

  "도덕": { min: 1480, max: 1580 },
  "생활과 윤리": { min: 1500, max: 1560 },
  "윤리와 사상": { min: 1520, max: 1580 },

  "실과(컴퓨팅)": { min: 1640, max: 1720 },
  "정보": { min: 1660, max: 1760 },
  "인공지능 기초": { min: 1700, max: 1780 },

  "음악": { min: 1820, max: 1880 },
  "미술": { min: 1880, max: 1940 },
  "체육": { min: 1940, max: 2000 },
  "기술·가정": { min: 2000, max: 2060 },
  "공학 일반": { min: 2040, max: 2080 }
};

// Canonical mapping for old 74 node IDs to standard codes
const HISTORICAL_NODE_ID_MAP = {
  "[3수01-07]": "mt_equal_part",
  "[4수01-10]": "mt_frac_add_like",
  "[9수02-02]": "mt_ms_algebra_var",
  "[9수03-03]": "mt_ms_linear_func",
  "[10공수1-01]": "mt_hs_poly_limits",
  "[12미적1-02-01]": "mt_hs_calculus_deriv",
  "[12미적1-03-06]": "mt_hs_calculus_integral",
  "[6수01-01]": "mt_elem_factors",
  "[9수02-01]": "mt_ms_monomial_rules",
  "[9수02-06]": "mt_ms_factorization",
  "[10공수1-03]": "mt_hs_poly_factor_advanced",
  "[6수02-01]": "mt_elem_ratio_rates",
  "[9수02-05]": "mt_ms_linear_system_2var",
  "[10공수1-06]": "mt_hs_matrix_mult_systems",
  "[3과02-02]": "mt_light_reflect",
  "[9과05-01]": "mt_light_refract",
  "[12물리03-01]": "mt_hs_wave_optics",
  "[9과02-01]": "mt_ms_forces_balanced",
  "[12물리01-04]": "mt_hs_newton_second",
  "[6실01-01]": "mt_elem_algo_pattern",
  "[9정02-01]": "mt_ms_algo_sorting",
  "[12인기01-01]": "mt_hs_ai_search_tree"
};

const subjectGradeCounters = {};

const nodes = [];

allStandards.forEach((std, idx) => {
  const code = std.code;
  const grade = std.grade || "초3~4";
  const subject = std.subject || "수학";
  const schoolLevel = std.schoolLevel || "ES";

  const historicalId = HISTORICAL_NODE_ID_MAP[code];
  const nodeId = historicalId || ("std_" + code.replace(/[[\]]/g, "").replace(/[-·]/g, "_"));

  let piagetKo = "구체적 조작기";
  if (grade === "초1" || grade === "초2" || grade === "초1~2") {
    piagetKo = "구체적 조작기";
  } else if (grade === "초3" || grade === "초4" || grade === "초3~4") {
    piagetKo = "구체적 조작기";
  } else if (grade === "초5" || grade === "초6" || grade === "초5~6") {
    piagetKo = "구체적 조작기 후기";
  } else if (schoolLevel === "MS") {
    piagetKo = "초기 형식적 조작기";
  } else if (schoolLevel === "HS") {
    piagetKo = "형식적 조작기";
  }

  let manip = std.manipulative;
  if (!manip) {
    if (subject.includes("수학") || subject.includes("대수") || subject.includes("미적분") || subject.includes("기하")) {
      if (grade.startsWith("초1") || grade.startsWith("초2")) manip = "ten-frame";
      else if (grade.startsWith("초3") || grade.startsWith("초4")) manip = "fraction-bars";
      else if (grade.startsWith("초5") || grade.startsWith("초6")) manip = "fraction-bars";
      else if (schoolLevel === "MS") manip = "balance-scale";
      else manip = "gradient-descent-surface";
    } else if (subject.includes("과학") || subject.includes("물리") || subject.includes("화학") || subject.includes("생명") || subject.includes("지구")) {
      if (grade.startsWith("초")) manip = "light-reflection";
      else if (schoolLevel === "MS") manip = "balance-scale";
      else manip = "light-reflection";
    } else if (subject.includes("국어") || subject.includes("문학") || subject.includes("독서") || subject.includes("화법")) {
      manip = "sentence-blocks";
    } else if (subject.includes("영어")) {
      manip = "sentence-blocks";
    } else if (subject.includes("사회") || subject.includes("역사") || subject.includes("경제") || subject.includes("정치")) {
      manip = "timeline-board";
    } else if (subject.includes("도덕") || subject.includes("윤리")) {
      manip = "concept-matrix";
    } else if (subject.includes("정보") || subject.includes("실과") || subject.includes("인공지능")) {
      manip = "concept-matrix";
    } else {
      manip = "pattern-blocks";
    }
  }

  let mis = std.misconception;
  if (!mis) {
    mis = `${std.domain || subject} 학습 시 선행 원리를 결여한 채 표면적 계산 공식이나 기계적 암기에만 의존하는 인지적 착각`;
  }

  const baseX = GRADE_X_BASE[grade] || 600;
  const band = SUBJECT_Y_BANDS[subject] || { min: 200, max: 400 };

  const counterKey = `${subject}::${grade}`;
  subjectGradeCounters[counterKey] = (subjectGradeCounters[counterKey] || 0) + 1;
  const itemIndex = subjectGradeCounters[counterKey] - 1;

  const xStagger = (itemIndex % 2 === 0 ? 0 : 30);
  const ySpan = band.max - band.min;
  const yOffset = (itemIndex * 35) % Math.max(40, ySpan);
  const finalX = baseX + xStagger;
  const finalY = band.min + yOffset;

  let name = std.name;
  if (!name) {
    const st = std.statement || "";
    const shortStmt = st.length > 28 ? st.slice(0, 26) + "..." : st;
    name = `${std.domain || subject}: ${shortStmt}`;
  }

  const prereqCodes = prereqsByCode.get(code) || [];
  const prereqNodeIds = prereqCodes.map(pc => {
    return HISTORICAL_NODE_ID_MAP[pc] || ("std_" + pc.replace(/[[\]]/g, "").replace(/[-·]/g, "_"));
  });

  let status = "mastered";
  if (idx % 7 === 0) status = "deficit";
  else if (idx % 3 === 0) status = "learning";

  const prereqCount = prereqCodes.length;
  const depCount = (depsByCode.get(code) || []).length;
  const centrality = Math.min(0.98, Math.max(0.70, 0.75 + (depCount * 0.04) + (prereqCount * 0.02)));

  nodes.push({
    id: nodeId,
    curriculumCode: code,
    subject: subject,
    domain: std.domain || subject,
    name: name,
    grade: grade,
    schoolLevel: schoolLevel,
    piagetStage: piagetKo,
    status: status,
    centrality: parseFloat(centrality.toFixed(2)),
    x: finalX,
    y: finalY,
    description: std.statement,
    prerequisites: prereqNodeIds,
    manipulative: manip,
    misconception: mis
  });
});

console.log(`Generated ${nodes.length} nodes for dashboard!`);

// Format TAXONOMY_DATA replacement string
const nodesJson = JSON.stringify(nodes, null, 2);
const taxonomyDataStr = `const TAXONOMY_DATA = {\n      nodes: ${nodesJson}\n    };`;

// Patch both public/taxonomy-dashboard.html and public/index.html
const targetFiles = ["public/taxonomy-dashboard.html", "public/index.html"];

for (const filePath of targetFiles) {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace TAXONOMY_DATA = { nodes: [...] };
  const regex = /const TAXONOMY_DATA = \{[\s\S]*?\n\s*\};/;
  if (regex.test(content)) {
    content = content.replace(regex, taxonomyDataStr);
    console.log(`Replaced TAXONOMY_DATA in ${filePath}`);
  } else {
    console.error(`TAXONOMY_DATA regex did not match in ${filePath}`);
  }

  // Ensure nodeMap registers both id, curriculumCode, and unbracketed code
  const nodeMapInitOld = `TAXONOMY_DATA.nodes.forEach(n => nodeMap.set(n.id, n));`;
  const nodeMapInitNew = `TAXONOMY_DATA.nodes.forEach(n => {
      nodeMap.set(n.id, n);
      if (n.curriculumCode) {
        nodeMap.set(n.curriculumCode, n);
        nodeMap.set(n.curriculumCode.replace(/[\\[\\]]/g, ""), n);
      }
    });`;
  if (content.includes(nodeMapInitOld)) {
    content = content.replace(nodeMapInitOld, nodeMapInitNew);
    console.log(`Updated nodeMap initialization in ${filePath}`);
  }

  // Update sidebar counter and title to reflect full K-12 coverage
  content = content.replace(
    /인지 위계 토픽 목록 \(\d+개 노드\)/g,
    `초1~고3 전주기 인지 위계 온톨로지 (${nodes.length}개 성취기준 노드)`
  );
  content = content.replace(
    /초등 3학년 분수부터 고등 미적분까지/g,
    `초등 1학년 기초부터 고등 3학년 심화·융합까지`
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated ${filePath} successfully!`);
}
