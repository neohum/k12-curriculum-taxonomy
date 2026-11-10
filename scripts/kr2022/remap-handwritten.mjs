#!/usr/bin/env node
/**
 * 손작성 성취기준을 공식 2022 개정 성취기준(data/kr-2022/standards.json)에 재매핑한다.
 *
 *   node scripts/kr2022/remap-handwritten.mjs \
 *     [--standards data/kr-2022/standards.json] \
 *     [--handwritten <손작성 목록 JSON 배열; 생략하면 저장소 안 출처에서 수집>] \
 *     [--out review/kr2022-remap/handwritten-remap.json] \
 *     [--review-out review/kr2022-remap/handwritten-remap.review.json]
 *
 * 공식 파일이 없으면 종료 코드 2로 멈춘다.
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  AMBIGUITY_MARGIN, CANDIDATE_FLOOR, MATCH_THRESHOLD, MAX_CANDIDATES, METHOD,
  REVIEW_MARGIN_BELOW, REVIEW_SCORE_BELOW,
  StandardsFileError, loadOfficialStandards, mergeHandwritten, remapAll
} from "../../src/core/kr2022/remap.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * 저장소 안 손작성 성취기준 출처.
 * - build-k12-full-ontology.mjs의 GRADE_COMPLETION_STANDARDS는 K12 어댑터의 같은 이름
 *   배열과 51건 전부 (코드, 문장)이 같고, import하면 console.log 부작용이 있어 넣지 않는다.
 * - LessonLabCurriculumBridge.ts는 TypeScript라 타입 제거를 지원하는 Node에서만 읽힌다.
 *   못 읽으면 건너뛰고 산출물 inputs에 skipped로 남긴다.
 */
const HANDWRITTEN_SOURCES = [
  { file: "src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs", exportName: "K12_STANDARDS" },
  { file: "src/core/taxonomy/Korea2022CurriculumAdapter.mjs", exportName: "KOREA_2022_STANDARDS" },
  { file: "src/core/taxonomy/MarketCurriculumTagger.mjs", exportName: "CORE_CURRICULUM_STANDARDS" },
  { file: "src/core/taxonomy/LessonLabCurriculumBridge.ts", exportName: "CORE_K12_STANDARDS", optional: true }
];

async function collectRepoHandwritten() {
  const lists = [];
  const report = [];
  for (const src of HANDWRITTEN_SOURCES) {
    const id = `${src.file}#${src.exportName}`;
    try {
      const mod = await import(pathToFileURL(path.join(ROOT, src.file)).href);
      const arr = mod[src.exportName];
      if (!Array.isArray(arr)) throw new Error(`${src.exportName} export가 배열이 아님`);
      lists.push({ source: id, standards: arr });
      report.push({ source: id, items: arr.length });
    } catch (err) {
      if (!src.optional) throw err;
      process.stderr.write(`경고: ${id}를 읽지 못해 건너뜁니다 (${err.message.split("\n")[0]})\n`);
      report.push({ source: id, items: 0, skipped: err.message.split("\n")[0] });
    }
  }
  return { lists, report };
}

function rel(p) {
  return path.relative(ROOT, path.resolve(p)).split(path.sep).join("/");
}

async function main() {
  const { values } = parseArgs({
    options: {
      standards: { type: "string", default: path.join(ROOT, "data/kr-2022/standards.json") },
      handwritten: { type: "string" },
      out: { type: "string", default: path.join(ROOT, "review/kr2022-remap/handwritten-remap.json") },
      "review-out": { type: "string", default: path.join(ROOT, "review/kr2022-remap/handwritten-remap.review.json") }
    }
  });

  const official = loadOfficialStandards(values.standards);

  let lists;
  let sourceReport;
  if (values.handwritten) {
    const arr = JSON.parse(fs.readFileSync(values.handwritten, "utf8"));
    if (!Array.isArray(arr)) throw new Error(`--handwritten 파일은 JSON 배열이어야 합니다: ${values.handwritten}`);
    lists = [{ source: rel(values.handwritten), standards: arr }];
    sourceReport = [{ source: rel(values.handwritten), items: arr.length }];
  } else {
    ({ lists, report: sourceReport } = await collectRepoHandwritten());
  }

  const handwritten = mergeHandwritten(lists);
  const { items, stats, reviewQueue } = remapAll(handwritten, official.standards);

  const method = {
    name: METHOD,
    thresholds: {
      MATCH_THRESHOLD, AMBIGUITY_MARGIN, CANDIDATE_FLOOR, MAX_CANDIDATES,
      REVIEW_SCORE_BELOW, REVIEW_MARGIN_BELOW
    },
    filter: "같은 교과(교과명 또는 과목명) + 같은 학년군(초등은 1~2/3~4/5~6, 중·고는 학교급)",
    thresholdNote: "임계값은 공식 데이터를 보기 전에 정한 값이며 정확도가 검증된 것이 아님. 근거는 src/core/kr2022/remap.mjs 주석."
  };
  const inputs = {
    standards: { path: rel(values.standards), count: official.standards.length, source: official.source ?? null },
    handwritten: { sources: sourceReport, rawItems: sourceReport.reduce((n, s) => n + s.items, 0), uniqueItems: handwritten.length }
  };

  const remapDoc = {
    schemaVersion: 1,
    generatedBy: "scripts/kr2022/remap-handwritten.mjs",
    humanVerified: false,
    statusMeaning: "matched/ambiguous/unmapped는 문자 bigram 유사도에 따른 자동 판정이며 사람이 확인하지 않았습니다. matched도 공식 매핑이 아니라 검토 후보입니다.",
    notice: "addedByUs의 내용(오개념, 교구, 피아제 단계, 키워드, Marble 토픽 매핑 등)은 고시 원문이 아니라 이 저장소가 덧붙인 것입니다. oldText도 고시 원문이 아닌 손작성 문장입니다.",
    method,
    inputs,
    stats: { ...stats, reviewQueue: reviewQueue.length },
    items
  };
  const reviewDoc = {
    schemaVersion: 1,
    generatedBy: "scripts/kr2022/remap-handwritten.mjs",
    humanVerified: false,
    notice: "자동 판정(matched 포함)을 사람이 확인해야 하는 항목. matched가 아닌 항목은 선수관계 생성에 쓰이지 않습니다.",
    method,
    items: reviewQueue
  };

  for (const [file, doc] of [[values.out, remapDoc], [values["review-out"], reviewDoc]]) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
  }

  console.log(`손작성 출처: ${sourceReport.map(s => `${s.source}=${s.items}${s.skipped ? "(건너뜀)" : ""}`).join(", ")}`);
  console.log(`손작성 항목: 원본 ${inputs.handwritten.rawItems}건 → (코드, 문장) 중복 제거 ${handwritten.length}건`);
  console.log(`공식 성취기준: ${official.standards.length}건`);
  console.log(`matched ${stats.matched} / ambiguous ${stats.ambiguous} / unmapped ${stats.unmapped} / 검토 큐 ${reviewQueue.length}`);
  console.log(`출력: ${rel(values.out)}, ${rel(values["review-out"])}`);
}

main().catch(err => {
  if (err instanceof StandardsFileError) {
    process.stderr.write(`오류: ${err.message}\n`);
    process.exit(2);
  }
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(1);
});
