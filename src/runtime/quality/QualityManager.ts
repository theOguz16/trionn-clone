import {
  QUALITY_PRESETS,
} from "./presets";

import type {
  QualityLevel,
  QualityPreset,
} from "./types";

type NavigatorWithMemory =
  Navigator & {
    deviceMemory?: number;
  };

class QualityManager {
  private level: QualityLevel = "medium";

  private reducedMotion = false;

  private initialized = false;

  private overrideLocked = false;

  private frameSamples: number[] = [];

  private lastDegradeAt = 0;

  init() {
    if (this.initialized) {
      return;
    }

    this.reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    this.level =
      this.detectInitialQuality();

    document.documentElement.dataset.runtimeQuality =
      this.level;

    this.initialized = true;
  }

  private detectInitialQuality():
    QualityLevel {
    let storedOverride: string | null =
      null;

    try {
      storedOverride =
        window.localStorage.getItem(
          "trionn-quality-override",
        );
    } catch {
      // Storage can be unavailable in hardened/private contexts.
    }

    const requested =
      new URLSearchParams(
        window.location.search,
      ).get("quality") ??
      storedOverride;

    if (
      requested === "low" ||
      requested === "medium" ||
      requested === "high"
    ) {
      this.overrideLocked = true;

      return requested;
    }

    if (this.reducedMotion) {
      return "low";
    }

    const cores =
      navigator.hardwareConcurrency ?? 4;

    const navigatorWithMemory =
      navigator as NavigatorWithMemory;

    const memory =
      navigatorWithMemory.deviceMemory;

    const lowCPU =
      cores <= 4;

    const lowMemory =
      memory !== undefined &&
      memory <= 4;

    if (lowCPU || lowMemory) {
      return "low";
    }

    const strongCPU =
      cores >= 8;

    const strongMemory =
      memory === undefined ||
      memory >= 8;

    if (strongCPU && strongMemory) {
      return "high";
    }

    return "medium";
  }

  get currentLevel() {
    return this.level;
  }

  get preset(): QualityPreset {
    return QUALITY_PRESETS[this.level];
  }

  get prefersReducedMotion() {
    return this.reducedMotion;
  }

  get pixelRatio() {
    return Math.min(
      window.devicePixelRatio || 1,
      this.preset.maxDpr,
    );
  }

  setLevel(level: QualityLevel) {
    this.level = level;

    document.documentElement.dataset.runtimeQuality =
      level;
  }

  observeFrame(deltaMilliseconds: number) {
    if (
      this.overrideLocked ||
      this.level === "low" ||
      document.visibilityState !== "visible"
    ) {
      return false;
    }

    if (
      deltaMilliseconds <= 0 ||
      deltaMilliseconds > 200
    ) {
      this.frameSamples = [];

      return false;
    }

    this.frameSamples.push(
      deltaMilliseconds,
    );

    if (this.frameSamples.length < 120) {
      return false;
    }

    const samples =
      this.frameSamples.splice(0);

    const average =
      samples.reduce(
        (sum, value) => sum + value,
        0,
      ) / samples.length;

    const slowRatio =
      samples.filter(
        (value) => value > 32,
      ).length / samples.length;

    const now = performance.now();

    if (
      average <= 24 ||
      slowRatio < 0.16 ||
      now - this.lastDegradeAt < 8000
    ) {
      return false;
    }

    this.lastDegradeAt = now;

    this.setLevel(
      this.level === "high"
        ? "medium"
        : "low",
    );

    return true;
  }
}

export const qualityManager =
  new QualityManager();
