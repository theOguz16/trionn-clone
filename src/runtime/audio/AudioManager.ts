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
  private chargeFilter: BiquadFilterNode | null = null;

  private whooshSource: AudioBufferSourceNode | null = null;
  private whooshGain: GainNode | null = null;
  private whooshFilter: BiquadFilterNode | null = null;

  private muted = false;

  private ensureContext() {
    if (this.context && this.context.state !== "closed") {
      return this.context;
    }

    const context = new AudioContext();
    const masterGain = context.createGain();
    const analyser = context.createAnalyser();

    masterGain.gain.value = this.muted ? 0 : 0.65;
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    masterGain.connect(analyser);
    analyser.connect(context.destination);

    this.context = context;
    this.masterGain = masterGain;
    this.analyser = analyser;
    this.frequencyData = new Uint8Array(
      new ArrayBuffer(analyser.frequencyBinCount),
    );

    return context;
  }

  private createNoiseBuffer(
    context: AudioContext,
    duration: number,
  ) {
    const frameCount = Math.max(
      1,
      Math.ceil(context.sampleRate * duration),
    );
    const buffer = context.createBuffer(
      1,
      frameCount,
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  async unlock() {
    const context = this.ensureContext();

    if (context.state === "suspended") {
      await context.resume();
    }

    return context.state === "running";
  }

  async startCharge() {
    const running = await this.unlock();

    if (
      !running ||
      !this.context ||
      !this.masterGain ||
      this.chargeOscillator
    ) {
      return;
    }

    const context = this.context;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(72, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(360, now);
    filter.Q.setValueAtTime(1.6, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.018, now + 0.035);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(now);

    this.chargeOscillator = oscillator;
    this.chargeGain = gain;
    this.chargeFilter = filter;
  }

  updateCharge(progress: number) {
    if (
      !this.context ||
      !this.chargeOscillator ||
      !this.chargeGain ||
      !this.chargeFilter
    ) {
      return;
    }

    const normalized = Math.max(0, Math.min(progress, 1));
    const now = this.context.currentTime;

    this.chargeOscillator.frequency.setTargetAtTime(
      72 + normalized * 118,
      now,
      0.025,
    );
    this.chargeFilter.frequency.setTargetAtTime(
      360 + normalized * 880,
      now,
      0.035,
    );
    this.chargeGain.gain.setTargetAtTime(
      0.018 + normalized * 0.047,
      now,
      0.025,
    );
  }

  private stopWhoosh() {
    if (
      !this.context ||
      !this.whooshSource ||
      !this.whooshGain
    ) {
      return;
    }

    const context = this.context;
    const source = this.whooshSource;
    const gain = this.whooshGain;
    const filter = this.whooshFilter;
    const now = context.currentTime;

    this.whooshSource = null;
    this.whooshGain = null;
    this.whooshFilter = null;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(0.0001, now, 0.055);

    try {
      source.stop(now + 0.28);
    } catch {
      // Source may already be stopping.
    }

    source.onended = () => {
      source.disconnect();
      filter?.disconnect();
      gain.disconnect();
    };
  }

  stopCharge() {
    this.stopWhoosh();

    if (
      !this.context ||
      !this.chargeOscillator ||
      !this.chargeGain
    ) {
      return;
    }

    const context = this.context;
    const oscillator = this.chargeOscillator;
    const gain = this.chargeGain;
    const filter = this.chargeFilter;
    const now = context.currentTime;

    this.chargeOscillator = null;
    this.chargeGain = null;
    this.chargeFilter = null;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(0.0001, now, 0.025);
    oscillator.stop(now + 0.15);

    oscillator.onended = () => {
      oscillator.disconnect();
      filter?.disconnect();
      gain.disconnect();
    };
  }

  private playExplosionImpact() {
    if (
      !this.context ||
      !this.masterGain ||
      this.context.state !== "running"
    ) {
      return;
    }

    const context = this.context;
    const now = context.currentTime;

    const lowOscillator = context.createOscillator();
    const lowGain = context.createGain();
    lowOscillator.type = "sine";
    lowOscillator.frequency.setValueAtTime(112, now);
    lowOscillator.frequency.exponentialRampToValueAtTime(38, now + 0.42);
    lowGain.gain.setValueAtTime(0.29, now);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    lowOscillator.connect(lowGain);
    lowGain.connect(this.masterGain);
    lowOscillator.start(now);
    lowOscillator.stop(now + 0.5);

    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = this.createNoiseBuffer(context, 0.34);
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(1350, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(260, now + 0.3);
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.35);

    lowOscillator.onended = () => {
      lowOscillator.disconnect();
      lowGain.disconnect();
    };
    noise.onended = () => {
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
    };
  }

  private startWhoosh() {
    if (
      !this.context ||
      !this.masterGain ||
      this.context.state !== "running"
    ) {
      return;
    }

    this.stopWhoosh();

    const context = this.context;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const now = context.currentTime;

    source.buffer = this.createNoiseBuffer(context, 1.2);
    source.loop = true;

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(520, now);
    filter.Q.setValueAtTime(0.7, now);
    filter.frequency.exponentialRampToValueAtTime(1180, now + 0.65);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.058, now + 0.12);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(now);

    this.whooshSource = source;
    this.whooshFilter = filter;
    this.whooshGain = gain;
  }

  playBlast() {
    if (
      !this.context ||
      !this.masterGain ||
      this.context.state !== "running"
    ) {
      return;
    }

    this.playExplosionImpact();
    this.startWhoosh();
  }

  private playPanelHoverBeep(
    frequency: number,
    strength: number,
    duration: number,
  ) {
    if (!this.context || !this.masterGain) {
      return;
    }

    const context = this.context;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(120, frequency * 0.92),
      now + duration,
    );

    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(strength, now + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(envelope);
    envelope.connect(this.masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);

    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  private playWeldSpark(
    frequency: number,
    strength: number,
    duration: number,
  ) {
    if (!this.context || !this.masterGain) {
      return;
    }

    const context = this.context;
    const now = context.currentTime;

    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    noise.buffer = this.createNoiseBuffer(context, duration + 0.04);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(Math.max(900, frequency * 2.2), now);
    filter.Q.setValueAtTime(4.2, now);

    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(
      Math.min(0.12, strength * 1.25),
      now + 0.002,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const metallic = context.createOscillator();
    const metallicGain = context.createGain();
    metallic.type = "square";
    metallic.frequency.setValueAtTime(frequency * 1.35, now);
    metallic.frequency.exponentialRampToValueAtTime(
      frequency * 0.72,
      now + duration,
    );
    metallicGain.gain.setValueAtTime(Math.min(0.028, strength * 0.36), now);
    metallicGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.78);

    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain);
    metallic.connect(metallicGain);
    metallicGain.connect(this.masterGain);

    noise.start(now);
    metallic.start(now);
    noise.stop(now + duration + 0.04);
    metallic.stop(now + duration + 0.02);

    noise.onended = () => {
      noise.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
    metallic.onended = () => {
      metallic.disconnect();
      metallicGain.disconnect();
    };
  }

  pluck({
    frequency,
    strength = 0.35,
    duration = 0.45,
  }: PluckOptions) {
    if (
      !this.context ||
      !this.masterGain ||
      this.context.state !== "running"
    ) {
      return;
    }

    if (frequency >= 800) {
      this.playWeldSpark(frequency, strength, duration);
      return;
    }

    this.playPanelHoverBeep(frequency, strength, duration);
  }

  setMuted(muted: boolean) {
    this.muted = muted;

    if (!this.context || !this.masterGain) {
      return;
    }

    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(
      muted ? 0 : 0.65,
      now,
      0.02,
    );
  }

  getEnergy() {
    if (!this.analyser || !this.frequencyData) {
      return 0;
    }

    this.analyser.getByteFrequencyData(this.frequencyData);

    let total = 0;
    for (let index = 0; index < this.frequencyData.length; index += 1) {
      total += this.frequencyData[index];
    }

    return total / this.frequencyData.length / 255;
  }

  get state() {
    return this.context?.state ?? "uninitialized";
  }

  async suspend() {
    if (this.context?.state === "running") {
      await this.context.suspend();
    }
  }

  async destroy() {
    this.stopCharge();
    this.stopWhoosh();

    if (this.context && this.context.state !== "closed") {
      await this.context.close();
    }

    this.context = null;
    this.masterGain = null;
    this.analyser = null;
    this.frequencyData = null;
  }
}

export const audioManager = new AudioManager();