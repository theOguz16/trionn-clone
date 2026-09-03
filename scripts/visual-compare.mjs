import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright-core";

import { visualConfig } from "../visual.config.mjs";
import {
  calculateScrollTarget,
  calculateMediaSeekTime,
  checkpointName,
  comparePngBuffers,
  createMarkdownSummary,
  mergeMaskRectSets,
  parseArgs,
  writeJson,
} from "./visual-compare-lib.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function timestampForPath() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function resolveBrowserPath() {
  const candidates = [
    process.env.VISUAL_BROWSER_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const executablePath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!executablePath) {
    throw new Error(
      "No Chromium browser found. Set VISUAL_BROWSER_PATH to a Chrome/Chromium executable.",
    );
  }

  return executablePath;
}

async function urlResponds(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      redirect: "follow",
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureCloneServer(cloneUrl, outputDirectory) {
  if (await urlResponds(cloneUrl)) {
    return null;
  }

  const parsed = new URL(cloneUrl);
  const localHosts = new Set(["127.0.0.1", "localhost"]);

  if (!localHosts.has(parsed.hostname) || parsed.port !== "3000") {
    throw new Error(
      `Clone URL did not respond: ${cloneUrl}. Start it manually or use the default port 3000 URL.`,
    );
  }

  fs.mkdirSync(outputDirectory, { recursive: true });
  const logFile = fs.openSync(path.join(outputDirectory, "clone-server.log"), "a");
  const child = spawn("pnpm", ["dev"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    detached: false,
    stdio: ["ignore", logFile, logFile],
  });

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Clone dev server exited with code ${child.exitCode}. See clone-server.log.`,
      );
    }
    if (await urlResponds(cloneUrl)) {
      return child;
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  child.kill("SIGTERM");
  throw new Error("Timed out waiting for the clone dev server.");
}

async function waitForStableDocument(page, target) {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(async () => {
    if (document.fonts) {
      await document.fonts.ready;
    }
  });

  if (target === "clone") {
    await page
      .locator("[data-initial-preloader]")
      .waitFor({ state: "detached", timeout: 15_000 })
      .catch(async () => {
        await page.locator("[data-initial-preloader]").waitFor({
          state: "hidden",
          timeout: 2_000,
        });
      });

    await page.waitForFunction(
      () =>
        document.documentElement.dataset.heroAssets === "ready" ||
        !document.querySelector("[data-home-hero] canvas"),
      undefined,
      { timeout: 12_000 },
    );
  } else {
    /*
     * Trionn keeps its loader mounted while its exit timeline runs. Waiting
     * for network-idle is insufficient because the overlay can still cover
     * the first reference capture, especially at the wide breakpoint.
     */
    await page.waitForFunction(
      () => {
        const overlays = [
          ...document.querySelectorAll(".pl-overlay, .pl-white-overlay"),
        ];
        return (
          overlays.length > 0 &&
          overlays.every((overlay) => {
            const style = getComputedStyle(overlay);
            const rect = overlay.getBoundingClientRect();
            return (
              style.display === "none" ||
              style.visibility === "hidden" ||
              Number(style.opacity) <= 0.01 ||
              rect.width < 2 ||
              rect.height < 2
            );
          })
        );
      },
      undefined,
      { timeout: 20_000 },
    );
    await page.waitForTimeout(500);
  }

  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("canvas")].every(
        (canvas) => canvas.width > 0 && canvas.height > 0,
      ),
    undefined,
    { timeout: 10_000 },
  );

  const consentButton = page
    .getByRole("button", {
      name: /decline|reject|no thanks/i,
    })
    .first();
  if (await consentButton.isVisible().catch(() => false)) {
    await consentButton.click();
    await page.waitForTimeout(200);
  } else {
    const consentText = page
      .getByText(/^(decline|reject|no thanks)$/i)
      .first();
    if (await consentText.isVisible().catch(() => false)) {
      await consentText.click();
      await page.waitForTimeout(200);
    }
  }
  await page.evaluate(() => {
    const consentCopy = [...document.querySelectorAll("body *")]
      .filter((element) => /we use cookies/i.test(element.textContent || ""))
      .sort(
        (first, second) =>
          (first.textContent?.length ?? 0) - (second.textContent?.length ?? 0),
      )[0];
    let candidate = consentCopy;
    while (candidate && candidate !== document.body) {
      const rect = candidate.getBoundingClientRect();
      const text = candidate.textContent || "";
      if (
        /decline/i.test(text) &&
        /accept/i.test(text) &&
        rect.width > Math.min(260, window.innerWidth * 0.5) &&
        rect.height > 20 &&
        rect.height < window.innerHeight * 0.35
      ) {
        candidate.remove();
        break;
      }
      candidate = candidate.parentElement;
    }
  });

  let previousHeight = -1;
  let stableSamples = 0;
  for (let attempt = 0; attempt < 12 && stableSamples < 3; attempt += 1) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    stableSamples = height === previousHeight ? stableSamples + 1 : 0;
    previousHeight = height;
    await page.waitForTimeout(250);
  }

  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((element) => element.remove());
    window.scrollTo(0, 0);
    document.documentElement.dataset.visualComparison = "ready";
  });
  await page.waitForTimeout(target === "reference" ? 1500 : 500);
}

async function openTargetPage(browser, url, viewport, target, attempt = 0) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: "dark",
    locale: "en-US",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await waitForStableDocument(page, target);
  } catch (error) {
    await context.close();
    if (target === "reference" && attempt < 2) {
      return openTargetPage(browser, url, viewport, target, attempt + 1);
    }
    throw error;
  }

  return { context, page, consoleErrors };
}

async function resolveCloneRange(page, selectors) {
  return page.evaluate((candidateSelectors) => {
    const candidates = candidateSelectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)],
    );
    const visible = candidates.find((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.height > 0 && rect.width > 0 && style.display !== "none";
    });

    if (!visible) {
      return null;
    }

    let rangeElement = visible;
    let parent = visible.parentElement;
    while (parent && parent !== document.body) {
      const parentRect = parent.getBoundingClientRect();
      const rangeRect = rangeElement.getBoundingClientRect();
      if (
        parent.classList.contains("pin-spacer") ||
        (parentRect.height > rangeRect.height * 1.5 &&
          getComputedStyle(rangeElement).position === "sticky")
      ) {
        rangeElement = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const rect = rangeElement.getBoundingClientRect();
    return {
      start: Math.round(rect.top + window.scrollY),
      end: Math.round(rect.bottom + window.scrollY),
      selector: candidateSelectors.find((selector) => visible.matches(selector)),
    };
  }, selectors);
}

async function scrollAndSettle(page, targetY, { preferWheel = false } = {}) {
  const { currentY, viewportHeight } = await page.evaluate(() => ({
    currentY: window.scrollY,
    viewportHeight: window.innerHeight,
  }));
  let settledY = currentY;

  if (!preferWheel) {
    const distance = targetY - currentY;
    const stepCount = Math.max(
      1,
      Math.ceil(Math.abs(distance) / (viewportHeight * 0.7)),
    );

    for (let step = 1; step <= stepCount; step += 1) {
      const intermediateY = Math.round(currentY + distance * (step / stepCount));
      await page.evaluate(
        (scrollY) => window.scrollTo({ top: scrollY, behavior: "auto" }),
        intermediateY,
      );
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => resolve())),
      );
      await page.waitForTimeout(30);
    }

    settledY = await page.evaluate(() => Math.round(window.scrollY));
    for (let attempt = 0; attempt < 12 && Math.abs(settledY - targetY) > 3; attempt += 1) {
      await page.evaluate(
        (scrollY) => window.scrollTo({ top: scrollY, behavior: "auto" }),
        targetY,
      );
      await page.waitForTimeout(100);
      settledY = await page.evaluate(() => Math.round(window.scrollY));
    }
  }

  /*
   * The reference occasionally re-enables its Lenis input lock after a
   * responsive reflow. In that state programmatic scrollTo calls are ignored,
   * while a real wheel gesture remains the authoritative input path.
   */
  const wheelAttemptLimit = preferWheel ? 240 : 48;
  for (
    let attempt = 0;
    attempt < wheelAttemptLimit && Math.abs(settledY - targetY) > 3;
    attempt += 1
  ) {
    const remaining = targetY - settledY;
    const wheelStep = Math.sign(remaining) * Math.max(
      4,
      Math.min(
        Math.abs(remaining) * (preferWheel ? 0.62 : 0.28),
        viewportHeight * (preferWheel ? 0.42 : 0.12),
      ),
    );
    await page.mouse.wheel(0, wheelStep);
    let lastSample = settledY;
    for (let sample = 0; sample < 6; sample += 1) {
      await page.waitForTimeout(60);
      settledY = await page.evaluate(() => Math.round(window.scrollY));
      if (Math.abs(settledY - lastSample) <= 1) break;
      lastSample = settledY;
    }
  }

  if (Math.abs(settledY - targetY) > 24) {
    throw new Error(`Scroll did not settle: requested ${targetY}, reached ${settledY}.`);
  }
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.waitForTimeout(1200);
  return page.evaluate(() => Math.round(window.scrollY));
}

async function applyMasks(page, masks) {
  await page.evaluate((maskNames) => {
    document.querySelectorAll("nextjs-portal").forEach((element) => element.remove());
    document.querySelectorAll("[data-visual-diff-mask]").forEach((element) => element.remove());

    const lateConsentCopy = [...document.querySelectorAll("body *")]
      .filter((element) => /we use cookies/i.test(element.textContent || ""))
      .sort(
        (first, second) =>
          (first.textContent?.length ?? 0) - (second.textContent?.length ?? 0),
      )[0];
    let lateConsentContainer = lateConsentCopy;
    while (lateConsentContainer && lateConsentContainer !== document.body) {
      const rect = lateConsentContainer.getBoundingClientRect();
      const text = lateConsentContainer.textContent || "";
      if (
        /decline/i.test(text) &&
        /accept/i.test(text) &&
        rect.width > Math.min(260, window.innerWidth * 0.5) &&
        rect.height > 20 &&
        rect.height < window.innerHeight * 0.35
      ) {
        lateConsentContainer.style.setProperty("display", "none", "important");
        break;
      }
      lateConsentContainer = lateConsentContainer.parentElement;
    }

    const addMask = (rect, name) => {
      if (!rect || rect.width < 2 || rect.height < 2) {
        return;
      }
      const mask = document.createElement("div");
      mask.dataset.visualDiffMask = name;
      Object.assign(mask.style, {
        position: "fixed",
        left: `${Math.round(rect.left)}px`,
        top: `${Math.round(rect.top)}px`,
        width: `${Math.round(rect.width)}px`,
        height: `${Math.round(rect.height)}px`,
        background: "rgb(255, 0, 255)",
        zIndex: "2147483646",
        pointerEvents: "none",
      });
      document.body.append(mask);
    };

    if (maskNames.includes("hero-word")) {
      const words = [...document.querySelectorAll("[data-hero-word]")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (words.length > 0) {
        const rects = words.map((element) => element.getBoundingClientRect());
        addMask(
          {
            left: Math.min(...rects.map((rect) => rect.left)) - 3,
            top: Math.min(...rects.map((rect) => rect.top)) - 3,
            width:
              Math.max(...rects.map((rect) => rect.right)) -
              Math.min(...rects.map((rect) => rect.left)) +
              6,
            height:
              Math.max(...rects.map((rect) => rect.bottom)) -
              Math.min(...rects.map((rect) => rect.top)) +
              6,
          },
          "hero-word",
        );
      } else {
        const heading = document.querySelector("#s1-headline h1, #s1-headline, main h1");
        if (heading) {
          const rect = heading.getBoundingClientRect();
          const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight) || rect.height / 2;
          addMask(
            {
              left: rect.left - 3,
              top: rect.bottom - lineHeight - 3,
              width: Math.min(rect.width * 0.92, window.innerWidth - rect.left) + 6,
              height: lineHeight + 6,
            },
            "hero-word",
          );
        }
      }
    }

    if (maskNames.includes("model-interior")) {
      const canvases = [...document.querySelectorAll("canvas")]
        .map((canvas) => canvas.getBoundingClientRect())
        .filter(
          (rect) =>
            rect.width > window.innerWidth * 0.25 &&
            rect.height > window.innerHeight * 0.25 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight,
        )
        .sort((first, second) => second.width * second.height - first.width * first.height);
      const rect = canvases[0];
      if (rect) {
        const mobile = window.innerWidth < 700;
        const desired = {
          left: window.innerWidth * (mobile ? 0.28 : 0.34),
          top: window.innerHeight * (mobile ? 0.34 : 0.3),
          width: window.innerWidth * (mobile ? 0.44 : 0.32),
          height: window.innerHeight * (mobile ? 0.42 : 0.44),
        };
        const left = Math.max(rect.left, desired.left);
        const top = Math.max(rect.top, desired.top);
        const right = Math.min(rect.right, desired.left + desired.width);
        const bottom = Math.min(rect.bottom, desired.top + desired.height);
        addMask(
          {
            left,
            top,
            width: right - left,
            height: bottom - top,
          },
          "model-interior",
        );
      }
    }

    if (maskNames.includes("clock")) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const timePattern = /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/;
      let node = walker.nextNode();
      while (node) {
        if (timePattern.test(node.textContent || "")) {
          const range = document.createRange();
          range.selectNodeContents(node);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight) {
            addMask(
              {
                left: rect.left - 3,
                top: rect.top - 3,
                width: rect.width + 6,
                height: rect.height + 6,
              },
              "clock",
            );
          }
        }
        node = walker.nextNode();
      }
    }

    const style = document.createElement("style");
    style.dataset.visualDiffMask = "stability-css";
    style.textContent = `
      * { caret-color: transparent !important; }
      html { scroll-behavior: auto !important; }
      ::-webkit-scrollbar { display: none !important; }
    `;
    document.head.append(style);
  }, masks ?? []);
}

async function synchronizeVideos(page, progress) {
  const durations = await page.evaluate(async () => {
    const videos = [...document.querySelectorAll("video")];

    return Promise.all(
      videos.map(async (video) => {
        video.autoplay = false;
        video.pause();

        if (video.readyState === 0) {
          await Promise.race([
            new Promise((resolve) =>
              video.addEventListener("loadedmetadata", resolve, { once: true }),
            ),
            new Promise((resolve) => setTimeout(resolve, 1500)),
          ]);
        }

        return Number.isFinite(video.duration) ? video.duration : 0;
      }),
    );
  });
  const seekTimes = durations.map((duration) =>
    calculateMediaSeekTime(duration, progress),
  );

  await page.evaluate(async (targets) => {
    const videos = [...document.querySelectorAll("video")];

    await Promise.all(
      videos.map(async (video, index) => {
        const target = targets[index] ?? 0;
        if (video.readyState === 0 || Math.abs(video.currentTime - target) < 0.01) {
          video.pause();
          return;
        }

        const seeked = new Promise((resolve) =>
          video.addEventListener("seeked", resolve, { once: true }),
        );
        try {
          video.currentTime = target;
        } catch {
          return;
        }
        await Promise.race([
          seeked,
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
        video.pause();
      }),
    );
  }, seekTimes);

  await page.waitForTimeout(150);
}

async function readAppliedMaskRects(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("div[data-visual-diff-mask]")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          name: element.dataset.visualDiffMask,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      })
      .filter((rect) => rect.name && rect.width > 0 && rect.height > 0),
  );
}

async function synchronizeAppliedMasks(page, sharedRects) {
  await page.evaluate((rects) => {
    document
      .querySelectorAll("div[data-visual-diff-mask]")
      .forEach((element) => element.remove());

    for (const rect of rects) {
      const left = Math.max(0, rect.left);
      const top = Math.max(0, rect.top);
      const right = Math.min(window.innerWidth, rect.left + rect.width);
      const bottom = Math.min(window.innerHeight, rect.top + rect.height);

      if (right - left < 2 || bottom - top < 2) {
        continue;
      }

      const mask = document.createElement("div");
      mask.dataset.visualDiffMask = rect.name;
      Object.assign(mask.style, {
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${right - left}px`,
        height: `${bottom - top}px`,
        background: "rgb(255, 0, 255)",
        zIndex: "2147483646",
        pointerEvents: "none",
      });
      document.body.append(mask);
    }
  }, sharedRects);
}

