"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./InitialPreloader.module.css";

type LoaderPhase =
  | "mark"
  | "brand"
  | "reveal";

const MARK_DURATION = 1550;
const BRAND_DURATION = 2200;
const REVEAL_DURATION = 1600;
const READY_FALLBACK = 4600;
const PRELOADER_COMPLETE_EVENT =
  "trionn:preloader-complete";

const MARK_PATHS = [
  "m10.796 14.06 2.007.002h.071l.037.061 4.524 7.815.11.19-.22-.003-2.02-.034-.071-.001-.035-.06-1.738-2.96H2.5l.114-.19 1.04-1.725.036-.06h8.65l-1.652-2.848-.11-.188z",
  "M16.898 2.36l.98 1.76.035.06-.036.062-1.72 3.007 5.351 9.227.11.191-.22-.003-2.02-.034-.07-.002-.036-.06-4.262-7.345-1.603 2.792-.109.188-.108-.188-1.017-1.765-.036-.062.036-.063 1.718-2.96 2.79-4.807.11-.19z",
  "m10.283 1.938.98 1.76.034.06-.035.062-4.265 7.352h3.667l-.106.186-.97 1.725-.037.064H.178l.114-.19 1.04-1.725.037-.06h3.34l5.356-9.235.11-.19z",
] as const;

