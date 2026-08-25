"use client";

import { useEffect, useState } from "react";

type DebugState = {
  phase: string;
  progress: string;
  detailA: string;
  detailB: string;
  detailC: string;
  final: string;
  webVisible: boolean;
  wordpressVisible: boolean;
};

const EMPTY_STATE: DebugState = {
  phase: "missing",
  progress: "0",
  detailA: "0",
  detailB: "0",
  detailC: "0",
  final: "0",
  webVisible: false,
  wordpressVisible: false,
};

export function ServicesDebugHud() {
  const [debug, setDebug] = useState<DebugState>(EMPTY_STATE);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let raf = 0;

    const update = () => {
      const section = document.querySelector<HTMLElement>(
        "[data-home-services-showcase]",
      );

      if (!section) {
        setDebug(EMPTY_STATE);
        raf = requestAnimationFrame(update);
        return;
      }

      const style = getComputedStyle(section);
      const webCard = section.querySelector<HTMLElement>(
        '[data-service-card="web"]',
      );
      const wordpressCard = section.querySelector<HTMLElement>(
        '[data-service-card="wordpress"]',
      );

      setDebug({
        phase: section.dataset.servicesPhase ?? "unset",
        progress: style.getPropertyValue("--services-progress").trim() || "0",
        detailA: style.getPropertyValue("--services-detail-a").trim() || "0",
        detailB: style.getPropertyValue("--services-detail-b").trim() || "0",
        detailC: style.getPropertyValue("--services-detail-c").trim() || "0",
        final: style.getPropertyValue("--services-final").trim() || "0",
        webVisible: Boolean(
          webCard &&
            Number.parseFloat(getComputedStyle(webCard).opacity || "0") > 0.01,
        ),
        wordpressVisible: Boolean(
          wordpressCard &&
            Number.parseFloat(getComputedStyle(wordpressCard).opacity || "0") >
              0.01,
        ),
      });

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);

    return () => cancelAnimationFrame(raf);
  }, []);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 14,
        top: 90,
        zIndex: 99999,
        padding: "10px 12px",
        border: "1px solid rgba(255,255,255,.35)",
        borderRadius: 8,
        background: "rgba(0,0,0,.82)",
        color: "#fff",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.45,
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      {`SERVICES DBG E5\nphase: ${debug.phase}\nmaster: ${debug.progress}\nA:${debug.detailA} B:${debug.detailB}\nC:${debug.detailC} F:${debug.final}\nweb:${debug.webVisible ? "on" : "off"} wp:${debug.wordpressVisible ? "on" : "off"}`}
    </div>
  );
}
