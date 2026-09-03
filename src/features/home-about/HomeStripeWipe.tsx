"use client";

import { useRef } from "react";

import {
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap/client";

import {
  canvasManager,
} from "@/runtime/canvas/CanvasManager";

const STRIPE_COUNT = 5;
const STRIPE_START = 0;
const STRIPE_STEP = 0.25;
const STRIPE_DURATION = 1;
const STRIPE_SEQUENCE_END =
  STRIPE_START +
  (STRIPE_COUNT - 1) * STRIPE_STEP +
  STRIPE_DURATION;

/*
 * The Stripe section starts overlapping the Hero while the model is still
 * returning. Keep the stripe surfaces transparent through that overlap so
 * the Hero can finish its 0.52 -> 0.78 rejoin and briefly hold assembled.
 * The marquee settles before the lower stripe starts to open. The calibrated
 * reveal window keeps that handoff inside the same narrative beat.
 */
const STRIPE_REVEAL_START = 0.04;
const STRIPE_REVEAL_END = 0.865;
const TABLET_STRIPE_REVEAL_START = 0;
const TABLET_STRIPE_REVEAL_END = 0.82375;
const HERO_PAUSE_AFTER_WIPE_START = 0.18;
const LIGHT_SURFACE_EPSILON = 0.995;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
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

  return clamp01(
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
          "scale3d(1, 0, 1)";
      });

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

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
        currentTheme = theme;

        /*
         * Other downstream sections also own theme triggers. Re-apply this
         * transition's final decision after the shared ScrollTrigger tick so
         * a fast reverse jump cannot leave the header in the light state.
         */
        queueMicrotask(() => {
          if (
            currentTheme === theme
          ) {
            setTheme(theme);
          }
        });
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
        const usesTabletTimeline =
          window.innerWidth >= 768 &&
          window.innerWidth < 1024;
        const revealStart = usesTabletTimeline
          ? TABLET_STRIPE_REVEAL_START
          : STRIPE_REVEAL_START;
        const revealEnd = usesTabletTimeline
          ? TABLET_STRIPE_REVEAL_END
          : STRIPE_REVEAL_END;
        const wipeProgress = clamp01(
          (progress - revealStart) /
            (revealEnd - revealStart),
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

        const scaleValues =
          new Array<number>(
            STRIPE_COUNT,
          ).fill(0);

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

          const localProgress = reducedMotion
            ? clamp01(
                wipeProgress / 0.32,
              )
            : getStripeProgress(
                visualProgress,
                orderIndex,
              );

          scaleValues[stripeIndex] =
            localProgress;

          stripes[
            stripeIndex
          ].style.transform =
            `scale3d(1, ${localProgress}, 1)`;
        }

        const lightSurfaceReady =
          scaleValues.every(
            (scale) =>
              scale >=
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
          end: "bottom top",
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
      data-home-stripe-wipe
      className="
        pointer-events-none
        relative
        z-[45]
        bg-transparent
      "
    >
      <div
        className="
          sticky
          top-0
          flex
          flex-col
          h-[100svh]
          overflow-hidden
          bg-transparent
        "
      >
        {Array.from({
          length: STRIPE_COUNT,
        }).map((_, index) => (
          <div
            key={index}
            data-stripe
            className="
              h-full
              w-full
              flex-1
              origin-bottom
              bg-[#d2d2d2]
              will-change-transform
              [backface-visibility:hidden]
              [transform:translateZ(0)]
            "
          />
        ))}

      </div>
    </section>
  );
}