async function removeMasks(page) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-visual-diff-mask]").forEach((element) => element.remove());
  });
}

async function hasVisibleComparisonCanvas(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("canvas")].some((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return (
        rect.width > window.innerWidth * 0.25 &&
        rect.height > window.innerHeight * 0.25 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        getComputedStyle(canvas).visibility !== "hidden"
      );
    }),
  );
}

async function captureCheckpoint({
  referencePage,
  clonePage,
  section,
  viewportKey,
  viewport,
  progress,
  outputDirectory,
}) {
  const referenceRange = section.liveRanges[viewportKey];
  const cloneElementRange = await resolveCloneRange(clonePage, section.cloneSelectors);

  if (!referenceRange || !cloneElementRange) {
    throw new Error(`Unable to resolve range for ${viewportKey}/${section.id}.`);
  }

  /*
   * The completed clone deliberately reproduces Trionn's overlapping pinned
   * timelines. A section element's bounding box therefore does not represent
   * its semantic scroll interval. Once both documents are calibrated to the
   * same global timeline, use the measured live interval on both sides while
   * retaining the selector measurement as an existence/layout diagnostic.
   */
  const cloneRange =
    visualConfig.cloneRangeMode === "reference"
      ? { start: referenceRange[0], end: referenceRange[1] }
      : cloneElementRange;

  const [referenceDocumentHeight, cloneDocumentHeight] = await Promise.all([
    referencePage.evaluate(() => document.documentElement.scrollHeight),
    clonePage.evaluate(() => document.documentElement.scrollHeight),
  ]);
  const documentHeightTolerance = 32;
  if (
    referenceDocumentHeight + documentHeightTolerance < referenceRange[1]
  ) {
    throw new Error(
      `Reference document is incomplete for ${viewportKey}/${section.id}: ` +
        `height ${referenceDocumentHeight}, expected at least ${referenceRange[1]}.`,
    );
  }
  if (
    visualConfig.cloneRangeMode === "reference" &&
    cloneDocumentHeight + documentHeightTolerance < referenceRange[1]
  ) {
    throw new Error(
      `Clone document is incomplete for ${viewportKey}/${section.id}: ` +
        `height ${cloneDocumentHeight}, expected at least ${referenceRange[1]}.`,
    );
  }
  const referenceScrollY = calculateScrollTarget({
    start: referenceRange[0],
    end: referenceRange[1],
    progress,
    viewportHeight: viewport.height,
    documentHeight: referenceDocumentHeight,
  });
  const cloneScrollY = calculateScrollTarget({
    start: cloneRange.start,
    end: cloneRange.end,
    progress,
    viewportHeight: viewport.height,
    documentHeight: cloneDocumentHeight,
  });

  const [actualReferenceScrollY, actualCloneScrollY] = await Promise.all([
    scrollAndSettle(referencePage, referenceScrollY, { preferWheel: true }),
    scrollAndSettle(clonePage, cloneScrollY),
  ]);
  if (Number.isFinite(section.videoSyncProgress)) {
    await Promise.all([
      synchronizeVideos(referencePage, section.videoSyncProgress),
      synchronizeVideos(clonePage, section.videoSyncProgress),
    ]);
  }
  const requestedMasks = section.masks ?? [];
  const [referenceHasCanvas, cloneHasCanvas] = await Promise.all([
    hasVisibleComparisonCanvas(referencePage),
    hasVisibleComparisonCanvas(clonePage),
  ]);
  const masks = requestedMasks.filter(
    (mask) =>
      mask !== "model-interior" || (referenceHasCanvas && cloneHasCanvas),
  );
  await Promise.all([
    applyMasks(referencePage, masks),
    applyMasks(clonePage, masks),
  ]);
  const [referenceMaskRects, cloneMaskRects] = await Promise.all([
    readAppliedMaskRects(referencePage),
    readAppliedMaskRects(clonePage),
  ]);
  const sharedMaskRects = mergeMaskRectSets(referenceMaskRects, cloneMaskRects);
  await Promise.all([
    synchronizeAppliedMasks(referencePage, sharedMaskRects),
    synchronizeAppliedMasks(clonePage, sharedMaskRects),
  ]);

  const checkpoint = checkpointName(progress);
  const checkpointDirectory = path.join(
    outputDirectory,
    viewportKey,
    section.id,
    checkpoint,
  );
  fs.mkdirSync(checkpointDirectory, { recursive: true });
  const referencePath = path.join(checkpointDirectory, "reference.png");
  const clonePath = path.join(checkpointDirectory, "clone.png");
  const diffPath = path.join(checkpointDirectory, "diff.png");

  const [referenceBuffer, cloneBuffer] = await Promise.all([
    referencePage.screenshot({ animations: "disabled", path: referencePath }),
    clonePage.screenshot({ animations: "disabled", path: clonePath }),
  ]);
  const comparison = comparePngBuffers(referenceBuffer, cloneBuffer);
  fs.writeFileSync(diffPath, comparison.diffBuffer);

  await Promise.all([removeMasks(referencePage), removeMasks(clonePage)]);

  return {
    viewport: viewportKey,
    viewportSize: `${viewport.width}x${viewport.height}`,
    section: section.id,
    progress,
    referenceScrollY: actualReferenceScrollY,
    cloneScrollY: actualCloneScrollY,
    requestedReferenceScrollY: referenceScrollY,
    requestedCloneScrollY: cloneScrollY,
    referenceRange,
    cloneRange: [cloneRange.start, cloneRange.end],
    cloneElementRange: [cloneElementRange.start, cloneElementRange.end],
    mismatchedPixels: comparison.mismatchedPixels,
    totalPixels: comparison.totalPixels,
    mismatchPercent: comparison.mismatchPercent,
    files: {
      reference: path.relative(outputDirectory, referencePath),
      clone: path.relative(outputDirectory, clonePath),
      diff: path.relative(outputDirectory, diffPath),
    },
  };
}

