"use client";

import {
  useEffect,
  useRef,
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

export function HomeHero() {
  const sectionRef =
    useRef<HTMLElement>(
      null,
    );

  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  const foregroundRef =
    useRef<HTMLDivElement>(
      null,
    );

  const canvasRef =
    useRef<HTMLCanvasElement>(
      null,
    );

  const phraseOneRef =
    useRef<HTMLSpanElement>(
      null,
    );

  const phraseTwoRef =
    useRef<HTMLSpanElement>(
      null,
    );

  // -------------------------
  // ROTATING HERO PHRASE
  // -------------------------

  useGSAP(
    () => {
      const first =
        phraseOneRef
          .current;

      const second =
        phraseTwoRef
          .current;

      if (
        !first ||
        !second
      ) {
        return;
      }

      gsap.set(
        first,
        {
          autoAlpha: 0,
          filter:
            "blur(12px)",
          yPercent: 10,
        },
      );

      gsap.set(
        second,
        {
          autoAlpha: 0,
          filter:
            "blur(12px)",
          yPercent: 15,
        },
      );

      const intro =
        gsap.to(
          first,
          {
            autoAlpha: 1,
            filter:
              "blur(0px)",
            yPercent: 0,

            duration: 0.8,

            delay: 1.35,

            ease:
              "power2.out",
          },
        );

      const loop =
        gsap.timeline(
          {
            repeat: -1,
            repeatDelay:
              0.5,

            delay:
              4.3,
          },
        );

      loop
        .to(
          first,
          {
            autoAlpha: 0,
            filter:
              "blur(12px)",
            yPercent: -12,
            duration: 0.55,
            ease:
              "power2.in",
          },
        )
        .to(
          second,
          {
            autoAlpha: 1,
            filter:
              "blur(0px)",
            yPercent: 0,
            duration: 0.65,
            ease:
              "power2.out",
          },
          "-=0.25",
        )
        .to(
          {},
          {
            duration: 2.5,
          },
        )
        .to(
          second,
          {
            autoAlpha: 0,
            filter:
              "blur(12px)",
            yPercent: -12,
            duration: 0.55,
            ease:
              "power2.in",
          },
        )
        .to(
          first,
          {
            autoAlpha: 1,
            filter:
              "blur(0px)",
            yPercent: 0,
            duration: 0.65,
            ease:
              "power2.out",
          },
          "-=0.25",
        )
        .to(
          {},
          {
            duration: 2.5,
          },
        );

      return () => {
        intro.kill();
        loop.kill();
      };
    },
    {
      scope:
        sectionRef,
    },
  );

  // -------------------------
  // HERO RUNTIME
  // -------------------------

  useEffect(() => {
    const section =
      sectionRef
        .current;

    const visual =
      visualRef
        .current;

    const foreground =
      foregroundRef
        .current;

    const canvas =
      canvasRef
        .current;

    if (
      !section ||
      !visual ||
      !canvas
    ) {
      return;
    }

    const vibrateElements =
      Array.from(
        visual
          .querySelectorAll<HTMLElement>(
            "[data-hero-vibrate]",
          ),
      );

    const globalHeader =
      document
        .querySelector<HTMLElement>(
          "header",
        );

    if (
      globalHeader
    ) {
      vibrateElements
        .push(
          globalHeader,
        );
    }

    let wasVibrating =
      false;

    const applyVibration =
      (
        amount: number,
        phase: number,
      ) => {
        if (
          amount >
          0.001
        ) {
          wasVibrating =
            true;

          const x =
            Math.sin(
              phase,
            ) *
            2.2 *
            amount;

          const y =
            Math.cos(
              phase *
                1.31,
            ) *
            1.6 *
            amount;

          for (
            const element of
            vibrateElements
          ) {
            element
              .style
              .transition =
              "none";

            element
              .style
              .transform =
              `translate(${x}px, ${y}px)`;
          }

          return;
        }

        if (
          !wasVibrating
        ) {
          return;
        }

        wasVibrating =
          false;

        for (
          const element of
          vibrateElements
        ) {
          element
            .style
            .transition =
            "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

          element
            .style
            .transform =
            "perspective(600px) translate(0px, 0px) rotateX(0deg)";
        }
      };

    const scene =
      new HeroScene(
        canvas,
        {
          onHoverPanel:
            () => {
              audioManager
                .pluck(
                  {
                    frequency:
                      520,

                    strength:
                      0.035,

                    duration:
                      0.08,
                  },
                );
            },

          onWeldSpark:
            () => {
              audioManager
                .pluck(
                  {
                    frequency:
                      900 +
                      Math.random() *
                        180,

                    strength:
                      0.045,

                    duration:
                      0.055,
                  },
                );
            },

          onChargeStart:
            () => {
              void audioManager
                .startCharge();
            },

          onChargeProgress:
            (
              progress,
            ) => {
              audioManager
                .updateCharge(
                  progress,
                );
            },

          onBlast:
            () => {
              audioManager
                .stopCharge();

              audioManager
                .playBlast();
            },

          onReturnStart:
            () => {
              audioManager
                .stopCharge();
            },

          onVibrate:
            (
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
      canvasManager
        .register(
          scene,
          true,
        );

    // -------------------------
    // VISIBILITY
    // -------------------------

    const observer =
      new IntersectionObserver(
        (
          [
            entry,
          ],
        ) => {
          canvasManager
            .setActive(
              scene.id,
              entry
                .isIntersecting,
            );
        },

        {
          rootMargin:
            "20% 0px",
        },
      );

    observer.observe(
      section,
    );

    // -------------------------
    // SCROLL BRIDGE
    // -------------------------

    const scrollTrigger =
      ScrollTrigger
        .create(
          {
            trigger:
              section,

            start:
              "top top",

            end:
              "bottom bottom",

            onUpdate:
              (
                self,
              ) => {
                scene
                  .setScrollProgress(
                    self.progress,
                  );

                if (
                  foreground
                ) {
                  const fade =
                    gsap.utils
                      .clamp(
                        0,
                        1,
                        (
                          self
                            .progress -
                          0.04
                        ) /
                          0.2,
                      );

                  gsap.set(
                    foreground,
                    {
                      autoAlpha:
                        1 -
                        fade,
                    },
                  );
                }
              },
          },
        );

    scene.setScrollProgress(
      scrollTrigger
        .progress,
    );

    // -------------------------
    // POINTER MOVE
    // -------------------------

    const handlePointerMove =
      (
        event:
          PointerEvent,
      ) => {
        const bounds =
          visual
            .getBoundingClientRect();

        const pixelX =
          event.clientX -
          bounds.left;

        const pixelY =
          event.clientY -
          bounds.top;

        const x =
          (
            pixelX /
            bounds.width
          ) *
            2 -
          1;

        const y =
          -(
            (
              pixelY /
              bounds.height
            ) *
              2 -
            1
          );

        scene.setPointer(
          x,
          y,
          pixelX,
          pixelY,
        );
      };

    // -------------------------
    // LEAVE
    // -------------------------

    const handlePointerLeave =
      () => {
        scene
          .resetPointer();

        audioManager
          .stopCharge();
      };

    // -------------------------
    // DOWN
    // -------------------------

    const handlePointerDown =
      (
        event:
          PointerEvent,
      ) => {
        if (
          !event.isPrimary
        ) {
          return;
        }

        void audioManager
          .unlock();

        scene
          .startHold();
      };

    // -------------------------
    // UP
    // -------------------------

    const handlePointerUp =
      (
        event:
          PointerEvent,
      ) => {
        if (
          !event.isPrimary
        ) {
          return;
        }

        scene.endHold();

        audioManager
          .stopCharge();
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

    // -------------------------
    // CLEANUP
    // -------------------------

    return () => {
      observer.disconnect();

      scrollTrigger.kill();

      audioManager
        .stopCharge();

      applyVibration(
        0,
        0,
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
      className="relative h-[175svh] bg-[#090909] text-white md:h-[190svh]"
    >
      <div
        ref={visualRef}
        className="sticky top-0 h-[100svh] select-none overflow-hidden"
      >
        {/* WEBGL */}

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        />

        {/* DOM FOREGROUND */}

        <div
          ref={foregroundRef}
          className="pointer-events-none absolute inset-0 z-10 mix-blend-difference"
        >
          {/* HEADLINE */}

          <div className="absolute left-5 top-[13vh] md:left-10 md:top-[12vh]">
            <h1
              data-hero-vibrate
              className="max-w-[11ch] text-[clamp(3rem,5.3vw,6rem)] font-medium leading-[0.93] tracking-[-0.065em]"
            >
              <span className="block">
                <BlurTextReveal
                  text="Designed to"
                  delay={1.2}
                  stagger={0.08}
                />
              </span>

              <span className="relative block h-[0.98em] whitespace-nowrap">
                <span
                  ref={phraseOneRef}
                  className="absolute left-0 top-0"
                >
                  mean something.
                </span>

                <span
                  ref={phraseTwoRef}
                  className="absolute left-0 top-0 opacity-0"
                >
                  mean intention.
                </span>
              </span>
            </h1>

            <TransitionLink
              data-hero-vibrate
              href="/#contact"
              className="pointer-events-auto mt-7 inline-flex min-w-36 items-center justify-between border-b border-white/40 pb-2 text-[9px] font-medium uppercase tracking-[0.12em] md:text-[10px]"
            >
              <span>
                Start a project
              </span>

              <span>
                →
              </span>
            </TransitionLink>
          </div>

          {/* EST / STAT */}

          <div
            data-hero-vibrate
            className="absolute right-5 top-[54%] hidden w-[230px] -translate-y-1/2 md:right-10 md:block"
          >
            <div className="flex items-start gap-3 border-t border-white/30 pt-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/40 text-[9px]">
                ◎
              </div>

              <div className="text-[9px] uppercase leading-[1.35] tracking-[0.08em]">
                <p>
                  Est. 2012
                </p>

                <p>
                  14+ years shaping
                  <br />
                  digital direction.
                </p>
              </div>
            </div>

            <p className="mt-5 text-[9px] leading-[1.45] text-white/70">
              Websites, AI products,
              brands, and systems built
              for clarity, scale and
              impact.
            </p>
          </div>

          {/* BOTTOM LEFT */}

          <div
            data-hero-vibrate
            className="absolute bottom-6 left-5 md:bottom-8 md:left-10"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[8px]">
              ↓
            </div>
          </div>

          {/* INTERACTION HINT */}

          <div
            data-hero-vibrate
            className="absolute bottom-6 right-5 text-right text-[8px] font-medium uppercase leading-[1.5] tracking-[0.08em] md:bottom-8 md:right-10 md:text-[9px]"
          >
            <p>
              Hold to 💥 blast
            </p>

            <p>
              Dare ⚡ to touch the lines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}