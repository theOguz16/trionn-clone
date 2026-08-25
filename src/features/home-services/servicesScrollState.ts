export type ServicesScrollPhase =
  | "intro"
  | "breakup"
  | "transition"
  | "detailA"
  | "detailB"
  | "detailC"
  | "final";

type ProgressRange = {
  start: number;
  end: number;
};

export const SERVICES_SCROLL_PHASES = {
  intro: { start: 0, end: 0.16 },
  breakup: { start: 0.16, end: 0.38 },
  transition: { start: 0.38, end: 0.52 },
  detailA: { start: 0.52, end: 0.64 },
  detailB: { start: 0.64, end: 0.76 },
  detailC: { start: 0.76, end: 0.88 },
  final: { start: 0.88, end: 1 },
} as const satisfies Record<ServicesScrollPhase, ProgressRange>;

export type ServicesScrollState = {
  master: number;
  phase: ServicesScrollPhase;
  intro: number;
  breakup: number;
  transition: number;
  detailA: number;
  detailB: number;
  detailC: number;
  final: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function rangeProgress(master: number, range: ProgressRange) {
  const span = range.end - range.start;
  if (span <= 0) return master >= range.end ? 1 : 0;
  return clamp01((master - range.start) / span);
}

export function resolveServicesPhase(masterProgress: number): ServicesScrollPhase {
  const master = clamp01(masterProgress);

  if (master < SERVICES_SCROLL_PHASES.breakup.start) return "intro";
  if (master < SERVICES_SCROLL_PHASES.transition.start) return "breakup";
  if (master < SERVICES_SCROLL_PHASES.detailA.start) return "transition";
  if (master < SERVICES_SCROLL_PHASES.detailB.start) return "detailA";
  if (master < SERVICES_SCROLL_PHASES.detailC.start) return "detailB";
  if (master < SERVICES_SCROLL_PHASES.final.start) return "detailC";
  return "final";
}

export function getServicesScrollState(masterProgress: number): ServicesScrollState {
  const master = clamp01(masterProgress);

  return {
    master,
    phase: resolveServicesPhase(master),
    intro: rangeProgress(master, SERVICES_SCROLL_PHASES.intro),
    breakup: rangeProgress(master, SERVICES_SCROLL_PHASES.breakup),
    transition: rangeProgress(master, SERVICES_SCROLL_PHASES.transition),
    detailA: rangeProgress(master, SERVICES_SCROLL_PHASES.detailA),
    detailB: rangeProgress(master, SERVICES_SCROLL_PHASES.detailB),
    detailC: rangeProgress(master, SERVICES_SCROLL_PHASES.detailC),
    final: rangeProgress(master, SERVICES_SCROLL_PHASES.final),
  };
}

type SceneKeyframe = {
  master: number;
  scene: number;
};

const SCENE_PROGRESS_KEYFRAMES: readonly SceneKeyframe[] = [
  { master: 0, scene: 0 },
  { master: SERVICES_SCROLL_PHASES.breakup.start, scene: 0.12 },
  { master: SERVICES_SCROLL_PHASES.transition.start, scene: 0.58 },
  { master: SERVICES_SCROLL_PHASES.detailA.start, scene: 0.68 },
  { master: SERVICES_SCROLL_PHASES.detailB.start, scene: 0.78 },
  { master: SERVICES_SCROLL_PHASES.detailC.start, scene: 0.86 },
  { master: SERVICES_SCROLL_PHASES.final.start, scene: 0.94 },
  { master: 1, scene: 1 },
];

export function mapMasterToSceneProgress(masterProgress: number) {
  const master = clamp01(masterProgress);

  for (let index = 1; index < SCENE_PROGRESS_KEYFRAMES.length; index += 1) {
    const previous = SCENE_PROGRESS_KEYFRAMES[index - 1];
    const next = SCENE_PROGRESS_KEYFRAMES[index];

    if (master <= next.master) {
      const local = rangeProgress(master, {
        start: previous.master,
        end: next.master,
      });

      return previous.scene + (next.scene - previous.scene) * local;
    }
  }

  return 1;
}