function selectEntries(allEntries, requested, type) {
  if (!requested) {
    return allEntries;
  }
  const selected = allEntries.filter(([key]) => requested.includes(key));
  const missing = requested.filter((key) => !allEntries.some(([candidate]) => candidate === key));
  if (missing.length > 0) {
    throw new Error(`Unknown ${type}: ${missing.join(", ")}`);
  }
  return selected;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const referenceUrl = options.referenceUrl ?? visualConfig.referenceUrl;
  const cloneUrl = options.cloneUrl ?? visualConfig.cloneUrl;
  const outputDirectory = path.resolve(
    projectRoot,
    options.output ?? path.join(visualConfig.outputRoot, "runs", timestampForPath()),
  );
  const viewportEntries = selectEntries(
    Object.entries(visualConfig.viewports),
    options.viewports,
    "viewport",
  );
  const sectionEntries = selectEntries(
    visualConfig.sections.map((section) => [section.id, section]),
    options.sections,
    "section",
  );
  const checkpoints = options.checkpoints ?? visualConfig.checkpoints;

  fs.mkdirSync(outputDirectory, { recursive: true });
  const spawnedServer = await ensureCloneServer(cloneUrl, outputDirectory);
  const browser = await chromium.launch({
    executablePath: resolveBrowserPath(),
    headless: !options.headed,
    args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
  });
  const run = {
    generatedAt: new Date().toISOString(),
    referenceUrl,
    cloneUrl,
    outputDirectory,
    browser: resolveBrowserPath(),
    comparisons: [],
    consoleErrors: {
      reference: [],
      clone: [],
    },
  };

  try {
    for (const [viewportKey, viewport] of viewportEntries) {
      process.stdout.write(`\n[${viewportKey}] opening reference and clone...\n`);
      const [referenceTarget, cloneTarget] = await Promise.all([
        openTargetPage(browser, referenceUrl, viewport, "reference"),
        openTargetPage(browser, cloneUrl, viewport, "clone"),
      ]);

      try {
        for (const [, section] of sectionEntries) {
          for (const progress of checkpoints) {
            process.stdout.write(
              `[${viewportKey}] ${section.id} ${Math.round(progress * 100)}%\n`,
            );
            run.comparisons.push(
              await captureCheckpoint({
                referencePage: referenceTarget.page,
                clonePage: cloneTarget.page,
                section,
                viewportKey,
                viewport,
                progress,
                outputDirectory,
              }),
            );
          }
        }
      } finally {
        run.consoleErrors.reference.push(...referenceTarget.consoleErrors);
        run.consoleErrors.clone.push(...cloneTarget.consoleErrors);
        await Promise.all([
          referenceTarget.context.close(),
          cloneTarget.context.close(),
        ]);
      }
    }
  } finally {
    await browser.close();
    if (spawnedServer && !options.keepServer) {
      spawnedServer.kill("SIGTERM");
    }
  }

  writeJson(path.join(outputDirectory, "summary.json"), run);
  fs.writeFileSync(
    path.join(outputDirectory, "summary.md"),
    createMarkdownSummary(run),
  );

  const averageDifference =
    run.comparisons.reduce((sum, item) => sum + item.mismatchPercent, 0) /
    Math.max(1, run.comparisons.length);
  process.stdout.write(
    `\nCompleted ${run.comparisons.length} comparisons. Average pixel difference: ${averageDifference.toFixed(4)}%\nOutput: ${outputDirectory}\n`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
