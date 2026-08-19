"use client";

import {
  type RefObject,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

import {
  TransitionLink,
} from "@/components/motion/TransitionLink";

import {
  BlurTextReveal,
} from "@/components/typography/BlurTextReveal";

import {
  gsap,
  ScrollTrigger,
  SplitText,
  useGSAP,
} from "@/lib/gsap/client";

import {
  audioManager,
} from "@/runtime/audio/AudioManager";

import {
  canvasManager,
} from "@/runtime/canvas/CanvasManager";

import {
  HeroScene,
} from "./HeroScene";

const HERO_WORDS = [
  "something.",
  "intention.",
  "depth.",
  "impact.",
  "purpose.",
];

const COOKIE_KEY =
  "trionn-cookie-choice";

const COOKIE_CHANGE_EVENT =
  "trionn-cookie-change";

function subscribeCookieChoice(
  callback: () => void,
) {
  const handleChange =
    () => {
      callback();
    };

  window.addEventListener(
    "storage",
    handleChange,
  );

  window.addEventListener(
    COOKIE_CHANGE_EVENT,
    handleChange,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleChange,
    );

    window.removeEventListener(
      COOKIE_CHANGE_EVENT,
      handleChange,
    );
  };
}

function getCookieSnapshot() {
  return (
    window.localStorage.getItem(
      COOKIE_KEY,
    ) === null
  );
}

function getCookieServerSnapshot() {
  return false;
}

