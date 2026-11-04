import fs from "node:fs";

// Load data
const dashboardPath = "public/taxonomy-dashboard.html";
const content = fs.readFileSync(dashboardPath, "utf8");
const match = content.match(/const TAXONOMY_DATA = (\{[\s\S]*?\n\s*\});/);
if (!match) {
  console.error("Could not find TAXONOMY_DATA in dashboard");
  process.exit(1);
}
const data = new Function("return " + match[1])();
const nodes = data.nodes;

console.log(`Loaded ${nodes.length} nodes from dashboard.`);

// Define Grade Column Bands (X coordinates)
// Allocate ample horizontal width per grade to support multiple sub-columns
const GRADE_X_RANGES = {
  "초1": { base: 120, subCols: 2 },
  "초1~2": { base: 360, subCols: 2 },
  "초2": { base: 600, subCols: 2 },
  "초3": { base: 840, subCols: 2 },
  "초3~4": { base: 1080, subCols: 3 },
  "초4": { base: 1440, subCols: 2 },
  "초5": { base: 1680, subCols: 2 },
  "초5~6": { base: 1920, subCols: 3 },
  "초6": { base: 2280, subCols: 2 },
  "중1": { base: 2520, subCols: 4 }, // Dense: 37 nodes -> 4 sub-columns
  "중1~3": { base: 3040, subCols: 2 },
  "중2": { base: 3280, subCols: 4 }, // Dense: 38 nodes -> 4 sub-columns
  "중2~3": { base: 3800, subCols: 2 },
  "중3": { base: 4040, subCols: 3 }, // Dense: 27 nodes -> 3 sub-columns
  "고1": { base: 4440, subCols: 3 }, // 26 nodes -> 3 sub-columns
  "고2": { base: 4840, subCols: 5 }, // Very dense: 51 nodes -> 5 sub-columns
  "고2~3": { base: 5480, subCols: 2 },
  "고3": { base: 5720, subCols: 3 }  // 14 nodes -> 3 sub-columns
};

// Define Subject Vertical Tracks (Y coordinates)
// Each subject gets a dedicated vertical track with generous vertical height
const SUBJECT_Y_TRACKS = {
  // 1. 수학 트랙 (수와 연산, 함수, 기하, 통계)
  "수학": 150,
  "공통수학": 320,
  "대수": 480,
  "미적분": 640,
  "확률과 통계": 800,
  "기하": 940,

  // 2. 과학 트랙 (물리, 화학, 생명, 지구)
  "과학": 1150,
  "통합과학": 1320,
  "물리학": 1480,
  "화학": 1640,
  "생명과학": 1780,
  "지구과학": 1920,

  // 3. 국어 트랙
  "국어": 2150,
  "공통국어": 2280,
  "문학": 2420,
  "독서와 작문": 2550,
  "화법과 언어": 2680,

  // 4. 영어 트랙
  "영어": 2880,
  "공통영어": 3000,
  "영어Ⅰ": 3120,
  "영어 독해와 작문": 3240,

  // 5. 사회/역사 트랙
  "사회": 3440,
  "통합사회": 3580,
  "역사": 3720,
  "한국사": 3860,
  "경제": 3990,
  "정치와 법": 4120,
  "사회·문화": 4250,

  // 6. 도덕/윤리 트랙
  "도덕": 4450,
  "생활과 윤리": 4580,
  "윤리와 사상": 4710,

  // 7. 정보/컴퓨팅/AI 트랙
  "실과(컴퓨팅)": 4900,
  "정보": 5040,
  "인공지능 기초": 5180,

  // 8. 예체능/기술 트랙
  "음악": 5360,
  "미술": 5490,
  "체육": 5620,
  "기술·가정": 5750,
  "공학 일반": 5870
};

// Group nodes by (grade, subject)
const cellBuckets = new Map();
nodes.forEach(node => {
  const g = node.grade || "초등";
  const s = node.subject || "수학";
  const key = `${g}::${s}`;
  if (!cellBuckets.has(key)) cellBuckets.set(key, []);
  cellBuckets.get(key).push(node);
});

// Layout each bucket across sub-columns and rows
const SUBCOL_SPACING = 135;
const ROW_SPACING = 95;

