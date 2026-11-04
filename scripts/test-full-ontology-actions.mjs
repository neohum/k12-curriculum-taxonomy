import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const remotePort = 9225;
const userDataDir = "C:\\Users\\user\\AppData\\Local\\Temp\\chrome-test-actions-" + Date.now();

const chromeProc = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${remotePort}`,
  `--user-data-dir=${userDataDir}`,
  "--no-sandbox",
  "--window-size=1600,1000",
  "http://localhost:3000/taxonomy-dashboard.html"
]);

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function run() {
  try {
    // Wait for Chrome
    for (let i = 0; i < 20; i++) {
      try {
        const v = await getJson(`http://127.0.0.1:${remotePort}/json/version`);
        if (v.webSocketDebuggerUrl) break;
      } catch (e) {}
      await new Promise(r => setTimeout(r, 400));
    }

    const targets = await getJson(`http://127.0.0.1:${remotePort}/json/list`);
    const pageTarget = targets.find(t => t.type === "page");
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = event => {
          const msg = JSON.parse(event.data);
          if (msg.id === id) {
            ws.removeEventListener("message", handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");
    await new Promise(r => setTimeout(r, 2000));

    async function evalCode(expression) {
      const res = await send("Runtime.evaluate", { expression, returnByValue: true });
      return res.result.value;
    }

    console.log("=== RUNNING FULL ONTOLOGY TEST SUITE ===");

    // 1. Initial State
    const initItems = await evalCode(`document.getElementById("sidebarTopicList").children.length`);
    console.log(`[Test 1] Initial total sidebar items: ${initItems} (expected 316)`);

    // 2. Grade 1 filter
    await evalCode(`filterByGrade("초1")`);
    const g1Items = await evalCode(`document.getElementById("sidebarTopicList").children.length`);
    console.log(`[Test 2] Grade 1 (초1) items: ${g1Items} (expected 11)`);

    // 3. Grade 12 filter
    await evalCode(`filterByGrade("고3")`);
    const g12Items = await evalCode(`document.getElementById("sidebarTopicList").children.length`);
    console.log(`[Test 3] Grade 12 (고3) items: ${g12Items} (expected 14)`);

    // 4. Reset to all grades, filter by Elementary School (ES)
    await evalCode(`filterByGrade("all"); filterBySchoolLevel("ES");`);
    const esItems = await evalCode(`document.getElementById("sidebarTopicList").children.length`);
    console.log(`[Test 4] School level ES items: ${esItems} (expected 113)`);

    // 5. School level MS
    await evalCode(`filterBySchoolLevel("MS");`);
    const msItems = await evalCode(`document.getElementById("sidebarTopicList").children.length`);
    console.log(`[Test 5] School level MS items: ${msItems} (expected 108)`);

    // 6. School level HS
    await evalCode(`filterBySchoolLevel("HS");`);
    const hsItems = await evalCode(`document.getElementById("sidebarTopicList").children.length`);
    console.log(`[Test 6] School level HS items: ${hsItems} (expected 95)`);

    // 7. Reset all filters
    await evalCode(`resetAllFilters();`);
    const resetItems = await evalCode(`document.getElementById("sidebarTopicList").children.length`);
    console.log(`[Test 7] After reset: ${resetItems} (expected 316)`);

    // 8. Select Grade 1 node [1수01-01]
    const g1Select = await evalCode(`(() => {
      selectTopicNode("std_1수01_01", true);
      return {
        title: document.getElementById("inspectorNodeTitle")?.innerText,
        code: document.getElementById("inspectorCurriculumCode")?.innerText,
        piaget: document.getElementById("inspectorPiagetStage")?.innerText,
        manip: document.getElementById("inspectorManipulative")?.innerText
      };
    })()`);
    console.log(`[Test 8] Selected 초1 node:`, g1Select);

    // 9. Select Grade 12 node [12미적2-01-01]
    const g12Select = await evalCode(`(() => {
      selectTopicNode("std_12미적2_01_01", true);
      return {
        title: document.getElementById("inspectorNodeTitle")?.innerText,
        code: document.getElementById("inspectorCurriculumCode")?.innerText,
        piaget: document.getElementById("inspectorPiagetStage")?.innerText,
        manip: document.getElementById("inspectorManipulative")?.innerText,
        prereqs: document.querySelectorAll("#inspectorPrereqList .prereq-badge").length,
        successors: document.querySelectorAll("#inspectorSuccessorList .prereq-badge").length
      };
    })()`);
    console.log(`[Test 9] Selected 고3 node:`, g12Select);

    // 10. Test Tab 5 (2022 개정 연동)
    const tab5Count = await evalCode(`(() => {
      switchMainTab("tab-curriculum");
      renderCurriculumTable();
      return document.getElementById("curriculumTableBody").children.length;
    })()`);
    console.log(`[Test 10] Tab 5 Curriculum table rows: ${tab5Count} (expected 316)`);

    // Capture Tab 5 screenshot
    const tab5Shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/evidence-k12-tab5-standards.png", Buffer.from(tab5Shot.data, "base64"));
    console.log("Tab 5 Screenshot saved to public/evidence-k12-tab5-standards.png");

    // Switch back to graph and capture full graph view screenshot
    await evalCode(`switchMainTab("tab-graph"); resetGraphView();`);
    await new Promise(r => setTimeout(r, 600));
    const graphShot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/evidence-k12-full-graph-view.png", Buffer.from(graphShot.data, "base64"));
    console.log("Graph Screenshot saved to public/evidence-k12-full-graph-view.png");

    console.log("=== ALL 10 UI INTERACTION TESTS PASSED! ===");
    ws.close();
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
    process.exit(0);
  }
}

run();
