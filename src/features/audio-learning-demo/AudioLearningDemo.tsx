"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { gsap } from "@/lib/gsap/client";
import { audioManager } from "@/runtime/audio/AudioManager";

const NOTES = [
  {
    label: "A2",
    frequency: 110,
  },
  {
    label: "A3",
    frequency: 220,
  },
  {
    label: "A4",
    frequency: 440,
  },
  {
    label: "A5",
    frequency: 880,
  },
];

export function AudioLearningDemo() {
  const meterRef =
    useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  useEffect(() => {
    const updateMeter = () => {
      const meter = meterRef.current;

      if (!meter) {
        return;
      }

      const energy =
        audioManager.getEnergy();

      meter.style.transform =
        `scaleX(${energy})`;
    };

    gsap.ticker.add(updateMeter);

    return () => {
      gsap.ticker.remove(updateMeter);
    };
  }, []);

  const enableAudio = async () => {
    const running =
      await audioManager.unlock();

    setEnabled(running);
  };

  const toggleMute = () => {
    const next = !muted;

    setMuted(next);

    audioManager.setMuted(next);
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-neutral-950 px-8 text-white">
      <div className="w-full max-w-3xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-orange-500">
          Web Audio Learning
        </p>

        <h2 className="text-5xl font-bold">
          Audio Graph
        </h2>

        {!enabled ? (
          <button
            type="button"
            onClick={enableAudio}
            className="mt-10 rounded-full bg-orange-500 px-6 py-3 font-medium text-black"
          >
            Enable sound
          </button>
        ) : (
          <>
            <div className="mt-10 flex flex-wrap gap-3">
              {NOTES.map(
                ({
                  label,
                  frequency,
                }) => (
                  <button
                    key={frequency}
                    type="button"
                    onPointerDown={() => {
                      audioManager.pluck({
                        frequency,
                        strength: 0.4,
                      });
                    }}
                    className="rounded-full border border-white/20 px-6 py-3 transition hover:bg-white hover:text-black"
                  >
                    {label}
                    {" · "}
                    {frequency} Hz
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={toggleMute}
              className="mt-6 text-sm uppercase tracking-[0.2em] text-white/60"
            >
              Sound{" "}
              {muted ? "Off" : "On"}
            </button>
          </>
        )}

        <div className="mt-12 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            ref={meterRef}
            className="h-full origin-left bg-orange-500"
            style={{
              transform: "scaleX(0)",
            }}
          />
        </div>
      </div>
    </section>
  );
}