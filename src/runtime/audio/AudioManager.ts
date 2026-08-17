export type PluckOptions = {
  frequency: number;
  strength?: number;
  duration?: number;
};

class AudioManager {
  private context: AudioContext | null = null;

  private masterGain: GainNode | null = null;

  private analyser: AnalyserNode | null = null;

  private frequencyData: Uint8Array<ArrayBuffer> | null = null;

  private chargeOscillator: OscillatorNode | null = null;

  private chargeGain: GainNode | null = null;

  private muted = false;

  private ensureContext() {
    if (
      this.context &&
      this.context.state !== "closed"
    ) {
      return this.context;
    }

    const context =
      new AudioContext();

    const masterGain =
      context.createGain();

    const analyser =
      context.createAnalyser();

    masterGain.gain.value =
      this.muted
        ? 0
        : 0.65;

    analyser.fftSize = 256;

    analyser.smoothingTimeConstant =
      0.8;

    masterGain.connect(
      analyser,
    );

    analyser.connect(
      context.destination,
    );

    this.context =
      context;

    this.masterGain =
      masterGain;

    this.analyser =
      analyser;

    this.frequencyData =
      new Uint8Array(
        new ArrayBuffer(
          analyser.frequencyBinCount,
        ),
      );

    return context;
  }

  async unlock() {
    const context =
      this.ensureContext();

    if (
      context.state ===
      "suspended"
    ) {
      await context.resume();
    }

    return (
      context.state ===
      "running"
    );
  }

  async startCharge() {
    const running =
      await this.unlock();

    if (
      !running ||
      !this.context ||
      !this.masterGain ||
      this.chargeOscillator
    ) {
      return;
    }

    const context =
      this.context;

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    const now =
      context.currentTime;

    oscillator.type =
      "sawtooth";

    oscillator.frequency.setValueAtTime(
      85,
      now,
    );

    gain.gain.setValueAtTime(
      0.0001,
      now,
    );

    gain.gain.exponentialRampToValueAtTime(
      0.025,
      now + 0.03,
    );

    oscillator.connect(
      gain,
    );

    gain.connect(
      this.masterGain,
    );

    oscillator.start(
      now,
    );

    this.chargeOscillator =
      oscillator;

    this.chargeGain =
      gain;
  }

  updateCharge(
    progress: number,
  ) {
    if (
      !this.context ||
      !this.chargeOscillator ||
      !this.chargeGain
    ) {
      return;
    }

    const normalized =
      Math.max(
        0,
        Math.min(
          progress,
          1,
        ),
      );

    const now =
      this.context.currentTime;

    this.chargeOscillator
      .frequency
      .setTargetAtTime(
        85 +
          normalized *
            260,
        now,
        0.02,
      );

    this.chargeGain
      .gain
      .setTargetAtTime(
        0.02 +
          normalized *
            0.065,
        now,
        0.02,
      );
  }

  stopCharge() {
    if (
      !this.context ||
      !this.chargeOscillator ||
      !this.chargeGain
    ) {
      return;
    }

    const context =
      this.context;

    const oscillator =
      this.chargeOscillator;

    const gain =
      this.chargeGain;

    this.chargeOscillator =
      null;

    this.chargeGain =
      null;

    const now =
      context.currentTime;

    gain.gain.cancelScheduledValues(
      now,
    );

    gain.gain.setTargetAtTime(
      0.0001,
      now,
      0.025,
    );

    oscillator.stop(
      now + 0.15,
    );

    oscillator.onended =
      () => {
        oscillator.disconnect();
        gain.disconnect();
      };
  }

  playBlast() {
    if (
      !this.context ||
      !this.masterGain ||
      this.context.state !==
        "running"
    ) {
      return;
    }

    const context =
      this.context;

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    const now =
      context.currentTime;

    oscillator.type =
      "sawtooth";

    oscillator.frequency.setValueAtTime(
      130,
      now,
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      42,
      now + 0.35,
    );

    gain.gain.setValueAtTime(
      0.32,
      now,
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.4,
    );

    oscillator.connect(
      gain,
    );

    gain.connect(
      this.masterGain,
    );

    oscillator.start(
      now,
    );

    oscillator.stop(
      now + 0.42,
    );

    oscillator.onended =
      () => {
        oscillator.disconnect();
        gain.disconnect();
      };
  }

  pluck({
    frequency,
    strength = 0.35,
    duration = 0.45,
  }: PluckOptions) {
    const context =
      this.context;

    const masterGain =
      this.masterGain;

    if (
      !context ||
      !masterGain ||
      context.state !==
        "running"
    ) {
      return;
    }

    const oscillator =
      context.createOscillator();

    const envelope =
      context.createGain();

    const now =
      context.currentTime;

    oscillator.type =
      "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      now,
    );

    const volume =
      Math.max(
        0.0001,
        Math.min(
          strength,
          1,
        ),
      );

    envelope.gain.setValueAtTime(
      0.0001,
      now,
    );

    envelope.gain.exponentialRampToValueAtTime(
      volume,
      now + 0.01,
    );

    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration,
    );

    oscillator.connect(
      envelope,
    );

    envelope.connect(
      masterGain,
    );

    oscillator.start(
      now,
    );

    oscillator.stop(
      now +
        duration +
        0.02,
    );

    oscillator.onended =
      () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
  }

  setMuted(
    muted: boolean,
  ) {
    this.muted =
      muted;

    if (
      !this.context ||
      !this.masterGain
    ) {
      return;
    }

    const now =
      this.context.currentTime;

    this.masterGain
      .gain
      .cancelScheduledValues(
        now,
      );

    this.masterGain
      .gain
      .setTargetAtTime(
        muted
          ? 0
          : 0.65,
        now,
        0.02,
      );
  }

  getEnergy() {
    if (
      !this.analyser ||
      !this.frequencyData
    ) {
      return 0;
    }

    this.analyser.getByteFrequencyData(
      this.frequencyData,
    );

    let total = 0;

    for (
      let index = 0;
      index <
      this.frequencyData.length;
      index += 1
    ) {
      total +=
        this.frequencyData[
          index
        ];
    }

    return (
      total /
      this.frequencyData
        .length /
      255
    );
  }

  get state() {
    return (
      this.context?.state ??
      "uninitialized"
    );
  }

  async suspend() {
    if (
      this.context?.state ===
      "running"
    ) {
      await this.context.suspend();
    }
  }

  async destroy() {
    this.stopCharge();

    if (
      this.context &&
      this.context.state !==
        "closed"
    ) {
      await this.context.close();
    }

    this.context =
      null;

    this.masterGain =
      null;

    this.analyser =
      null;

    this.frequencyData =
      null;
  }
}

export const audioManager =
  new AudioManager();