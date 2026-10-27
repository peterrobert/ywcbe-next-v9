#!/usr/bin/env node
/**
 * TUC migration verification harness.
 *
 * Uses only Node.js built-ins and an already-installed Chrome via the DevTools
 * Protocol. It never submits the survey or writes to any production service.
 *
 * Usage:
 *   npm run build:next
 *   node scripts/verify-migration.mjs
 *
 * Options / environment:
 *   BASE_URL=http://127.0.0.1:3000   Verify an already-running production build
 *                                    instead of starting an isolated server.
 *   CHROME_PATH=/path/to/chrome      Override Chrome discovery.
 *   --help                           Show this help.
 *
 * Exit codes:
 *   0  All required assertions passed (skipped checks are reported separately).
 *   1  At least one required assertion failed.
 *   2  The harness could not run (missing build, missing Chrome, timeout, ...).
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CHROME_ARGS = [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-sync",
  "--disable-extensions",
  "--metrics-recording-only",
  "--remote-debugging-port=0",
  "--window-size=1440,900",
  // Safety backstop: even if request interception ever fails, a survey
  // submission must never reach the production Apps Script deployment.
  "--host-resolver-rules=MAP script.google.com 127.0.0.1",
];

const EXPECTED_ROUTES = [
  "/",
  "/black-hand",
  "/earth-globe",
  "/yellow-sticky-note",
  "/red-flag",
  "/crumpled-paper",
  "/closerlook",
  "/top10-poc",
  "/open-items",
  "/survey-poc",
];

const SKIP_NAV_LINKS = EXPECTED_ROUTES;

const ROUTE_EXPECTATIONS = {
  "/": {
    heading: "TUC",
    markers: [
      "Welcome To",
      "👉 Click anything that makes you curious.",
      "What is TUC?",
      "2% Spare Bandwidth",
      "Top10 Lists",
      "CloserLook@",
      "The resources we need already exist.",
      "Submit a Suggestion",
      "Another App?",
    ],
  },
  "/black-hand": {
    heading: "WHAT IS TUC?",
    markers: ["What if we stopped starting over?"],
  },
  "/earth-globe": {
    heading: "THE RESOURCES WE NEED ALREADY EXIST",
    markers: ["THE RESOURCES WE NEED ALREADY EXIST"],
  },
  "/yellow-sticky-note": {
    heading: "2% SPARE BANDWIDTH",
    markers: ["2% SPARE BANDWIDTH"],
  },
  "/red-flag": {
    heading: "Red Flags",
    markers: ["Red Flags"],
  },
  "/crumpled-paper": {
    heading: "Another App?",
    markers: ["Another App?"],
  },
  "/closerlook": {
    heading: "CloserLook@",
    markers: [
      "CloserLook@",
      "Deeper information, one click away.",
      "Perspectives",
      "Deeper Information",
      "Why TUC Matters",
      "C-Level Perspectives",
      "White Paper",
      "Grey Paper",
      "Founder’s Notes",
      "This workspace stays open until you close it.",
    ],
  },
  "/top10-poc": {
    heading: "Top10: Ways to Engage in TUC",
    markers: ["Choose an OpenItem You Can Help Complete"],
  },
  "/open-items": {
    heading: "OpenItems",
    markers: [
      "Suggestion Box Loop Test",
      "TUC-TASK-0002",
      "TUC-SB-0005",
      "Open / In follow-through",
    ],
  },
  "/survey-poc": {
    heading: "WTF is TUC?",
    markers: [
      "A TUC Survey",
      "Final Approved Version",
      "Part 1 — Your TUC Experience",
      "Part 2 — Connections",
      "Part 3 — Connecting the Dots",
      "Part 4 — Your Two Cents",
      "Optional — Stay Connected",
      "PASS 🧩",
      "SUBMIT MY TWO CENTS!",
      "Thanks for helping TUC get better!",
    ],
  },
};

const OPEN_ITEMS_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfAliHmLu4qnbGVGoNC_YRnnqGPL-RXKjAlM2SE9ky4bVLl4A/viewform";
const TOP10_FORM_URL = `${OPEN_ITEMS_FORM_URL}?usp=dialog`;

// The landing page uses the same Google Form as the Top10 suggestion control.
const LANDING_CONTROLS_DESKTOP = [
  { tag: "A", href: "/black-hand", label: "What is TUC?" },
  { tag: "A", href: "/yellow-sticky-note", label: "2% Spare Bandwidth" },
  { tag: "A", href: "/top10-poc", label: "Navigate to Top10 Lists" },
  { tag: "BUTTON", href: null, label: "Open Welcome to TUC" },
  { tag: "A", href: "/survey-poc", label: "Take TUC Survey" },
  { tag: "A", href: "/closerlook", label: "Navigate to CloserLook Workspace" },
  { tag: "A", href: "/red-flag", label: "Red Flag Overview" },
  { tag: "A", href: "/earth-globe", label: "Earth Globe Overview" },
  { tag: "A", href: TOP10_FORM_URL, label: "Submit a Suggestion" },
  { tag: "A", href: "/crumpled-paper", label: "Another App?" },
];

const LANDING_CONTROLS_MOBILE = [
  { tag: "BUTTON", href: null, label: "Open Welcome to TUC" },
  { tag: "A", href: "/survey-poc", label: "Take TUC Survey" },
  { tag: "A", href: "/black-hand", label: "What is TUC?" },
  { tag: "A", href: "/earth-globe", label: "Earth Globe Overview" },
  { tag: "A", href: "/yellow-sticky-note", label: "2% Spare Bandwidth" },
  { tag: "A", href: "/red-flag", label: "Red Flag Overview" },
  { tag: "A", href: "/crumpled-paper", label: "Another App?" },
  { tag: "A", href: "/top10-poc", label: "Navigate to Top10 Lists" },
  { tag: "A", href: TOP10_FORM_URL, label: "Submit a Suggestion" },
  { tag: "A", href: "/closerlook", label: "Navigate to CloserLook Workspace" },
];

const CLOSERLOOK_DOC_URLS = [
  "https://docs.google.com/document/d/1b_pysDmZdCqtHms3-nme4h7JmlU7wvDWUNtAo36qU3k/edit?usp=sharing",
  "https://docs.google.com/document/d/1JbjlU4S-IvXrwp5z4piatwVYdKP5K0GxW3TWWIGM52w/edit?tab=t.8h58bqwrwo7z",
  "https://docs.google.com/document/d/1mKajfyW4qiPXF-O0LUXq1RHaq7048I2i2zTej9impz8/edit?usp=sharing",
  "https://docs.google.com/document/d/1A4jlADhoSdn0BZpT8LTQ-0Vzjs0jK1mcIh_2QEqYdsM/edit?usp=sharing",
  "https://docs.google.com/document/d/1-pAQRa1Os5gTCzb6UuppVtMVZgTf8cIJmJdyMtvKX8c/edit?usp=sharing",
];

const SURVEY_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyk7HYTI1W8wDBcnoEzckS8lOoZFq8xd9UCqVsJesbzHVmsK4-50-pcGxavxvDp2W9ZvQ/exec";
const SURVEY_PASS_OPTION = "PASS 🧩 (Maybe I'll answer next time!)";
const SURVEY_PASS_LABELS = [
  "Q1 History",
  "Q1 Completed Before",
  "Q2 First Connection",
  "Q3 Sparked Interest",
  "Q4 Understanding",
  "Q5 Stands Out",
  "Q6 Engaged So Far",
  "Q7 Future Interests",
  "Q7 Imagine Engaging",
  "Q8 Perspective Change",
  "Q9 Easter Eggs",
  "Q10 Puzzle Meaning",
  "Q11 Mind",
  "Q12 Question",
  "Follow-up",
];
const SURVEY_QUESTION_HEADINGS = [
  "1. What's your history with TUC? 👋",
  "2. How did you first connect with TUC? 🔎",
  "3. Has anything sparked or renewed your curiosity? 🔥",
  "4. So… WTF is TUC? ❓",
  "5. What stands out to you? 👀",
  "6. How have you engaged with TUC so far?",
  "7. What interests you about engaging with TUC going forward? 🚀",
  "8. What's changed in your perspective on TUC? 🔄",
  "9. Have you noticed any 🥚 Easter eggs, hidden connections, or unexpected details?",
  "10. What do you think “…… 🧩 ……” means?",
  "11. What's on your mind?",
  "12. What question should we have asked?",
];
const SURVEY_ROW_COUNTS = {
  1: 11,
  2: 10,
  3: 5,
  4: 6,
  5: 12,
  6: 10,
  7: 17,
  8: 10,
  9: 5,
  10: 4,
  11: 1,
  12: 1,
  followUp: 3,
};
const SURVEY_TEXT_MARKERS = [
  "WTF is TUC? ❓",
  "A TUC Survey … #itsotuc",
  "Final Approved Version",
  "No tests. No wrong answers. No pressure.",
  "Whether you just discovered TUC, have followed its evolution from YesWeCan, or helped build it over the years, your perspective matters.",
  "We're interested in what you understand, notice, question, discover, and believe could be better.",
  "Answer anything. Pass on anything. Come back anytime.",
  "Part 1 — Your TUC Experience",
  "Part 2 — Connections & Possibilities",
  "Part 3 — Connecting the Dots",
  "Part 4 — Your Two Cents",
  "Choose as many as apply.",
  "Just discovered it",
  "Someone introduced me to TUC",
  "I stumbled across it",
  "Optional: What caught or renewed your interest?",
  "Where are you in understanding TUC today?",
  "2% Spare Bandwidth",
  "CloserLook@",
  "We're interested in actual participation, whether yesterday or years ago.",
  "No commitment required.",
  "Could you imagine yourself engaging or continuing to engage with TUC?",
  "Think about your first encounter, your last visit, or your last survey.",
  "Optional: A little something for the curious.",
  "Wait… what Easter eggs? 😄",
  "I think I've connected the dots!",
  "I have a theory",
  "Something confusing? Brilliant? Ridiculous? Missing? Worth exploring? Something that could be better—or something we absolutely shouldn't change?",
  "Perhaps an idea from years ago that deserves another look.",
  "Sometimes the best question is the one nobody thought to ask.",
  "Your thoughts:",
  "Your question:",
  "Optional — Stay Connected",
  "May we follow up?",
  "You can remain anonymous. Sharing your contact information doesn't subscribe you to anything, and follow-up isn't guaranteed.",
  "SUBMIT MY TWO CENTS!",
  "Thanks for helping TUC get better!",
  "#itsotuc",
  "BACK TO TUC",
];

const passes = [];
const failures = [];
const skips = [];
const warnings = [];

function recordPass(name, detail) {
  passes.push({ name, detail });
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function recordSkip(name, reason) {
  skips.push({ name, reason });
  console.log(`  SKIP  ${name} — ${reason}`);
}

function recordFailure(name, error) {
  const detail = error instanceof Error ? error.message : String(error);
  failures.push({ name, detail });
  console.log(`  FAIL  ${name} — ${detail}`);
}

async function check(name, fn) {
  try {
    const detail = await fn();
    recordPass(name, typeof detail === "string" ? detail : undefined);
    return true;
  } catch (error) {
    recordFailure(name, error);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function usage() {
  console.log(`TUC migration verification harness

Usage:
  npm run build:next && node scripts/verify-migration.mjs
  BASE_URL=http://127.0.0.1:3000 node scripts/verify-migration.mjs

The harness starts its own production Next.js server on an ephemeral port unless
BASE_URL is set. It launches an isolated headless Chrome profile and always
cleans up the processes and temporary files it created.

It verifies: ${EXPECTED_ROUTES.join(", ")}.
It never submits the survey or writes to production integrations.`);
}

async function getFreePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function terminate(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === "win32") child.kill("SIGTERM");
    else process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      // already gone
    }
  }
}

async function waitForExit(child, timeoutMs = 5000) {
  if (!child || child.exitCode !== null) return;
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(timeoutMs),
  ]);
  if (child.exitCode === null) {
    try {
      if (process.platform === "win32") child.kill("SIGKILL");
      else process.kill(-child.pid, "SIGKILL");
    } catch {
      // already gone
    }
  }
}

function findChrome() {
  if (process.env.CHROME_PATH) {
    if (fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    throw new Error(`CHROME_PATH does not exist: ${process.env.CHROME_PATH}`);
  }

  const absoluteCandidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const candidate of absoluteCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const commandNames =
    process.platform === "win32"
      ? ["chrome.exe"]
      : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  const searchDirs = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
  for (const dir of searchDirs) {
    for (const command of commandNames) {
      const candidate = path.join(dir, command);
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  throw new Error(
    "Chrome/Chromium was not found. Set CHROME_PATH to the browser executable."
  );
}

async function waitForServer(baseUrl, child, output, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) {
      throw new Error(
        `Next.js server exited with code ${child.exitCode}.\n${output.join("")}`
      );
    }
    try {
      const response = await fetch(`${baseUrl}/`, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(300);
  }

  throw new Error(
    `Next.js server did not become ready at ${baseUrl}: ${lastError?.message ?? "timeout"}`
  );
}

async function startServer() {
  const provided = process.env.BASE_URL?.trim().replace(/\/+$/, "");
  if (provided) {
    console.log(`Using supplied BASE_URL: ${provided}`);
    await check("supplied server responds", async () => {
      const response = await fetch(`${provided}/`, {
        signal: AbortSignal.timeout(15000),
      });
      assert(response.ok, `GET / returned HTTP ${response.status}`);
      return `HTTP ${response.status}`;
    });
    if (failures.length) throw new Error("Supplied BASE_URL is not reachable.");
    return { baseUrl: provided, child: null, output: [] };
  }

  const buildIdPath = path.join(ROOT, ".next", "BUILD_ID");
  if (!fs.existsSync(buildIdPath)) {
    throw new Error(
      "No production build found at .next/BUILD_ID. Run `npm run build:next` first."
    );
  }

  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    throw new Error(`Next.js CLI not found at ${nextBin}.`);
  }

  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const port = await getFreePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    const output = [];
    const child = spawn(
      process.execPath,
      [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)],
      {
        cwd: ROOT,
        detached: process.platform !== "win32",
        env: { ...process.env, NODE_ENV: "production" },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => output.push(chunk));
    child.stderr.on("data", (chunk) => output.push(chunk));

    console.log(`Starting isolated Next.js server on ${baseUrl}`);
    try {
      await waitForServer(baseUrl, child, output);
      return { baseUrl, child, output };
    } catch (error) {
      lastError = error;
      terminate(child);
      await waitForExit(child);
    }
  }

  throw lastError ?? new Error("Could not start the Next.js server.");
}

async function launchChrome() {
  if (typeof WebSocket !== "function") {
    throw new Error("This Node.js version does not provide a global WebSocket.");
  }
  const executable = findChrome();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "tuc-verify-chrome-"));
  const output = [];
  const child = spawn(
    executable,
    [...CHROME_ARGS, `--user-data-dir=${profileDir}`, "about:blank"],
    {
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => output.push(chunk));
  child.stderr.on("data", (chunk) => output.push(chunk));

  const portFile = path.join(profileDir, "DevToolsActivePort");
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Chrome exited early (${child.exitCode}).\n${output.join("")}`);
    }
    if (fs.existsSync(portFile)) {
      const contents = fs.readFileSync(portFile, "utf8").trim().split(/\r?\n/);
      const port = Number(contents[0]);
      if (Number.isInteger(port) && port > 0) {
        return { child, profileDir, port, output };
      }
    }
    await sleep(150);
  }

  terminate(child);
  await waitForExit(child);
  throw new Error(`Chrome did not expose a DevTools port.\n${output.join("")}`);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`GET ${url} returned HTTP ${response.status}`);
  return response.json();
}

class CDPClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.closed = false;

    ws.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.id !== undefined) {
        const request = this.pending.get(message.id);
        if (!request) return;
        this.pending.delete(message.id);
        if (message.error) request.reject(new Error(message.error.message));
        else request.resolve(message.result);
        return;
      }
      if (message.method) {
        const handlers = this.listeners.get(message.method);
        if (handlers) {
          for (const handler of handlers) handler(message.params);
        }
      }
    });

    ws.addEventListener("close", () => {
      this.closed = true;
      for (const request of this.pending.values()) {
        request.reject(new Error("CDP connection closed"));
      }
      this.pending.clear();
    });
  }

  static async connect(url, timeoutMs = 15000) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Timed out connecting to ${url}`)),
        timeoutMs
      );
      ws.addEventListener(
        "open",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
      ws.addEventListener(
        "error",
        () => {
          clearTimeout(timer);
          reject(new Error(`WebSocket error connecting to ${url}`));
        },
        { once: true }
      );
    });
    return new CDPClient(ws);
  }

  send(method, params = {}) {
    if (this.closed) return Promise.reject(new Error("CDP connection closed"));
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(handler);
  }

  close() {
    if (!this.closed) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
  }
}

async function run() {
  let server = null;
  let chrome = null;
  let browser = null;
  let page = null;
  let pageTarget = null;
  const runtimeErrors = [];
  const failedRequests = [];
  const requestUrls = new Map();
  const surveyNetworkRequests = [];
  let currentPhase = "startup";

  const cleanup = async () => {
    if (page) page.close();
    if (browser) browser.close();
    if (chrome?.child) {
      terminate(chrome.child);
      await waitForExit(chrome.child);
    }
    if (chrome?.profileDir) {
      try {
        fs.rmSync(chrome.profileDir, { recursive: true, force: true });
      } catch {
        // best effort
      }
    }
    if (server?.child) {
      terminate(server.child);
      await waitForExit(server.child);
    }
  };

  try {
    server = await startServer();
    const baseUrl = server.baseUrl;
    const baseOrigin = new URL(baseUrl).origin;

    chrome = await launchChrome();
    const version = await fetchJson(
      `http://127.0.0.1:${chrome.port}/json/version`
    );
    browser = await CDPClient.connect(version.webSocketDebuggerUrl);

    let targets = await fetchJson(`http://127.0.0.1:${chrome.port}/json/list`);
    pageTarget = targets.find((target) => target.type === "page");
    if (!pageTarget) {
      try {
        pageTarget = await fetchJson(
          `http://127.0.0.1:${chrome.port}/json/new?about:blank`,
          { method: "PUT" }
        );
      } catch {
        pageTarget = await fetchJson(
          `http://127.0.0.1:${chrome.port}/json/new?about:blank`
        );
      }
    }
    assert(pageTarget?.webSocketDebuggerUrl, "Chrome did not expose a page target.");
    page = await CDPClient.connect(pageTarget.webSocketDebuggerUrl);

    // Give the page clipboard access so the copy interaction can be read back.
    for (const permissions of [
      ["clipboardReadWrite", "clipboardSanitizedWrite"],
      ["clipboardReadWrite"],
    ]) {
      try {
        await browser.send("Browser.grantPermissions", {
          origin: baseOrigin,
          permissions,
        });
        break;
      } catch (error) {
        if (permissions.length === 1) {
          warnings.push(`Clipboard permission grant failed: ${error.message}`);
        }
      }
    }

    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Network.enable");
    await page.send("Log.enable");
    await page.send("Page.bringToFront");
    await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Stub window.open so external-form checks can assert the exact call
    // without opening Google Forms.
    await page.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `window.__verifyOpened = [];
        window.open = function (...args) {
          window.__verifyOpened.push(args);
          return null;
        };`,
    });

    page.on("Runtime.exceptionThrown", (params) => {
      const description =
        params.exceptionDetails?.exception?.description ||
        params.exceptionDetails?.text ||
        "unknown exception";
      runtimeErrors.push({
        phase: currentPhase,
        source: "exception",
        message: description,
      });
    });
    page.on("Runtime.consoleAPICalled", (params) => {
      if (params.type !== "error" && params.type !== "assert") return;
      const message = params.args
        .map((arg) => arg.value ?? arg.description ?? arg.type)
        .join(" ");
      runtimeErrors.push({ phase: currentPhase, source: params.type, message });
    });
    page.on("Log.entryAdded", (params) => {
      if (params.entry?.level !== "error") return;
      runtimeErrors.push({
        phase: currentPhase,
        source: "log",
        message: `${params.entry.text}${params.entry.url ? ` (${params.entry.url})` : ""}`,
      });
    });
    page.on("Network.requestWillBeSent", (params) => {
      requestUrls.set(params.requestId, params.request.url);
      if (params.request.url === SURVEY_ENDPOINT) {
        surveyNetworkRequests.push({
          url: params.request.url,
          method: params.request.method,
          headers: params.request.headers,
        });
      }
    });
    page.on("Network.loadingFailed", (params) => {
      if (params.canceled || params.errorText === "net::ERR_ABORTED") return;
      const url = requestUrls.get(params.requestId) || "";
      if (isIgnorableRemoteAsset(url)) return;
      failedRequests.push({
        phase: currentPhase,
        source: "request",
        message: `${params.errorText || "request failed"} ${url}`,
      });
    });
    page.on("Network.responseReceived", (params) => {
      const { response, type } = params;
      if (!response || response.status < 400) return;
      if (isIgnorableRemoteAsset(response.url)) return;
      if (!response.url.startsWith(baseUrl)) return;
      failedRequests.push({
        phase: currentPhase,
        source: "response",
        message: `HTTP ${response.status} ${type} ${response.url}`,
      });
    });

    const evaluate = async (expression) => {
      const result = await page.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
        userGesture: true,
      });
      if (result.exceptionDetails) {
        const description =
          result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text ||
          "evaluation failed";
        throw new Error(description);
      }
      return result.result.value;
    };

    const waitFor = async (predicate, label, timeoutMs = 8000) => {
      const deadline = Date.now() + timeoutMs;
      let lastError = null;
      while (Date.now() < deadline) {
        try {
          if (await predicate()) return;
        } catch (error) {
          lastError = error;
        }
        await sleep(100);
      }
      throw new Error(
        `Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ""}`
      );
    };

    const waitForLoad = async () => {
      await waitFor(async () => {
        const ready = await evaluate("document.readyState");
        return ready === "complete";
      }, "document readyState=complete", 15000);
      await waitFor(
        async () =>
          (await evaluate("!!document.querySelector('main')")) ||
          (await evaluate("!!document.querySelector('[role=\"dialog\"]')")),
        "main content",
        15000
      );
      await sleep(500);
    };

    const goto = async (route) => {
      await page.send("Page.navigate", { url: `${baseUrl}${route}` });
      await waitForLoad();
    };

    const gotoRaw = async (route) => {
      await page.send("Page.navigate", { url: `${baseUrl}${route}` });
      await waitFor(
        async () => (await evaluate("document.readyState")) === "complete",
        "document readyState=complete",
        15000
      );
      await sleep(600);
    };

    const currentPath = () => evaluate("location.pathname");

    const waitForPath = async (expectedPath, timeoutMs = 10000) => {
      await waitFor(
        async () => (await currentPath()) === expectedPath,
        `path ${expectedPath}`,
        timeoutMs
      );
      await sleep(400);
    };

    const trustedClick = async (finderExpression) => {
      const point = await evaluate(`(() => {
        const el = (${finderExpression});
        if (!el) return null;
        el.scrollIntoView({ block: "center", inline: "center" });
        const rect = el.getBoundingClientRect();
        return {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
      })()`);
      assert(point, "element was not found");
      assert(point.width > 0 && point.height > 0, "element is not visible");
      await page.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: point.x,
        y: point.y,
      });
      await page.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: point.x,
        y: point.y,
        button: "left",
        clickCount: 1,
      });
      await page.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: point.x,
        y: point.y,
        button: "left",
        clickCount: 1,
      });
      await sleep(100);
    };

    const pressKey = async (key, code, virtualKeyCode, text) => {
      const base = {
        key,
        code,
        windowsVirtualKeyCode: virtualKeyCode,
        nativeVirtualKeyCode: virtualKeyCode,
      };
      await page.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        ...base,
        ...(text ? { text, unmodifiedText: text } : {}),
      });
      await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
      await sleep(100);
    };

    const bodyText = () =>
      evaluate("document.body.innerText.replace(/\\s+/g, ' ').trim()");

    const buttonText = (prefix) =>
      evaluate(`(() => {
        const button = [...document.querySelectorAll("button")].find((item) =>
          item.textContent.trim().startsWith(${JSON.stringify(prefix)})
        );
        return button ? button.textContent.trim() : null;
      })()`);

    const installSurveyHelpers = async () => {
      await evaluate(`(() => {
        const normalize = (value) => (value || "").replace(/\\s+/g, " ").trim();
        const question = (number) => {
          const heading = [...document.querySelectorAll("main h3")].find((item) =>
            normalize(item.textContent).startsWith(String(number) + ".")
          );
          return heading ? heading.closest("div.space-y-8") : null;
        };
        const rows = (number) => {
          const scope = question(number);
          return scope ? [...scope.querySelectorAll("div.cursor-pointer")] : [];
        };
        const row = (number, text) =>
          rows(number).find((item) => normalize(item.textContent).includes(text)) || null;
        const rowExact = (number, text) =>
          rows(number).find((item) => normalize(item.textContent) === text) || null;
        const labeledField = (scope, labelPrefix) => {
          if (!scope) return null;
          const label = [...scope.querySelectorAll("label")].find((item) =>
            normalize(item.textContent).startsWith(labelPrefix)
          );
          if (!label) return null;
          return label.parentElement?.querySelector("input, textarea") ?? label.nextElementSibling;
        };
        const field = (number, labelPrefix) => labeledField(question(number), labelPrefix);
        const contactField = (labelPrefix) => {
          const label = [...document.querySelectorAll("main label")].find((item) =>
            normalize(item.textContent).startsWith(labelPrefix)
          );
          return label?.parentElement?.querySelector("input, textarea") ?? null;
        };
        const followUpRow = (text) => {
          const label = [...document.querySelectorAll("main label")].find((item) =>
            normalize(item.textContent) === "May we follow up?"
          );
          const scope = label?.parentElement;
          if (!scope) return null;
          return [...scope.querySelectorAll("div.cursor-pointer")].find((item) =>
            normalize(item.textContent).includes(text)
          ) || null;
        };
        const setValue = (element, value) => {
          if (!element) return false;
          const prototype = element.tagName === "TEXTAREA"
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
          if (!setter) return false;
          setter.call(element, value);
          element.dispatchEvent(new Event("input", { bubbles: true }));
          return true;
        };
        window.__survey = {
          normalize,
          question,
          row,
          rowExact,
          field,
          contactField,
          followUpRow,
          setValue
        };
        return true;
      })()`);
    };

    const clickSurveyRow = async (number, text, exact = false) => {
      await trustedClick(
        `(() => window.__survey?.${exact ? "rowExact" : "row"}(${number}, ${JSON.stringify(text)}))()`
      );
    };

    const clickSurveyFollowUp = async (text) => {
      await trustedClick(
        `(() => window.__survey?.followUpRow(${JSON.stringify(text)}))()`
      );
    };

    const setSurveyField = async (number, labelPrefix, value) => {
      const updated = await evaluate(
        `(() => window.__survey?.setValue(window.__survey?.field(${number}, ${JSON.stringify(labelPrefix)}), ${JSON.stringify(value)}))()`
      );
      assert(updated, `could not set ${JSON.stringify(labelPrefix)} in Q${number}`);
    };

    const setSurveyContact = async (labelPrefix, value) => {
      const updated = await evaluate(
        `(() => window.__survey?.setValue(window.__survey?.contactField(${JSON.stringify(labelPrefix)}), ${JSON.stringify(value)}))()`
      );
      assert(updated, `could not set contact field ${JSON.stringify(labelPrefix)}`);
    };

    const surveyFieldValue = (number, labelPrefix) =>
      evaluate(
        `window.__survey?.field(${number}, ${JSON.stringify(labelPrefix)})?.value ?? null`
      );

    const surveyContactValue = (labelPrefix) =>
      evaluate(
        `window.__survey?.contactField(${JSON.stringify(labelPrefix)})?.value ?? null`
      );

    const surveyRowState = (number, text, exact = false) =>
      evaluate(`(() => {
        const row = window.__survey?.${exact ? "rowExact" : "row"}(${number}, ${JSON.stringify(text)});
        if (!row) return null;
        const control = row.querySelector("[data-state]");
        return {
          checked: control?.getAttribute("data-state") === "checked",
          text: window.__survey.normalize(row.textContent)
        };
      })()`);

    const surveyFollowUpState = (text) =>
      evaluate(`(() => {
        const row = window.__survey?.followUpRow(${JSON.stringify(text)});
        if (!row) return null;
        const control = row.querySelector("[data-state]");
        return {
          checked: control?.getAttribute("data-state") === "checked",
          text: window.__survey.normalize(row.textContent)
        };
      })()`);

    const submitSurvey = async () => {
      await trustedClick(
        `[...document.querySelectorAll("button")].find((button) => button.textContent.includes("SUBMIT MY TWO CENTS!"))`
      );
    };

    console.log("\nHTTP route checks");
    for (const route of EXPECTED_ROUTES) {
      const expectation = ROUTE_EXPECTATIONS[route];
      await check(`GET ${route}`, async () => {
        const response = await fetch(`${baseUrl}${route}`, {
          signal: AbortSignal.timeout(15000),
          redirect: "follow",
        });
        assert(response.status === 200, `expected HTTP 200, got ${response.status}`);
        const html = await response.text();
        for (const marker of expectation.markers) {
          assert(html.includes(marker), `response HTML is missing ${JSON.stringify(marker)}`);
        }
        return `HTTP 200, ${expectation.markers.length} content marker(s)`;
      });
    }

    await check("GET /closerlook contains all five exact Google Docs URLs", async () => {
      const response = await fetch(`${baseUrl}/closerlook`, {
        signal: AbortSignal.timeout(15000),
      });
      assert(response.status === 200, `expected HTTP 200, got ${response.status}`);
      const html = await response.text();
      for (const url of CLOSERLOOK_DOC_URLS) {
        assert(
          html.includes(url.replace(/&/g, "&amp;")),
          `response HTML is missing document URL ${url}`
        );
      }
      return "5 exact document URLs";
    });

    await check("page metadata and favicon are present, unique, and canonical-free", async () => {
      const titles = [];
      for (const route of EXPECTED_ROUTES) {
        const response = await fetch(`${baseUrl}${route}`, {
          signal: AbortSignal.timeout(15000),
        });
        assert(
          response.status === 200,
          `${route} returned HTTP ${response.status}`
        );
        const html = await response.text();
        const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
        assert(title, `${route} has no <title>`);
        titles.push(`${route} → ${title}`);

        const description = html.match(
          /<meta name="description" content="([^"]+)/
        )?.[1];
        assert(description, `${route} has no meta description`);
        assert(
          /<meta property="og:title" content="[^"]+"/.test(html),
          `${route} has no og:title`
        );
        assert(
          /<meta property="og:description" content="[^"]+"/.test(html),
          `${route} has no og:description`
        );
        assert(
          !/rel="canonical"/.test(html),
          `${route} emits a canonical URL but no production domain is confirmed`
        );
        assert(/rel="icon"/.test(html), `${route} has no icon link`);
      }

      const uniqueTitles = new Set(titles.map((entry) => entry.split(" → ")[1]));
      assert(
        uniqueTitles.size === titles.length,
        `duplicate page titles: ${titles.join(" | ")}`
      );

      for (const asset of ["/favicon.ico", "/icon.svg"]) {
        const response = await fetch(`${baseUrl}${asset}`, {
          signal: AbortSignal.timeout(15000),
        });
        assert(
          response.status === 200,
          `${asset} returned HTTP ${response.status}`
        );
      }

      return `${titles.length} unique titles, descriptions, OG tags, no canonical, favicon assets 200`;
    });

    console.log("\nBrowser route checks");
    currentPhase = "route rendering";
    for (const route of EXPECTED_ROUTES) {
      const expectation = ROUTE_EXPECTATIONS[route];
      await goto(route);

      await check(`${route} heading`, async () => {
        const heading = await evaluate(
          "document.querySelector('h1')?.textContent?.replace(/\\s+/g, ' ').trim() ?? null"
        );
        assert(heading, "no h1 found");
        assert(
          heading.includes(expectation.heading),
          `expected h1 to include ${JSON.stringify(expectation.heading)}, got ${JSON.stringify(heading)}`
        );
        return heading;
      });

      await check(`${route} rendered content`, async () => {
        const text = (await bodyText()).toLowerCase();
        for (const marker of expectation.markers) {
          assert(
            text.includes(marker.toLowerCase()),
            `rendered page is missing ${JSON.stringify(marker)}`
          );
        }
        return `${expectation.markers.length} marker(s)`;
      });

      await check(`${route} main target`, async () => {
        const main = await evaluate(`(() => {
          const el = document.querySelector("main");
          return el ? { id: el.id, tabIndex: el.tabIndex } : null;
        })()`);
        assert(main, "no <main> element found");
        assert(main.id === "main-content", `main id is ${JSON.stringify(main.id)}`);
        assert(main.tabIndex === -1, `main tabIndex is ${main.tabIndex}`);
        return "main#main-content with tabIndex=-1";
      });

      await check(`${route} skip navigation`, async () => {
        const nav = await evaluate(`(() => {
          const nav = document.querySelector('nav[aria-label="TUC sections"]');
          if (!nav) return null;
          return {
            anchors: [...nav.querySelectorAll("a")].map((a) => ({
              href: a.getAttribute("href"),
              current: a.getAttribute("aria-current")
            }))
          };
        })()`);
        assert(nav, "skip navigation is missing");
        const skipLink = nav.anchors[0];
        assert(
          skipLink?.href === "#main-content",
          `first skip link is ${JSON.stringify(skipLink?.href)}`
        );
        const routeLinks = nav.anchors.slice(1).map((anchor) => anchor.href);
        assert(
          JSON.stringify(routeLinks) === JSON.stringify(SKIP_NAV_LINKS),
          `skip links are ${JSON.stringify(routeLinks)}, expected ${JSON.stringify(SKIP_NAV_LINKS)}`
        );
        const current = nav.anchors.filter((anchor) => anchor.current === "page");
        assert(
          current.length === 1 && current[0].href === route,
          `aria-current="page" is on ${JSON.stringify(current.map((a) => a.href))}`
        );
        return `${routeLinks.length} route links + skip target, current=${route}`;
      });
    }

    console.log("\nConcept CTA chain");
    currentPhase = "concept CTA chain";
    await goto("/black-hand");
    await check("concept route CTA chain", async () => {
      const chain = [
        ["/black-hand", "/earth-globe"],
        ["/earth-globe", "/yellow-sticky-note"],
        ["/yellow-sticky-note", "/red-flag"],
        ["/red-flag", "/crumpled-paper"],
        ["/crumpled-paper", "/top10-poc"],
      ];
      for (const [from, to] of chain) {
        assert((await currentPath()) === from, `expected to start at ${from}`);
        await evaluate("window.scrollTo(0, 500)");
        await trustedClick(
          `(() => { const buttons = [...document.querySelectorAll('[role="dialog"] button')]; return buttons[buttons.length - 1]; })()`
        );
        await waitForPath(to);
      }
      return "black-hand → earth-globe → yellow-sticky-note → red-flag → crumpled-paper → top10-poc";
    });

    console.log("\nTop10 checks");
    currentPhase = "top10";
    await check("Top10 has 17 engagement cards and 3 priorities", async () => {
      const result = await evaluate(`(() => ({
        cards: [...document.querySelectorAll("main section h3")].length,
        priorities: [...document.querySelectorAll("main section > div > h2")].map((h) => h.textContent.trim()),
        openItemsCard: !!document.querySelector('main a[href="/open-items"]')
      }))()`);
      assert(result.cards === 17, `expected 17 cards, got ${result.cards}`);
      assert(result.priorities.length === 3, `expected 3 priorities, got ${result.priorities.length}`);
      assert(result.openItemsCard, "OpenItems card link is missing");
      return `${result.cards} cards, ${result.priorities.length} priorities`;
    });

    await check("Top10 dialog opens, lists five Top10s, and closes with Escape", async () => {
      await trustedClick(
        `document.querySelector('button[aria-label="Explore TUC Through Top10s"]')`
      );
      await waitFor(
        async () => await evaluate("!!document.querySelector('[role=\"dialog\"]')"),
        "Top10 dialog"
      );
      await sleep(250);
      const dialog = await evaluate(`(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return {
          title: dialog?.querySelector("h2")?.textContent?.trim() ?? null,
          text: dialog?.innerText ?? "",
          buttons: [...(dialog?.querySelectorAll("button") ?? [])].map((b) => b.textContent.trim())
        };
      })()`);
      assert(
        dialog.title === "Top10 Ways to Better Understand TUC",
        `unexpected dialog title ${JSON.stringify(dialog.title)}`
      );
      const listButtons = dialog.buttons.filter((text) => /^\d\. Top10 /.test(text));
      assert(listButtons.length === 5, `expected 5 Top10 list buttons, got ${listButtons.length}`);
      assert(
        dialog.text.includes("Suggest another Top10"),
        "Suggest another Top10 control is missing"
      );
      await pressKey("Escape", "Escape", 27);
      await waitFor(
        async () => !(await evaluate("!!document.querySelector('[role=\"dialog\"]')")),
        "dialog to close"
      );
      return "title, 5 lists, suggestion control, Escape close";
    });

    await check("Top10 suggestion form uses the exact URL and safe new tab", async () => {
      await trustedClick(
        `[...document.querySelectorAll("button")].find((button) => button.textContent.includes("Make a Suggestion"))`
      );
      await waitFor(
        async () =>
          (await evaluate("(window.__verifyOpened || []).length")) > 0,
        "window.open call"
      );
      const opened = await evaluate("window.__verifyOpened");
      assert(opened.length === 1, `expected 1 window.open call, got ${opened.length}`);
      const [url, target, features] = opened[0];
      assert(url === TOP10_FORM_URL, `unexpected form URL ${JSON.stringify(url)}`);
      assert(target === "_blank", `unexpected target ${JSON.stringify(target)}`);
      assert(
        /noopener/.test(features) && /noreferrer/.test(features),
        `window features are ${JSON.stringify(features)}`
      );
      return "exact ?usp=dialog URL, _blank, noopener+noreferrer";
    });

    console.log("\nOpenItems card and interactions");
    currentPhase = "openitems card";
    await check("Top10 OpenItems card is a keyboard-focusable link", async () => {
      const result = await evaluate(`(() => {
        const link = document.querySelector('main a[href="/open-items"]');
        if (!link) return null;
        link.focus();
        return {
          focused: document.activeElement === link,
          cursor: getComputedStyle(link).cursor,
          text: link.textContent.replace(/\\s+/g, " ").trim()
        };
      })()`);
      assert(result, "OpenItems link not found");
      assert(result.focused, "OpenItems link could not receive focus");
      assert(result.cursor === "pointer", `cursor is ${JSON.stringify(result.cursor)}`);
      return result.text.slice(0, 60);
    });

    await check("OpenItems card mouse click navigates to /open-items", async () => {
      await trustedClick(`document.querySelector('main a[href="/open-items"]')`);
      await waitForPath("/open-items");
      return await currentPath();
    });

    await check("OpenItems copy: clipboard, button label, toast, and 2s reset", async () => {
      const startedAt = Date.now();
      await trustedClick(
        `[...document.querySelectorAll("button")].find((button) => button.textContent.trim().startsWith("COPY TASK ID"))`
      );

      await waitFor(
        async () => (await buttonText("COPIED")) === "COPIED",
        "COPIED button label"
      );
      const copiedAt = Date.now();

      let clipboard = null;
      let clipboardError = null;
      try {
        clipboard = await evaluate("navigator.clipboard.readText()");
      } catch (error) {
        clipboardError = error;
      }

      await waitFor(
        async () => {
          const text = await bodyText();
          return text.includes("ID Copied") && text.includes("TUC-TASK-0002 copied to clipboard.");
        },
        "copy toast"
      );

      await sleep(Math.max(0, 600 - (Date.now() - startedAt)));
      const stillCopied = (await buttonText("COPIED")) === "COPIED";
      assert(stillCopied, "button reset before the 2 second delay");

      const targetResetAt = startedAt + 2300;
      await sleep(Math.max(0, targetResetAt - Date.now()));
      const resetLabel = await buttonText("COPY TASK ID");
      assert(
        resetLabel === "COPY TASK ID: TUC-TASK-0002",
        `button label after reset is ${JSON.stringify(resetLabel)}`
      );

      if (clipboardError) {
        recordSkip(
          "OpenItems clipboard contents",
          `clipboard read unavailable: ${clipboardError.message}`
        );
      } else {
        assert(
          clipboard === "TUC-TASK-0002",
          `clipboard contains ${JSON.stringify(clipboard)}`
        );
      }

      return `COPIED at ${copiedAt - startedAt}ms, reset by ${Date.now() - startedAt}ms`;
    });

    await check("OpenItems external form uses the exact URL and safe new tab", async () => {
      const link = await evaluate(`(() => {
        const anchor = [...document.querySelectorAll("a")].find((a) =>
          a.textContent.includes("I CAN HELP")
        );
        if (!anchor) return null;
        return {
          href: anchor.getAttribute("href"),
          target: anchor.getAttribute("target"),
          rel: anchor.getAttribute("rel")
        };
      })()`);
      assert(link, "I CAN HELP link not found");
      assert(link.href === OPEN_ITEMS_FORM_URL, `unexpected href ${JSON.stringify(link.href)}`);
      assert(link.target === "_blank", `unexpected target ${JSON.stringify(link.target)}`);
      assert(
        /noopener/.test(link.rel) && /noreferrer/.test(link.rel),
        `unexpected rel ${JSON.stringify(link.rel)}`
      );
      return "exact URL, _blank, noopener+noreferrer";
    });

    await check("OpenItems Back to Top10 resets scroll", async () => {
      await evaluate("window.scrollTo(0, 500)");
      await trustedClick(
        `[...document.querySelectorAll("button")].find((button) => button.textContent.includes("BACK TO TOP10"))`
      );
      await waitForPath("/top10-poc");
      await sleep(150);
      const scrollY = await evaluate("window.scrollY");
      assert(scrollY === 0, `scrollY after navigation is ${scrollY}`);
      return "scrollY=0";
    });

    await check("OpenItems card Enter key navigates to /open-items", async () => {
      const focused = await evaluate(`(() => {
        const link = document.querySelector('main a[href="/open-items"]');
        if (!link) return false;
        link.focus();
        return document.activeElement === link;
      })()`);
      assert(focused, "OpenItems link could not receive focus");
      await pressKey("Enter", "Enter", 13, "\r");
      await waitForPath("/open-items");
      return "/open-items";
    });

    await check("OpenItems Home resets scroll and navigates to /", async () => {
      await evaluate("window.scrollTo(0, 500)");
      await trustedClick(
        `[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "HOME")`
      );
      await waitForPath("/");
      await sleep(150);
      const scrollY = await evaluate("window.scrollY");
      assert(scrollY === 0, `scrollY after navigation is ${scrollY}`);
      return "scrollY=0";
    });

    await check("skip navigation is keyboard discoverable and focuses main", async () => {
      await goto("/open-items");
      await pressKey("Tab", "Tab", 9);
      const first = await evaluate(`(() => {
        const active = document.activeElement;
        const nav = document.querySelector('nav[aria-label="TUC sections"]');
        const rect = nav?.getBoundingClientRect();
        return {
          tag: active?.tagName ?? null,
          href: active?.getAttribute?.("href") ?? null,
          navVisible: !!rect && rect.width > 0 && rect.height > 0
        };
      })()`);
      assert(first.tag === "A", `first Tab focus is ${first.tag}, expected the skip link`);
      assert(
        first.href === "#main-content",
        `first Tab focus has href ${JSON.stringify(first.href)}`
      );
      assert(first.navVisible, "skip navigation did not become visible when focused");
      await pressKey("Enter", "Enter", 13, "\r");
      await sleep(150);
      const focusedId = await evaluate("document.activeElement?.id ?? null");
      assert(
        focusedId === "main-content",
        `after activating skip link, focus is on ${JSON.stringify(focusedId)}`
      );
      return "Tab reveals nav, Enter focuses main#main-content";
    });

    console.log("\nCloserLook checks");
    currentPhase = "closerlook";
    await goto("/closerlook");

    await check("CloserLook has five safe external document links", async () => {
      const links = await evaluate(`(() => [...document.querySelectorAll('main a[target="_blank"]')].map((anchor) => ({
        href: anchor.getAttribute("href"),
        target: anchor.getAttribute("target"),
        rel: anchor.getAttribute("rel"),
        label: anchor.getAttribute("aria-label")
      })))()`);
      assert(links.length === CLOSERLOOK_DOC_URLS.length, `found ${links.length} external links, expected ${CLOSERLOOK_DOC_URLS.length}`);
      for (const url of CLOSERLOOK_DOC_URLS) {
        const link = links.find((candidate) => candidate.href === url);
        assert(link, `missing document link ${url}`);
        assert(link.target === "_blank", `${url} target is ${JSON.stringify(link.target)}`);
        assert(
          /noopener/.test(link.rel) && /noreferrer/.test(link.rel),
          `${url} rel is ${JSON.stringify(link.rel)}`
        );
        assert(
          /\(opens in a new tab\)$/.test(link.label || ""),
          `${url} aria-label is ${JSON.stringify(link.label)}`
        );
      }
      return "5 exact URLs, _blank, noopener+noreferrer";
    });

    const perspectivesTrigger =
      `[...document.querySelectorAll("main button")].find((button) => button.textContent.trim().startsWith("Perspectives"))`;
    const accordionState = () =>
      evaluate(`(() => {
        const trigger = ${perspectivesTrigger};
        if (!trigger) return null;
        const content = document.getElementById(trigger.getAttribute("aria-controls"));
        return {
          expanded: trigger.getAttribute("aria-expanded"),
          state: trigger.getAttribute("data-state"),
          contentState: content?.getAttribute("data-state") ?? null,
          contentRole: content?.getAttribute("role") ?? null,
          contentText: content ? content.innerText.replace(/\\s+/g, " ").trim() : "",
          contentVisible: !!content && content.getBoundingClientRect().height > 0
        };
      })()`);

    await check("Perspectives accordion opens and closes by mouse", async () => {
      const closed = await accordionState();
      assert(closed, "Perspectives trigger not found");
      assert(closed.expanded === "false", `initial aria-expanded is ${JSON.stringify(closed.expanded)}`);
      assert(!closed.contentVisible, "accordion content is visible before opening");

      await trustedClick(perspectivesTrigger);
      await waitFor(
        async () => (await accordionState())?.expanded === "true",
        "accordion to open"
      );
      const opened = await accordionState();
      assert(opened.state === "open", `trigger data-state is ${JSON.stringify(opened.state)}`);
      assert(opened.contentState === "open", `content data-state is ${JSON.stringify(opened.contentState)}`);
      assert(opened.contentRole === "region", `content role is ${JSON.stringify(opened.contentRole)}`);
      assert(opened.contentVisible, "accordion content is not visible after opening");
      for (const phrase of [
        "No single perspective is assumed to be the correct one.",
        "What could TUC help me discover, understand, contribute to or build on?",
        "How could existing people, knowledge and resources become more visible, connected and useful?",
        "Could TUC reduce fragmentation, duplication and wasted effort",
        "What could TUC mean from strategic, operational, financial, technological and other leadership perspectives?",
      ]) {
        assert(opened.contentText.includes(phrase), `expanded content is missing ${JSON.stringify(phrase)}`);
      }

      await trustedClick(perspectivesTrigger);
      await waitFor(
        async () => (await accordionState())?.expanded === "false",
        "accordion to close"
      );
      const reclosed = await accordionState();
      assert(!reclosed.contentVisible, "accordion content is still visible after closing");
      return "aria-expanded false → true → false";
    });

    await check("Perspectives accordion opens and closes by keyboard", async () => {
      const focused = await evaluate(`(() => {
        const trigger = ${perspectivesTrigger};
        if (!trigger) return false;
        trigger.focus();
        return document.activeElement === trigger;
      })()`);
      assert(focused, "Perspectives trigger could not receive focus");

      await pressKey("Enter", "Enter", 13, "\r");
      await waitFor(
        async () => (await accordionState())?.expanded === "true",
        "keyboard open"
      );

      await pressKey(" ", "Space", 32, " ");
      await waitFor(
        async () => (await accordionState())?.expanded === "false",
        "keyboard close"
      );
      return "Enter opens, Space closes";
    });

    await check("CloserLook Back returns to the previous in-app route", async () => {
      await goto("/top10-poc");
      await evaluate(
        `document.querySelector('nav[aria-label="TUC sections"] a[href="/closerlook"]').click()`
      );
      await waitForPath("/closerlook");
      await trustedClick(
        `document.querySelector('button[aria-label="Return to previous view"]')`
      );
      await waitForPath("/top10-poc");
      return "/top10-poc → /closerlook → Back → /top10-poc";
    });

    await check("CloserLook direct entry uses browser history with no in-app fallback", async () => {
      const targetUrl = `http://127.0.0.1:${chrome.port}/json/new?${baseUrl}/closerlook`;
      let directTarget;
      try {
        directTarget = await fetchJson(targetUrl, { method: "PUT" });
      } catch {
        directTarget = await fetchJson(targetUrl);
      }
      assert(directTarget?.webSocketDebuggerUrl, "direct-entry target was not created");
      const direct = await CDPClient.connect(directTarget.webSocketDebuggerUrl);
      const evaluateDirect = async (expression) => {
        const result = await direct.send("Runtime.evaluate", {
          expression,
          returnByValue: true,
          awaitPromise: true,
          userGesture: true,
        });
        if (result.exceptionDetails) {
          throw new Error(
            result.exceptionDetails.exception?.description ||
              result.exceptionDetails.text ||
              "evaluation failed"
          );
        }
        return result.result.value;
      };
      try {
        await direct.send("Page.enable");
        await direct.send("Runtime.enable");
        await waitFor(
          async () => (await evaluateDirect("document.readyState")) === "complete",
          "direct-entry document",
          15000
        );
        await sleep(1200);
        const historyLength = await evaluateDirect("window.history.length");
        assert(
          historyLength === 1,
          `direct-entry history.length is ${historyLength}, expected 1`
        );
        const before = await evaluateDirect("location.pathname");
        assert(before === "/closerlook", `direct entry opened at ${before}`);

        await evaluateDirect(
          `document.querySelector('button[aria-label="Return to previous view"]').click()`
        );
        await sleep(800);
        const after = await evaluateDirect("location.pathname");
        assert(
          after === "/closerlook",
          `Back from direct entry navigated to ${after}; expected history back to be a no-op`
        );
        return "history.length=1, Back is a no-op (no in-app fallback)";
      } finally {
        direct.close();
        await fetch(`http://127.0.0.1:${chrome.port}/json/close/${directTarget.id}`).catch(
          () => {}
        );
      }
    });

    console.log("\nSurvey checks");
    currentPhase = "survey";
    await goto("/survey-poc");
    await installSurveyHelpers();

    const appsScriptRequests = [];
    const appsScriptControl = { mode: "block", held: null };
    page.on("Fetch.requestPaused", (params) => {
      const record = {
        requestId: params.requestId,
        url: params.request.url,
        method: params.request.method,
        headers: params.request.headers,
        postData:
          params.request.postData ??
          params.request.postDataEntries
            ?.map((entry) => Buffer.from(entry.bytes, "base64").toString("utf8"))
            .join("") ??
          "",
      };
      appsScriptRequests.push(record);

      if (appsScriptControl.mode === "hold") {
        appsScriptControl.held = record;
        return;
      }

      const action =
        appsScriptControl.mode === "fulfill"
          ? page.send("Fetch.fulfillRequest", {
              requestId: params.requestId,
              responseCode: 200,
              responseHeaders: [{ name: "Content-Type", value: "text/plain" }],
              body: Buffer.from("ok").toString("base64"),
            })
          : page.send("Fetch.failRequest", {
              requestId: params.requestId,
              errorReason: appsScriptControl.mode === "fail" ? "Failed" : "Aborted",
            });
      action.catch((error) => {
        warnings.push(`Apps Script interception error: ${error.message}`);
      });
    });
    await page.send("Fetch.enable", {
      patterns: [
        {
          urlPattern: "https://script.google.com/*",
          requestStage: "Request",
        },
      ],
    });

    await check("Survey has 12 questions, 5 sections, 95 option rows, and exact content", async () => {
      const structure = await evaluate(`(() => {
        const headings = [...document.querySelectorAll("main h3")]
          .map((item) => window.__survey.normalize(item.textContent))
          .filter((text) => /^\\d+\\./.test(text));
        const sections = [...document.querySelectorAll("main h2")]
          .map((item) => window.__survey.normalize(item.textContent));
        const counts = {};
        for (const number of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
          counts[number] = window.__survey.question(number)?.querySelectorAll("div.cursor-pointer").length ?? -1;
        }
        const followUpLabel = [...document.querySelectorAll("main label")].find((item) =>
          window.__survey.normalize(item.textContent) === "May we follow up?"
        );
        counts.followUp = followUpLabel?.parentElement?.querySelectorAll("div.cursor-pointer").length ?? -1;
        const submit = [...document.querySelectorAll("button")].find((item) =>
          item.textContent.includes("SUBMIT MY TWO CENTS!")
        );
        return {
          headings,
          sections,
          counts,
          hasForm: !!document.querySelector("main form"),
          namePlaceholder: document.querySelector('main input[placeholder="Esther..."]')?.getAttribute("placeholder") ?? null,
          emailPlaceholder: document.querySelector('main input[placeholder="esther@tuc.org..."]')?.getAttribute("placeholder") ?? null,
          emptyFields: [...document.querySelectorAll("main input, main textarea")].every((item) => !item.value),
          submit: submit ? {
            text: window.__survey.normalize(submit.textContent),
            disabled: submit.disabled
          } : null
        };
      })()`);

      assert(structure.headings.length === 12, `expected 12 question headings, got ${structure.headings.length}`);
      for (let index = 0; index < SURVEY_QUESTION_HEADINGS.length; index += 1) {
        assert(
          structure.headings[index] === SURVEY_QUESTION_HEADINGS[index],
          `question ${index + 1} heading is ${JSON.stringify(structure.headings[index])}`
        );
      }
      assert(
        JSON.stringify(structure.sections) === JSON.stringify([
          "Part 1 — Your TUC Experience",
          "Part 2 — Connections & Possibilities",
          "Part 3 — Connecting the Dots",
          "Part 4 — Your Two Cents",
          "Optional — Stay Connected",
        ]),
        `section headings are ${JSON.stringify(structure.sections)}`
      );
      assert(
        JSON.stringify(structure.counts) === JSON.stringify(SURVEY_ROW_COUNTS),
        `option row counts are ${JSON.stringify(structure.counts)}`
      );
      assert(!structure.hasForm, "survey should not render a <form> element");
      assert(
        structure.namePlaceholder === "Esther...",
        `name placeholder is ${JSON.stringify(structure.namePlaceholder)}`
      );
      assert(
        structure.emailPlaceholder === "esther@tuc.org...",
        `email placeholder is ${JSON.stringify(structure.emailPlaceholder)}`
      );
      assert(structure.emptyFields, "survey fields should start empty");
      assert(structure.submit, "submit button not found");
      assert(
        structure.submit.text === "SUBMIT MY TWO CENTS!",
        `submit text is ${JSON.stringify(structure.submit.text)}`
      );
      assert(structure.submit.disabled === false, "submit button should start enabled");

      const text = (await bodyText()).toLowerCase();
      for (const marker of SURVEY_TEXT_MARKERS) {
        assert(
          text.includes(marker.toLowerCase()),
          `survey is missing ${JSON.stringify(marker)}`
        );
      }
      return "12 questions, 5 sections, 95 option rows, exact content markers";
    });

    await check("Survey PASS semantics match legacy multi- and single-select behavior", async () => {
      await goto("/survey-poc");
      await installSurveyHelpers();

      await clickSurveyRow(1, "Just discovered it");
      await clickSurveyRow(1, "I've helped test, build, or improve it");
      assert(
        (await surveyRowState(1, "Just discovered it")).checked,
        "Q1 normal option did not select"
      );
      await clickSurveyRow(1, SURVEY_PASS_OPTION);
      assert(
        (await surveyRowState(1, SURVEY_PASS_OPTION)).checked,
        "Q1 PASS did not select"
      );
      assert(
        !(await surveyRowState(1, "Just discovered it")).checked,
        "Q1 PASS did not clear normal selections"
      );
      await clickSurveyRow(1, "I'm returning to see what's changed");
      assert(
        !(await surveyRowState(1, SURVEY_PASS_OPTION)).checked,
        "Q1 normal option did not clear PASS"
      );
      assert(
        (await surveyRowState(1, "I'm returning to see what's changed")).checked,
        "Q1 normal option did not select"
      );
      await clickSurveyRow(1, SURVEY_PASS_OPTION);
      await clickSurveyRow(1, SURVEY_PASS_OPTION);
      assert(
        (await surveyRowState(1, SURVEY_PASS_OPTION)).checked,
        "Q1 PASS should remain selected when clicked again"
      );

      await clickSurveyRow(1, "PASS 🧩", true);
      assert(
        (await surveyRowState(1, "PASS 🧩", true)).checked,
        "Q1 sub-question PASS did not select"
      );
      await clickSurveyRow(1, "Yes");
      assert(
        !(await surveyRowState(1, "PASS 🧩", true)).checked,
        "Q1 sub-question PASS did not clear"
      );
      assert((await surveyRowState(1, "Yes")).checked, "Q1 sub-question Yes did not select");

      await clickSurveyRow(3, "Maybe");
      await clickSurveyRow(3, "PASS 🧩", true);
      assert(
        (await surveyRowState(3, "PASS 🧩", true)).checked,
        "Q3 PASS did not select"
      );
      assert(!(await surveyRowState(3, "Maybe")).checked, "Q3 PASS did not clear Maybe");

      await clickSurveyRow(4, SURVEY_PASS_OPTION);
      assert(
        (await surveyRowState(4, SURVEY_PASS_OPTION)).checked,
        "Q4 PASS did not select"
      );

      await clickSurveyRow(5, "2% Spare Bandwidth");
      await clickSurveyRow(5, "CloserLook@");
      await clickSurveyRow(5, SURVEY_PASS_OPTION);
      assert(
        (await surveyRowState(5, SURVEY_PASS_OPTION)).checked,
        "Q5 PASS did not select"
      );
      assert(
        !(await surveyRowState(5, "2% Spare Bandwidth")).checked,
        "Q5 PASS did not clear normal selections"
      );
      await clickSurveyRow(5, "Top10");
      assert(
        !(await surveyRowState(5, SURVEY_PASS_OPTION)).checked,
        "Q5 normal option did not clear PASS"
      );
      assert((await surveyRowState(5, "Top10")).checked, "Q5 normal option did not select");

      await clickSurveyRow(7, "Just exploring for now");
      await clickSurveyRow(7, "PASS 🧩", true);
      assert(
        (await surveyRowState(7, "PASS 🧩", true)).checked,
        "Q7 sub-question PASS did not select"
      );
      assert(
        (await surveyRowState(7, "Just exploring for now")).checked,
        "Q7 main selection should remain independent of the sub-question"
      );

      await clickSurveyFollowUp("PASS 🧩");
      assert(
        (await surveyFollowUpState("PASS 🧩")).checked,
        "Follow-up PASS did not select"
      );

      await setSurveyField(11, "Your thoughts:", "temporary thoughts");
      assert(
        (await surveyFieldValue(11, "Your thoughts:")) === "temporary thoughts",
        "Q11 text was not set"
      );
      await clickSurveyRow(11, SURVEY_PASS_OPTION);
      assert(
        (await surveyFieldValue(11, "Your thoughts:")) === SURVEY_PASS_OPTION,
        "Q11 PASS did not overwrite text"
      );
      await clickSurveyRow(11, SURVEY_PASS_OPTION);
      assert(
        (await surveyFieldValue(11, "Your thoughts:")) === "",
        "Q11 PASS toggle did not clear text"
      );

      await setSurveyField(12, "Your question:", "temporary question");
      await clickSurveyRow(12, SURVEY_PASS_OPTION);
      assert(
        (await surveyFieldValue(12, "Your question:")) === SURVEY_PASS_OPTION,
        "Q12 PASS did not overwrite text"
      );
      await clickSurveyRow(12, SURVEY_PASS_OPTION);
      assert(
        (await surveyFieldValue(12, "Your question:")) === "",
        "Q12 PASS toggle did not clear text"
      );

      return "multi-select replace/remove, single-select, text PASS toggle, follow-up";
    });

    await check("Survey sends the exact payload, shows success, and returns to TUC", async () => {
      await goto("/survey-poc");
      await installSurveyHelpers();

      await clickSurveyRow(1, "Just discovered it");
      await clickSurveyRow(1, "I've helped test, build, or improve it");
      await setSurveyField(1, "Something else:", "M10 Q1 other");
      await clickSurveyRow(1, "Yes");

      await clickSurveyRow(2, "Someone introduced me to TUC");
      await clickSurveyRow(2, "I stumbled across it");
      await setSurveyField(2, "Something else:", "M10 Q2 other");

      await clickSurveyRow(3, "Maybe");
      await setSurveyField(3, "Optional: What caught or renewed your interest?", "M10 Q3 explanation");

      await clickSurveyRow(4, "I'm still learning");
      await setSurveyField(4, "Something else:", "M10 Q4 other");

      await clickSurveyRow(5, "2% Spare Bandwidth");
      await clickSurveyRow(5, "CloserLook@");
      await setSurveyField(5, "Something else:", "M10 Q5 other");

      await clickSurveyRow(6, "Explored the website or TUC documents");
      await setSurveyField(6, "Something else:", "M10 Q6 other");

      await clickSurveyRow(7, "Sharing ideas or suggestions");
      await clickSurveyRow(7, "Just exploring for now");
      await setSurveyField(7, "Something else:", "M10 Q7 other");
      await clickSurveyRow(7, "Maybe", true);

      await clickSurveyRow(8, "I understand TUC better");
      await setSurveyField(8, "Something else:", "M10 Q8 other");

      await clickSurveyRow(9, "No");
      await setSurveyField(9, "Optional: What did you notice?", "M10 Q9 details");

      await clickSurveyRow(10, "I have a theory");
      await setSurveyField(10, "Optional: What's your interpretation?", "M10 Q10 interpretation");

      await setSurveyField(11, "Your thoughts:", "M10 Q11 mind");
      await setSurveyField(12, "Your question:", "M10 Q12 question");
      await setSurveyContact("Name:", "M10 Test");
      await setSurveyContact("Email:", "m10@example.test");
      await clickSurveyFollowUp("No");

      appsScriptControl.mode = "fulfill";
      const requestIndex = appsScriptRequests.length;
      await submitSurvey();
      await waitFor(
        () => appsScriptRequests.length > requestIndex,
        "intercepted survey submission",
        10000
      );
      const request = appsScriptRequests[requestIndex];
      assert(request, "survey request was not captured");

      await waitFor(
        async () => (await bodyText()).includes("Didn't answer everything? No worries."),
        "survey success screen",
        10000
      );
      await waitFor(
        async () => (await bodyText()).includes("Survey Submitted!"),
        "survey success toast",
        5000
      );
      await waitFor(
        async () => (await evaluate("window.scrollY")) === 0,
        "survey success scroll to top",
        5000
      );

      assert(request.method === "POST", `survey method is ${JSON.stringify(request.method)}`);
      assert(request.url === SURVEY_ENDPOINT, `survey URL is ${JSON.stringify(request.url)}`);
      const header = (name) =>
        Object.entries(request.headers || {}).find(
          ([key]) => key.toLowerCase() === name
        )?.[1] ?? "";
      assert(
        /^text\/plain/.test(header("content-type")),
        `survey content-type is ${JSON.stringify(header("content-type"))}`
      );
      const surveySource = fs.readFileSync(
        path.join(ROOT, "src/app/survey-poc/page.tsx"),
        "utf8"
      );
      assert(
        /mode:\s*["']no-cors["']/.test(surveySource),
        "survey source is missing mode: no-cors"
      );
      assert(
        /Content-Type["']?\s*:\s*["']text\/plain;charset=utf-8["']/.test(surveySource),
        "survey source is missing the exact text/plain content type"
      );
      const endpointNetworkRequests = surveyNetworkRequests.filter(
        (item) => item.url === SURVEY_ENDPOINT
      );
      assert(
        endpointNetworkRequests.length === 1,
        `expected one network request to the survey endpoint, got ${endpointNetworkRequests.length}`
      );
      assert(
        endpointNetworkRequests.every((item) => item.method === "POST"),
        "survey endpoint received a non-POST/preflight request"
      );

      const payload = JSON.parse(request.postData);
      assert(payload.type === "TUC_SURVEY_SUBMISSION", `payload type is ${JSON.stringify(payload.type)}`);
      assert(
        /^TUC-SRV-[A-Z0-9]{1,6}-\d{4}$/.test(payload.responseId),
        `responseId is ${JSON.stringify(payload.responseId)}`
      );
      assert(
        Number.isFinite(Date.parse(payload.submittedAt)) &&
          Math.abs(Date.now() - Date.parse(payload.submittedAt)) < 60000,
        `submittedAt is ${JSON.stringify(payload.submittedAt)}`
      );

      const expected = {
        type: "TUC_SURVEY_SUBMISSION",
        name: "M10 Test",
        email: "m10@example.test",
        surveyVersion: "FINAL-2026-10-24",
        q1History: "Just discovered it, I've helped test, build, or improve it, M10 Q1 other",
        q1CompletedBefore: "Yes",
        q2FirstConnection: "Someone introduced me to TUC, I stumbled across it, M10 Q2 other",
        q3CuriositySparked: "Maybe",
        q3Explanation: "M10 Q3 explanation",
        q4UnderstandingTuc: "I'm still learning, M10 Q4 other",
        q5WhatStandsOut: "2% Spare Bandwidth, CloserLook@, M10 Q5 other",
        q6ActualEngagement: "Explored the website or TUC documents, M10 Q6 other",
        q7FutureInterests: "Sharing ideas or suggestions, Just exploring for now, M10 Q7 other",
        q7ImagineEngaging: "Maybe",
        q8PerspectiveChange: "I understand TUC better, M10 Q8 other",
        q9EasterEggsNoticed: "No",
        q9Details: "M10 Q9 details",
        q10PuzzleMeaning: "I have a theory",
        q10Interpretation: "M10 Q10 interpretation",
        q11Mind: "M10 Q11 mind",
        q12Question: "M10 Q12 question",
        questionsPassed: "",
        followUpPermission: "No",
      };
      const actual = { ...payload };
      delete actual.responseId;
      delete actual.submittedAt;
      assert(
        JSON.stringify(actual) === JSON.stringify(expected),
        `payload mismatch:\nactual=${JSON.stringify(actual)}\nexpected=${JSON.stringify(expected)}`
      );

      const successText = (await bodyText()).toLowerCase();
      for (const marker of [
        "SUBMIT MY TWO CENTS!",
        "Thanks for helping TUC get better!",
        "Didn't answer everything? No worries.",
        "Whether this is your first encounter or you've been part of the journey for years, there's always something more to discover, improve, or connect.",
        "Come back anytime. Your next visit might change your perspective—or ours.",
        "One contribution can become the starting point for many more.",
        "#itsotuc",
        "BACK TO TUC",
        "Survey Submitted!",
      ]) {
        assert(
          successText.includes(marker.toLowerCase()),
          `success screen is missing ${JSON.stringify(marker)}`
        );
      }
      assert(
        !successText.includes("part 1 — your tuc experience"),
        "success screen still contains the survey form"
      );

      await trustedClick(
        `[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "BACK TO TUC")`
      );
      await waitForPath("/");
      await sleep(150);
      assert((await evaluate("window.scrollY")) === 0, "BACK TO TUC did not reset scroll");
      return "exact payload, success screen, toast, scroll, BACK TO TUC";
    });

    await check("Survey payload records all 15 PASS labels in order", async () => {
      await goto("/survey-poc");
      await installSurveyHelpers();

      await clickSurveyRow(1, SURVEY_PASS_OPTION);
      await clickSurveyRow(1, "PASS 🧩", true);
      await clickSurveyRow(2, SURVEY_PASS_OPTION);
      await clickSurveyRow(3, "PASS 🧩", true);
      await clickSurveyRow(4, SURVEY_PASS_OPTION);
      await clickSurveyRow(5, SURVEY_PASS_OPTION);
      await clickSurveyRow(6, SURVEY_PASS_OPTION);
      await clickSurveyRow(7, SURVEY_PASS_OPTION);
      await clickSurveyRow(7, "PASS 🧩", true);
      await clickSurveyRow(8, SURVEY_PASS_OPTION);
      await clickSurveyRow(9, "PASS 🧩", true);
      await clickSurveyRow(10, "PASS 🧩", true);
      await clickSurveyRow(11, SURVEY_PASS_OPTION);
      await clickSurveyRow(12, SURVEY_PASS_OPTION);
      await clickSurveyFollowUp("PASS 🧩");

      appsScriptControl.mode = "fulfill";
      const requestIndex = appsScriptRequests.length;
      await submitSurvey();
      await waitFor(
        () => appsScriptRequests.length > requestIndex,
        "PASS survey submission",
        10000
      );
      const request = appsScriptRequests[requestIndex];
      await waitFor(
        async () => (await bodyText()).includes("Didn't answer everything? No worries."),
        "PASS survey success screen",
        10000
      );

      const payload = JSON.parse(request.postData);
      const expected = {
        type: "TUC_SURVEY_SUBMISSION",
        name: "",
        email: "",
        surveyVersion: "FINAL-2026-10-24",
        q1History: SURVEY_PASS_OPTION,
        q1CompletedBefore: SURVEY_PASS_OPTION,
        q2FirstConnection: SURVEY_PASS_OPTION,
        q3CuriositySparked: SURVEY_PASS_OPTION,
        q3Explanation: "",
        q4UnderstandingTuc: SURVEY_PASS_OPTION,
        q5WhatStandsOut: SURVEY_PASS_OPTION,
        q6ActualEngagement: SURVEY_PASS_OPTION,
        q7FutureInterests: SURVEY_PASS_OPTION,
        q7ImagineEngaging: SURVEY_PASS_OPTION,
        q8PerspectiveChange: SURVEY_PASS_OPTION,
        q9EasterEggsNoticed: SURVEY_PASS_OPTION,
        q9Details: "",
        q10PuzzleMeaning: SURVEY_PASS_OPTION,
        q10Interpretation: "",
        q11Mind: SURVEY_PASS_OPTION,
        q12Question: SURVEY_PASS_OPTION,
        questionsPassed: SURVEY_PASS_LABELS.join(", "),
        followUpPermission: SURVEY_PASS_OPTION,
      };
      const actual = { ...payload };
      delete actual.responseId;
      delete actual.submittedAt;
      assert(
        JSON.stringify(actual) === JSON.stringify(expected),
        `PASS payload mismatch:\nactual=${JSON.stringify(actual)}\nexpected=${JSON.stringify(expected)}`
      );
      return `${SURVEY_PASS_LABELS.length} PASS labels in exact order`;
    });

    await check("Survey failure preserves answers and re-enables submission", async () => {
      await goto("/survey-poc");
      await installSurveyHelpers();
      await setSurveyField(11, "Your thoughts:", "keep my answers");
      await setSurveyField(12, "Your question:", "keep my question");
      await setSurveyContact("Name:", "M10 Failure");
      await setSurveyContact("Email:", "failure@example.test");

      appsScriptControl.mode = "fail";
      currentPhase = "survey failure";
      const requestIndex = appsScriptRequests.length;
      await submitSurvey();
      await waitFor(
        () => appsScriptRequests.length > requestIndex,
        "intercepted failure submission",
        10000
      );
      await waitFor(
        async () => (await bodyText()).includes("Submission Error"),
        "survey failure toast",
        10000
      );

      const failureText = await bodyText();
      assert(failureText.includes("Submission Error"), "failure toast title is missing");
      assert(
        failureText.includes("Failed to fetch") ||
          failureText.includes("Something went wrong. Your answers are safe—please try again."),
        `unexpected failure description: ${failureText.slice(0, 500)}`
      );
      assert(
        !failureText.includes("Didn't answer everything? No worries."),
        "failure rendered the success screen"
      );
      assert(
        (await surveyFieldValue(11, "Your thoughts:")) === "keep my answers",
        "Q11 answer was not preserved after failure"
      );
      assert(
        (await surveyFieldValue(12, "Your question:")) === "keep my question",
        "Q12 answer was not preserved after failure"
      );
      assert(
        (await surveyContactValue("Name:")) === "M10 Failure",
        "name was not preserved after failure"
      );
      assert(
        (await surveyContactValue("Email:")) === "failure@example.test",
        "email was not preserved after failure"
      );

      const submitState = await evaluate(`(() => {
        const button = [...document.querySelectorAll("button")].find((item) =>
          item.textContent.includes("SUBMIT MY TWO CENTS!")
        );
        return button ? {
          disabled: button.disabled,
          text: window.__survey.normalize(button.textContent)
        } : null;
      })()`);
      assert(submitState, "submit button missing after failure");
      assert(submitState.disabled === false, "submit button remained disabled after failure");
      assert(
        submitState.text === "SUBMIT MY TWO CENTS!",
        `submit text after failure is ${JSON.stringify(submitState.text)}`
      );
      currentPhase = "survey";
      return "destructive toast, answers preserved, submit re-enabled";
    });

    await check("Survey prevents duplicate submission while in flight", async () => {
      await goto("/survey-poc");
      await installSurveyHelpers();
      await setSurveyField(11, "Your thoughts:", "double submit");

      appsScriptControl.mode = "hold";
      appsScriptControl.held = null;
      const requestIndex = appsScriptRequests.length;
      await submitSurvey();
      await waitFor(
        () => appsScriptRequests.length > requestIndex,
        "held survey submission",
        10000
      );
      await waitFor(
        async () =>
          (await evaluate(`(() => {
            const button = [...document.querySelectorAll("button")].find((item) =>
              item.textContent.includes("SUBMITTING")
            );
            return button ? button.disabled : false;
          })()`)) === true,
        "submit button to disable",
        5000
      );

      await trustedClick(
        `[...document.querySelectorAll("button")].find((item) =>
          item.textContent.includes("SUBMITTING")
        )`
      );
      await sleep(400);
      assert(
        appsScriptRequests.length === requestIndex + 1,
        `duplicate submission produced ${appsScriptRequests.length - requestIndex} requests`
      );

      const held = appsScriptControl.held;
      assert(held, "held survey request was not captured");
      await page.send("Fetch.fulfillRequest", {
        requestId: held.requestId,
        responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: "text/plain" }],
        body: Buffer.from("ok").toString("base64"),
      });
      appsScriptControl.held = null;
      await waitFor(
        async () => (await bodyText()).includes("Didn't answer everything? No worries."),
        "held submission success screen",
        10000
      );
      assert(
        appsScriptRequests.length === requestIndex + 1,
        "a duplicate request was sent after the success screen"
      );
      return "one request while submitting";
    });

    appsScriptControl.mode = "block";
    await page.send("Fetch.disable").catch(() => {});

    console.log("\nLanding page checks");
    currentPhase = "landing";
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await goto("/");

    const landingControls = () =>
      evaluate(`(() => {
        const norm = (value) => (value || "").replace(/\\s+/g, " ").trim();
        return [...document.querySelectorAll("main a, main button")]
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return false;
            return getComputedStyle(el).visibility !== "hidden";
          })
          .map((el) => ({
            tag: el.tagName,
            href: el.getAttribute("href"),
            label: el.getAttribute("aria-label"),
            target: el.getAttribute("target"),
            rel: el.getAttribute("rel"),
            text: norm(el.textContent)
          }));
      })()`);

    const summarizeControls = (items) =>
      items.map(({ tag, href, label }) => ({ tag, href, label }));

    const clickLandingControl = (label) =>
      trustedClick(
        `(() => {
          return [...document.querySelectorAll("main a, main button")].find((el) =>
            el.getAttribute("aria-label") === ${JSON.stringify(label)} &&
            el.getBoundingClientRect().width > 0
          ) || null;
        })()`
      );

    const landingLayouts = () =>
      evaluate(`(() => {
        const main = document.querySelector("main");
        return [...main.children]
          .filter((el) => el.tagName === "DIV")
          .map((el) => ({ display: getComputedStyle(el).display, hidden: el.getBoundingClientRect().height === 0 }));
      })()`);

    const openWelcome = async () => {
      await clickLandingControl("Open Welcome to TUC");
      await waitFor(
        async () => await evaluate(`!!document.querySelector('[role="dialog"]')`),
        "welcome dialog"
      );
    };

    const welcomeState = () =>
      evaluate(`(() => {
        const norm = (value) => (value || "").replace(/\\s+/g, " ").trim();
        const dialog = document.querySelector('[role="dialog"]');
        const main = document.querySelector("main");
        const style = main ? getComputedStyle(main) : null;
        return {
          role: dialog?.getAttribute("role") ?? null,
          modal: dialog?.getAttribute("aria-modal") ?? null,
          labelledby: dialog?.getAttribute("aria-labelledby") ?? null,
          title: norm(dialog?.querySelector("h1")?.textContent),
          text: norm(dialog?.innerText),
          controls: dialog
            ? [...dialog.querySelectorAll("button")].map(
                (button) => button.getAttribute("aria-label") || norm(button.textContent)
              )
            : [],
          focusInsideDialog: dialog ? dialog.contains(document.activeElement) : null,
          marginRight: style?.marginRight ?? null,
          opacity: style?.opacity ?? null
        };
      })()`);

    const welcomeClosed = () =>
      waitFor(
        async () => !(await evaluate(`!!document.querySelector('[role="dialog"]')`)),
        "welcome dialog to close"
      );

    await check("Landing renders the legacy content and no smoke shell", async () => {
      const text = (await bodyText()).toLowerCase();
      for (const marker of [
        "Welcome To",
        "👉 Click anything that makes you curious.",
        "What is TUC?",
        "2% Spare Bandwidth",
        "Top10 Lists",
        "CloserLook@",
        "The resources we need already exist.",
        "Submit a Suggestion",
        "Another App?",
        "ANOTHER APP?",
      ]) {
        assert(
          text.includes(marker.toLowerCase()),
          `landing page is missing ${JSON.stringify(marker)}`
        );
      }
      assert(!text.includes("next migration shell"), "landing page still contains the smoke shell");
      assert(
        !(await evaluate(`document.documentElement.innerHTML.includes("Next migration shell")`)),
        "smoke shell markup is still present"
      );
      const headings = await evaluate(
        `[...document.querySelectorAll("main h1")].filter((el) => el.getBoundingClientRect().height > 0).length`
      );
      assert(headings === 1, `expected one visible h1, got ${headings}`);
      return "legacy copy, single visible h1";
    });

    await check("Landing desktop CTA map matches the legacy layout", async () => {
      const controls = await landingControls();
      assert(
        JSON.stringify(summarizeControls(controls)) === JSON.stringify(LANDING_CONTROLS_DESKTOP),
        `desktop controls are ${JSON.stringify(summarizeControls(controls))}`
      );
      const external = controls.find((item) => item.href === TOP10_FORM_URL);
      assert(external, "suggestion form link is missing");
      assert(external.target === "_blank", `suggestion target is ${JSON.stringify(external.target)}`);
      assert(
        /noopener/.test(external.rel) && /noreferrer/.test(external.rel),
        `suggestion rel is ${JSON.stringify(external.rel)}`
      );
      const layouts = await landingLayouts();
      assert(
        layouts.filter((layout) => !layout.hidden).length === 1,
        `expected one visible layout, got ${JSON.stringify(layouts)}`
      );
      return `${controls.length} controls, safe external link, one layout`;
    });

    await check("Landing skip link is the first tab stop and targets main", async () => {
      await goto("/");
      await pressKey("Tab", "Tab", 9);
      const first = await evaluate(`(() => {
        const active = document.activeElement;
        const nav = document.querySelector('nav[aria-label="TUC sections"]');
        const rect = nav?.getBoundingClientRect();
        return {
          tag: active?.tagName ?? null,
          href: active?.getAttribute?.("href") ?? null,
          navVisible: !!rect && rect.width > 0 && rect.height > 0
        };
      })()`);
      assert(first.tag === "A", `first Tab focus is ${first.tag}, expected the skip link`);
      assert(first.href === "#main-content", `first Tab href is ${JSON.stringify(first.href)}`);
      assert(first.navVisible, "skip navigation did not become visible when focused");
      await pressKey("Enter", "Enter", 13, "\r");
      await sleep(150);
      assert(
        (await evaluate("document.activeElement?.id ?? null")) === "main-content",
        "Enter did not focus main#main-content"
      );
      return "Tab reveals nav, Enter focuses main#main-content";
    });

    await check("Landing internal links reach every legacy destination", async () => {
      const routes = [
        ["What is TUC?", "/black-hand"],
        ["2% Spare Bandwidth", "/yellow-sticky-note"],
        ["Navigate to Top10 Lists", "/top10-poc"],
        ["Take TUC Survey", "/survey-poc"],
        ["Navigate to CloserLook Workspace", "/closerlook"],
        ["Red Flag Overview", "/red-flag"],
        ["Earth Globe Overview", "/earth-globe"],
        ["Another App?", "/crumpled-paper"],
      ];
      for (const [label, path] of routes) {
        await goto("/");
        await evaluate("window.scrollTo(0, 600)");
        await clickLandingControl(label);
        await waitForPath(path);
        assert(
          (await evaluate("window.scrollY")) === 0,
          `${label} did not reset the scroll position`
        );
      }
      return `${routes.length} destinations`;
    });

    await check("Welcome overlay opens with the legacy content and layout shift", async () => {
      await goto("/");
      await openWelcome();
      const state = await welcomeState();
      assert(state.role === "dialog", `dialog role is ${JSON.stringify(state.role)}`);
      assert(state.modal === "true", `aria-modal is ${JSON.stringify(state.modal)}`);
      assert(
        state.labelledby === "welcome-title",
        `aria-labelledby is ${JSON.stringify(state.labelledby)}`
      );
      assert(
        state.title === "Welcome to TUC (The Ultimate Collaboration)",
        `overlay title is ${JSON.stringify(state.title)}`
      );
      const text = state.text.toLowerCase();
      for (const marker of [
        "Enough is enough. It's time to do things differently.",
        "We keep reinventing the wheel",
        'It\'s time to reimagine "Think Globally, Act Locally"',
        "TUC is being built to increase the efficacy",
        "TUC is a global effort to be the change we want to see",
        "The idea is ambitious. The possibilities are enormous. And we're just getting started.",
      ]) {
        assert(text.includes(marker.toLowerCase()), `overlay is missing ${JSON.stringify(marker)}`);
      }
      assert(
        JSON.stringify(state.controls) ===
          JSON.stringify([
            "Back to TUC landing page",
            "Close welcome overlay",
            "Back",
            "Explore the Idea",
          ]),
        `overlay controls are ${JSON.stringify(state.controls)}`
      );
      assert(state.marginRight === "400px", `main margin-right is ${JSON.stringify(state.marginRight)}`);
      assert(state.opacity === "1", `main opacity is ${JSON.stringify(state.opacity)}`);
      assert(state.focusInsideDialog === false, "focus was moved into the dialog");
      return "dialog semantics, copy, controls, xl layout shift, no focus move";
    });

    await check("Welcome overlay closes through every legacy control", async () => {
      await trustedClick(
        `document.querySelector('[role="dialog"] button[aria-label="Back to TUC landing page"]')`
      );
      await welcomeClosed();

      await openWelcome();
      await trustedClick(
        `document.querySelector('[role="dialog"] button[aria-label="Close welcome overlay"]')`
      );
      await welcomeClosed();

      await openWelcome();
      await trustedClick(`(() => {
        const buttons = [...document.querySelectorAll('[role="dialog"] button')].filter(
          (button) => button.textContent.replace(/\\s+/g, " ").trim() === "Back"
        );
        return buttons[buttons.length - 1];
      })()`);
      await welcomeClosed();
      return "header Back, close icon, footer Back";
    });

    await check("Welcome overlay preserves the legacy Escape and focus behavior", async () => {
      await openWelcome();
      const before = await welcomeState();
      assert(before.focusInsideDialog === false, "focus was moved into the dialog");
      await pressKey("Escape", "Escape", 27);
      await sleep(300);
      assert(
        await evaluate(`!!document.querySelector('[role="dialog"]')`),
        "Escape closed the dialog, but the legacy overlay ignores Escape"
      );
      return "Escape does not close, focus is not managed";
    });

    await check("Welcome overlay Explore the Idea opens the Black Hand route", async () => {
      await trustedClick(`(() => {
        const button = [...document.querySelectorAll('[role="dialog"] button')].find((item) =>
          item.textContent.includes("Explore the Idea")
        );
        return button || null;
      })()`);
      await waitForPath("/black-hand");
      await waitFor(
        async () =>
          await evaluate(`(() => {
            const main = document.querySelector("main");
            return !!main && main.innerText.includes("What if we stopped starting over?");
          })()`),
        "black hand content"
      );
      // The Black Hand page renders its own ConceptOverlay dialog by design, so
      // assert that the Welcome overlay itself is unmounted rather than that no
      // dialog element exists.
      assert(
        !(await evaluate(`!!document.querySelector("#welcome-title")`)),
        "the Welcome overlay survived navigation"
      );
      assert(
        await evaluate(`!!document.querySelector('[aria-labelledby="overlay-title"]')`),
        "the Black Hand concept dialog did not render"
      );
      return "Explore the Idea → /black-hand, Welcome overlay unmounted";
    });

    await check("Landing mobile CTA map matches the legacy layout", async () => {
      await page.send("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await goto("/");
      const controls = await landingControls();
      assert(
        JSON.stringify(summarizeControls(controls)) === JSON.stringify(LANDING_CONTROLS_MOBILE),
        `mobile controls are ${JSON.stringify(summarizeControls(controls))}`
      );
      const layouts = await landingLayouts();
      const visible = layouts.filter((layout) => !layout.hidden);
      assert(visible.length === 1, `expected one visible layout, got ${JSON.stringify(layouts)}`);
      assert(visible[0].display === "flex", `mobile layout display is ${visible[0].display}`);
      return `${controls.length} controls, mobile-only layout`;
    });

    await check("Landing mobile survey emoji navigates without leaving a dialog", async () => {
      await clickLandingControl("Take TUC Survey");
      await waitForPath("/survey-poc");
      await waitFor(
        async () => await evaluate(`!!document.querySelector("main#main-content h1")`),
        "survey form"
      );
      assert(
        !(await evaluate(`!!document.querySelector("#welcome-title")`)),
        "the welcome overlay opened while navigating"
      );
      const form = await evaluate(`(() => {
        const h1 = document.querySelector("main#main-content h1");
        return {
          heading: (h1?.textContent || "").replace(/\\s+/g, " ").trim(),
          fields: document.querySelectorAll("main#main-content input, main#main-content textarea").length
        };
      })()`);
      assert(
        form.heading.startsWith("WTF is TUC?"),
        `survey heading is ${JSON.stringify(form.heading)}`
      );
      assert(form.fields > 0, "survey form has no fields");
      return `🙂 → /survey-poc, ${form.fields} fields, no Welcome overlay`;
    });

    await check("Unmatched routes render the legacy 404 with a real 404 status", async () => {
      await page.send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const response = await fetch(`${baseUrl}/m11-missing-page`, {
        signal: AbortSignal.timeout(15000),
      });
      assert(response.status === 404, `expected HTTP 404, got ${response.status}`);
      await gotoRaw("/m11-missing-page");
      await waitFor(
        async () =>
          (await evaluate(
            `document.querySelector(".font-mono")?.textContent ?? null`
          )) === "/m11-missing-page",
        "404 pathname echo"
      );
      const text = (await bodyText()).toLowerCase();
      for (const marker of [
        "404",
        "sorry, we couldn't find that page.",
        "the page /m11-missing-page does not exist.",
      ]) {
        assert(text.includes(marker), `404 page is missing ${JSON.stringify(marker)}`);
      }
      assert(
        await evaluate(`document.querySelectorAll("title").length === 1`),
        "the 404 document should contain exactly one <title>"
      );
      assert(
        await evaluate(`!!document.title.trim()`),
        "the 404 document has no title"
      );
      assert(
        await evaluate(`!!document.querySelector('meta[name="robots"][content="noindex"]')`),
        "noindex meta is missing"
      );
      await trustedClick(
        `[...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Go Home")`
      );
      await waitForPath("/");
      return "404 status, copy, path echo, noindex, Go Home";
    });

    console.log("\nResponsive checks");
    currentPhase = "responsive";
    for (const [width, height] of [
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1440, 900],
    ]) {
      await page.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      for (const route of EXPECTED_ROUTES) {
        await check(`${route} no horizontal overflow at ${width}x${height}`, async () => {
          await goto(route);
          const metrics = await evaluate(`(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            bodyScrollWidth: document.body.scrollWidth
          }))()`);
          assert(
            metrics.scrollWidth <= metrics.clientWidth + 1,
            `scrollWidth ${metrics.scrollWidth} exceeds clientWidth ${metrics.clientWidth}`
          );
          return `${metrics.scrollWidth}/${metrics.clientWidth}px`;
        });

        if (route === "/") {
          await check(`/ layout isolation at ${width}x${height}`, async () => {
            const layouts = await evaluate(`(() => {
              const main = document.querySelector("main");
              return [...main.children]
                .filter((el) => el.tagName === "DIV")
                .map((el) => ({ display: getComputedStyle(el).display }));
            })()`);
            const visible = layouts.filter((layout) => layout.display !== "none");
            assert(
              visible.length === 1,
              `expected one visible layout, got ${JSON.stringify(layouts)}`
            );
            const expected = width >= 768 ? "grid" : "flex";
            assert(
              visible[0].display === expected,
              `visible layout display is ${visible[0].display}, expected ${expected}`
            );
            const controls = await evaluate(
              `[...document.querySelectorAll("main a, main button")].filter((el) => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
              }).length`
            );
            assert(controls === 10, `expected 10 visible controls, got ${controls}`);
            return `one ${expected} layout, ${controls} controls`;
          });
        }
      }
    }
    await page.send("Emulation.clearDeviceMetricsOverride");

    console.log("\nRuntime health");
    currentPhase = "runtime health";
    await check("no console errors, exceptions, or unexpected failed requests", async () => {
      const problems = [...runtimeErrors, ...failedRequests].filter((problem) => {
        if (isIgnorableRemoteAsset(problem.message)) {
          if (
            !warnings.some((warning) =>
              warning.startsWith("Ignored a network failure for a known remote landing-page image")
            )
          ) {
            warnings.push(
              "Ignored a network failure for a known remote landing-page image (offline test environment)."
            );
          }
          return false;
        }
        if (
          problem.phase === "landing" &&
          /m11-missing-page/.test(problem.message)
        ) {
          if (
            !warnings.some((warning) =>
              warning.startsWith("Ignored expected 404 from the intentional missing-page check")
            )
          ) {
            warnings.push(
              "Ignored expected 404 from the intentional missing-page check during the landing phase."
            );
          }
          return false;
        }
        if (
          problem.phase === "survey failure" &&
          /Submission Failure:|script\.google\.com/.test(problem.message)
        ) {
          if (
            !warnings.some((warning) =>
              warning.startsWith("Ignored expected simulated survey failure")
            )
          ) {
            warnings.push(
              "Ignored expected simulated survey failure from the offline Apps Script interception test."
            );
          }
          return false;
        }
        return true;
      });
      if (problems.length) {
        const summary = problems
          .slice(0, 10)
          .map((problem) => `[${problem.phase}/${problem.source}] ${problem.message}`)
          .join("\n");
        throw new Error(
          `${problems.length} runtime problem(s):\n${summary}${problems.length > 10 ? `\n...and ${problems.length - 10} more` : ""}`
        );
      }
      return "clean";
    });
  } catch (error) {
    recordFailure("harness", error?.stack || error);
  } finally {
    await cleanup();
  }

  console.log("\nSummary");
  console.log(`  Passed:   ${passes.length}`);
  console.log(`  Failed:   ${failures.length}`);
  console.log(`  Skipped:  ${skips.length}`);

  if (warnings.length) {
    console.log("\nWarnings (non-failing)");
    for (const warning of warnings) console.log(`  - ${warning}`);
  }

  if (skips.length) {
    console.log("\nSkipped checks");
    for (const skip of skips) console.log(`  - ${skip.name}: ${skip.reason}`);
  }

  if (failures.length) {
    console.log("\nFailures");
    for (const failure of failures) console.log(`  - ${failure.name}: ${failure.detail}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll required migration checks passed.");
  }
}

// The landing page renders two legacy remote images. If the verification
// environment is offline, their load failures must not be reported as app
// defects, but they are still surfaced as a warning.
const KNOWN_REMOTE_ASSETS = [
  "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_88f00ba619_7ca58802f2a328bf.png",
  "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_e96766a1f9_a1482af51388d43e.png",
];

function isIgnorableRemoteAsset(value) {
  const text = String(value);
  return KNOWN_REMOTE_ASSETS.some((url) => text.includes(url));
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  usage();
} else {
  const watchdog = setTimeout(() => {
    console.error("Verification harness timed out after 6 minutes.");
    process.exit(2);
  }, 6 * 60 * 1000);

  run()
    .catch((error) => {
      console.error("Verification harness crashed:", error);
      process.exitCode = 2;
    })
    .finally(() => clearTimeout(watchdog));
}
