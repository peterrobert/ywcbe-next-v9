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
];

const SKIP_NAV_LINKS = EXPECTED_ROUTES;

const ROUTE_EXPECTATIONS = {
  "/": {
    heading: "Next migration shell",
    markers: ["Next migration shell"],
    mainTarget: false,
  },
  "/black-hand": {
    heading: "WHAT IS TUC?",
    markers: ["What if we stopped starting over?"],
    mainTarget: true,
  },
  "/earth-globe": {
    heading: "THE RESOURCES WE NEED ALREADY EXIST",
    markers: ["THE RESOURCES WE NEED ALREADY EXIST"],
    mainTarget: true,
  },
  "/yellow-sticky-note": {
    heading: "2% SPARE BANDWIDTH",
    markers: ["2% SPARE BANDWIDTH"],
    mainTarget: true,
  },
  "/red-flag": {
    heading: "Red Flags",
    markers: ["Red Flags"],
    mainTarget: true,
  },
  "/crumpled-paper": {
    heading: "Another App?",
    markers: ["Another App?"],
    mainTarget: true,
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
    mainTarget: true,
  },
  "/top10-poc": {
    heading: "Top10: Ways to Engage in TUC",
    markers: ["Choose an OpenItem You Can Help Complete"],
    mainTarget: true,
  },
  "/open-items": {
    heading: "OpenItems",
    markers: [
      "Suggestion Box Loop Test",
      "TUC-TASK-0002",
      "TUC-SB-0005",
      "Open / In follow-through",
    ],
    mainTarget: true,
  },
};

const OPEN_ITEMS_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfAliHmLu4qnbGVGoNC_YRnnqGPL-RXKjAlM2SE9ky4bVLl4A/viewform";
const TOP10_FORM_URL = `${OPEN_ITEMS_FORM_URL}?usp=dialog`;

const CLOSERLOOK_DOC_URLS = [
  "https://docs.google.com/document/d/1b_pysDmZdCqtHms3-nme4h7JmlU7wvDWUNtAo36qU3k/edit?usp=sharing",
  "https://docs.google.com/document/d/1JbjlU4S-IvXrwp5z4piatwVYdKP5K0GxW3TWWIGM52w/edit?tab=t.8h58bqwrwo7z",
  "https://docs.google.com/document/d/1mKajfyW4qiPXF-O0LUXq1RHaq7048I2i2zTej9impz8/edit?usp=sharing",
  "https://docs.google.com/document/d/1A4jlADhoSdn0BZpT8LTQ-0Vzjs0jK1mcIh_2QEqYdsM/edit?usp=sharing",
  "https://docs.google.com/document/d/1-pAQRa1Os5gTCzb6UuppVtMVZgTf8cIJmJdyMtvKX8c/edit?usp=sharing",
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
    });
    page.on("Network.loadingFailed", (params) => {
      if (params.canceled || params.errorText === "net::ERR_ABORTED") return;
      const url = requestUrls.get(params.requestId) || "";
      if (isIgnorableUrl(url)) return;
      failedRequests.push({
        phase: currentPhase,
        source: "request",
        message: `${params.errorText || "request failed"} ${url}`,
      });
    });
    page.on("Network.responseReceived", (params) => {
      const { response, type } = params;
      if (!response || response.status < 400) return;
      if (isIgnorableUrl(response.url)) return;
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
        if (!expectation.mainTarget) return "main present (smoke page has no target yet)";
        assert(main.id === "main-content", `main id is ${JSON.stringify(main.id)}`);
        assert(main.tabIndex === -1, `main tabIndex is ${main.tabIndex}`);
        return "main#main-content with tabIndex=-1";
      });

      if (route !== "/") {
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

    console.log("\nResponsive checks");
    currentPhase = "responsive";
    for (const [width, height] of [
      [390, 844],
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
      }
    }
    await page.send("Emulation.clearDeviceMetricsOverride");

    console.log("\nRuntime health");
    currentPhase = "runtime health";
    await check("no console errors, exceptions, or unexpected failed requests", async () => {
      const problems = [...runtimeErrors, ...failedRequests].filter((problem) => {
        if (isIgnorableUrl(problem.message)) {
          warnings.push(`Ignored known missing favicon request: ${problem.message}`);
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

  const ignoredFavicon = runtimeErrors
    .concat(failedRequests)
    .some((problem) => isIgnorableUrl(problem.message));
  if (ignoredFavicon && !warnings.some((warning) => warning.includes("favicon"))) {
    warnings.push(
      "The browser requested /favicon.ico, which is not implemented yet (planned for a later milestone)."
    );
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

function isIgnorableUrl(value) {
  return /favicon\.ico/.test(String(value));
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
