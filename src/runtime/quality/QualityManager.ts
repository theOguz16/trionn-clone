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

    this.initialized = true;
  }

  private detectInitialQuality():
    QualityLevel {
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
  }
}

export const qualityManager =
  new QualityManager();