function PersistentGuideLines({
  lineRef,
}: {
  lineRef:
    RefObject<
      SVGSVGElement | null
    >;
}) {
  return (
    <svg
      ref={lineRef}
      aria-hidden="true"
      viewBox="-500 -350 2600 1750"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-0"
    >
      <g
        fill="none"
        strokeLinecap="round"
      >
        <ellipse
          cx="760"
          cy="1130"
          rx="1600"
          ry="545"
          transform="rotate(-13 760 1130)"
          stroke="#3f4958"
          strokeWidth="1.35"
          opacity="0.72"
          vectorEffect="non-scaling-stroke"
        />

        <ellipse
          cx="720"
          cy="1030"
          rx="1420"
          ry="700"
          transform="rotate(-24 720 1030)"
          stroke="#343e4c"
          strokeWidth="1.2"
          opacity="0.64"
          vectorEffect="non-scaling-stroke"
        />

        <ellipse
          cx="820"
          cy="1080"
          rx="1740"
          ry="840"
          transform="rotate(15 820 1080)"
          stroke="#303947"
          strokeWidth="1.1"
          opacity="0.56"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

function AnimatedCtaText({
  text,
}: {
  text: string;
}) {
  return (
    <span
      data-cta-label
      className="flex w-max whitespace-nowrap"
    >
      {text
        .split("")
        .map(
          (
            char,
            index,
          ) => (
            <span
              key={`${char}-${index}`}
              data-cta-char
              className="inline-block"
            >
              {char === " "
                ? "\u00a0"
                : char}
            </span>
          ),
        )}
    </span>
  );
}

function animateCtaIn(
  root:
    HTMLElement,
) {
  const label =
    root.querySelector<HTMLElement>(
      "[data-cta-label]",
    );

  const chars =
    Array.from(
      root.querySelectorAll<HTMLElement>(
        "[data-cta-char]",
      ),
    );

  const leftArrow =
    root.querySelector<HTMLElement>(
      "[data-cta-arrow-left]",
    );

  const rightArrow =
    root.querySelector<HTMLElement>(
      "[data-cta-arrow-right]",
    );

  if (
    !label ||
    chars.length === 0
  ) {
    return;
  }

  const shift =
    Math.max(
      24,
      root.clientWidth -
        label.scrollWidth -
        2,
    );

  gsap.killTweensOf(chars);

  gsap.to(chars, {
    x: shift,
    duration: 0.48,
    stagger: {
      each: 0.014,
      from: "start",
    },
    ease: "power3.out",
    overwrite: true,
  });

  if (leftArrow) {
    gsap.to(leftArrow, {
      x: 0,
      autoAlpha: 1,
      duration: 0.28,
      delay: 0.04,
      ease: "power2.out",
    });
  }

  if (rightArrow) {
    gsap.to(rightArrow, {
      x: 9,
      autoAlpha: 0,
      duration: 0.24,
      ease: "power2.out",
    });
  }
}

function animateCtaOut(
  root:
    HTMLElement,
) {
  const chars =
    Array.from(
      root.querySelectorAll<HTMLElement>(
        "[data-cta-char]",
      ),
    );

  const leftArrow =
    root.querySelector<HTMLElement>(
      "[data-cta-arrow-left]",
    );

  const rightArrow =
    root.querySelector<HTMLElement>(
      "[data-cta-arrow-right]",
    );

  gsap.killTweensOf(chars);

  gsap.to(chars, {
    x: 0,
    duration: 0.42,
    stagger: {
      each: 0.011,
      from: "end",
    },
    ease: "power3.out",
    overwrite: true,
  });

  if (leftArrow) {
    gsap.to(leftArrow, {
      x: -9,
      autoAlpha: 0,
      duration: 0.24,
      ease: "power2.out",
    });
  }

  if (rightArrow) {
    gsap.to(rightArrow, {
      x: 0,
      autoAlpha: 1,
      duration: 0.28,
      delay: 0.06,
      ease: "power2.out",
    });
  }
}

function smoothStep(
  value: number,
) {
  const t =
    gsap.utils.clamp(
      0,
      1,
      value,
    );

  return (
    t * t *
    (3 - 2 * t)
  );
}

function smootherStep(
  value: number,
) {
  const t =
    gsap.utils.clamp(
      0,
      1,
      value,
    );

  return (
    t * t * t *
    (t * (t * 6 - 15) + 10)
  );
}

export function HomeHero() {
  const sectionRef =
    useRef<HTMLElement>(null);
  const visualRef =
    useRef<HTMLDivElement>(null);
  const foregroundRef =
    useRef<HTMLDivElement>(null);
  const statsRef =
    useRef<HTMLDivElement>(null);
  const canvasRef =
    useRef<HTMLCanvasElement>(null);
  const linesRef =
    useRef<SVGSVGElement>(null);
  const wordsRef =
    useRef<HTMLSpanElement>(null);

  const cookieVisible =
    useSyncExternalStore(
      subscribeCookieChoice,
      getCookieSnapshot,
      getCookieServerSnapshot,
    );

  const chooseCookies = (
    choice: "accept" | "decline",
  ) => {
    window.localStorage.setItem(
      COOKIE_KEY,
      choice,
    );

    window.dispatchEvent(
      new Event(
        COOKIE_CHANGE_EVENT,
      ),
    );
  };

  useGSAP(
    () => {
      const container =
        wordsRef.current;

      if (!container) {
        return;
      }

      const wordElements =
        Array.from(
          container.querySelectorAll<HTMLElement>(
            "[data-hero-word]",
          ),
        );

      if (
        wordElements.length < 2
      ) {
        return;
      }

      const splits =
        wordElements.map(
          (element) =>
            new SplitText(
              element,
              { type: "chars" },
            ),
        );

      gsap.set(wordElements, {
        autoAlpha: 0,
      });

      splits.forEach((split) => {
        gsap.set(split.chars, {
          autoAlpha: 0,
          filter: "blur(12px)",
          willChange: "filter, opacity",
        });
      });

      gsap.set(wordElements[0], {
        autoAlpha: 1,
      });

      gsap.set(splits[0].chars, {
        autoAlpha: 1,
        filter: "blur(0px)",
      });

      const timeline =
        gsap.timeline({
          repeat: -1,
          delay: 3.2,
        });

      for (
        let index = 0;
        index < wordElements.length;
        index += 1
      ) {
        const currentElement =
          wordElements[index];
        const currentSplit =
          splits[index];
        const nextIndex =
          (index + 1) %
          wordElements.length;
        const nextElement =
          wordElements[nextIndex];
        const nextSplit =
          splits[nextIndex];

        timeline
          .to({}, { duration: 2.25 })
          .to(currentSplit.chars, {
            autoAlpha: 0,
            filter: "blur(12px)",
            duration: 0.52,
            stagger: {
              each: 0.035,
              from: "random",
            },
            ease: "power2.in",
          })
          .set(nextElement, {
            autoAlpha: 1,
          }, "<")
          .fromTo(
            nextSplit.chars,
            {
              autoAlpha: 0,
              filter: "blur(12px)",
            },
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.72,
              stagger: {
                each: 0.05,
                from: "random",
              },
              ease: "power2.out",
            },
            "-=0.31",
          )
          .set(currentElement, {
            autoAlpha: 0,
          });
      }

      return () => {
        timeline.kill();
        splits.forEach((split) => {
          split.revert();
        });
      };
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    const section =
      sectionRef.current;
    const visual =
      visualRef.current;
    const foreground =
      foregroundRef.current;
    const stats =
      statsRef.current;
    const canvas =
      canvasRef.current;
    const persistentLines =
      linesRef.current;

    if (
      !section ||
      !visual ||
      !canvas
    ) {
      return;
    }

    const vibrateElements =
      Array.from(
        visual.querySelectorAll<HTMLElement>(
          "[data-hero-vibrate]",
        ),
      );

    const navElements =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-hero-nav-vibrate]",
        ),
      );

    vibrateElements.push(
      ...navElements,
    );

    let vibrationActive = false;

    const applyVibration = (
      amount: number,
      phase: number,
    ) => {
      if (amount > 0.001) {
        vibrationActive = true;

        const x =
          (
            Math.sin(phase) * 3.7 +
            Math.sin(phase * 2.17) * 0.9
          ) * amount;

        const y =
          (
            Math.cos(phase * 1.31) * 2.6 +
            Math.sin(phase * 1.73) * 0.55
          ) * amount;

        gsap.killTweensOf(
          vibrateElements,
        );

        gsap.set(vibrateElements, {
          x,
          y,
          force3D: true,
        });
        return;
      }

      if (!vibrationActive) {
        return;
      }

      vibrationActive = false;

      gsap.to(vibrateElements, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform",
      });
    };

    const scene =
      new HeroScene(
        canvas,
        {
          onHoverPanel: () => {
            audioManager.pluck({
              frequency: 520,
              strength: 0.035,
              duration: 0.08,
            });
          },
          onWeldSpark: () => {
            audioManager.pluck({
              frequency:
                980 +
                Math.random() * 220,
              strength: 0.06,
              duration: 0.07,
            });
          },
          onChargeStart: () => {
            void audioManager.startCharge();
          },
          onChargeProgress: (
            progress,
          ) => {
            audioManager.updateCharge(
              progress,
            );
          },
          onBlast: () => {
            audioManager.stopCharge();
            audioManager.playBlast();
          },
          onReturnStart: () => {
            audioManager.stopCharge();
          },
          onVibrate: (
            amount,
            phase,
          ) => {
            applyVibration(
              amount,
              phase,
            );
          },
        },
      );

    const unregister =
      canvasManager.register(
        scene,
        true,
      );

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          canvasManager.setActive(
            scene.id,
            entry.isIntersecting,
          );
        },
        {
          rootMargin: "20% 0px",
        },
      );

    observer.observe(section);

    const applyProgress = (
      rawProgress: number,
    ) => {
      const raw =
        gsap.utils.clamp(
          0,
          1,
          rawProgress,
        );

      /*
       * 0.00 → 0.19  blast-like explosion
       * 0.19 → 0.54  fully exploded through the main About statement
       * 0.54 → 0.78  slow, readable rejoin
       * 0.78 → 0.84  fully assembled hold
       * 0.84 → 0.92  fade into the stripe wipe
       */
      let sceneProgress = 0;

      if (raw <= 0.19) {
        sceneProgress =
          smoothStep(
            raw / 0.19,
          );
      } else if (raw <= 0.54) {
        sceneProgress = 1;
      } else if (raw <= 0.78) {
        const join =
          smootherStep(
            (raw - 0.54) /
              0.24,
          );

        sceneProgress =
          0.58 *
          (1 - join);
      } else {
        sceneProgress = 0;
      }

      scene.setScrollProgress(
        sceneProgress,
      );

      if (foreground) {
        const fade =
          gsap.utils.clamp(
            0,
            1,
            (raw - 0.035) /
              0.07,
          );

        gsap.set(foreground, {
          autoAlpha: 1 - fade,
        });
      }

      if (stats) {
        const statsFade =
          gsap.utils.clamp(
            0,
            1,
            (raw - 0.28) /
              0.13,
          );

        gsap.set(stats, {
          autoAlpha:
            1 - statsFade,
          y: -12 * statsFade,
        });
      }

      if (persistentLines) {
        const lineIn =
          gsap.utils.clamp(
            0,
            1,
            (raw - 0.045) /
              0.08,
          );

        const lineOut =
          gsap.utils.clamp(
            0,
            1,
            (raw - 0.31) /
              0.17,
          );

        gsap.set(
          persistentLines,
          {
            autoAlpha:
              lineIn *
              (1 - lineOut),
            x: -24 * raw,
            y: -10 * raw,
          },
        );
      }

      const canvasFade =
        gsap.utils.clamp(
          0,
          1,
          (raw - 0.84) /
            0.08,
        );

      gsap.set(canvas, {
        autoAlpha:
          1 - canvasFade,
      });
    };

    const trigger =
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          applyProgress(
            self.progress,
          );
        },
      });

    applyProgress(
      trigger.progress,
    );

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      const bounds =
        visual.getBoundingClientRect();

      const pixelX =
        event.clientX -
        bounds.left;
      const pixelY =
        event.clientY -
        bounds.top;

      const x =
        (pixelX /
          bounds.width) * 2 - 1;
      const y =
        -(
          (pixelY /
            bounds.height) * 2 - 1
        );

      scene.setPointer(
        x,
        y,
        pixelX,
        pixelY,
      );
    };

    const handlePointerLeave = () => {
      scene.resetPointer();
      audioManager.stopCharge();
    };

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      if (!event.isPrimary) {
        return;
      }

      void audioManager.unlock();
      scene.startHold();
    };

    const handlePointerUp = (
      event: PointerEvent,
    ) => {
      if (!event.isPrimary) {
        return;
      }

      scene.endHold();
      audioManager.stopCharge();
    };

    visual.addEventListener(
      "pointermove",
      handlePointerMove,
    );
    visual.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );
    visual.addEventListener(
      "pointerdown",
      handlePointerDown,
    );
    window.addEventListener(
      "pointerup",
      handlePointerUp,
    );
    window.addEventListener(
      "pointercancel",
      handlePointerUp,
    );

    return () => {
      observer.disconnect();
      trigger.kill();
      audioManager.stopCharge();

      gsap.killTweensOf(
        vibrateElements,
      );
      gsap.set(
        vibrateElements,
        { clearProps: "transform" },
      );

      visual.removeEventListener(
        "pointermove",
        handlePointerMove,
      );
      visual.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      visual.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
      window.removeEventListener(
        "pointerup",
        handlePointerUp,
      );
      window.removeEventListener(
        "pointercancel",
        handlePointerUp,
      );

      unregister();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[620svh] bg-[#090909] text-white"
    >
      <div
        ref={visualRef}
        className="sticky top-0 h-[100svh] select-none overflow-hidden bg-[#090909]"
      >
        <PersistentGuideLines
          lineRef={linesRef}
        />

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        />

        <div
          ref={foregroundRef}
          className="pointer-events-none absolute inset-0 z-10 mix-blend-difference"
        >
          <div className="absolute left-[2.1vw] top-[11.9vh] max-md:left-5 max-md:top-[13vh]">
            <h1
              data-hero-vibrate
              className="text-[clamp(3.95rem,5.1vw,5.55rem)] font-normal leading-[0.92] tracking-[-0.068em] text-[#c8c8c5]"
            >
              <span className="block">
                <BlurTextReveal
                  text="Designed to"
                  delay={1.2}
                  stagger={0.08}
                />
              </span>

              <span className="flex whitespace-nowrap">
                <BlurTextReveal
                  text="mean"
                  delay={1.32}
                  stagger={0.08}
                />

                <span aria-hidden="true">
                  &nbsp;
                </span>

                <span
                  ref={wordsRef}
                  className="relative inline-block min-w-[5.8em]"
                >
                  {HERO_WORDS.map(
                    (word, index) => (
                      <span
                        key={word}
                        data-hero-word
                        className={[
                          "absolute left-0 top-0",
                          index === 0
                            ? ""
                            : "opacity-0",
                        ].join(" ")}
                      >
                        {word}
                      </span>
                    ),
                  )}

                  <span className="invisible">
                    something.
                  </span>
                </span>
              </span>
            </h1>

            <div
              data-hero-vibrate
              className="pointer-events-auto mt-[34px] flex flex-col gap-[18px] sm:flex-row"
            >
              <TransitionLink
                href="/contact"
                onMouseEnter={(event) => {
                  animateCtaIn(
                    event.currentTarget,
                  );
                }}
                onMouseLeave={(event) => {
                  animateCtaOut(
                    event.currentTarget,
                  );
                }}
                className="relative flex h-[34px] w-[220px] items-start overflow-hidden border-b border-[#bebeba]/70 pt-[2px] font-mono text-[11px] font-normal uppercase tracking-[-0.025em] text-[#c9c9c5]"
              >
                <span
                  data-cta-arrow-left
                  className="absolute left-0 top-[2px] z-10 -translate-x-[9px] opacity-0"
                >
                  →
                </span>
                <AnimatedCtaText
                  text="Discuss your project"
                />
                <span
                  data-cta-arrow-right
                  className="absolute right-0 top-[2px]"
                >
                  →
                </span>
              </TransitionLink>

              <a
                href="https://calendly.com/hello-trionn/30min"
                target="_blank"
                rel="noreferrer"
                onMouseEnter={(event) => {
                  animateCtaIn(
                    event.currentTarget,
                  );
                }}
                onMouseLeave={(event) => {
                  animateCtaOut(
                    event.currentTarget,
                  );
                }}
                className="relative flex h-[34px] w-[220px] items-start overflow-hidden border-b border-[#bebeba]/70 pt-[2px] font-mono text-[11px] font-normal uppercase tracking-[-0.025em] text-[#c9c9c5]"
              >
                <span
                  data-cta-arrow-left
                  className="absolute left-0 top-[2px] z-10 -translate-x-[9px] opacity-0"
                >
                  →
                </span>
                <AnimatedCtaText
                  text="Book a 30-minute call"
                />
                <span
                  data-cta-arrow-right
                  className="absolute right-0 top-[2px]"
                >
                  →
                </span>
              </a>
            </div>
          </div>

          <div
            data-hero-vibrate
            className="absolute bottom-[22px] left-[2.1vw] max-md:left-5"
          >
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white/30 text-[7px]">
              ↓
            </div>
          </div>

          <div
            data-hero-vibrate
            className="absolute bottom-[27px] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-mono text-[12px] font-normal uppercase leading-[1.3] tracking-[-0.025em] text-[#ccccca]"
          >
            <p className="flex items-center justify-center gap-[7px]">
              <span>Hold to</span>
              <span className="text-[15px] leading-none text-[#ff5a19]">
                ✹
              </span>
              <span>Blast</span>
            </p>
            <p>
              Dare{" "}
              <span className="text-[#ffd126]">
                ϟ
              </span>{" "}
              to touch the lines.
            </p>
          </div>
        </div>

        <div
          ref={statsRef}
          data-hero-vibrate
          className="pointer-events-none absolute bottom-[6.8vh] right-[2.15vw] z-[12] hidden w-[210px] text-white md:block"
        >
          <div className="grid grid-cols-[72px_1fr] border border-white/[0.16]">
            <div className="flex min-h-[62px] flex-col items-center justify-center border-r border-white/[0.16]">
              <svg
                aria-hidden="true"
                viewBox="0 0 28 18"
                className="mb-[5px] h-[16px] w-[25px]"
                fill="none"
              >
                <ellipse
                  cx="14"
                  cy="9"
                  rx="11"
                  ry="7"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <ellipse
                  cx="14"
                  cy="9"
                  rx="5"
                  ry="7"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M3 9H25"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
              <span className="text-[7px] uppercase tracking-[0.05em]">
                Est. 2012
              </span>
            </div>
            <div className="flex min-h-[62px] items-center px-[11px] text-[8px] uppercase leading-[1.35] tracking-[0.04em]">
              <span>
                14+ years shaping
                <br />
                digital direction.
              </span>
            </div>
          </div>

          <p className="mt-[17px] text-[10px] leading-[1.35] text-white/75">
            Websites, AI products,
            brands, and systems built
            for clarity, scale and
            impact.
          </p>
        </div>

        {cookieVisible && (
          <div className="pointer-events-auto absolute bottom-[82px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-6 border border-white/[0.12] bg-[#111]/95 px-4 py-[11px] text-[7px] uppercase tracking-[0.025em] text-white/60 backdrop-blur-sm md:text-[8px]">
            <span className="whitespace-nowrap">
              We use cookies to enhance
              your experience.
            </span>
            <div className="flex items-center gap-[9px] text-white/85">
              <button
                type="button"
                onClick={() => {
                  chooseCookies(
                    "decline",
                  );
                }}
                className="uppercase transition-opacity hover:opacity-50"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => {
                  chooseCookies(
                    "accept",
                  );
                }}
                className="uppercase transition-opacity hover:opacity-50"
              >
                Accept
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
