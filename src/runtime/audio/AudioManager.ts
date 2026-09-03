export type PluckOptions = {
  frequency: number;
  strength?: number;
  duration?: number;
};

export type AudioPlaybackStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "error";

export type AudioPlaybackState = {
  status: AudioPlaybackStatus;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  progress: number;
  canPlay: boolean;
  error: string | null;
};

export type AudioSource = {
  src: string;
  type: string;
};

export type FrequencyBands = {
  bass: number;
  lowMid: number;
  mid: number;
  high: number;
  overall: number;
};

const INITIAL_PLAYBACK_STATE: AudioPlaybackState = {
  status: "idle",
  muted: true,
  volume: 0.52,
  currentTime: 0,
  duration: 0,
  progress: 0,
  canPlay: false,
  error: null,
};

class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private mediaElement: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private mediaGain: GainNode | null = null;
  private loadedSource: string | null = null;
  private hasPlaybackStarted = false;
  private mediaFadeTimer: number | null = null;
  private lastThunderPulseAt = 0;

  private playbackState: AudioPlaybackState = {
    ...INITIAL_PLAYBACK_STATE,
  };

  private listeners = new Set<() => void>();

  private chargeOscillator: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;
  private chargeFilter: BiquadFilterNode | null = null;

  private whooshSource: AudioBufferSourceNode | null = null;
  private whooshGain: GainNode | null = null;
  private whooshFilter: BiquadFilterNode | null = null;

  private muted = true;

  private ensureContext() {
    if (this.context && this.context.state !== "closed") {
      return this.context;
    }

    const context = new AudioContext();
    const masterGain = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const analyser = context.createAnalyser();

    /*
     * Keep the hero effects compact and controlled. The compressor is
     * deliberately gentle: it only catches weld/explosion peaks when
     * several procedural layers overlap.
     */
    masterGain.gain.value = this.muted
      ? 0
      : this.playbackState.volume;

    compressor.threshold.value = -14;
    compressor.knee.value = 16;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;

    masterGain.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(context.destination);

    this.context = context;
    this.masterGain = masterGain;
    this.compressor = compressor;
    this.analyser = analyser;
    this.noiseBuffer = null;
    this.frequencyData = new Uint8Array(
      new ArrayBuffer(analyser.frequencyBinCount),
    );

    return context;
  }

  private emitPlaybackState(
    patch: Partial<AudioPlaybackState>,
  ) {
    this.playbackState = {
      ...this.playbackState,
      ...patch,
    };

    for (const listener of this.listeners) {
      listener();
    }
  }

  private syncMediaTime = () => {
    const media = this.mediaElement;
    if (!media) return;

    const duration = Number.isFinite(media.duration)
      ? media.duration
      : 0;
    const currentTime = Number.isFinite(media.currentTime)
      ? media.currentTime
      : 0;

    this.emitPlaybackState({
      currentTime,
      duration,
      progress: duration > 0
        ? Math.min(1, currentTime / duration)
        : 0,
    });
  };

  private handleMediaLoadStart = () => {
    this.emitPlaybackState({
      status: "loading",
      canPlay: false,
      error: null,
    });
  };

  private handleMediaReady = () => {
    this.syncMediaTime();
    this.emitPlaybackState({
      status: this.mediaElement?.paused
        ? this.hasPlaybackStarted
          ? "paused"
          : "ready"
        : "playing",
      canPlay: true,
      error: null,
    });
  };

  private handleMediaPlay = () => {
    this.hasPlaybackStarted = true;
    this.emitPlaybackState({
      status: "playing",
      canPlay: true,
      error: null,
    });
  };

  private handleMediaPause = () => {
    if (this.playbackState.status === "error") return;

    this.syncMediaTime();
    this.emitPlaybackState({
      status: "paused",
    });
  };

  private handleMediaError = () => {
    this.emitPlaybackState({
      status: "error",
      canPlay: false,
      error: "Audio unavailable",
    });
  };

  private addMediaListeners(media: HTMLAudioElement) {
    media.addEventListener("loadstart", this.handleMediaLoadStart);
    media.addEventListener("loadedmetadata", this.handleMediaReady);
    media.addEventListener("canplay", this.handleMediaReady);
    media.addEventListener("play", this.handleMediaPlay);
    media.addEventListener("pause", this.handleMediaPause);
    media.addEventListener("timeupdate", this.syncMediaTime);
    media.addEventListener("durationchange", this.syncMediaTime);
    media.addEventListener("error", this.handleMediaError);
  }

  private removeMediaListeners(media: HTMLAudioElement) {
    media.removeEventListener("loadstart", this.handleMediaLoadStart);
    media.removeEventListener("loadedmetadata", this.handleMediaReady);
    media.removeEventListener("canplay", this.handleMediaReady);
    media.removeEventListener("play", this.handleMediaPlay);
    media.removeEventListener("pause", this.handleMediaPause);
    media.removeEventListener("timeupdate", this.syncMediaTime);
    media.removeEventListener("durationchange", this.syncMediaTime);
    media.removeEventListener("error", this.handleMediaError);
  }

  private ensureMediaGraph() {
    const media = this.mediaElement;
    const context = this.ensureContext();

    if (!media || this.mediaSource) {
      return;
    }

    const source = context.createMediaElementSource(media);
    const gain = context.createGain();
    gain.gain.value = 0.0001;
    source.connect(gain);
    gain.connect(this.masterGain!);

    this.mediaSource = source;
    this.mediaGain = gain;
  }

  load(sources: AudioSource | AudioSource[]) {
    if (typeof window === "undefined") return;

    const candidates = Array.isArray(sources)
      ? sources
      : [sources];
    const media = this.mediaElement ?? new Audio();
    const selected =
      candidates.find(({ type }) => media.canPlayType(type) !== "") ??
      candidates[0];

    if (!selected || this.loadedSource === selected.src) {
      return;
    }

    if (!this.mediaElement) {
      media.preload = "metadata";
      media.loop = true;
      media.crossOrigin = "anonymous";
      this.addMediaListeners(media);
      this.mediaElement = media;
    }

    this.loadedSource = selected.src;
    media.src = selected.src;
    media.load();
  }

  async play() {
    const media = this.mediaElement;
    if (!media) {
      this.emitPlaybackState({
        status: "error",
        error: "Audio unavailable",
      });
      return false;
    }

    try {
      await this.unlock();
      this.ensureMediaGraph();
      await media.play();
      return true;
    } catch {
      this.emitPlaybackState({
        status: "paused",
        error: "Select play to start audio",
      });
      return false;
    }
  }

  pause() {
    if (this.mediaFadeTimer !== null) {
      window.clearTimeout(this.mediaFadeTimer);
      this.mediaFadeTimer = null;
    }
    this.mediaElement?.pause();
  }

  async playThunderPulse(
    intensity = 0.45,
    duration = 0.72,
  ) {
    if (this.muted || !this.mediaElement) {
      return false;
    }

    const nowMs = window.performance.now();
    if (nowMs - this.lastThunderPulseAt < 90) {
      return true;
    }
    this.lastThunderPulseAt = nowMs;

    const running = await this.unlock();
    if (!running) return false;

    this.ensureMediaGraph();
    const context = this.context;
    const media = this.mediaElement;
    const gain = this.mediaGain;

    if (!context || !gain) return false;

    const normalized = Math.max(0.1, Math.min(intensity, 1));
    const pulseDuration = Math.max(0.28, Math.min(duration, 1.4));
    const now = context.currentTime;
    const currentGain = Math.max(0.0001, gain.gain.value);

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(currentGain, now);
    gain.gain.exponentialRampToValueAtTime(
      0.16 + normalized * 0.28,
      now + 0.025,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + pulseDuration,
    );

    if (this.mediaFadeTimer !== null) {
      window.clearTimeout(this.mediaFadeTimer);
    }

    try {
      if (media.paused) {
        await media.play();
      }
    } catch {
      return false;
    }

    this.mediaFadeTimer = window.setTimeout(() => {
      media.pause();
      this.mediaFadeTimer = null;
    }, pulseDuration * 1000 + 70);

    return true;
  }

  async toggle() {
    if (this.playbackState.status === "playing") {
      this.pause();
      return false;
    }

    return this.play();
  }

  mute() {
    this.setMuted(true);
  }

  unmute() {
    this.setMuted(false);
  }

  toggleMute() {
    this.setMuted(!this.playbackState.muted);
  }

  seek(seconds: number) {
    const media = this.mediaElement;
    if (!media || !Number.isFinite(seconds)) return;

    const duration = Number.isFinite(media.duration)
      ? media.duration
      : 0;
    const endSafeTime = duration > 0
      ? Math.max(0, duration - 0.05)
      : 0;
    media.currentTime = Math.max(0, Math.min(seconds, endSafeTime));
    this.syncMediaTime();
  }

  setVolume(value: number) {
    const volume = Math.max(0, Math.min(value, 1));
    this.emitPlaybackState({ volume });

    if (!this.context || !this.masterGain || this.muted) return;

    this.masterGain.gain.setTargetAtTime(
      volume,
      this.context.currentTime,
      0.02,
    );
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.playbackState;

  getServerSnapshot = () => INITIAL_PLAYBACK_STATE;

  private getNoiseBuffer(context: AudioContext) {
    if (this.noiseBuffer) {
      return this.noiseBuffer;
    }

    const duration = 2.4;
    const frameCount = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    this.noiseBuffer = buffer;
    return buffer;
  }

  private randomNoiseOffset(buffer: AudioBuffer, duration: number) {
    return Math.random() * Math.max(0, buffer.duration - duration - 0.02);
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

    /*
     * Charge should feel like vibration/pressure rather than a musical
     * rising note. Low triangle tone + a slowly opening low-pass keeps it
     * physical and leaves space for the later blast.
     */
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(58, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(245, now);
    filter.Q.setValueAtTime(0.85, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.012, now + 0.035);

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
    const shaped = normalized * normalized;
    const now = this.context.currentTime;

    this.chargeOscillator.frequency.setTargetAtTime(
      58 + shaped * 76,
      now,
      0.035,
    );
    this.chargeFilter.frequency.setTargetAtTime(
      245 + shaped * 720,
      now,
      0.045,
    );
    this.chargeGain.gain.setTargetAtTime(
      0.012 + shaped * 0.032,
      now,
      0.03,
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
    gain.gain.setTargetAtTime(0.0001, now, 0.045);

    try {
      source.stop(now + 0.22);
    } catch {
      // The source may already be stopping after a rapid release.
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
    gain.gain.setTargetAtTime(0.0001, now, 0.022);
    oscillator.stop(now + 0.12);

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

    /* Low body: short pressure hit, not a long bass note. */
    const lowOscillator = context.createOscillator();
    const lowGain = context.createGain();
    lowOscillator.type = "sine";
    lowOscillator.frequency.setValueAtTime(94, now);
    lowOscillator.frequency.exponentialRampToValueAtTime(38, now + 0.22);
    lowGain.gain.setValueAtTime(0.17, now);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.27);
    lowOscillator.connect(lowGain);
    lowGain.connect(this.masterGain);
    lowOscillator.start(now);
    lowOscillator.stop(now + 0.29);

    /* Mid snap gives the break-apart moment definition on small speakers. */
    const snapOscillator = context.createOscillator();
    const snapGain = context.createGain();
    snapOscillator.type = "triangle";
    snapOscillator.frequency.setValueAtTime(210, now);
    snapOscillator.frequency.exponentialRampToValueAtTime(72, now + 0.11);
    snapGain.gain.setValueAtTime(0.055, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    snapOscillator.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOscillator.start(now);
    snapOscillator.stop(now + 0.15);

    /* Broadband transient keeps the impact tactile instead of tonal. */
    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const noiseBuffer = this.getNoiseBuffer(context);
    const noiseDuration = 0.22;

    noise.buffer = noiseBuffer;
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(2100, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(420, now + 0.18);
    noiseFilter.Q.setValueAtTime(0.55, now);
    noiseGain.gain.setValueAtTime(0.075, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(
      now,
      this.randomNoiseOffset(noiseBuffer, noiseDuration),
      noiseDuration,
    );

    lowOscillator.onended = () => {
      lowOscillator.disconnect();
      lowGain.disconnect();
    };
    snapOscillator.onended = () => {
      snapOscillator.disconnect();
      snapGain.disconnect();
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
    const buffer = this.getNoiseBuffer(context);
    const now = context.currentTime;

    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0.15;
    source.loopEnd = Math.min(buffer.duration - 0.1, 2.1);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(620, now);
    filter.Q.setValueAtTime(0.52, now);
    filter.frequency.exponentialRampToValueAtTime(1320, now + 0.72);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.036, now + 0.14);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(
      now + 0.025,
      this.randomNoiseOffset(buffer, 0.9),
    );

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

  playJoin() {
    if (
      !this.context ||
      !this.masterGain ||
      this.context.state !== "running"
    ) {
      return;
    }

    const context = this.context;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(92, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      178,
      now + 0.24,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(now);
    oscillator.stop(now + 0.32);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
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
    const beepDuration = Math.min(0.07, Math.max(0.045, duration));
    const baseFrequency = Math.min(680, Math.max(420, frequency));

    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(baseFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFrequency * 0.955,
      now + beepDuration,
    );

    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(baseFrequency * 2.02, now);

    const peak = Math.min(0.03, Math.max(0.012, strength * 0.72));
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(peak, now + 0.003);
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      now + beepDuration,
    );

    overtoneGain.gain.setValueAtTime(peak * 0.14, now);
    overtoneGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + beepDuration * 0.58,
    );

    oscillator.connect(envelope);
    envelope.connect(this.masterGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(this.masterGain);

    oscillator.start(now);
    overtone.start(now);
    oscillator.stop(now + beepDuration + 0.015);
    overtone.stop(now + beepDuration + 0.015);

    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
    overtone.onended = () => {
      overtone.disconnect();
      overtoneGain.disconnect();
    };
  }

  playFooterNote(
    frequency: number,
    strength = 0.5,
    duration = 0.72,
  ) {
    if (
      this.muted ||
      !this.context ||
      !this.masterGain ||
      this.context.state !== "running"
    ) {
      return;
    }

    const context = this.context;
    const now = context.currentTime;
    const baseFrequency = Math.max(110, Math.min(frequency, 660));
    const noteDuration = Math.max(0.32, Math.min(duration, 1.1));
    const normalized = Math.max(0.1, Math.min(strength, 1));
    const partials = [
      { ratio: 1, gain: 0.075, type: "triangle" as OscillatorType },
      { ratio: 2.01, gain: 0.025, type: "sine" as OscillatorType },
      { ratio: 3.98, gain: 0.009, type: "sine" as OscillatorType },
    ];

    partials.forEach((partial, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const peak = partial.gain * normalized;

      oscillator.type = partial.type;
      oscillator.frequency.setValueAtTime(
        baseFrequency * partial.ratio,
        now,
      );
      oscillator.detune.setValueAtTime(index === 1 ? 2.5 : -1.5, now);

      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(
        peak,
        now + 0.004 + index * 0.002,
      );
      envelope.gain.exponentialRampToValueAtTime(
        0.0001,
        now + noteDuration * (1 - index * 0.12),
      );

      oscillator.connect(envelope);
      envelope.connect(this.masterGain!);
      oscillator.start(now);
      oscillator.stop(now + noteDuration + 0.02);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
    });

    const hammer = context.createBufferSource();
    const hammerFilter = context.createBiquadFilter();
    const hammerGain = context.createGain();
    const hammerDuration = 0.035;

    hammer.buffer = this.getNoiseBuffer(context);
    hammerFilter.type = "bandpass";
    hammerFilter.frequency.setValueAtTime(baseFrequency * 3.2, now);
    hammerFilter.Q.setValueAtTime(1.4, now);
    hammerGain.gain.setValueAtTime(0.018 * normalized, now);
    hammerGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + hammerDuration,
    );
    hammer.connect(hammerFilter);
    hammerFilter.connect(hammerGain);
    hammerGain.connect(this.masterGain);
    hammer.start(
      now,
      this.randomNoiseOffset(hammer.buffer, hammerDuration),
      hammerDuration,
    );
    hammer.onended = () => {
      hammer.disconnect();
      hammerFilter.disconnect();
      hammerGain.disconnect();
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
    const sparkDuration = Math.min(0.085, Math.max(0.055, duration));
    const buffer = this.getNoiseBuffer(context);

    /* Fast high-frequency crackle. */
    const noise = context.createBufferSource();
    const highpass = context.createBiquadFilter();
    const bandpass = context.createBiquadFilter();
    const envelope = context.createGain();

    noise.buffer = buffer;
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(1450, now);
    highpass.Q.setValueAtTime(0.35, now);

    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(
      Math.min(3900, Math.max(2250, frequency * 2.55)),
      now,
    );
    bandpass.Q.setValueAtTime(2.5, now);

    const crackPeak = Math.min(0.07, Math.max(0.035, strength * 0.88));
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(crackPeak, now + 0.0015);
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      now + sparkDuration,
    );

    noise.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(envelope);
    envelope.connect(this.masterGain);

    /* Tiny resonant ring: triangle avoids the harsh digital square buzz. */
    const ring = context.createOscillator();
    const ringGain = context.createGain();
    ring.type = "triangle";
    ring.frequency.setValueAtTime(
      Math.min(3200, Math.max(1900, frequency * 1.9)),
      now,
    );
    ring.frequency.exponentialRampToValueAtTime(
      Math.max(1250, frequency * 1.25),
      now + sparkDuration * 0.62,
    );

    const ringPeak = Math.min(0.012, strength * 0.13);
    ringGain.gain.setValueAtTime(ringPeak, now);
    ringGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + sparkDuration * 0.68,
    );

    ring.connect(ringGain);
    ringGain.connect(this.masterGain);

    noise.start(
      now,
      this.randomNoiseOffset(buffer, sparkDuration + 0.02),
      sparkDuration + 0.02,
    );
    ring.start(now);
    ring.stop(now + sparkDuration + 0.015);

    noise.onended = () => {
      noise.disconnect();
      highpass.disconnect();
      bandpass.disconnect();
      envelope.disconnect();
    };
    ring.onended = () => {
      ring.disconnect();
      ringGain.disconnect();
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
    this.emitPlaybackState({ muted });

    if (!this.context || !this.masterGain) {
      return;
    }

    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(
      muted ? 0 : this.playbackState.volume,
      now,
      0.02,
    );
  }

  getFrequencyData() {
    if (!this.analyser || !this.frequencyData) {
      return null;
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  getFrequencyBands(): FrequencyBands {
    const data = this.getFrequencyData();
    const analyser = this.analyser;
    const context = this.context;

    if (!data || !analyser || !context) {
      return {
        bass: 0,
        lowMid: 0,
        mid: 0,
        high: 0,
        overall: 0,
      };
    }

    const binWidth = context.sampleRate / analyser.fftSize;
    const averageBand = (minimum: number, maximum: number) => {
      const start = Math.max(0, Math.floor(minimum / binWidth));
      const end = Math.min(data.length, Math.ceil(maximum / binWidth));
      let total = 0;

      for (let index = start; index < end; index += 1) {
        total += data[index];
      }

      return end > start
        ? total / (end - start) / 255
        : 0;
    };

    let squaredTotal = 0;
    for (let index = 0; index < data.length; index += 1) {
      const normalized = data[index] / 255;
      squaredTotal += normalized * normalized;
    }

    return {
      bass: averageBand(20, 160),
      lowMid: averageBand(160, 500),
      mid: averageBand(500, 2000),
      high: averageBand(2000, 12000),
      overall: Math.sqrt(squaredTotal / data.length),
    };
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

    if (this.mediaFadeTimer !== null) {
      window.clearTimeout(this.mediaFadeTimer);
      this.mediaFadeTimer = null;
    }

    if (this.mediaElement) {
      this.removeMediaListeners(this.mediaElement);
      this.mediaElement.pause();
      this.mediaElement.removeAttribute("src");
      this.mediaElement.load();
    }

    this.mediaSource?.disconnect();
    this.mediaGain?.disconnect();

    if (this.context && this.context.state !== "closed") {
      await this.context.close();
    }

    this.context = null;
    this.masterGain = null;
    this.compressor = null;
    this.analyser = null;
    this.frequencyData = null;
    this.noiseBuffer = null;
    this.mediaElement = null;
    this.mediaSource = null;
    this.mediaGain = null;
    this.loadedSource = null;
    this.hasPlaybackStarted = false;
    this.playbackState = {
      ...INITIAL_PLAYBACK_STATE,
    };
    this.muted = true;
    this.listeners.clear();
  }
}

export const audioManager = new AudioManager();
