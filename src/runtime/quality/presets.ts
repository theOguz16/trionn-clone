import type {
  QualityLevel,
  QualityPreset,
} from "./types";

export const QUALITY_PRESETS:
  Record<QualityLevel, QualityPreset> = {
  low: {
    maxDpr: 1,
    particleMultiplier: 0.35,
    shaderDetail: 0.5,
    antialias: false,
  },

  medium: {
    maxDpr: 1.5,
    particleMultiplier: 0.65,
    shaderDetail: 0.75,
    antialias: true,
  },

  high: {
    maxDpr: 2,
    particleMultiplier: 1,
    shaderDetail: 1,
    antialias: true,
  },
};