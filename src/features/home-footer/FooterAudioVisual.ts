import { audioManager } from "@/runtime/audio/AudioManager";

import type {
  RuntimeFrame,
  RuntimeScene,
} from "@/runtime/canvas/RuntimeScene";

type SmoothedBands = {
  bass: number;
  lowMid: number;
  mid: number;
  high: number;
  overall: number;
};

export class FooterAudioVisual implements RuntimeScene {
  readonly id = "home-footer-audio-visual";

  private smoothed: SmoothedBands = {
    bass: 0,
    lowMid: 0,
    mid: 0,
    high: 0,
    overall: 0,
  };

  constructor(
    private readonly root: HTMLElement,
    private readonly bars: HTMLElement[],
  ) {}

  update({ time, delta }: RuntimeFrame) {
    const snapshot = audioManager.getSnapshot();
    const reactive =
      snapshot.status === "playing" && !snapshot.muted;
    const measured = reactive
      ? audioManager.getFrequencyBands()
      : {
          bass: 0.025,
          lowMid: 0.018,
          mid: 0.014,
          high: 0.01,
          overall: 0.016,
        };
    const damping = 1 - Math.exp(-delta * 7.5);

    for (const key of Object.keys(this.smoothed) as Array<keyof SmoothedBands>) {
      this.smoothed[key] +=
        (measured[key] - this.smoothed[key]) * damping;
    }

    this.root.style.setProperty(
      "--footer-audio-bass",
      this.smoothed.bass.toFixed(4),
    );
    this.root.style.setProperty(
      "--footer-audio-mid",
      this.smoothed.mid.toFixed(4),
    );
    this.root.style.setProperty(
      "--footer-audio-high",
      this.smoothed.high.toFixed(4),
    );
    this.root.style.setProperty(
      "--footer-audio-rms",
      this.smoothed.overall.toFixed(4),
    );

    this.bars.forEach((bar, index) => {
      const position = index / Math.max(1, this.bars.length - 1);
      const band = position < 0.25
        ? this.smoothed.bass
        : position < 0.48
          ? this.smoothed.lowMid
          : position < 0.76
            ? this.smoothed.mid
            : this.smoothed.high;
      const texture = 0.72 + 0.28 * Math.sin(time * 1.4 + index * 1.73);
      const amplitude = Math.min(1, 0.12 + band * 2.4 * texture);
      bar.style.transform = `scaleY(${amplitude.toFixed(3)})`;
      bar.style.opacity = `${(0.18 + amplitude * 0.62).toFixed(3)}`;
    });
  }

  resize() {
    // DOM geometry is responsive; no cached dimensions are retained.
  }

  destroy() {
    this.root.style.removeProperty("--footer-audio-bass");
    this.root.style.removeProperty("--footer-audio-mid");
    this.root.style.removeProperty("--footer-audio-high");
    this.root.style.removeProperty("--footer-audio-rms");

    this.bars.forEach((bar) => {
      bar.style.removeProperty("transform");
      bar.style.removeProperty("opacity");
    });
  }
}
