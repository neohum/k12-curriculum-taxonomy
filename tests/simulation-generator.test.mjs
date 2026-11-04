import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  ManipulativeSimulationGenerator,
  AVAILABLE_TEMPLATES
} from "../src/core/taxonomy/ManipulativeSimulationGenerator.mjs";
import { TargetGradeGroup, PiagetStage } from "../src/core/taxonomy/LessonTaxonomySchema.mjs";

test("ManipulativeSimulationGenerator - 4대 표준 조작기 템플릿 메타데이터 제공", () => {
  const templates = ManipulativeSimulationGenerator.getAvailableTemplates();
  assert.equal(templates.length, 4);

  const ids = templates.map(t => t.id);
  assert.ok(ids.includes("fraction-bars"));
  assert.ok(ids.includes("ten-frame"));
  assert.ok(ids.includes("balance-scale"));
  assert.ok(ids.includes("light-reflection"));

  // Check pedagogical taxonomy mapping
  const frac = templates.find(t => t.id === "fraction-bars");
  assert.equal(frac.targetGradeGroup, TargetGradeGroup.ELEMENTARY_MID);
  assert.equal(frac.piagetStage, PiagetStage.CONCRETE_OPERATIONAL);

  const ten = templates.find(t => t.id === "ten-frame");
  assert.equal(ten.targetGradeGroup, TargetGradeGroup.ELEMENTARY_LOW);
  assert.equal(ten.piagetStage, PiagetStage.PREOPERATIONAL);

  const bal = templates.find(t => t.id === "balance-scale");
  assert.equal(bal.targetGradeGroup, TargetGradeGroup.ELEMENTARY_MID);
  assert.equal(bal.piagetStage, PiagetStage.CONCRETE_OPERATIONAL);

  const light = templates.find(t => t.id === "light-reflection");
  assert.equal(light.targetGradeGroup, TargetGradeGroup.ELEMENTARY_HIGH);
  assert.equal(light.piagetStage, PiagetStage.CONCRETE_OPERATIONAL);
});

test("ManipulativeSimulationGenerator - 미지원 템플릿 요청 시 에러 발생", () => {
  assert.throws(() => {
    ManipulativeSimulationGenerator.generateSimulationHtml("unknown-template");
  }, /Unknown manipulative template/);
});

test("ManipulativeSimulationGenerator - fraction-bars 독립 실행형 HTML 및 컨트롤 검증", () => {
  const html = ManipulativeSimulationGenerator.generateSimulationHtml("fraction-bars");

  // 1. Standalone HTML5 validation
  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("<html lang=\"ko\">"));
  assert.ok(html.includes("<meta charset=\"utf-8\">"));
  assert.ok(!html.includes("http://"), "외부 CDN 및 외부 스크립트 의존성 금지");
  assert.ok(!html.includes("https://"), "외부 CDN 및 외부 스크립트 의존성 금지");

  // 2. Web Audio API synthesis
  assert.ok(html.includes("AudioContext"));
  assert.ok(html.includes("SoundEngine"));
  assert.ok(html.includes("playChime"));
  assert.ok(html.includes("playFanfare"));

  // 3. Tactile touch controls (44px+)
  assert.ok(html.includes("min-height: 44px"));
  assert.ok(html.includes("min-width: 44px"));

  // 4. Interactive fraction controls
  assert.ok(html.includes("barsContainer"));
  assert.ok(html.includes("addBar"));
  assert.ok(html.includes("alignment-guide"));
  assert.ok(html.includes("checkEquivalence"));
  assert.ok(html.includes("동치분수 발견"));
});

test("ManipulativeSimulationGenerator - ten-frame 독립 실행형 HTML 및 컨트롤 검증", () => {
  const html = ManipulativeSimulationGenerator.generateSimulationHtml("ten-frame");

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("<html lang=\"ko\">"));
  assert.ok(!html.includes("http://"));
  assert.ok(!html.includes("https://"));

  // Web Audio API
  assert.ok(html.includes("AudioContext"));
  assert.ok(html.includes("playPop"));

  // Touch target
  assert.ok(html.includes("min-height: 44px"));

  // 10-frame box & pedagogy
  assert.ok(html.includes("ten-frame-box"));
  assert.ok(html.includes("counter-token"));
  assert.ok(html.includes("toggleCell"));
  assert.ok(html.includes("10의 짝꿍") || html.includes("10의 보수"));
  assert.ok(html.includes("5단위 구조") || html.includes("5단위"));
});

test("ManipulativeSimulationGenerator - balance-scale 2D Canvas 및 물리 등호 검증", () => {
  const html = ManipulativeSimulationGenerator.generateSimulationHtml("balance-scale");

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("<canvas id=\"scaleCanvas\""));
  assert.ok(html.includes("AudioContext"));
  assert.ok(html.includes("min-height: 44px"));

  // Balance scale controls & physics
  assert.ok(html.includes("addWeight"));
  assert.ok(html.includes("scale-equation-bar"));
  assert.ok(html.includes("equalSymbol"));
  assert.ok(html.includes("startMysteryQuiz"));
  assert.ok(html.includes("requestAnimationFrame"));
});

test("ManipulativeSimulationGenerator - light-reflection 광학 레이 Canvas 및 스넬/전반사 검증", () => {
  const html = ManipulativeSimulationGenerator.generateSimulationHtml("light-reflection");

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("<canvas id=\"rayCanvas\""));
  assert.ok(html.includes("AudioContext"));
  assert.ok(html.includes("min-height: 44px"));

  // Light reflection & refraction controls
  assert.ok(html.includes("btnMirror"));
  assert.ok(html.includes("btnAirWater"));
  assert.ok(html.includes("btnWaterAir"));
  assert.ok(html.includes("valIncident"));
  assert.ok(html.includes("valRefract"));
  assert.ok(html.includes("tirBanner"));
  assert.ok(html.includes("전반사"));
});

test("ManipulativeSimulationGenerator - 사용자 커스텀 설정(config) 주입 검증", () => {
  const customConfig = {
    title: "우리 반 특별 분수 조작기",
    gradeLevel: "초등 3학년 특별반",
    pedagogicalNote: "교실 수업 실전: 단위분수의 덧셈과 뺄셈을 직관적으로 탐구합니다."
  };

  const html = ManipulativeSimulationGenerator.generateSimulationHtml("fraction-bars", customConfig);
  assert.ok(html.includes("우리 반 특별 분수 조작기"));
  assert.ok(html.includes("초등 3학년 특별반"));
  assert.ok(html.includes("교실 수업 실전: 단위분수의 덧셈과 뺄셈을 직관적으로 탐구합니다."));
});

test("ManipulativeSimulationGenerator - 생성된 public/taxonomy/simulations 파일 실체 및 무결성 검증", () => {
  const simDir = path.resolve(process.cwd(), "public/taxonomy/simulations");
  const expectedFiles = [
    "fraction-bars.html",
    "ten-frame.html",
    "balance-scale.html",
    "light-reflection.html"
  ];

  for (const file of expectedFiles) {
    const fullPath = path.join(simDir, file);
    assert.ok(fs.existsSync(fullPath), `파일 누락: ${fullPath}`);

    const content = fs.readFileSync(fullPath, "utf-8");
    assert.ok(content.length > 1000, `${file} 내용 부족`);
    assert.ok(content.includes("<!DOCTYPE html>"), `${file} HTML5 DTD 누락`);
    assert.ok(content.includes("AudioContext"), `${file} Web Audio API 누락`);
    assert.ok(content.includes("min-height: 44px"), `${file} 44px 터치 규격 누락`);
  }
});