function SlotReel({
  digit,
  short = false,
}: {
  digit: number;
  short?: boolean;
}) {
  const digits = short
    ? [0, 1]
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <span className={styles.slotReel}>
      <span
        className={styles.slotStrip}
        style={{
          transform: `translate3d(0, -${digit}em, 0)`,
        }}
      >
        {digits.map((value) => (
          <span key={value} className={styles.slotDigit}>
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}

function LoaderCounter({ progress }: { progress: number }) {
  const value = Math.max(0, Math.min(progress, 100));
  const hundreds = value === 100 ? 1 : 0;
  const tens = value === 100 ? 0 : Math.floor(value / 10);
  const ones = value === 100 ? 0 : value % 10;

  return (
    <div className={styles.progress} aria-label={`${value}`}>
      <SlotReel digit={hundreds} short />
      <SlotReel digit={tens} />
      <SlotReel digit={ones} />
    </div>
  );
}

export function InitialPreloader() {
  const [phase, setPhase] =
    useState<LoaderPhase>(
      "mark",
    );
  const [progress, setProgress] =
    useState(0);
  const [visible, setVisible] =
    useState(true);
  const revealStartedRef =
    useRef(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const root =
      document.documentElement;
    const body = document.body;
    const previousRootOverflow =
      root.style.overflow;
    const previousBodyOverflow =
      body.style.overflow;
    const previousOverscroll =
      body.style.overscrollBehavior;

    root.style.overflow =
      "hidden";
    body.style.overflow =
      "hidden";
    body.style.overscrollBehavior =
      "none";
    window.scrollTo(0, 0);

    return () => {
      root.style.overflow =
        previousRootOverflow;
      body.style.overflow =
        previousBodyOverflow;
      body.style.overscrollBehavior =
        previousOverscroll;
      window.scrollTo(0, 0);
    };
  }, [visible]);

  useEffect(() => {
    let cancelled = false;
    const timers:
      Array<ReturnType<typeof setTimeout>> =
        [];
    const startedAt =
      performance.now();
    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    const markDuration =
      reducedMotion ? 80 : MARK_DURATION;
    const brandDuration =
      reducedMotion ? 180 : BRAND_DURATION;
    const revealDuration =
      reducedMotion ? 220 : REVEAL_DURATION;
    const nominalRevealAt =
      markDuration + brandDuration;
    const fallbackDuration =
      reducedMotion ? 420 : READY_FALLBACK;

    let pageReady =
      document.readyState ===
      "complete";
    let fontsReady =
      !document.fonts;
    let nominalSequenceComplete = false;

    document.documentElement.dataset.preloaderState =
      "loading";

    const startReveal = () => {
      if (
        cancelled ||
        revealStartedRef.current
      ) {
        return;
      }

      revealStartedRef.current =
        true;
      setProgress(100);
      setPhase("reveal");

      timers.push(
        setTimeout(() => {
          if (!cancelled) {
            document.documentElement.dataset.preloaderState =
              "complete";
            window.dispatchEvent(
              new Event(
                PRELOADER_COMPLETE_EVENT,
              ),
            );
            setVisible(false);
          }
        }, revealDuration),
      );
    };

    const checkReady = () => {
      if (!nominalSequenceComplete) {
        return;
      }

      if (pageReady && fontsReady) {
        startReveal();
      }
    };

    const onPageReady = () => {
      pageReady = true;
      checkReady();
    };

    if (!pageReady) {
      window.addEventListener(
        "load",
        onPageReady,
        { once: true },
      );
    }

    if (document.fonts) {
      void document.fonts.ready
        .catch(() => undefined)
        .then(() => {
          fontsReady = true;
          checkReady();
        });
    }

    timers.push(
      setTimeout(() => {
        if (!cancelled) {
          setPhase("brand");
        }
      }, markDuration),
    );

    let progressFrame = 0;

    const updateProgress = () => {
      if (
        cancelled ||
        revealStartedRef.current
      ) {
        return;
      }

      const elapsed =
        performance.now() -
        startedAt;
      const brandElapsed =
        Math.max(
          0,
          elapsed - markDuration,
        );

      setProgress(
        Math.min(
          100,
          Math.floor(
            (brandElapsed /
              brandDuration) *
              100,
          ),
        ),
      );

      progressFrame =
        window.requestAnimationFrame(
          updateProgress,
        );
    };

    progressFrame =
      window.requestAnimationFrame(
        updateProgress,
      );

    timers.push(
      setTimeout(() => {
        nominalSequenceComplete = true;
        checkReady();
      }, nominalRevealAt),
    );

    timers.push(
      setTimeout(
        () => {
          nominalSequenceComplete = true;
          startReveal();
        },
        fallbackDuration,
      ),
    );

    checkReady();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(
        progressFrame,
      );
      timers.forEach((timer) => {
        clearTimeout(timer);
      });
      window.removeEventListener(
        "load",
        onPageReady,
      );
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      data-initial-preloader=""
      data-loader-phase={phase}
      className={styles.loader}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#c8c8c8",
      }}
    >
      <div className={styles.sheet} />

      <div className={styles.center}>
        <div className={styles.brandStage}>
          <div className={styles.frame}>
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className={styles.frameBorder}
            >
              <rect
                x="0.6"
                y="0.6"
                width="98.8"
                height="98.8"
                pathLength="1"
              />
            </svg>

            <span className={styles.frameCornerOne} />
            <span className={styles.frameCornerTwo} />
            <span className={styles.frameCornerThree} />
            <span className={styles.frameCornerFour} />

            <svg
              aria-hidden="true"
              viewBox="0 0 22 25"
              className={styles.symbol}
              fill="none"
            >
              <defs>
                <pattern
                  id="loader-scan-stripes"
                  width="1"
                  height="1.12"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="1" height="0.67" fill="#434343" />
                </pattern>
              </defs>

              <g className={styles.symbolOutline}>
                {MARK_PATHS.map((path) => (
                  <path key={`outline-${path}`} d={path} />
                ))}
              </g>

              <g className={styles.symbolScan}>
                {MARK_PATHS.map((path, index) => (
                  <path
                    key={`scan-${path}`}
                    d={path}
                    className={styles[`symbolScanPiece${index + 1}`]}
                  />
                ))}
              </g>

              <g className={styles.symbolSolid}>
                {MARK_PATHS.map((path) => (
                  <path key={`solid-${path}`} d={path} />
                ))}
              </g>
            </svg>
          </div>

          <p className={styles.tagline}>
            <span className={styles.tagWord}>Inspire</span>
            <span className={styles.tagDot}>·</span>
            <span className={styles.tagWord}>Innovate</span>
            <span className={styles.tagDot}>·</span>
            <span className={styles.tagWord}>Impact</span>
          </p>
        </div>
      </div>

      <LoaderCounter progress={progress} />
    </div>
  );
}
