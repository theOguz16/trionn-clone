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
const STRIPE_START = 0.02;
const STRIPE_STEP = 0.105;
const STRIPE_DURATION = 0.48;

const CAPTION_VIEWPORT_Y = 0.78;
const CAPTION_CLEARANCE = 20;

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

      const update = (
        rawProgress: number,
      ) => {
        const progress = clamp01(rawProgress);

        setHeroPaused(progress > 0.12);

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
              progress,
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
            (progress - 0.095) /
              0.13,
          );

          const phaseLeave =
            1 -
            smootherStep(
              (progress - 0.42) /
                0.15,
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

        if (progress >= 0.94) {
          changeTheme("light");
        } else {
          changeTheme("dark");
        }
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
        -mt-[228svh]
        h-[312svh]
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
