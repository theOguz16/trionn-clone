import assert from "node:assert/strict";
import test from "node:test";

import { PNG } from "pngjs";

import {
  calculateScrollTarget,
  calculateMediaSeekTime,
  checkpointName,
  comparePngBuffers,
  mergeMaskRectSets,
  parseArgs,
} from "./visual-compare-lib.mjs";

test("calculateScrollTarget normalizes progress inside a pinned section", () => {
  assert.equal(
    calculateScrollTarget({
      start: 1000,
      end: 5000,
      progress: 0.5,
      viewportHeight: 1000,
      documentHeight: 10000,
    }),
    2500,
  );
});

test("calculateScrollTarget clamps to the document maximum", () => {
  assert.equal(
    calculateScrollTarget({
      start: 9000,
      end: 10000,
      progress: 1,
      viewportHeight: 1000,
      documentHeight: 9500,
    }),
    8500,
  );
});

test("calculateMediaSeekTime clamps progress and avoids the duration boundary", () => {
  assert.equal(calculateMediaSeekTime(Number.NaN, 0.5), 0);
  assert.equal(calculateMediaSeekTime(10, -1), 0);
  assert.equal(calculateMediaSeekTime(10, 0.25), 2.4875);
  assert.equal(calculateMediaSeekTime(10, 2), 9.95);
});

test("parseArgs accepts scoped runs", () => {
  assert.deepEqual(
    parseArgs([
      "--",
      "--viewports",
      "mobile,desktopWide",
      "--sections",
      "hero,footer",
      "--checkpoints",
      "0,0.5,1",
      "--headed",
    ]),
    {
      referenceUrl: null,
      cloneUrl: null,
      output: null,
      sections: ["hero", "footer"],
      viewports: ["mobile", "desktopWide"],
      checkpoints: [0, 0.5, 1],
      headed: true,
      keepServer: false,
    },
  );
});

test("checkpointName is stable and sortable", () => {
  assert.equal(checkpointName(0), "p000");
  assert.equal(checkpointName(0.25), "p025");
  assert.equal(checkpointName(1), "p100");
});

test("comparePngBuffers reports exact and changed pixels", () => {
  const first = new PNG({ width: 2, height: 1 });
  const second = new PNG({ width: 2, height: 1 });

  first.data.set([0, 0, 0, 255, 255, 255, 255, 255]);
  second.data.set([0, 0, 0, 255, 0, 0, 0, 255]);

  const result = comparePngBuffers(
    PNG.sync.write(first),
    PNG.sync.write(second),
  );

  assert.equal(result.mismatchedPixels, 1);
  assert.equal(result.totalPixels, 2);
  assert.equal(result.mismatchPercent, 50);
});

test("mergeMaskRectSets creates identical union geometry by mask name", () => {
  assert.deepEqual(
    mergeMaskRectSets(
      [
        { name: "hero-word", left: 236, top: 186, width: 371, height: 87 },
        { name: "model-interior", left: 490, top: 270, width: 461, height: 396 },
      ],
      [
        { name: "hero-word", left: 28, top: 186, width: 838, height: 87 },
        { name: "model-interior", left: 490, top: 270, width: 461, height: 396 },
      ],
    ),
    [
      { name: "hero-word", left: 28, top: 186, width: 838, height: 87 },
      { name: "model-interior", left: 490, top: 270, width: 461, height: 396 },
    ],
  );
});
