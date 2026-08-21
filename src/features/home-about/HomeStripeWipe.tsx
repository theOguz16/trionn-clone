"use client";

import { useRef } from "react";

import {
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap/client";

import {
  canvasManager,
} from "@/runtime/canvas/CanvasManager";

const STRIPE_COUNT = 6;
const STRIPE_START = 0.015;
const STRIPE_STEP = 0.095;
const STRIPE_DURATION = 0.58;
const STRIPE_SEQUENCE_END =
  STRIPE_START +
  (STRIPE_COUNT - 1) * STRIPE_STEP +
  STRIPE_DURATION;

/*
 * The Stripe section starts overlapping the Hero while the model is still
 * returning. Keep the stripe surfaces transparent through that overlap so
 * the Hero can finish its 0.52 -> 0.78 rejoin and briefly hold assembled.
 * With the current section geometry, 0.39 maps to roughly Hero raw 0.80.
 */
const STRIPE_REVEAL_START = 0.39;
const HERO_PAUSE_AFTER_WIPE_START = 0.12;

const CAPTION_VIEWPORT_Y = 0.78;
const CAPTION_CLEARANCE = 22;
const LIGHT_SURFACE_EPSILON = 0.5;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smootherStep(value: number) {
  const t = clamp01(value);

  return (
    t *
    t *
    t *
    (t * (t * 6 - 15) + 10)
  );
}

function setTheme(
  theme: "dark" | "light",
) {
  document.documentElement.dataset.pageTheme = theme;
}

function getStripeProgress(
  progress: number,
  orderIndex: number,
) {
  const start =
    STRIPE_START +
    orderIndex * STRIPE_STEP;

  return smootherStep(
    (progress - start) /
      STRIPE_DURATION,
  );
}

export function HomeStripeWipe() {
  const sectionRef =
    useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const stripes = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-stripe]",
        ),
      );

      const caption =
        section.querySelector<HTMLElement>(
          "[data-outcome]",
        );

      const aboutSection =
        section.previousElementSibling instanceof HTMLElement
          ? section.previousElementSibling
          : null;
      const heroSection =
        aboutSection?.previousElementSibling instanceof HTMLElement
          ? aboutSection.previousElementSibling
          : null;
      const heroCanvas =
        heroSection?.querySelector<HTMLCanvasElement>("canvas") ?? null;

      if (
        stripes.length !==
        STRIPE_COUNT
      ) {
        return;
      }

      stripes.forEach((stripe) => {
        stripe.style.transform =
          "translate3d(0, 102%, 0)";
      });

      if (caption) {
        caption.style.opacity = "0";
        caption.style.transform =
          "translate3d(-50%, 9px, 0)";
      }

      let heroPaused = false;

      let currentTheme:
        | "dark"
        | "light" = "dark";

      const setHeroPaused = (
        paused: boolean,
      ) => {
        if (
          heroPaused === paused
        ) {
          return;
        }

        heroPaused = paused;

        canvasManager.setActive(
          "home-hero",
          !paused,
        );
      };

      const changeTheme = (
        theme:
          | "dark"
          | "light",
      ) => {
        if (
          currentTheme === theme
        ) {
          return;
        }

        currentTheme = theme;
        setTheme(theme);
      };

      const keepHeroVisibleBehindWipe = (
        visible: boolean,
      ) => {
        if (!heroCanvas) {
          return;
        }

        heroCanvas.style.setProperty(
          "opacity",
          visible ? "1" : "0",
          "important",
        );
        heroCanvas.style.setProperty(
          "visibility",
          visible ? "visible" : "hidden",
          "important",
        );
      };

      const update = (
        rawProgress: number,
      ) => {
        const progress = clamp01(rawProgress);
        const wipeProgress = clamp01(
          (progress - STRIPE_REVEAL_START) /
            (1 - STRIPE_REVEAL_START),
        );
        const visualProgress =
          wipeProgress * STRIPE_SEQUENCE_END;

        /*
         * Do not freeze the Hero during its rejoin. The previous section-based
         * 0.10 threshold paused the renderer around Hero raw 0.69, leaving the
         * machine visibly exploded underneath the incoming stripes.
         */
        setHeroPaused(
          wipeProgress > HERO_PAUSE_AFTER_WIPE_START,
        );

        const yPercents =
          new Array<number>(
            STRIPE_COUNT,
          ).fill(102);

        for (
          let orderIndex = 0;
          orderIndex <
          STRIPE_COUNT;
          orderIndex += 1
        ) {
          const stripeIndex =
            STRIPE_COUNT -
            1 -
            orderIndex;

          const localProgress =
            getStripeProgress(
              visualProgress,
              orderIndex,
            );

          const yPercent =
            102 *
            (1 - localProgress);

          yPercents[stripeIndex] =
            yPercent;

          stripes[
            stripeIndex
          ].style.transform =
            `translate3d(0, ${yPercent}%, 0)`;
        }

        if (caption) {
          const stripeHeight =
            1 / STRIPE_COUNT;

          const captionStripeIndex =
            Math.min(
              STRIPE_COUNT - 1,
              Math.floor(
                CAPTION_VIEWPORT_Y /
                  stripeHeight,
              ),
            );

          const stripeTop =
            captionStripeIndex *
            stripeHeight;

          const localCaptionPercent =
            ((
              CAPTION_VIEWPORT_Y -
              stripeTop
            ) /
              stripeHeight) *
            100;

          const movingSurfaceTop =
            yPercents[
              captionStripeIndex
            ];

          const darkClearance =
            clamp01(
              (
                movingSurfaceTop -
                localCaptionPercent
              ) /
                CAPTION_CLEARANCE,
            );

          const enter = smootherStep(
            (wipeProgress - 0.09) /
              0.15,
          );

          const phaseLeave =
            1 -
            smootherStep(
              (wipeProgress - 0.45) /
                0.18,
            );

          const opacity =
            enter *
            phaseLeave *
            darkClearance;

          const y =
            9 * (1 - enter) -
            5 * (1 - phaseLeave);

          caption.style.opacity =
            `${opacity}`;

          caption.style.transform =
            `translate3d(-50%, ${y}px, 0)`;
        }

        const lightSurfaceReady =
          yPercents.every(
            (yPercent) =>
              yPercent <=
              LIGHT_SURFACE_EPSILON,
          );

        /*
         * Keep the fully assembled model opaque behind the moving stripes.
         * The stripes physically occlude it; only retire the canvas after the
         * light surface has genuinely covered the viewport.
         */
        keepHeroVisibleBehindWipe(
          !lightSurfaceReady,
        );

        changeTheme(
          lightSurfaceReady
            ? "light"
            : "dark",
        );
      };

      const trigger =
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,

          onUpdate: (self) => {
            update(self.progress);
          },

          onEnter: (self) => {
            update(self.progress);
          },

          onEnterBack: (self) => {
            update(self.progress);
          },

          onLeave: () => {
            update(1);
            setHeroPaused(true);
            changeTheme("light");
          },

          onLeaveBack: () => {
            update(0);
            setHeroPaused(false);
            changeTheme("dark");
          },
        });

      update(trigger.progress);

      return () => {
        trigger.kill();

        if (heroCanvas) {
          heroCanvas.style.removeProperty("opacity");
          heroCanvas.style.removeProperty("visibility");
        }
      };
    },
    {
      scope: sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      className="
        pointer-events-none
        relative
        z-[45]
        -mt-[224svh]
        h-[308svh]
        bg-transparent
      "
    >
      <div
        className="
          sticky
          top-0
          h-[100svh]
          overflow-hidden
          bg-transparent
        "
      >
        {Array.from({
          length: STRIPE_COUNT,
        }).map((_, index) => {
          const top =
            (index /
              STRIPE_COUNT) *
            100;

          const height =
            100 /
            STRIPE_COUNT;

          return (
            <div
              key={index}
              className="
                absolute
                left-0
                w-full
                overflow-hidden
                bg-transparent
                [contain:strict]
              "
              style={{
                top: `${top}%`,
                height:
                  `calc(${height}% + 2px)`,
              }}
            >
              <div
                data-stripe
                className="
                  absolute
                  inset-0
                  bg-[#dedddb]
                  will-change-transform
                  [backface-visibility:hidden]
                  [transform:translateZ(0)]
                "
              />
            </div>
          );
        })}

        <p
          data-outcome
          className="
            absolute
            left-1/2
            top-[78%]
            z-20
            whitespace-nowrap
            font-mono
            text-[10.5px]
            uppercase
            tracking-[-0.025em]
            text-[#d0d0cd]
            opacity-0
            will-change-[transform,opacity]
          "
        >
          ✦ From idea to outcome.
        </p>
      </div>
    </section>
  );
}
