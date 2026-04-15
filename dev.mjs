#!/usr/bin/env node
/**
 * Development runner: starts the Vite dev server (port 5173, internal) and
 * the Express backend (port 5001, which proxies non-API traffic to Vite).
 *
 * Usage:  npm run dev  (from workspace root)
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const VITE_PORT = "5173";
const API_PORT = "5001";

const c = (code, msg) => `\x1b[${code}m${msg}\x1b[0m`;
const tag = (label, code) => (line) => process.stdout.write(`${c(code, `[${label}]`)} ${line}\n`);

function run(label, colorCode, cmd, args, cwd, env) {
  const proc = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const log = tag(label, colorCode);
  proc.stdout.on("data", (d) => {
    d.toString()
      .split("\n")
      .filter(Boolean)
      .filter((line) => !line.includes("➜  Local:") && !line.includes("➜  Network:"))
      .forEach(log);
  });
  proc.stderr.on("data", (d) => d.toString().split("\n").filter(Boolean).forEach(log));
  return proc;
}

function runSync(label, colorCode, cmd, args, cwd, env) {
  return new Promise((resolve, reject) => {
    const proc = run(label, colorCode, cmd, args, cwd, env);
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${label} exited ${code}`))));
  });
}

async function main() {
  console.log(c(33, `[dev] Starting development servers...`));

  // 1. Start Vite dev server (internal, handles HMR)
  const viteProc = run(
    "vite", "36",
    "npx", ["vite", "--config", "vite.config.ts", "--host", "127.0.0.1", "--logLevel", "error"],
    path.join(ROOT, "artifacts", "royal-kesar"),
    { PORT: VITE_PORT },
  );

  // 2. Build the backend
  console.log(c(33, "[api] Building backend..."));
  await runSync(
    "api-build", "33",
    "node", ["./build.mjs"],
    path.join(ROOT, "artifacts", "api-server"),
    { NODE_ENV: "development" },
  ).catch((err) => {
    console.error(c(31, `[api] Build failed: ${err.message}`));
    viteProc.kill();
    process.exit(1);
  });

  // 3. Start the backend on port 5001 (proxies non-API requests to Vite on 5173)
  const apiProc = run(
    "api", "35",
    "node", ["--enable-source-maps", "../../dist/index.mjs"],
    path.join(ROOT, "artifacts", "api-server"),
    { NODE_ENV: "development", PORT: API_PORT, VITE_PORT },
  );

  apiProc.on("exit", (code) => {
    if (code) { console.error(c(31, `[api] exited ${code}`)); process.exit(code); }
  });

  viteProc.on("exit", (code) => {
    if (code) { console.error(c(31, `[vite] exited ${code}`)); process.exit(code); }
  });

  const shutdown = () => {
    apiProc.kill("SIGTERM");
    viteProc.kill("SIGTERM");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => { console.error(err); process.exit(1); });
