"use client";

import {
  useRef,
} from "react";

import {
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap/client";

import {
  canvasManager,
} from "@/runtime/canvas/CanvasManager";

const STRIPE_COUNT =
  6;

const STRIPE_START =
  0.03;

const STRIPE_STEP =
  0.105;

const STRIPE_DURATION =
  0.445;

function clamp01(
  value:
    number,
) {
  return Math.min(
    1,
    Math.max(
      0,
      value,
    ),
  );
}

function smoothStep(
  value:
    number,
) {
  const t =
    clamp01(
      value,
    );

  return (
    t *
    t *
    (
      3 -
      2 * t
    )
  );
}

function setTheme(
  theme:
    | "dark"
    | "light",
) {
  document.documentElement.dataset.pageTheme =
    theme;
}

export function HomeStripeWipe() {
  const sectionRef =
    useRef<HTMLElement>(
      null,
    );

  useGSAP(
    () => {
      const section =
        sectionRef.current;

      if (!section) {
        return;
      }

      const stripes =
        Array.from(
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

      stripes.forEach(
        (
          stripe,
        ) => {
          stripe.style.transform =
            "translate3d(0, 102%, 0)";
        },
      );

      if (caption) {
        caption.style.opacity =
          "0";

        caption.style.transform =
          "translate3d(-50%, 10px, 0)";
      }

      let heroPaused =
        false;

      let currentTheme:
        | "dark"
        | "light" =
        "dark";

      const setHeroPaused =
        (
          paused:
            boolean,
        ) => {
          if (
            heroPaused ===
            paused
          ) {
            return;
          }

          heroPaused =
            paused;

          canvasManager.setActive(
            "home-hero",
            !paused,
          );
        };

      const changeTheme =
        (
          theme:
            | "dark"
            | "light",
        ) => {
          if (
            currentTheme ===
            theme
          ) {
            return;
          }

          currentTheme =
            theme;

          setTheme(
            theme,
          );
        };

      const update =
        (
          rawProgress:
            number,
        ) => {
          const progress =
            clamp01(
              rawProgress,
            );

          /*
           * Keep model alive behind
           * nearly the entire wipe.
           */
          setHeroPaused(
            progress >
              0.93,
          );

          /*
           * Bottom → top.
           *
           * New timing:
           *
           * first starts .03
           * every next one +.105
           * duration .445
           *
           * final:
           *
           * .03 + 5*.105 + .445 = 1.0
           *
           * Deliberate.
           */
          for (
            let orderIndex =
              0;

            orderIndex <
            STRIPE_COUNT;

            orderIndex +=
              1
          ) {
            const stripeIndex =
              STRIPE_COUNT -
              1 -
              orderIndex;

            const start =
              STRIPE_START +
              orderIndex *
                STRIPE_STEP;

            const localProgress =
              smoothStep(
                (
                  progress -
                  start
                ) /
                  STRIPE_DURATION,
              );

            const y =
              102 *
              (
                1 -
                localProgress
              );

            stripes[
              stripeIndex
            ].style.transform =
              `translate3d(
                0,
                ${y}%,
                0
              )`;
          }

          if (caption) {
            const enter =
              smoothStep(
                (
                  progress -
                  0.24
                ) /
                  0.13,
              );

            const leave =
              smoothStep(
                (
                  progress -
                  0.79
                ) /
                  0.12,
              );

            const opacity =
              enter *
              (
                1 -
                leave
              );

            const y =
              10 *
                (
                  1 -
                  enter
                ) -
              7 *
                leave;

            caption.style.opacity =
              `${opacity}`;

            caption.style.transform =
              `translate3d(
                -50%,
                ${y}px,
                0
              )`;
          }

          if (
            progress >=
            0.94
          ) {
            changeTheme(
              "light",
            );
          } else {
            changeTheme(
              "dark",
            );
          }
        };

      const trigger =
        ScrollTrigger.create({
          trigger:
            section,

          start:
            "top top",

          end:
            "bottom bottom",

          invalidateOnRefresh:
            true,

          onUpdate:
            (
              self,
            ) => {
              update(
                self.progress,
              );
            },

          onEnter:
            (
              self,
            ) => {
              update(
                self.progress,
              );
            },

          onEnterBack:
            (
              self,
            ) => {
              update(
                self.progress,
              );
            },

          onLeave:
            () => {
              update(
                1,
              );

              setHeroPaused(
                true,
              );

              changeTheme(
                "light",
              );
            },

          onLeaveBack:
            () => {
              update(
                0,
              );

              setHeroPaused(
                false,
              );

              changeTheme(
                "dark",
              );
            },
        });

      update(
        trigger.progress,
      );

      return () => {
        trigger.kill();

        canvasManager.setActive(
          "home-hero",
          true,
        );
      };
    },

    {
      scope:
        sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      className="
        pointer-events-none
        relative
        z-[45]
        -mt-[155svh]
        h-[270svh]
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
          length:
            STRIPE_COUNT,
        }).map(
          (
            _,
            index,
          ) => {
            const top =
              (
                index /
                STRIPE_COUNT
              ) *
              100;

            const height =
              100 /
              STRIPE_COUNT;

            return (
              <div
                key={
                  index
                }
                className="
                  absolute
                  left-0
                  w-full
                  overflow-hidden
                  bg-transparent
                  [contain:strict]
                "
                style={{
                  top:
                    `${top}%`,

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
          },
        )}

        <p
          data-outcome
          className="
            absolute
            left-1/2
            top-[73%]
            z-20
            whitespace-nowrap
            font-mono
            text-[11px]
            uppercase
            tracking-[-0.025em]
            text-[#c9c9c6]
            opacity-0
          "
        >
          ✦ From idea to outcome.
        </p>
      </div>
    </section>
  );
}