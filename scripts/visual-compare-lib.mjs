import fs from "node:fs";
import path from "node:path";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export function parseCsv(value) {
  if (!value) {
    return null;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseArgs(argv) {
  const options = {
    referenceUrl: null,
    cloneUrl: null,
    output: null,
    sections: null,
    viewports: null,
    checkpoints: null,
    headed: false,
    keepServer: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const next = argv[index + 1];

    if (argument === "--") {
      continue;
    }

    if (argument === "--headed") {
      options.headed = true;
      continue;
    }

    if (argument === "--keep-server") {
      options.keepServer = true;
      continue;
    }

    const optionMap = {
      "--reference": "referenceUrl",
      "--clone": "cloneUrl",
      "--output": "output",
      "--sections": "sections",
      "--viewports": "viewports",
      "--checkpoints": "checkpoints",
    };
    const optionName = optionMap[argument];

    if (!optionName) {
      throw new Error(`Unknown option: ${argument}`);
    }

    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for ${argument}`);
    }

    options[optionName] = next;
    index += 1;
  }

  options.sections = parseCsv(options.sections);
  options.viewports = parseCsv(options.viewports);
  options.checkpoints = parseCsv(options.checkpoints)?.map(Number) ?? null;

  if (
    options.checkpoints?.some(
      (checkpoint) =>
        !Number.isFinite(checkpoint) || checkpoint < 0 || checkpoint > 1,
    )
  ) {
    throw new Error("Checkpoints must be numbers between 0 and 1.");
  }

  return options;
}

export function checkpointName(progress) {
  return `p${String(Math.round(progress * 100)).padStart(3, "0")}`;
}

export function calculateScrollTarget({
  start,
  end,
  progress,
  viewportHeight,
  documentHeight,
}) {
  const scrollableSectionDistance = Math.max(0, end - start - viewportHeight);
  const desired = start + scrollableSectionDistance * progress;
  const documentMaximum = Math.max(0, documentHeight - viewportHeight);

  return Math.round(Math.min(documentMaximum, Math.max(0, desired)));
}

export function calculateMediaSeekTime(duration, progress = 0.25) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  const normalizedProgress = Math.min(1, Math.max(0, progress));
  const safeDuration = Math.max(0, duration - 0.05);

  return safeDuration * normalizedProgress;
}

export function comparePngBuffers(referenceBuffer, cloneBuffer) {
  const reference = PNG.sync.read(referenceBuffer);
  const clone = PNG.sync.read(cloneBuffer);

  if (reference.width !== clone.width || reference.height !== clone.height) {
    throw new Error(
      `Screenshot dimensions differ: reference ${reference.width}x${reference.height}, clone ${clone.width}x${clone.height}`,
    );
  }

  const diff = new PNG({
    width: reference.width,
    height: reference.height,
  });
  const mismatchedPixels = pixelmatch(
    reference.data,
    clone.data,
    diff.data,
    reference.width,
    reference.height,
    {
      threshold: 0.1,
      includeAA: false,
      alpha: 0.65,
      diffColor: [255, 0, 80],
      aaColor: [255, 214, 0],
    },
  );
  const totalPixels = reference.width * reference.height;

  return {
    diffBuffer: PNG.sync.write(diff),
    mismatchedPixels,
    totalPixels,
    mismatchPercent: Number(((mismatchedPixels / totalPixels) * 100).toFixed(4)),
  };
}

export function mergeMaskRectSets(...rectSets) {
  const boundsByName = new Map();

  for (const rect of rectSets.flat()) {
    if (
      !rect?.name ||
      !Number.isFinite(rect.left) ||
      !Number.isFinite(rect.top) ||
      !Number.isFinite(rect.width) ||
      !Number.isFinite(rect.height) ||
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      continue;
    }

    const right = rect.left + rect.width;
    const bottom = rect.top + rect.height;
    const current = boundsByName.get(rect.name);

    boundsByName.set(
      rect.name,
      current
        ? {
            name: rect.name,
            left: Math.min(current.left, rect.left),
            top: Math.min(current.top, rect.top),
            right: Math.max(current.right, right),
            bottom: Math.max(current.bottom, bottom),
          }
        : {
            name: rect.name,
            left: rect.left,
            top: rect.top,
            right,
            bottom,
          },
    );
  }

  return [...boundsByName.values()]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map(({ name, left, top, right, bottom }) => ({
      name,
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(right - left),
      height: Math.round(bottom - top),
    }));
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function createMarkdownSummary(run) {
  const rows = run.comparisons
    .map(
      (item) =>
        `| ${item.viewport} | ${item.section} | ${Math.round(item.progress * 100)}% | ${item.referenceScrollY} | ${item.cloneScrollY} | ${item.mismatchPercent.toFixed(4)}% |`,
    )
    .join("\n");

  return `# Trionn visual comparison\n\n` +
    `Generated: ${run.generatedAt}\n\n` +
    `Reference: \`${run.referenceUrl}\`  \n` +
    `Clone: \`${run.cloneUrl}\`\n\n` +
    `Dynamic content is covered with magenta masks. Model masks cover only the inner geometry; the visible canvas/model boundary remains part of the comparison.\n\n` +
    `| Viewport | Section | Checkpoint | Reference Y | Clone Y | Pixel difference |\n` +
    `|---|---|---:|---:|---:|---:|\n${rows}\n`;
}
