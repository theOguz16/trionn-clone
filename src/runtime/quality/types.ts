export type QualityLevel =
  | "low"
  | "medium"
  | "high";

export type QualityPreset = {
  maxDpr: number;
  particleMultiplier: number;
  shaderDetail: number;
  antialias: boolean;
};