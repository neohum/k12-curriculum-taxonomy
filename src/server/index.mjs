#!/usr/bin/env node

/**
 * K-12 Curriculum Taxonomy & Cognitive Scaffolding Standalone Server
 * 
 * Run with:
 *   npm start
 *   npm run dev
 *   node src/server/index.mjs --port 3000
 */

import { K12TaxonomyServer } from "./K12TaxonomyServer.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  let port = Number(process.env.PORT) || 3000;
  let host = process.env.HOST || "0.0.0.0";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" || args[i] === "-p") {
      port = parseInt(args[++i], 10);
    } else if (args[i] === "--host" || args[i] === "-h") {
      host = args[++i];
    }
  }

  return { port, host };
}

async function main() {
  const { port, host } = parseArgs();
  const server = new K12TaxonomyServer({ port, host });

  console.log("\n==================================================================");
  console.log(" 🌐 K-12 Curriculum Cognitive Taxonomy & Scaffold Server");
  console.log("    2022 개정 K-12 전과목 인지위계 온톨로지 & 대시보드");
  console.log("==================================================================");
  console.log(` Starting server on host: ${host}, requested port: ${port}...`);

  const { port: actualPort, url } = await server.start();

  console.log(`\n 🎉 Server is online!`);
  console.log(` ------------------------------------------------------------------`);
  console.log(` 🖥️  Web Dashboard:      ${url}/`);
  console.log(` 🔍  Health check:       ${url}/api/health`);
  console.log(` 📚  Standards search:   ${url}/api/taxonomy/standards?query=미적분`);
  console.log(` 🔗  Spiral chains:      ${url}/api/taxonomy/chains`);
  console.log(` 🧩  Cognitive diagnose: POST ${url}/api/taxonomy/diagnose`);
  console.log(` 📐  Lesson scaffold:    POST ${url}/api/taxonomy/lesson-scaffold`);
  console.log(` ------------------------------------------------------------------`);
  console.log(` Open ${url}/ in your browser to view the interactive dashboard.`);
  console.log(` Press Ctrl+C to stop.\n`);

  const shutdown = async signal => {
    console.log(`\nReceived ${signal}. Shutting down K12TaxonomyServer gracefully...`);
    try {
      await server.stop();
      console.log("Server stopped successfully. Goodbye!");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch(err => {
  console.error("Fatal error starting K12TaxonomyServer:", err);
  process.exit(1);
});
