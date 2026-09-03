export type ServicesScrollPhase =
  | "intro"
  | "overlap"
  | "breakup"
  | "assemble"
  | "pairA"
  | "pairB"
  | "pairC";

type ProgressRange = {
  start: number;
  end: number;
};

export const SERVICES_SCROLL_PHASES = {
  intro: {
    start: 0,
    end: 0.15,
  },

  overlap: {
    start: 0.15,
    end: 0.28,
  },

  breakup: {
    start: 0.28,
    end: 0.46,
  },

  assemble: {
    start: 0.46,
    end: 0.56,
  },

  pairA: {
    start: 0.56,
    end: 0.7,
  },

  pairB: {
    start: 0.7,
    end: 0.84,
  },

  pairC: {
    start: 0.84,
    end: 1,
  },
} as const satisfies Record<
  ServicesScrollPhase,
  ProgressRange
>;

export type ServicesScrollState = {
  master: number;

  phase: ServicesScrollPhase;

  intro: number;
  overlap: number;
  breakup: number;
  assemble: number;

  pairA: number;
  pairB: number;
  pairC: number;
};

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function rangeProgress(
  master: number,
  range: ProgressRange,
) {
  const span = range.end - range.start;

  if (span <= 0) {
    return master >= range.end ? 1 : 0;
  }

  return clamp01(
    (master - range.start) / span,
  );
}

export function resolveServicesPhase(
  masterProgress: number,
): ServicesScrollPhase {
  const master = clamp01(masterProgress);

  if (
    master <
    SERVICES_SCROLL_PHASES.overlap.start
  ) {
    return "intro";
  }

  if (
    master <
    SERVICES_SCROLL_PHASES.breakup.start
  ) {
    return "overlap";
  }

  if (
    master <
    SERVICES_SCROLL_PHASES.assemble.start
  ) {
    return "breakup";
  }

  if (
    master <
    SERVICES_SCROLL_PHASES.pairA.start
  ) {
    return "assemble";
  }

  if (
    master <
    SERVICES_SCROLL_PHASES.pairB.start
  ) {
    return "pairA";
  }

  if (
    master <
    SERVICES_SCROLL_PHASES.pairC.start
  ) {
    return "pairB";
  }

  return "pairC";
}

export function getServicesScrollState(
  masterProgress: number,
): ServicesScrollState {
  const master = clamp01(masterProgress);

  return {
    master,

    phase: resolveServicesPhase(master),

    intro: rangeProgress(
      master,
      SERVICES_SCROLL_PHASES.intro,
    ),

    overlap: rangeProgress(
      master,
      SERVICES_SCROLL_PHASES.overlap,
    ),

    breakup: rangeProgress(
      master,
      SERVICES_SCROLL_PHASES.breakup,
    ),

    assemble: rangeProgress(
      master,
      SERVICES_SCROLL_PHASES.assemble,
    ),

    pairA: rangeProgress(
      master,
      SERVICES_SCROLL_PHASES.pairA,
    ),

    pairB: rangeProgress(
      master,
      SERVICES_SCROLL_PHASES.pairB,
    ),

    pairC: rangeProgress(
      master,
      SERVICES_SCROLL_PHASES.pairC,
    ),
  };
}

export function mapMasterToSceneProgress(
  scrollProgress: number,
  viewport: "desktop" | "mobile" =
    "desktop",
) {
  const scroll = clamp01(scrollProgress);

  /*
   * 1280×720 referansında koyu servis sahnesi 6400px civarında başlar ve
   * Client stories 13625px'te devralır. Bu anchor'lar intro, breakup,
   * üç kart çifti ve ışık çıkışını aynı fiziksel scroll noktalarına bağlar.
   */
  const desktopKeyframes = [
    { scroll: 0, master: 0 },
    { scroll: 0.092, master: 0.05 },
    { scroll: 0.246, master: 0.22 },
    { scroll: 0.4, master: 0.42 },
    { scroll: 0.553, master: 0.65 },
    { scroll: 0.707, master: 0.75 },
    { scroll: 0.861, master: 0.92 },
    { scroll: 0.922, master: 0.965 },
    { scroll: 1, master: 0.986 },
  ] as const;

  /*
   * Portrait choreography has its own physical scroll anchors. The opening
   * and stone turn get generous holds, while the final half is reserved for
   * the six-card, single-lane conveyor and a clean light hand-off.
   */
  const mobileKeyframes = [
    { scroll: 0, master: 0.08 },
    { scroll: 0.08, master: 0.14 },
    { scroll: 0.22, master: 0.26 },
    { scroll: 0.34, master: 0.38 },
    { scroll: 0.5, master: 0.5 },
    { scroll: 0.62, master: 0.68 },
    { scroll: 0.78, master: 0.84 },
    { scroll: 0.94, master: 0.94 },
    { scroll: 1, master: 0.965 },
  ] as const;

  const keyframes =
    viewport === "mobile"
      ? mobileKeyframes
      : desktopKeyframes;

  for (
    let index = 1;
    index < keyframes.length;
    index += 1
  ) {
    const previous = keyframes[index - 1];
    const next = keyframes[index];

    if (scroll <= next.scroll) {
      const local =
        (scroll - previous.scroll) /
        (next.scroll - previous.scroll);

      return (
        previous.master +
        (next.master - previous.master) *
          local
      );
    }
  }

  return 1;
}