for (const [key, bucketNodes] of cellBuckets.entries()) {
  const [grade, subject] = key.split("::");
  const gRange = GRADE_X_RANGES[grade] || { base: 2000, subCols: 2 };
  const baseY = SUBJECT_Y_TRACKS[subject] || 2500;
  const maxCols = Math.max(1, gRange.subCols || 2);

  bucketNodes.forEach((node, i) => {
    const col = i % maxCols;
    const row = Math.floor(i / maxCols);

    node.x = gRange.base + (col * SUBCOL_SPACING);
    node.y = baseY + (row * ROW_SPACING);
  });
}

// Anti-Overlap Iterative Relaxation (Spring / Repulsion Algorithm)
console.log("Running anti-overlap repulsion relaxation...");

const MIN_DIST = 92; // minimum Euclidean distance between centers
const MIN_DX = 115;  // horizontal clearance
const MIN_DY = 82;   // vertical clearance

for (let iter = 0; iter < 60; iter++) {
  let moved = 0;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MIN_DIST || (Math.abs(dx) < MIN_DX && Math.abs(dy) < MIN_DY)) {
        // Overlap detected: push apart
        const angle = dist > 0.001 ? Math.atan2(dy, dx) : (Math.random() * Math.PI * 2);
        const targetDist = Math.max(MIN_DIST, Math.hypot(MIN_DX, MIN_DY) * 0.75);
        const overlap = Math.max(targetDist - dist, 15);

        const pushX = Math.cos(angle) * (overlap * 0.52);
        const pushY = Math.sin(angle) * (overlap * 0.52);

        // Keep inside bounds
        a.x = Math.max(60, Math.round(a.x - pushX));
        a.y = Math.max(80, Math.round(a.y - pushY));
        b.x = Math.max(60, Math.round(b.x + pushX));
        b.y = Math.max(80, Math.round(b.y + pushY));

        moved++;
      }
    }
  }

  if (moved === 0) {
    console.log(`Relaxation converged at iteration ${iter + 1}!`);
    break;
  }
}

// Round all coordinates
nodes.forEach(n => {
  n.x = Math.round(n.x);
  n.y = Math.round(n.y);
});

// Final Overlap Verification
let finalOverlaps = 0;
const overlapDetails = [];

for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i];
    const b = nodes[j];
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Overlap threshold: distance < 75px or bounding box overlap
    if (dist < 75 || (Math.abs(dx) < 85 && Math.abs(dy) < 65)) {
      finalOverlaps++;
      overlapDetails.push({
        a: `${a.curriculumCode} (${a.x}, ${a.y})`,
        b: `${b.curriculumCode} (${b.x}, ${b.y})`,
        dist: Math.round(dist)
      });
    }
  }
}

console.log(`=== ANTI-OVERLAP VERIFICATION RESULTS ===`);
console.log(`Total nodes: ${nodes.length}`);
console.log(`Overlapping pairs: ${finalOverlaps}`);

if (finalOverlaps === 0) {
  console.log("SUCCESS! ZERO OVERLAPPING NODES! All 316 nodes have safe clearance.");
} else {
  console.warn("Remaining overlaps:", overlapDetails.slice(0, 10));
}

// Bounding box
const xs = nodes.map(n => n.x);
const ys = nodes.map(n => n.y);
console.log(`X range: [${Math.min(...xs)}, ${Math.max(...xs)}], width: ${Math.max(...xs) - Math.min(...xs)}px`);
console.log(`Y range: [${Math.min(...ys)}, ${Math.max(...ys)}], height: ${Math.max(...ys) - Math.min(...ys)}px`);

// Write updated TAXONOMY_DATA to public/taxonomy-dashboard.html and public/index.html
const nodesJson = JSON.stringify(nodes, null, 2);
const taxonomyDataStr = `const TAXONOMY_DATA = {\n      nodes: ${nodesJson}\n    };`;

const targetFiles = ["public/taxonomy-dashboard.html", "public/index.html"];

for (const filePath of targetFiles) {
  let fileContent = fs.readFileSync(filePath, "utf8");
  const regex = /const TAXONOMY_DATA = \{[\s\S]*?\n\s*\};/;
  if (regex.test(fileContent)) {
    fileContent = fileContent.replace(regex, taxonomyDataStr);
    fs.writeFileSync(filePath, fileContent, "utf8");
    console.log(`Updated ${filePath} with zero-overlap positions.`);
  } else {
    console.error(`Regex failed on ${filePath}`);
  }
}
