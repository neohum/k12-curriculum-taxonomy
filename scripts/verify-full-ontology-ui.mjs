import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

// Find Chrome path
const chromePaths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe"
];
const chromePath = chromePaths.find(p => fs.existsSync(p));

if (!chromePath) {
  console.error("Chrome not found!");
  process.exit(1);
}

const remotePort = 9223;
const userDataDir = "C:\\Users\\user\\AppData\\Local\\Temp\\chrome-test-profile-" + Date.now();

const chromeProc = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${remotePort}`,
  `--user-data-dir=${userDataDir}`,
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--window-size=1600,1000",
  "http://localhost:3000/taxonomy-dashboard.html"
]);

chromeProc.on("error", err => {
  console.error("Failed to start Chrome:", err);
  process.exit(1);
});

// Helper for JSON HTTP
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

// Wait for Chrome CDP to be available
async function waitForChrome() {
  for (let i = 0; i < 20; i++) {
    try {
      const version = await getJson(`http://127.0.0.1:${remotePort}/json/version`);
      if (version.webSocketDebuggerUrl) return version;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error("Chrome debug port not ready");
}

async function run() {
  try {
    await waitForChrome();
    const targets = await getJson(`http://127.0.0.1:${remotePort}/json/list`);
    const pageTarget = targets.find(t => t.type === "page");
    if (!pageTarget) throw new Error("No page target found");

    const wsUrl = pageTarget.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

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

    // Enable Runtime, Page, Log
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Log.enable");

    ws.addEventListener("message", evt => {
      const msg = JSON.parse(evt.data);
      if (msg.method === "Runtime.exceptionThrown") {
        console.error("PAGE EXCEPTION:", JSON.stringify(msg.params.exceptionDetails));
      }
      if (msg.method === "Runtime.consoleAPICalled") {
        console.log("PAGE CONSOLE:", msg.params.type, msg.params.args.map(a => a.value || a.description).join(" "));
      }
    });

    // Wait 2.5 seconds for complete render
    await new Promise(r => setTimeout(r, 2500));

    // Evaluate DOM metrics
    const evalRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const sidebar = document.getElementById("sidebarTopicList");
        const sidebarItems = sidebar ? sidebar.children.length : 0;
        const gradeChips = document.querySelectorAll(".grade-filters [data-grade]").length;
        const schoolChips = document.querySelectorAll(".school-level-filters [data-school]").length;
        const canvas = document.getElementById("knowledgeCanvas");
        const canvasW = canvas ? canvas.width : 0;
        const canvasH = canvas ? canvas.height : 0;
        const inspectorTitle = document.getElementById("inspectorNodeTitle")?.innerText;
        const inspectorCode = document.getElementById("inspectorCurriculumCode")?.innerText;
        const prereqBadges = document.querySelectorAll("#inspectorPrereqList .prereq-badge").length;
        const successorBadges = document.querySelectorAll("#inspectorSuccessorList .prereq-badge").length;
        const firstSidebarHtml = sidebar && sidebar.firstElementChild ? sidebar.firstElementChild.innerText.slice(0, 100) : "";

        return {
          sidebarItems,
          gradeChips,
          schoolChips,
          canvasW,
          canvasH,
          inspectorTitle,
          inspectorCode,
          prereqBadges,
          successorBadges,
          firstSidebarHtml
        };
      })()`,
      returnByValue: true
    });

    console.log("=== UI VERIFICATION RESULTS ===");
    console.log(JSON.stringify(evalRes.result.value, null, 2));

    // Capture screenshot
    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/evidence-k12-full-ontology.png", Buffer.from(shot.data, "base64"));
    console.log("Screenshot saved to public/evidence-k12-full-ontology.png");

    ws.close();
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
    process.exit(0);
  }
}

run();
