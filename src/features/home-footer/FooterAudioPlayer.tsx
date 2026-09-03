"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useSyncExternalStore,
} from "react";

import { audioManager } from "@/runtime/audio/AudioManager";

import styles from "./HomeAudioFooter.module.css";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

const WAVEFORM_BARS = Array.from(
  { length: 36 },
  (_, index) => 22 + ((index * 17 + index * index * 3) % 64),
);

export function FooterAudioPlayer() {
  const state = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.getSnapshot,
    audioManager.getServerSnapshot,
  );
  const playing = state.status === "playing";
  const unavailable = state.status === "error";
  const durationLabel = state.duration > 0
    ? formatTime(state.duration)
    : "--:--";
  const statusLabel = unavailable
    ? "Audio unavailable"
    : state.status === "loading"
      ? "Loading audio"
      : playing
        ? "Playing"
        : state.status === "paused"
          ? "Paused"
          : "Ready";

  const handlePlayerKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key.toLowerCase() !== "m") return;

    event.preventDefault();
    audioManager.toggleMute();
  };

  const seekStyle = {
    "--seek-progress": `${state.progress * 100}%`,
  } as CSSProperties;

  const togglePlayback = () => {
    if (!playing) audioManager.unmute();
    void audioManager.toggle();
  };

  return (
    <div
      data-footer-audio-player
      className={styles.player}
      onKeyDown={handlePlayerKeyDown}
    >
      <div className={styles.playerTopline}>
        <div>
          <p className={styles.playerTitle}>Afterglow Systems</p>
          <p className={styles.playerSource}>Original ambient composition</p>
        </div>
        <span role="status" aria-live="polite" className={styles.playerStatus}>
          {statusLabel}
        </span>
      </div>

      <div className={styles.playerControls}>
        <button
          type="button"
          disabled={unavailable}
          aria-label={playing ? "Pause ambient track" : "Play ambient track"}
          aria-pressed={playing}
          className={styles.playButton}
          onClick={togglePlayback}
          onKeyDown={(event) => {
            if (event.key !== " " && event.key !== "Enter") return;
            event.preventDefault();
            togglePlayback();
          }}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        </button>

        <div className={styles.seekGroup}>
          <div aria-hidden="true" className={styles.waveform}>
            {WAVEFORM_BARS.map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={state.duration || 0}
            step={0.01}
            value={Math.min(state.currentTime, state.duration || 0)}
            disabled={!state.canPlay || unavailable}
            aria-label="Seek audio"
            aria-valuetext={`${formatTime(state.currentTime)} of ${durationLabel}`}
            style={seekStyle}
            className={styles.seek}
            onChange={(event) => {
              audioManager.seek(Number(event.currentTarget.value));
            }}
            onKeyDown={(event) => {
              if (event.key === "Home") {
                event.preventDefault();
                audioManager.seek(0);
              } else if (event.key === "End") {
                event.preventDefault();
                audioManager.seek(state.duration);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                audioManager.seek(state.currentTime - 5);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                audioManager.seek(state.currentTime + 5);
              }
            }}
          />
          <p className={styles.time}>
            <span>{formatTime(state.currentTime)}</span>
            <span aria-hidden="true">/</span>
            <span>{durationLabel}</span>
          </p>
        </div>

        <button
          type="button"
          disabled={unavailable}
          aria-label={state.muted ? "Enable sound" : "Mute sound"}
          aria-pressed={!state.muted}
          className={styles.muteButton}
          onClick={() => audioManager.toggleMute()}
        >
          <span aria-hidden="true">{state.muted ? "MUTED" : "SOUND"}</span>
        </button>
      </div>

      {state.error && !unavailable ? (
        <p className={styles.playerNotice}>{state.error}</p>
      ) : null}
    </div>
  );
}
