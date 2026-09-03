"use client";

import {
  useEffect,
  useState,
} from "react";

type DebugState = {
  phase: string;

  master: string;

  overlap: string;

  breakup: string;

  pairA: string;

  pairB: string;

  pairC: string;
};

const EMPTY_STATE: DebugState = {
  phase: "missing",

  master: "0",

  overlap: "0",

  breakup: "0",

  pairA: "0",

  pairB: "0",

  pairC: "0",
};

export function ServicesDebugHud() {
  const [
    state,
    setState,
  ] =
    useState<DebugState>(
      EMPTY_STATE,
    );

  useEffect(() => {
    if (
      process.env
        .NODE_ENV ===
      "production"
    ) {
      return;
    }

    let frame = 0;

    const update = () => {
      const section =
        document.querySelector<HTMLElement>(
          "[data-home-services-showcase]",
        );

      if (!section) {
        setState(
          EMPTY_STATE,
        );

        frame =
          requestAnimationFrame(
            update,
          );

        return;
      }

      const style =
        getComputedStyle(
          section,
        );

      setState({
        phase:
          section
            .dataset
            .servicesPhase ??
          "unset",

        master:
          style
            .getPropertyValue(
              "--services-progress",
            )
            .trim() ||
          "0",

        overlap:
          style
            .getPropertyValue(
              "--services-overlap",
            )
            .trim() ||
          "0",

        breakup:
          style
            .getPropertyValue(
              "--services-breakup",
            )
            .trim() ||
          "0",

        pairA:
          style
            .getPropertyValue(
              "--services-pair-a",
            )
            .trim() ||
          "0",

        pairB:
          style
            .getPropertyValue(
              "--services-pair-b",
            )
            .trim() ||
          "0",

        pairC:
          style
            .getPropertyValue(
              "--services-pair-c",
            )
            .trim() ||
          "0",
      });

      frame =
        requestAnimationFrame(
          update,
        );
    };

    frame =
      requestAnimationFrame(
        update,
      );

    return () =>
      cancelAnimationFrame(
        frame,
      );
  }, []);

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return null;
  }

  return (
    <div
      style={{
        position:
          "fixed",

        left: 14,

        top: 90,

        zIndex: 99999,

        padding:
          "10px 12px",

        border:
          "1px solid rgba(255,255,255,.35)",

        borderRadius: 8,

        background:
          "rgba(0,0,0,.84)",

        color: "#fff",

        fontFamily:
          "ui-monospace,SFMono-Regular,Menlo,monospace",

        fontSize: 11,

        lineHeight: 1.45,

        pointerEvents:
          "none",

        whiteSpace:
          "pre",
      }}
    >
      {`SERVICES FLOW K
phase: ${state.phase}
master: ${state.master}
overlap: ${state.overlap}
breakup: ${state.breakup}
pairA: ${state.pairA}
pairB: ${state.pairB}
pairC: ${state.pairC}`}
    </div>
  );
}