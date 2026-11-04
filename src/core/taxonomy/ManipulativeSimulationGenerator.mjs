import fs from "node:fs";
import path from "node:path";
import { TargetGradeGroup, PiagetStage } from "./LessonTaxonomySchema.mjs";

/**
 * Common Web Audio API synthesizer for self-contained, offline sound effects.
 */
const WEB_AUDIO_SCRIPT = `
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  _init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
  playTone(freq, type = "sine", duration = 0.12, vol = 0.15) {
    if (this.muted) return;
    try {
      this._init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
  playPop() {
    this.playTone(460, "sine", 0.08, 0.22);
  }
  playThud() {
    this.playTone(140, "triangle", 0.14, 0.25);
  }
  playClick() {
    this.playTone(850, "sine", 0.04, 0.08);
  }
  playChime() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, "triangle", 0.25, 0.18), i * 85);
    });
  }
  playFanfare() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, "sine", 0.35, 0.2), i * 90);
    });
  }
  playLaserBeep() {
    this.playTone(720, "sawtooth", 0.08, 0.08);
    setTimeout(() => this.playTone(1100, "sine", 0.12, 0.12), 60);
  }
}
const sound = new SoundEngine();
`;

/**
 * Common CSS for tactile 44px+ touch targets and Korean pedagogy typography.
 */
const COMMON_CSS = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", "Noto Sans KR", sans-serif;
    background: #f8fafc;
    color: #1e293b;
    line-height: 1.5;
    padding: 16px;
    word-break: keep-all;
    overflow-x: hidden;
  }
  .sim-container {
    max-width: 960px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    padding: 24px;
  }
  header.sim-header {
    margin-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 16px;
  }
  .badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 9999px;
    line-height: 1;
  }
  .badge-primary { background: #e0e7ff; color: #3730a3; }
  .badge-stage { background: #dcfce7; color: #166534; }
  .badge-subject { background: #fef3c7; color: #92400e; }
  h1.sim-title {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 6px;
    text-wrap: balance;
  }
  p.sim-subtitle {
    font-size: 15px;
    color: #64748b;
  }
  .pedagogy-box {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 20px;
    font-size: 14px;
    color: #14532d;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pedagogy-box .pedagogy-title {
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  /* Tactile touch targets (min 44px) */
  button, .touch-btn, select, input[type="range"] {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
    font-family: inherit;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }
  button:active, .touch-btn:active {
    transform: scale(0.97);
  }
  .btn-primary {
    background: #3b82f6;
    color: #ffffff;
    border: none;
    padding: 0 16px;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
  }
  .btn-primary:hover { background: #2563eb; }
  .btn-secondary {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #cbd5e1;
    padding: 0 14px;
  }
  .btn-secondary:hover { background: #e2e8f0; }
  .btn-accent {
    background: #10b981;
    color: #ffffff;
    border: none;
    padding: 0 16px;
  }
  .btn-accent:hover { background: #059669; }
  .btn-danger {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
    padding: 0 12px;
  }
  .btn-danger:hover { background: #fecaca; }
  .control-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
  }
  .canvas-wrapper {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }
`;

/**
 * Standard manipulative templates catalog.
 */
export const AVAILABLE_TEMPLATES = [
  {
    id: "fraction-bars",
    name: "fraction-bars",
    title: "분수 막대 분할 및 크기 비교 조작기",
    subject: "수학 (수와 연산)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_MID,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL,
    description: "분수 막대 분할 및 직관적 크기 비교, 동치분수 탐구 시뮬레이션"
  },
  {
    id: "ten-frame",
    name: "ten-frame",
    title: "10칸 상자 바둑알 놓기 및 묶음 수세기 조작기",
    subject: "수학 (수와 연산)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_LOW,
    piagetStage: PiagetStage.PREOPERATIONAL,
    description: "10칸 상자(Ten-frame)를 통한 5·10 묶음 수세기 및 10의 보수(가르기와 모으기) 조작기"
  },
  {
    id: "balance-scale",
    name: "balance-scale",
    title: "2D 양팔 저울 수식 등호 균형 물리 조작기",
    subject: "수학 / 과학 (등식의 성질)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_MID,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL,
    description: "2D 물리 기반 양팔 저울 조작을 통한 등호(=)와 방정식 기초 균형 시뮬레이션"
  },
  {
    id: "light-reflection",
    name: "light-reflection",
    title: "과학 빛의 반사와 굴절 레이 실험실",
    subject: "과학 (빛과 렌즈)",
    targetGradeGroup: TargetGradeGroup.ELEMENTARY_HIGH,
    piagetStage: PiagetStage.CONCRETE_OPERATIONAL,
    description: "평면 거울의 반사의 법칙 및 매질 경계면 굴절·전반사 광학 실험실"
  }
];

export class ManipulativeSimulationGenerator {
  static getAvailableTemplates() {
    return AVAILABLE_TEMPLATES;
  }

  getAvailableTemplates() {
    return ManipulativeSimulationGenerator.getAvailableTemplates();
  }

  /**
   * Generates complete standalone HTML for requested template.
   */
  static generateSimulationHtml(templateName, config = {}) {
    const template = AVAILABLE_TEMPLATES.find(t => t.id === templateName);
    if (!template) {
      throw new Error(`Unknown manipulative template: '${templateName}'. Available: ${AVAILABLE_TEMPLATES.map(t => t.id).join(", ")}`);
    }

    switch (templateName) {
      case "fraction-bars":
        return generateFractionBarsHtml(config, template);
      case "ten-frame":
        return generateTenFrameHtml(config, template);
      case "balance-scale":
        return generateBalanceScaleHtml(config, template);
      case "light-reflection":
        return generateLightReflectionHtml(config, template);
      default:
        throw new Error(`Template implementation missing: ${templateName}`);
    }
  }

  generateSimulationHtml(templateName, config = {}) {
    return ManipulativeSimulationGenerator.generateSimulationHtml(templateName, config);
  }

  /**
   * Saves generated standalone HTML to file.
   */
  static saveSimulation(templateName, outputPath, config = {}) {
    const html = ManipulativeSimulationGenerator.generateSimulationHtml(templateName, config);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, html, "utf-8");
    return outputPath;
  }

  saveSimulation(templateName, outputPath, config = {}) {
    return ManipulativeSimulationGenerator.saveSimulation(templateName, outputPath, config);
  }

  /**
   * Generates all 4 standard templates into target directory.
   */
  static generateAll(outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const results = [];
    for (const t of AVAILABLE_TEMPLATES) {
      const filePath = path.join(outputDir, `${t.id}.html`);
      ManipulativeSimulationGenerator.saveSimulation(t.id, filePath);
      results.push(filePath);
    }
    return results;
  }
}

/**
 * 1. fraction-bars template generator
 */
function generateFractionBarsHtml(customConfig = {}, templateMeta) {
  const title = customConfig.title || templateMeta.title;
  const gradeLevel = customConfig.gradeLevel || "초등 3~4학년 (구체적 조작기)";
  const subject = customConfig.subject || templateMeta.subject;
  const note = customConfig.pedagogicalNote || "분모가 다른 분수들의 길이를 직접 비교하고, 같은 크기를 가진 동치분수(1/2 = 2/4 = 3/6)의 관계를 시각적으로 탐구합니다.";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${COMMON_CSS}
    .whole-bar-container {
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
    }
    .whole-label {
      font-size: 14px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    .bars-area {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
      position: relative;
    }
    .fraction-row {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: background 0.15s;
    }
    .fraction-row.highlighted {
      background: #fef9c3;
      border-color: #fde047;
    }
    .row-meta {
      width: 90px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }
    .row-denom {
      font-size: 15px;
      font-weight: 700;
      color: #334155;
    }
    .row-val {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
    }
    .bar-track {
      flex: 1;
      height: 48px;
      background: #e2e8f0;
      border-radius: 8px;
      display: flex;
      overflow: hidden;
      border: 2px solid #cbd5e1;
      position: relative;
      touch-action: none;
    }
    .bar-segment {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      border-right: 1px solid rgba(255,255,255,0.7);
      background: #f1f5f9;
      cursor: pointer;
      user-select: none;
      transition: background 0.1s ease;
      min-width: 24px;
    }
    .bar-segment:last-child {
      border-right: none;
    }
    .bar-segment.active {
      background: #3b82f6;
      color: #ffffff;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.15);
    }
    .bar-segment:hover {
      filter: brightness(0.95);
    }
    .row-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .palette-section {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      margin-bottom: 16px;
    }
    .palette-title {
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 10px;
    }
    .palette-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .denom-btn {
      padding: 0 14px;
      border-radius: 8px;
      background: #ffffff;
      border: 2px solid #cbd5e1;
      color: #1e293b;
      font-size: 15px;
      font-weight: 700;
    }
    .denom-btn:hover {
      border-color: #3b82f6;
      color: #2563eb;
    }
    .alignment-guide {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ef4444;
      pointer-events: none;
      z-index: 20;
      display: none;
    }
    .alignment-guide::after {
      content: "기준선";
      position: absolute;
      top: -20px;
      left: -18px;
      font-size: 11px;
      font-weight: 700;
      background: #ef4444;
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .equivalence-card {
      background: #fdf4ff;
      border: 1px solid #f0abfc;
      border-radius: 12px;
      padding: 12px 18px;
      margin-top: 14px;
      font-size: 14px;
      color: #701a75;
      font-weight: 600;
      display: none;
    }
  </style>
</head>
<body>
  <div class="sim-container">
    <header class="sim-header">
      <div class="badge-row">
        <span class="badge badge-primary">교구 시뮬레이션</span>
        <span class="badge badge-stage">${gradeLevel}</span>
        <span class="badge badge-subject">${subject}</span>
      </div>
      <h1 class="sim-title">${title}</h1>
      <p class="sim-subtitle">막대를 추가하고 칸을 클릭하여 분수의 크기를 눈으로 직접 비교해 보세요.</p>
    </header>

    <div class="pedagogy-box">
      <div class="pedagogy-title">💡 수업 탐구 안내 (비계 설정)</div>
      <div>${note}</div>
    </div>

    <!-- Whole Bar Reference -->
    <div class="whole-bar-container">
      <div class="whole-label">
        <span>기준 전체 (1)</span>
        <span>1 / 1 (100%)</span>
      </div>
      <div class="bar-track" style="border-color: #93c5fd; background: #dbeafe;">
        <div style="flex: 1; height: 100%; background: #60a5fa; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px;">
          전체 1
        </div>
      </div>
    </div>

    <!-- Denominator palette -->
    <div class="palette-section">
      <div class="palette-title">+ 분수 막대 추가하기 (분모 선택)</div>
      <div class="palette-buttons">
        <button class="denom-btn touch-btn" onclick="addBar(2)">1/2 막대</button>
        <button class="denom-btn touch-btn" onclick="addBar(3)">1/3 막대</button>
        <button class="denom-btn touch-btn" onclick="addBar(4)">1/4 막대</button>
        <button class="denom-btn touch-btn" onclick="addBar(5)">1/5 막대</button>
        <button class="denom-btn touch-btn" onclick="addBar(6)">1/6 막대</button>
        <button class="denom-btn touch-btn" onclick="addBar(8)">1/8 막대</button>
        <button class="denom-btn touch-btn" onclick="addBar(10)">1/10 막대</button>
        <button class="denom-btn touch-btn" onclick="addBar(12)">1/12 막대</button>
      </div>
    </div>

    <!-- Bars Area -->
    <div class="bars-area" id="barsContainer">
      <div class="alignment-guide" id="guideLine"></div>
    </div>

    <!-- Equivalence banner -->
    <div class="equivalence-card" id="equivCard">
      🎉 <strong>동치분수 발견!</strong> <span id="equivText"></span>
    </div>

    <!-- Global Controls -->
    <div class="control-bar">
      <button class="btn-secondary touch-btn" onclick="toggleGuide()">📏 수직 기준선 켜기/끄기</button>
      <button class="btn-secondary touch-btn" onclick="fillAll()">✨ 모두 채우기</button>
      <button class="btn-secondary touch-btn" onclick="clearAll()">🔄 모두 비우기</button>
      <button class="btn-danger touch-btn" onclick="resetAll()">🗑️ 처음 상태로</button>
      <div style="margin-left: auto;">
        <button class="btn-secondary touch-btn" id="muteBtn" onclick="toggleMute()">🔊 소리 켜짐</button>
      </div>
    </div>
  </div>

  <script>
${WEB_AUDIO_SCRIPT}

    let rows = [];
    let showGuide = false;
    let guideX = 200;

    const container = document.getElementById("barsContainer");
    const guideLine = document.getElementById("guideLine");
    const equivCard = document.getElementById("equivCard");
    const equivText = document.getElementById("equivText");
    const muteBtn = document.getElementById("muteBtn");

    function toggleMute() {
      const isMuted = sound.toggleMute();
      muteBtn.textContent = isMuted ? "🔇 소리 꺼짐" : "🔊 소리 켜짐";
    }

    function addBar(denom, activeCount = 1) {
      sound.playPop();
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const row = { id, denom, activeCount };
      rows.push(row);
      render();
      checkEquivalence();
    }

    function removeBar(id) {
      sound.playClick();
      rows = rows.filter(r => r.id !== id);
      render();
      checkEquivalence();
    }

    function setSegment(id, index) {
      const row = rows.find(r => r.id === id);
      if (!row) return;
      if (row.activeCount === index + 1) {
        row.activeCount = index;
      } else {
        row.activeCount = index + 1;
      }
      sound.playTone(300 + (row.activeCount * 40), "sine", 0.1, 0.15);
      render();
      checkEquivalence();
    }

    function fillRow(id) {
      const row = rows.find(r => r.id === id);
      if (row) {
        row.activeCount = row.denom;
        sound.playChime();
        render();
        checkEquivalence();
      }
    }

    function clearRow(id) {
      const row = rows.find(r => r.id === id);
      if (row) {
        row.activeCount = 0;
        sound.playClick();
        render();
        checkEquivalence();
      }
    }

    function fillAll() {
      rows.forEach(r => r.activeCount = r.denom);
      sound.playFanfare();
      render();
      checkEquivalence();
    }

    function clearAll() {
      rows.forEach(r => r.activeCount = 0);
      sound.playClick();
      render();
      checkEquivalence();
    }

    function resetAll() {
      rows = [];
      addBar(2, 1);
      addBar(4, 2);
      addBar(6, 3);
      sound.playClick();
      render();
      checkEquivalence();
    }

    function toggleGuide() {
      showGuide = !showGuide;
      guideLine.style.display = showGuide ? "block" : "none";
      sound.playClick();
    }

    container.addEventListener("pointermove", (e) => {
      if (!showGuide) return;
      const rect = container.getBoundingClientRect();
      const x = Math.max(90, Math.min(e.clientX - rect.left, rect.width - 10));
      guideLine.style.left = x + "px";
    });

    function checkEquivalence() {
      const activeRows = rows.filter(r => r.activeCount > 0);
      const groups = {};
      for (const r of activeRows) {
        const val = (r.activeCount / r.denom).toFixed(4);
        if (!groups[val]) groups[val] = [];
        groups[val].push(r);
      }

      let found = null;
      for (const val in groups) {
        if (groups[val].length >= 2) {
          found = groups[val];
          break;
        }
      }

      if (found) {
        const eqStr = found.map(r => r.activeCount + "/" + r.denom).join(" = ");
        equivText.textContent = eqStr + " (크기: " + (found[0].activeCount / found[0].denom).toFixed(2) + ")";
        equivCard.style.display = "block";
      } else {
        equivCard.style.display = "none";
      }
    }

    function render() {
      container.innerHTML = "";
      container.appendChild(guideLine);

      rows.forEach(row => {
        const rowEl = document.createElement("div");
        rowEl.className = "fraction-row";
        rowEl.id = "row-" + row.id;

        const metaEl = document.createElement("div");
        metaEl.className = "row-meta";
        metaEl.innerHTML = \`
          <span class="row-denom">1/\${row.denom}</span>
          <span class="row-val">\${row.activeCount}/\${row.denom} (\${(row.activeCount / row.denom).toFixed(2)})</span>
        \`;

        const trackEl = document.createElement("div");
        trackEl.className = "bar-track";

        for (let i = 0; i < row.denom; i++) {
          const seg = document.createElement("div");
          seg.className = "bar-segment touch-btn" + (i < row.activeCount ? " active" : "");
          seg.textContent = "1/" + row.denom;
          seg.onclick = () => setSegment(row.id, i);
          trackEl.appendChild(seg);
        }

        const actionsEl = document.createElement("div");
        actionsEl.className = "row-actions";
        actionsEl.innerHTML = \`
          <button class="btn-secondary touch-btn" style="min-width:44px; padding:0 8px; font-size:12px;" onclick="fillRow('\${row.id}')">가득</button>
          <button class="btn-secondary touch-btn" style="min-width:44px; padding:0 8px; font-size:12px;" onclick="clearRow('\${row.id}')">비움</button>
          <button class="btn-danger touch-btn" style="min-width:44px; padding:0 8px;" onclick="removeBar('\${row.id}')">✕</button>
        \`;

        rowEl.appendChild(metaEl);
        rowEl.appendChild(trackEl);
        rowEl.appendChild(actionsEl);
        container.appendChild(rowEl);
      });
    }

    // Initial default rows
    resetAll();
  </script>
</body>
</html>`;
}

/**
 * 2. ten-frame template generator
 */
function generateTenFrameHtml(customConfig = {}, templateMeta) {
  const title = customConfig.title || templateMeta.title;
  const gradeLevel = customConfig.gradeLevel || "초등 1~2학년 (전조작기)";
  const subject = customConfig.subject || templateMeta.subject;
  const note = customConfig.pedagogicalNote || "5개씩 채워지는 윗줄과 아랫줄 구조를 통해 5와 10의 묶음 수세기를 익히고, 10이 되기 위해 몇 개가 더 필요한지(10의 보수)를 즐겁게 놀이로 체득합니다.";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${COMMON_CSS}
    .frames-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
      align-items: center;
    }
    .ten-frame-box {
      background: #ffffff;
      border: 3px solid #1e293b;
      border-radius: 14px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 4px;
      padding: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      width: 100%;
      max-width: 560px;
    }
    .frame-cell {
      aspect-ratio: 1 / 1;
      min-height: 56px;
      min-width: 56px;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      transition: background 0.1s ease, transform 0.1s ease;
    }
    .frame-cell:hover {
      background: #f1f5f9;
    }
    .frame-cell:active {
      transform: scale(0.94);
    }
    .counter-token {
      width: 78%;
      height: 78%;
      border-radius: 50%;
      box-shadow: 0 3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      animation: popIn 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn {
      0% { transform: scale(0.3); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .token-red {
      background: radial-gradient(circle at 35% 35%, #ef4444, #b91c1c);
    }
    .token-blue {
      background: radial-gradient(circle at 35% 35%, #3b82f6, #1d4ed8);
    }
    .status-dashboard {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }
    .count-summary {
      font-size: 18px;
      font-weight: 800;
      color: #0369a1;
      margin-bottom: 8px;
    }
    .scaffold-text {
      font-size: 15px;
      color: #0c4a6e;
      line-height: 1.6;
    }
    .color-picker-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
    }
    .color-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      border: 2px solid transparent;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
    }
    .color-btn.selected {
      border-color: #0f172a;
      box-shadow: 0 0 0 2px rgba(15,23,42,0.2);
    }
    .celebrate-banner {
      background: #ecfdf5;
      border: 2px solid #34d399;
      color: #065f46;
      border-radius: 12px;
      padding: 12px 18px;
      font-size: 16px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 16px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="sim-container">
    <header class="sim-header">
      <div class="badge-row">
        <span class="badge badge-primary">교구 시뮬레이션</span>
        <span class="badge badge-stage">${gradeLevel}</span>
        <span class="badge badge-subject">${subject}</span>
      </div>
      <h1 class="sim-title">${title}</h1>
      <p class="sim-subtitle">칸을 탭하여 바둑알을 채우고, 5와 10의 묶음을 확인해 보세요.</p>
    </header>

    <div class="pedagogy-box">
      <div class="pedagogy-title">💡 수업 탐구 안내 (비계 설정)</div>
      <div>${note}</div>
    </div>

    <!-- Color selector -->
    <div class="color-picker-row">
      <span style="font-weight: 700; font-size: 14px; color: #475569;">놓을 바둑알 색상:</span>
      <button class="color-btn touch-btn selected" id="btnRed" onclick="selectColor('red')">
        <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#ef4444;"></span>
        빨간 알
      </button>
      <button class="color-btn touch-btn" id="btnBlue" onclick="selectColor('blue')">
        <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#3b82f6;"></span>
        파란 알
      </button>
    </div>

    <!-- Celebration banner -->
    <div class="celebrate-banner" id="celebBanner">
      🎉 <strong>참 잘했어요!</strong> 10칸이 가득 차서 완벽한 10이 완성되었습니다!
    </div>

    <!-- Frames -->
    <div class="frames-wrapper">
      <div class="ten-frame-box" id="frame1"></div>
      <div class="ten-frame-box" id="frame2" style="display: none;"></div>
    </div>

    <!-- Dashboard -->
    <div class="status-dashboard">
      <div class="count-summary" id="countSummary">현재 바둑알: 빨강 0개 + 파랑 0개 = 총 0개</div>
      <div class="scaffold-text" id="complementText">10이 되려면 바둑알 10개가 더 필요해요.</div>
      <div class="scaffold-text" id="bundleText" style="margin-top: 4px; color: #0284c7;"></div>
    </div>

    <!-- Action Buttons -->
    <div class="control-bar">
      <button class="btn-primary touch-btn" onclick="addOne()">+1 개 놓기</button>
      <button class="btn-secondary touch-btn" onclick="removeOne()">-1 개 빼기</button>
      <button class="btn-accent touch-btn" onclick="fillFive()">윗줄 5개 채우기</button>
      <button class="btn-accent touch-btn" onclick="fillTen()">10개 가득 채우기</button>
      <button class="btn-secondary touch-btn" onclick="toggleDoubleFrame()" id="frameToggleBtn">20칸 모드로 확장</button>
      <button class="btn-danger touch-btn" onclick="clearFrame()">🔄 비우기</button>
      <div style="margin-left: auto;">
        <button class="btn-secondary touch-btn" id="muteBtn" onclick="toggleMute()">🔊 소리 켜짐</button>
      </div>
    </div>
  </div>

  <script>
${WEB_AUDIO_SCRIPT}

    let currentColor = 'red';
    let isDouble = false;
    // 20 cells max, each can be null, 'red', or 'blue'
    const cells = new Array(20).fill(null);

    const frame1 = document.getElementById("frame1");
    const frame2 = document.getElementById("frame2");
    const countSummary = document.getElementById("countSummary");
    const complementText = document.getElementById("complementText");
    const bundleText = document.getElementById("bundleText");
    const celebBanner = document.getElementById("celebBanner");
    const frameToggleBtn = document.getElementById("frameToggleBtn");
    const muteBtn = document.getElementById("muteBtn");

    function toggleMute() {
      const isMuted = sound.toggleMute();
      muteBtn.textContent = isMuted ? "🔇 소리 꺼짐" : "🔊 소리 켜짐";
    }

    function selectColor(color) {
      currentColor = color;
      sound.playClick();
      document.getElementById("btnRed").classList.toggle("selected", color === 'red');
      document.getElementById("btnBlue").classList.toggle("selected", color === 'blue');
    }

    function toggleCell(index) {
      if (cells[index] === currentColor) {
        cells[index] = null;
        sound.playClick();
      } else {
        cells[index] = currentColor;
        sound.playPop();
      }
      render();
      checkMilestones();
    }

    function addOne() {
      const limit = isDouble ? 20 : 10;
      const emptyIdx = cells.slice(0, limit).findIndex(c => c === null);
      if (emptyIdx !== -1) {
        cells[emptyIdx] = currentColor;
        sound.playPop();
        render();
        checkMilestones();
      }
    }

    function removeOne() {
      const limit = isDouble ? 20 : 10;
      for (let i = limit - 1; i >= 0; i--) {
        if (cells[i] !== null) {
          cells[i] = null;
          sound.playClick();
          render();
          checkMilestones();
          break;
        }
      }
    }

    function fillFive() {
      for (let i = 0; i < 5; i++) {
        if (!cells[i]) cells[i] = currentColor;
      }
      sound.playChime();
      render();
      checkMilestones();
    }

    function fillTen() {
      for (let i = 0; i < 10; i++) {
        if (!cells[i]) cells[i] = currentColor;
      }
      sound.playFanfare();
      render();
      checkMilestones();
    }

    function clearFrame() {
      cells.fill(null);
      sound.playClick();
      render();
      checkMilestones();
    }

    function toggleDoubleFrame() {
      isDouble = !isDouble;
      frame2.style.display = isDouble ? "grid" : "none";
      frameToggleBtn.textContent = isDouble ? "10칸 모드로 축소" : "20칸 모드로 확장";
      sound.playClick();
      render();
      checkMilestones();
    }

    function checkMilestones() {
      const limit = isDouble ? 20 : 10;
      const count = cells.slice(0, limit).filter(Boolean).length;
      if (count === 10 || (isDouble && count === 20)) {
        celebBanner.style.display = "block";
        sound.playFanfare();
      } else {
        celebBanner.style.display = "none";
      }
    }

    function render() {
      const limit = isDouble ? 20 : 10;
      let redCount = 0;
      let blueCount = 0;

      for (let i = 0; i < limit; i++) {
        if (cells[i] === 'red') redCount++;
        if (cells[i] === 'blue') blueCount++;
      }
      const total = redCount + blueCount;
      const needed = Math.max(0, 10 - total);

      countSummary.textContent = \`현재 바둑알: 빨강 \${redCount}개 + 파랑 \${blueCount}개 = 총 \${total}개\`;
      
      if (!isDouble) {
        if (total === 10) {
          complementText.textContent = \`10의 짝꿍: \${redCount}와(과) \${blueCount}을(를) 모으면 10이 돼요!\`;
        } else {
          complementText.textContent = \`10이 되려면 바둑알 \${needed}개가 더 필요해요. (10 - \${total} = \${needed})\`;
        }
      } else {
        complementText.textContent = \`20까지의 수: 10개짜리 묶음 \${Math.floor(total/10)}개와 낱개 \${total % 10}개\`;
      }

      bundleText.textContent = \`5단위 구조: 5개 묶음 \${Math.floor(total/5)}개와 낱개 \${total % 5}개\`;

      // Render cells in Frame 1
      frame1.innerHTML = "";
      for (let i = 0; i < 10; i++) {
        const cell = document.createElement("div");
        cell.className = "frame-cell touch-btn";
        cell.onclick = () => toggleCell(i);
        if (cells[i]) {
          const tok = document.createElement("div");
          tok.className = "counter-token token-" + cells[i];
          tok.textContent = i + 1;
          cell.appendChild(tok);
        }
        frame1.appendChild(cell);
      }

      // Render cells in Frame 2 if double
      if (isDouble) {
        frame2.innerHTML = "";
        for (let i = 10; i < 20; i++) {
          const cell = document.createElement("div");
          cell.className = "frame-cell touch-btn";
          cell.onclick = () => toggleCell(i);
          if (cells[i]) {
            const tok = document.createElement("div");
            tok.className = "counter-token token-" + cells[i];
            tok.textContent = i + 1;
            cell.appendChild(tok);
          }
          frame2.appendChild(cell);
        }
      }
    }

    // Initial render
    render();
  </script>
</body>
</html>`;
}

/**
 * 3. balance-scale template generator
 */
function generateBalanceScaleHtml(customConfig = {}, templateMeta) {
  const title = customConfig.title || templateMeta.title;
  const gradeLevel = customConfig.gradeLevel || "초등 3~6학년 (구체적 조작기)";
  const subject = customConfig.subject || templateMeta.subject;
  const note = customConfig.pedagogicalNote || "양팔 저울의 좌우에 무게추를 올려 균형을 맞추며 등호(=)의 참된 의미(같음과 수평)를 배우고, 양변에 같은 수를 더하거나 뺄 때 등식이 유지됨을 탐구합니다.";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${COMMON_CSS}
    .canvas-box {
      width: 100%;
      height: 380px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      position: relative;
      margin-bottom: 20px;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .balance-banner {
      background: #ecfdf5;
      border: 2px solid #34d399;
      color: #065f46;
      border-radius: 12px;
      padding: 12px 18px;
      font-size: 16px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 16px;
      display: none;
    }
    .scale-equation-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 20px;
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: 800;
    }
    .side-value {
      padding: 6px 14px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #0f172a;
    }
    .equal-sign {
      font-size: 28px;
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f1f5f9;
      color: #475569;
    }
    .equal-sign.balanced {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
    }
    .pan-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .pan-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px;
    }
    .pan-card-title {
      font-size: 15px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
    }
    .weight-btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .btn-weight {
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      font-weight: 700;
      font-size: 14px;
      padding: 0 12px;
    }
    .btn-weight:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    .btn-1g { color: #0284c7; }
    .btn-2g { color: #16a34a; }
    .btn-5g { color: #d97706; }
    .btn-10g { color: #7c3aed; }
  </style>
</head>
<body>
  <div class="sim-container">
    <header class="sim-header">
      <div class="badge-row">
        <span class="badge badge-primary">교구 시뮬레이션</span>
        <span class="badge badge-stage">${gradeLevel}</span>
        <span class="badge badge-subject">${subject}</span>
      </div>
      <h1 class="sim-title">${title}</h1>
      <p class="sim-subtitle">좌우 접시에 추를 올리거나 내려 등호(=)가 성립하는 수평 균형을 찾아보세요.</p>
    </header>

    <div class="pedagogy-box">
      <div class="pedagogy-title">💡 수업 탐구 안내 (비계 설정)</div>
      <div>${note}</div>
    </div>

    <!-- Celebration banner -->
    <div class="balance-banner" id="balBanner">
      ⚖️ <strong>등호(=) 성립!</strong> 좌변과 우변의 무게가 정확히 일치하여 저울이 수평을 이루었습니다!
    </div>

    <!-- Equation readout -->
    <div class="scale-equation-bar">
      <span class="side-value" id="leftWeightText">좌변: 0g</span>
      <span class="equal-sign" id="equalSymbol">=</span>
      <span class="side-value" id="rightWeightText">우변: 0g</span>
    </div>

    <!-- Canvas -->
    <div class="canvas-box">
      <canvas id="scaleCanvas" width="900" height="380"></canvas>
    </div>

    <!-- Left & Right Pan Controls -->
    <div class="pan-controls">
      <div class="pan-card">
        <div class="pan-card-title">
          <span>🔵 왼쪽 접시 (좌변)</span>
          <button class="btn-danger touch-btn" style="min-height:36px; padding:0 10px; font-size:12px;" onclick="clearLeft()">비우기</button>
        </div>
        <div class="weight-btn-group">
          <button class="btn-weight touch-btn btn-1g" onclick="addWeight('left', 1)">+1g 추</button>
          <button class="btn-weight touch-btn btn-2g" onclick="addWeight('left', 2)">+2g 추</button>
          <button class="btn-weight touch-btn btn-5g" onclick="addWeight('left', 5)">+5g 추</button>
          <button class="btn-weight touch-btn btn-10g" onclick="addWeight('left', 10)">+10g 추</button>
        </div>
      </div>

      <div class="pan-card">
        <div class="pan-card-title">
          <span>🟠 오른쪽 접시 (우변)</span>
          <button class="btn-danger touch-btn" style="min-height:36px; padding:0 10px; font-size:12px;" onclick="clearRight()">비우기</button>
        </div>
        <div class="weight-btn-group">
          <button class="btn-weight touch-btn btn-1g" onclick="addWeight('right', 1)">+1g 추</button>
          <button class="btn-weight touch-btn btn-2g" onclick="addWeight('right', 2)">+2g 추</button>
          <button class="btn-weight touch-btn btn-5g" onclick="addWeight('right', 5)">+5g 추</button>
          <button class="btn-weight touch-btn btn-10g" onclick="addWeight('right', 10)">+10g 추</button>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="control-bar">
      <button class="btn-primary touch-btn" onclick="startMysteryQuiz()">🎁 수수께끼 상자 맞추기 퀴즈</button>
      <button class="btn-secondary touch-btn" onclick="resetScale()">🔄 저울 초기화</button>
      <div style="margin-left: auto;">
        <button class="btn-secondary touch-btn" id="muteBtn" onclick="toggleMute()">🔊 소리 켜짐</button>
      </div>
    </div>
  </div>

  <script>
${WEB_AUDIO_SCRIPT}

    const canvas = document.getElementById("scaleCanvas");
    const ctx = canvas.getContext("2d");
    const balBanner = document.getElementById("balBanner");
    const leftWeightText = document.getElementById("leftWeightText");
    const rightWeightText = document.getElementById("rightWeightText");
    const equalSymbol = document.getElementById("equalSymbol");
    const muteBtn = document.getElementById("muteBtn");

    let leftWeights = [];
    let rightWeights = [];
    let currentAngle = 0;
    let mysteryWeight = null;

    function toggleMute() {
      const isMuted = sound.toggleMute();
      muteBtn.textContent = isMuted ? "🔇 소리 꺼짐" : "🔊 소리 켜짐";
    }

    function addWeight(pan, val) {
      sound.playThud();
      if (pan === 'left') {
        leftWeights.push(val);
      } else {
        rightWeights.push(val);
      }
      checkStatus();
    }

    function clearLeft() {
      leftWeights = [];
      sound.playClick();
      checkStatus();
    }

    function clearRight() {
      rightWeights = [];
      mysteryWeight = null;
      sound.playClick();
      checkStatus();
    }

    function resetScale() {
      leftWeights = [];
      rightWeights = [];
      mysteryWeight = null;
      sound.playClick();
      checkStatus();
    }

    function startMysteryQuiz() {
      resetScale();
      const possible = [3, 4, 6, 7, 8, 9, 12, 15];
      mysteryWeight = possible[Math.floor(Math.random() * possible.length)];
      sound.playChime();
      alert("🎁 우측 접시에 비밀의 보물 상자가 놓였습니다! 좌측에 추를 올려 저울의 수평을 맞추어 무게를 알아내 보세요.");
      checkStatus();
    }

    function sum(arr) {
      return arr.reduce((a, b) => a + b, 0);
    }

    function checkStatus() {
      const wL = sum(leftWeights);
      const wR = (mysteryWeight !== null ? mysteryWeight : sum(rightWeights));

      leftWeightText.textContent = "좌변: " + wL + "g";
      rightWeightText.textContent = mysteryWeight !== null ? "우변: 보물 상자(?g)" : "우변: " + wR + "g";

      if (wL === wR && (wL > 0 || mysteryWeight !== null)) {
        equalSymbol.textContent = "=";
        equalSymbol.className = "equal-sign balanced";
        balBanner.style.display = "block";
        if (mysteryWeight !== null) {
          balBanner.innerHTML = "🎉 <strong>정답입니다!</strong> 보물 상자의 무게는 정확히 <strong>" + mysteryWeight + "g</strong>이었습니다!";
        }
        sound.playFanfare();
      } else if (wL > wR) {
        equalSymbol.textContent = ">";
        equalSymbol.className = "equal-sign";
        balBanner.style.display = "none";
      } else if (wL < wR) {
        equalSymbol.textContent = "<";
        equalSymbol.className = "equal-sign";
        balBanner.style.display = "none";
      } else {
        equalSymbol.textContent = "=";
        equalSymbol.className = "equal-sign";
        balBanner.style.display = "none";
      }
    }

    function animate() {
      const wL = sum(leftWeights);
      const wR = (mysteryWeight !== null ? mysteryWeight : sum(rightWeights));

      // Calculate target tilt angle (in radians)
      const diff = wR - wL;
      const targetAngle = Math.max(-0.35, Math.min(0.35, diff * 0.05));
      // Spring lerp
      currentAngle += (targetAngle - currentAngle) * 0.1;

      renderCanvas();
      requestAnimationFrame(animate);
    }

    function renderCanvas() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const pivotX = w / 2;
      const pivotY = 160;
      const beamHalfLen = 280;

      // Base / Stand
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX - 45, h - 40);
      ctx.lineTo(pivotX + 45, h - 40);
      ctx.closePath();
      ctx.fill();

      // Pedestal bottom
      ctx.fillStyle = "#334155";
      ctx.fillRect(pivotX - 90, h - 40, 180, 18);

      // Beam rotation
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(currentAngle);

      // Draw horizontal beam
      const isBal = Math.abs(currentAngle) < 0.005 && (sum(leftWeights) > 0 || mysteryWeight !== null);
      ctx.fillStyle = isBal ? "#10b981" : "#1e293b";
      ctx.fillRect(-beamHalfLen, -8, beamHalfLen * 2, 16);

      // Pivot pin
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Beam endpoints
      const leftEnd = { x: -beamHalfLen, y: 0 };
      const rightEnd = { x: beamHalfLen, y: 0 };

      ctx.restore();

      // Calculate world coords of beam ends
      const cosA = Math.cos(currentAngle);
      const sinA = Math.sin(currentAngle);
      const leftWorldX = pivotX - beamHalfLen * cosA;
      const leftWorldY = pivotY - beamHalfLen * sinA;
      const rightWorldX = pivotX + beamHalfLen * cosA;
      const rightWorldY = pivotY + beamHalfLen * sinA;

      // Draw Left Pan strings and pan
      drawPan(leftWorldX, leftWorldY, leftWeights, false);

      // Draw Right Pan strings and pan
      drawPan(rightWorldX, rightWorldY, rightWeights, mysteryWeight !== null);
    }

    function drawPan(x, y, weights, isMystery) {
      const panY = y + 120;
      const panW = 140;

      // Strings
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - panW / 2, panY);
      ctx.moveTo(x, y);
      ctx.lineTo(x + panW / 2, panY);
      ctx.stroke();

      // Pan dish
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.ellipse(x, panY, panW / 2, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Render weights on pan
      if (isMystery) {
        // Draw Mystery Chest
        ctx.fillStyle = "#d97706";
        ctx.fillRect(x - 25, panY - 45, 50, 45);
        ctx.fillStyle = "#b45309";
        ctx.fillRect(x - 25, panY - 25, 50, 6);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("?", x, panY - 14);
      } else {
        let curX = x - (weights.length * 24) / 2 + 12;
        weights.forEach(val => {
          drawWeightBlock(curX, panY, val);
          curX += 26;
        });
      }
    }

    function drawWeightBlock(bx, by, val) {
      let color = "#0284c7";
      let h = 26;
      if (val === 2) { color = "#16a34a"; h = 32; }
      else if (val === 5) { color = "#d97706"; h = 42; }
      else if (val === 10) { color = "#7c3aed"; h = 52; }

      ctx.fillStyle = color;
      ctx.fillRect(bx - 11, by - h, 22, h);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(val + "g", bx, by - 6);
    }

    // Start loop
    animate();
  </script>
</body>
</html>`;
}

/**
 * 4. light-reflection template generator
 */
function generateLightReflectionHtml(customConfig = {}, templateMeta) {
  const title = customConfig.title || templateMeta.title;
  const gradeLevel = customConfig.gradeLevel || "초등 5~6학년 (구체적 ➔ 형식적 조작기)";
  const subject = customConfig.subject || templateMeta.subject;
  const note = customConfig.pedagogicalNote || "빛이 거울에 닿아 반사될 때의 법칙(입사각 = 반사각)과 공기에서 물이나 유리로 들어갈 때 꺾이는 굴절 현상, 그리고 빛이 완전히 꺾이지 않고 반사되는 전반사를 실험해 봅니다.";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${COMMON_CSS}
    .lab-canvas-box {
      width: 100%;
      height: 440px;
      background: #0f172a;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      margin-bottom: 20px;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
    }
    .data-readout-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .data-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }
    .data-label {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }
    .data-value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .data-value.active-glow {
      color: #ef4444;
      text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    }
    .slider-control-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .slider-row input[type="range"] {
      flex: 1;
      height: 8px;
      accent-color: #ef4444;
    }
    .mode-tab-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .mode-btn {
      padding: 0 16px;
      border: 2px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-weight: 700;
      border-radius: 10px;
    }
    .mode-btn.active {
      border-color: #ef4444;
      background: #fef2f2;
      color: #b91c1c;
    }
    .tir-banner {
      background: #fef2f2;
      border: 2px solid #f87171;
      color: #991b1b;
      border-radius: 12px;
      padding: 12px 18px;
      font-size: 15px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 16px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="sim-container">
    <header class="sim-header">
      <div class="badge-row">
        <span class="badge badge-primary">교구 시뮬레이션</span>
        <span class="badge badge-stage">${gradeLevel}</span>
        <span class="badge badge-subject">${subject}</span>
      </div>
      <h1 class="sim-title">${title}</h1>
      <p class="sim-subtitle">각도 슬라이더를 조절하거나 캔버스를 드래그하여 빛의 반사 및 굴절 경로를 탐구하세요.</p>
    </header>

    <div class="pedagogy-box">
      <div class="pedagogy-title">💡 수업 탐구 안내 (비계 설정)</div>
      <div>${note}</div>
    </div>

    <!-- Mode Select Tabs -->
    <div style="margin-bottom: 16px;">
      <div class="mode-tab-group">
        <button class="mode-btn touch-btn active" id="btnMirror" onclick="setMode('mirror')">🪞 평면 거울 (반사의 법칙)</button>
        <button class="mode-btn touch-btn" id="btnAirWater" onclick="setMode('air_to_water')">💧 공기 ➔ 물 (굴절)</button>
        <button class="mode-btn touch-btn" id="btnWaterAir" onclick="setMode('water_to_air')">⚡ 물 ➔ 공기 (전반사 탐구)</button>
      </div>
    </div>

    <!-- Total Reflection Alert Banner -->
    <div class="tir-banner" id="tirBanner">
      ⚡ <strong>전반사(Total Internal Reflection) 발생!</strong> 임계각(약 48.8°)을 넘어 빛이 굴절하지 않고 100% 반사됩니다!
    </div>

    <!-- Canvas Lab -->
    <div class="lab-canvas-box">
      <canvas id="rayCanvas" width="900" height="440"></canvas>
    </div>

    <!-- Live Data Readout -->
    <div class="data-readout-grid">
      <div class="data-card">
        <div class="data-label">입사각 (Incident Angle)</div>
        <div class="data-value active-glow" id="valIncident">45.0°</div>
      </div>
      <div class="data-card">
        <div class="data-label">반사각 (Reflection Angle)</div>
        <div class="data-value" id="valReflect">45.0°</div>
      </div>
      <div class="data-card">
        <div class="data-label">굴절각 (Refraction Angle)</div>
        <div class="data-value" id="valRefract">32.1°</div>
      </div>
    </div>

    <!-- Slider & Fine tune -->
    <div class="slider-control-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:14px; color:#334155;">입사각 조절 (0° ~ 85°):</span>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary touch-btn" style="min-height:36px; padding:0 10px;" onclick="adjustAngle(-1)">-1°</button>
          <button class="btn-secondary touch-btn" style="min-height:36px; padding:0 10px;" onclick="adjustAngle(1)">+1°</button>
        </div>
      </div>
      <div class="slider-row">
        <span>0°</span>
        <input type="range" id="angleRange" min="0" max="85" value="45" step="0.5" oninput="onSlider(this.value)">
        <span>85°</span>
      </div>
    </div>

    <!-- Options & Controls -->
    <div class="control-bar">
      <button class="btn-secondary touch-btn" onclick="toggleNormal()" id="normalBtn">📐 법선(기준선) 켜기</button>
      <button class="btn-secondary touch-btn" onclick="toggleProtractor()" id="protractorBtn">🧭 각도기 켜기</button>
      <button class="btn-secondary touch-btn" onclick="resetDefaults()">🔄 초기화</button>
      <div style="margin-left: auto;">
        <button class="btn-secondary touch-btn" id="muteBtn" onclick="toggleMute()">🔊 소리 켜짐</button>
      </div>
    </div>
  </div>

  <script>
${WEB_AUDIO_SCRIPT}

    const canvas = document.getElementById("rayCanvas");
    const ctx = canvas.getContext("2d");
    const valIncident = document.getElementById("valIncident");
    const valReflect = document.getElementById("valReflect");
    const valRefract = document.getElementById("valRefract");
    const angleRange = document.getElementById("angleRange");
    const tirBanner = document.getElementById("tirBanner");
    const muteBtn = document.getElementById("muteBtn");

    let mode = 'mirror'; // 'mirror', 'air_to_water', 'water_to_air'
    let incidentAngleDeg = 45;
    let showNormal = true;
    let showProtractor = true;
    let isDragging = false;

    function toggleMute() {
      const isMuted = sound.toggleMute();
      muteBtn.textContent = isMuted ? "🔇 소리 꺼짐" : "🔊 소리 켜짐";
    }

    function setMode(m) {
      mode = m;
      sound.playClick();
      document.getElementById("btnMirror").classList.toggle("active", m === 'mirror');
      document.getElementById("btnAirWater").classList.toggle("active", m === 'air_to_water');
      document.getElementById("btnWaterAir").classList.toggle("active", m === 'water_to_air');
      draw();
    }

    function adjustAngle(delta) {
      incidentAngleDeg = Math.max(0, Math.min(85, incidentAngleDeg + delta));
      angleRange.value = incidentAngleDeg;
      sound.playLaserBeep();
      draw();
    }

    function onSlider(val) {
      incidentAngleDeg = parseFloat(val);
      draw();
    }

    function toggleNormal() {
      showNormal = !showNormal;
      document.getElementById("normalBtn").textContent = showNormal ? "📐 법선 끄기" : "📐 법선 켜기";
      sound.playClick();
      draw();
    }

    function toggleProtractor() {
      showProtractor = !showProtractor;
      document.getElementById("protractorBtn").textContent = showProtractor ? "🧭 각도기 끄기" : "🧭 각도기 켜기";
      sound.playClick();
      draw();
    }

    function resetDefaults() {
      incidentAngleDeg = 45;
      angleRange.value = 45;
      setMode('mirror');
      draw();
    }

    canvas.addEventListener("pointerdown", (e) => {
      isDragging = true;
      handlePointer(e);
    });
    window.addEventListener("pointermove", (e) => {
      if (isDragging) handlePointer(e);
    });
    window.addEventListener("pointerup", () => {
      isDragging = false;
    });

    function handlePointer(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Incident ray is on top-left (or bottom-left if water_to_air)
      const dx = cx - mx;
      const dy = cy - my;
      let rad = Math.atan2(dx, dy);
      let deg = rad * (180 / Math.PI);
      if (mode === 'water_to_air') {
        // coming from bottom
        rad = Math.atan2(dx, -dy);
        deg = rad * (180 / Math.PI);
      }
      if (deg >= 0 && deg <= 85) {
        incidentAngleDeg = Math.round(deg * 10) / 10;
        angleRange.value = incidentAngleDeg;
        draw();
      }
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const rayLen = 320;

      ctx.clearRect(0, 0, w, h);

      // Background media colors
      if (mode === 'mirror') {
        // Top: Air, Bottom: Mirror Silver
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, cy);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, cy, w, cy);

        // Mirror surface line
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();

        // Mirror hatch marks
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        for (let x = 10; x < w; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, cy);
          ctx.lineTo(x - 10, cy + 12);
          ctx.stroke();
        }
      } else if (mode === 'air_to_water') {
        // Top: Air (dark navy), Bottom: Water (aqua navy)
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, cy);
        ctx.fillStyle = "#0369a1";
        ctx.fillRect(0, cy, w, cy);

        // Boundary line
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();
      } else if (mode === 'water_to_air') {
        // Top: Air, Bottom: Water
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, cy);
        ctx.fillStyle = "#0369a1";
        ctx.fillRect(0, cy, w, cy);

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();
      }

      // Media text labels
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.fillText(mode === 'water_to_air' ? "공기 (n₁ = 1.00)" : (mode === 'mirror' ? "공기 매질" : "공기 (n₁ = 1.00)"), 20, 30);
      ctx.fillText(mode === 'mirror' ? "평면 거울" : (mode === 'air_to_water' ? "물 (n₂ = 1.33)" : "물 (n₁ = 1.33)"), 20, cy + 30);

      // Protractor (각도기)
      if (showProtractor) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 180, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        for (let a = 0; a <= 90; a += 15) {
          const rad = (a * Math.PI) / 180;
          // Left top
          const lx = cx - Math.sin(rad) * 195;
          const ly = cy - Math.cos(rad) * 195;
          ctx.fillText(a + "°", lx, ly);

          // Right top
          const rx = cx + Math.sin(rad) * 195;
          const ry = cy - Math.cos(rad) * 195;
          ctx.fillText(a + "°", rx, ry);
        }
      }

      // Normal Line (법선 - 수직 점선)
      if (showNormal) {
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, 20);
        ctx.lineTo(cx, h - 20);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("법선(Normal)", cx, 15);
      }

      // Angle calculations
      const radIncident = (incidentAngleDeg * Math.PI) / 180;
      valIncident.textContent = incidentAngleDeg.toFixed(1) + "°";
      valReflect.textContent = incidentAngleDeg.toFixed(1) + "°";

      let hasTotalReflection = false;
      let radRefracted = null;

      if (mode === 'air_to_water') {
        const n1 = 1.0, n2 = 1.33;
        const sinR = (n1 / n2) * Math.sin(radIncident);
        radRefracted = Math.asin(sinR);
        valRefract.textContent = (radRefracted * 180 / Math.PI).toFixed(1) + "°";
        tirBanner.style.display = "none";
      } else if (mode === 'water_to_air') {
        const n1 = 1.33, n2 = 1.0;
        const sinR = (n1 / n2) * Math.sin(radIncident);
        if (sinR > 1.0) {
          hasTotalReflection = true;
          valRefract.textContent = "전반사 발생!";
          tirBanner.style.display = "block";
        } else {
          radRefracted = Math.asin(sinR);
          valRefract.textContent = (radRefracted * 180 / Math.PI).toFixed(1) + "°";
          tirBanner.style.display = "none";
        }
      } else {
        valRefract.textContent = "- (반사 모드)";
        tirBanner.style.display = "none";
      }

      // Draw Incident Ray (Red laser)
      ctx.save();
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;

      let srcX, srcY;
      if (mode === 'water_to_air') {
        srcX = cx - Math.sin(radIncident) * rayLen;
        srcY = cy + Math.cos(radIncident) * rayLen;
      } else {
        srcX = cx - Math.sin(radIncident) * rayLen;
        srcY = cy - Math.cos(radIncident) * rayLen;
      }

      ctx.beginPath();
      ctx.moveTo(srcX, srcY);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      // Laser emitter head
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(srcX, srcY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Reflected Ray
      ctx.shadowColor = hasTotalReflection ? "#fbbf24" : "#f87171";
      ctx.strokeStyle = hasTotalReflection ? "#fbbf24" : "rgba(239, 68, 68, 0.75)";
      ctx.lineWidth = hasTotalReflection ? 5 : 3;

      let refX, refY;
      if (mode === 'water_to_air') {
        refX = cx + Math.sin(radIncident) * rayLen;
        refY = cy + Math.cos(radIncident) * rayLen;
      } else {
        refX = cx + Math.sin(radIncident) * rayLen;
        refY = cy - Math.cos(radIncident) * rayLen;
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(refX, refY);
      ctx.stroke();

      // Refracted Ray (if not total reflection and not mirror)
      if (radRefracted !== null && !hasTotalReflection) {
        ctx.shadowColor = "#38bdf8";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4;

        let refrX, refrY;
        if (mode === 'air_to_water') {
          refrX = cx + Math.sin(radRefracted) * rayLen;
          refrY = cy + Math.cos(radRefracted) * rayLen;
        } else {
          refrX = cx + Math.sin(radRefracted) * rayLen;
          refrY = cy - Math.cos(radRefracted) * rayLen;
        }
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(refrX, refrY);
        ctx.stroke();
      }

      ctx.restore();

      // Draw angle arcs
      drawAngleArc(cx, cy, incidentAngleDeg, mode === 'water_to_air' ? 1 : -1, "#ef4444", "i = " + incidentAngleDeg.toFixed(0) + "°");
    }

    function drawAngleArc(cx, cy, deg, ySign, color, label) {
      if (deg < 3) return;
      const radius = 55;
      const rad = (deg * Math.PI) / 180;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ySign < 0) {
        ctx.arc(cx, cy, radius, -Math.PI / 2 - rad, -Math.PI / 2);
      } else {
        ctx.arc(cx, cy, radius, Math.PI / 2, Math.PI / 2 + rad);
      }
      ctx.stroke();
    }

    // Initial draw
    draw();
  </script>
</body>
</html>`;
}
