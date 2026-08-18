/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useRef,
} from "react";

import {
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap/client";

const AWARD_LOGOS = [
  "https://trionn.com/images/awwwards.svg",
  "https://trionn.com/images/ccda.svg",
  "https://trionn.com/images/thefwa.svg",
  "https://trionn.com/images/csswinner.svg",
  "https://trionn.com/images/adesignaward.svg",
  "https://trionn.com/images/gsap.svg",
];

const PARTNER_LOGOS = [
  "https://trionn.com/images/partner1.svg",
  "https://trionn.com/images/partner2.svg",
  "https://trionn.com/images/partner3.svg",
  "https://trionn.com/images/partner4.svg",
  "https://trionn.com/images/partner5.svg",
];

type CardPose = {
  z:
    number;

  rotateX:
    number;

  opacity:
    number;

  blur:
    number;
};

type CardJourney = {
  start:
    CardPose;

  middle:
    CardPose;

  end:
    CardPose;
};

const CARD_JOURNEYS:
  CardJourney[] = [
    /*
     * LEFT
     *
     * First and closest.
     * Also most upright.
     */
    {
      start: {
        z:
          -65,

        rotateX:
          -5,

        opacity:
          0.62,

        blur:
          2.2,
      },

      middle: {
        z:
          26,

        rotateX:
          -1.5,

        opacity:
          1,

        blur:
          0,
      },

      end: {
        z:
          0,

        rotateX:
          0,

        opacity:
          1,

        blur:
          0,
      },
    },

    /*
     * CENTER
     */
    {
      start: {
        z:
          -150,

        rotateX:
          -11,

        opacity:
          0.48,

        blur:
          3.2,
      },

      middle: {
        z:
          -38,

        rotateX:
          -4,

        opacity:
          0.9,

        blur:
          0.9,
      },

      end: {
        z:
          0,

        rotateX:
          0,

        opacity:
          1,

        blur:
          0,
      },
    },

    /*
     * RIGHT
     *
     * Furthest away.
     */
    {
      start: {
        z:
          -235,

        rotateX:
          -17,

        opacity:
          0.34,

        blur:
          4.2,
      },

      middle: {
        z:
          -92,

        rotateX:
          -7,

        opacity:
          0.76,

        blur:
          1.65,
      },

      end: {
        z:
          0,

        rotateX:
          0,

        opacity:
          1,

        blur:
          0,
      },
    },
  ];

const CARD_DELAYS = [
  0,
  0.13,
  0.24,
];

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

function lerp(
  from:
    number,

  to:
    number,

  amount:
    number,
) {
  return (
    from +
    (
      to -
      from
    ) *
      amount
  );
}

function interpolatePose(
  from:
    CardPose,

  to:
    CardPose,

  progress:
    number,
): CardPose {
  return {
    z:
      lerp(
        from.z,
        to.z,
        progress,
      ),

    rotateX:
      lerp(
        from.rotateX,
        to.rotateX,
        progress,
      ),

    opacity:
      lerp(
        from.opacity,
        to.opacity,
        progress,
      ),

    blur:
      lerp(
        from.blur,
        to.blur,
        progress,
      ),
  };
}

function getJourneyPose(
  journey:
    CardJourney,

  progress:
    number,
) {
  if (
    progress <=
    0.72
  ) {
    return interpolatePose(
      journey.start,
      journey.middle,
      smoothStep(
        progress /
          0.72,
      ),
    );
  }

  return interpolatePose(
    journey.middle,
    journey.end,
    smoothStep(
      (
        progress -
        0.72
      ) /
        0.28,
    ),
  );
}

function applyPose(
  element:
    HTMLElement,

  pose:
    CardPose,
) {
  /*
   * No X.
   * No Y.
   * No rotateY.
   * No rotateZ.
   * No explicit scale.
   *
   * Perspective itself produces
   * apparent size change.
   */
  element.style.transform =
    [
      `translate3d(
        0,
        0,
        ${pose.z}px
      )`,

      `rotateX(
        ${pose.rotateX}deg
      )`,
    ].join(
      " ",
    );

  element.style.opacity =
    `${pose.opacity}`;

  element.style.filter =
    `blur(${pose.blur}px)`;
}

function setTheme(
  theme:
    | "dark"
    | "light",
) {
  document.documentElement.dataset.pageTheme =
    theme;
}

export function HomeKeyFacts() {
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

      const header =
        section.querySelector<HTMLElement>(
          "[data-keyfacts-header]",
        );

      const grid =
        section.querySelector<HTMLElement>(
          "[data-facts-grid]",
        );

      const cards =
        Array.from(
          section.querySelectorAll<HTMLElement>(
            "[data-card-shell]",
          ),
        );

      const partners =
        section.querySelector<HTMLElement>(
          "[data-partners]",
        );

      if (
        !header ||
        !grid ||
        cards.length !==
        3 ||
        !partners
      ) {
        return;
      }

      header.style.opacity =
        "0";

      header.style.transform =
        "translate3d(0, 24px, 0)";

      header.style.filter =
        "blur(3px)";

      cards.forEach(
        (
          card,
          index,
        ) => {
          applyPose(
            card,
            CARD_JOURNEYS[
              index
            ].start,
          );
        },
      );

      partners.style.opacity =
        "0";

      partners.style.transform =
        "translate3d(0, 24px, 0)";

      const themeTrigger =
        ScrollTrigger.create({
          trigger:
            section,

          start:
            "top 98%",

          end:
            "bottom top",

          onEnter:
            () => {
              setTheme(
                "light",
              );
            },

          onEnterBack:
            () => {
              setTheme(
                "light",
              );
            },

          onLeaveBack:
            () => {
              setTheme(
                "dark",
              );
            },
        });

      const headerTrigger =
        ScrollTrigger.create({
          trigger:
            header,

          start:
            "top 98%",

          end:
            "top 72%",

          onUpdate:
            (
              self,
            ) => {
              const progress =
                smoothStep(
                  self.progress,
                );

              header.style.opacity =
                `${progress}`;

              header.style.transform =
                `translate3d(
                  0,
                  ${
                    24 *
                    (
                      1 -
                      progress
                    )
                  }px,
                  0
                )`;

              header.style.filter =
                `blur(${
                  3 *
                  (
                    1 -
                    progress
                  )
                }px)`;
            },

          onLeave:
            () => {
              header.style.opacity =
                "1";

              header.style.transform =
                "translate3d(0, 0, 0)";

              header.style.filter =
                "blur(0px)";
            },

          onLeaveBack:
            () => {
              header.style.opacity =
                "0";

              header.style.transform =
                "translate3d(0, 24px, 0)";

              header.style.filter =
                "blur(3px)";
            },
        });

      const updateCards =
        (
          progress:
            number,
        ) => {
          cards.forEach(
            (
              card,
              index,
            ) => {
              const delay =
                CARD_DELAYS[
                  index
                ];

              const localProgress =
                clamp01(
                  (
                    progress -
                    delay
                  ) /
                    (
                      1 -
                      delay
                    ),
                );

              applyPose(
                card,
                getJourneyPose(
                  CARD_JOURNEYS[
                    index
                  ],
                  localProgress,
                ),
              );
            },
          );
        };

      const cardsTrigger =
        ScrollTrigger.create({
          trigger:
            grid,

          start:
            "top 100%",

          end:
            "top 46%",

          invalidateOnRefresh:
            true,

          onUpdate:
            (
              self,
            ) => {
              updateCards(
                self.progress,
              );
            },

          onEnter:
            (
              self,
            ) => {
              updateCards(
                self.progress,
              );
            },

          onEnterBack:
            (
              self,
            ) => {
              updateCards(
                self.progress,
              );
            },

          onLeave:
            () => {
              updateCards(
                1,
              );
            },

          onLeaveBack:
            () => {
              updateCards(
                0,
              );
            },
        });

      const partnersTrigger =
        ScrollTrigger.create({
          trigger:
            partners,

          start:
            "top 96%",

          end:
            "top 72%",

          onUpdate:
            (
              self,
            ) => {
              const progress =
                smoothStep(
                  self.progress,
                );

              partners.style.opacity =
                `${progress}`;

              partners.style.transform =
                `translate3d(
                  0,
                  ${
                    24 *
                    (
                      1 -
                      progress
                    )
                  }px,
                  0
                )`;
            },
        });

      return () => {
        themeTrigger.kill();

        headerTrigger.kill();

        cardsTrigger.kill();

        partnersTrigger.kill();
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
        relative
        z-[50]
        -mt-[95svh]
        min-h-[120svh]
        bg-[#dedddb]
        text-[#414141]
      "
    >
      <div
        className="
          min-h-[120svh]
          overflow-hidden
          bg-[#dedddb]
          px-[2.1vw]
          pb-[8svh]
          pt-[6svh]
        "
      >
        {/* HEADER */}

        <div
          data-keyfacts-header
          className="
            text-center
            opacity-0
            will-change-[transform,opacity,filter]
          "
        >
          <h2
            className="
              text-[clamp(4.1rem,5vw,5.75rem)]
              font-normal
              leading-none
              tracking-[-0.061em]
            "
          >
            Key facts
          </h2>

          <p
            className="
              mx-auto
              mt-[18px]
              max-w-[190px]
              text-[13px]
              leading-[1.18]
              tracking-[-0.025em]
            "
          >
            A snapshot of our
            <br />
            experience and impact.
          </p>
        </div>

        {/* CARDS */}

        <div
          data-facts-grid
          className="
            mx-auto
            mt-[5svh]
            grid
            w-full
            max-w-[1000px]
            grid-cols-1
            items-end
            gap-[18px]
            [perspective:1500px]
            [perspective-origin:50%_100%]
            md:grid-cols-3
          "
        >
          {/* LEFT */}

          <div
            data-card-shell
            className="
              origin-bottom
              opacity-0
              will-change-[transform,opacity,filter]
              [transform-style:preserve-3d]
              [backface-visibility:hidden]
            "
          >
            <article
              className="
                relative
                h-[395px]
                overflow-hidden
                rounded-[6px]
                bg-[#414146]
                text-[#e7e6e3]
              "
            >
              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  top-[55px]
                  bg-cover
                  bg-center
                "
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1760719438551-6c5408b122e9?auto=format&fit=crop&q=82&w=900')",
                }}
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-b
                  from-transparent
                  via-transparent
                  to-black/25
                "
              />

              <p
                className="
                  absolute
                  left-[31px]
                  top-[34px]
                  z-10
                  text-[12px]
                  uppercase
                  tracking-[-0.025em]
                "
              >
                Featured &amp; Awards
              </p>

              <div
                className="
                  absolute
                  bottom-[77px]
                  left-[31px]
                  z-10
                  flex
                  w-[150px]
                  flex-wrap
                  items-center
                  gap-x-[8px]
                  gap-y-[4px]
                "
              >
                {AWARD_LOGOS.map(
                  (
                    src,
                  ) => (
                    <img
                      key={
                        src
                      }
                      src={
                        src
                      }
                      alt=""
                      className="
                        h-[17px]
                        max-w-[40px]
                        object-contain
                        brightness-0
                        invert
                        opacity-80
                      "
                    />
                  ),
                )}
              </div>

              <p
                className="
                  absolute
                  bottom-[31px]
                  left-[31px]
                  z-10
                  max-w-[165px]
                  text-[13px]
                  leading-[1.18]
                  text-white/70
                "
              >
                Featured on top design
                platforms worldwide.
              </p>

              <p
                className="
                  absolute
                  bottom-[24px]
                  right-[27px]
                  z-10
                  text-[42px]
                  font-light
                  tracking-[-0.06em]
                "
              >
                50

                <sup className="ml-[2px] text-[15px]">
                  +
                </sup>
              </p>
            </article>
          </div>

          {/* CENTER */}

          <div
            data-card-shell
            className="
              origin-bottom
              opacity-0
              will-change-[transform,opacity,filter]
              [transform-style:preserve-3d]
              [backface-visibility:hidden]
            "
          >
            <article
              className="
                relative
                h-[395px]
                overflow-hidden
                rounded-[6px]
                bg-[#e7e5e3]
                text-[#474747]
              "
            >
              <p
                className="
                  absolute
                  left-1/2
                  top-[34px]
                  -translate-x-1/2
                  whitespace-nowrap
                  text-[12px]
                  uppercase
                  tracking-[-0.025em]
                "
              >
                Projects completed
              </p>

              <div
                className="
                  absolute
                  left-1/2
                  top-[105px]
                  flex
                  h-[164px]
                  w-[164px]
                  -translate-x-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f8f7f5]
                "
              >
                <span
                  className="
                    text-[43px]
                    font-light
                    tracking-[-0.065em]
                  "
                >
                  1.5K

                  <sup className="ml-[2px] align-top text-[14px]">
                    +
                  </sup>
                </span>
              </div>

              <p
                className="
                  absolute
                  bottom-[31px]
                  left-1/2
                  w-[220px]
                  -translate-x-1/2
                  text-center
                  text-[13px]
                  leading-[1.22]
                  text-black/58
                "
              >
                90% of our clients seek our
                services for a second project.
              </p>
            </article>
          </div>

          {/* RIGHT */}

          <div
            data-card-shell
            className="
              origin-bottom
              opacity-0
              will-change-[transform,opacity,filter]
              [transform-style:preserve-3d]
              [backface-visibility:hidden]
            "
          >
            <article
              className="
                relative
                h-[395px]
                overflow-hidden
                rounded-[6px]
                bg-[#414146]
                text-[#e7e6e3]
              "
            >
              <div
                className="
                  absolute
                  left-[30px]
                  right-[30px]
                  top-[79px]
                  h-[212px]
                  bg-cover
                  bg-center
                "
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1562569633-622303bafef5?auto=format&fit=crop&q=82&w=900')",
                }}
              />

              <p
                className="
                  absolute
                  right-[29px]
                  top-[34px]
                  z-10
                  text-[12px]
                  uppercase
                  tracking-[-0.025em]
                "
              >
                Our team members
              </p>

              <p
                className="
                  absolute
                  bottom-[35px]
                  left-[31px]
                  z-10
                  max-w-[135px]
                  text-[13px]
                  leading-[1.15]
                  text-white/60
                "
              >
                Different skills.
                <br />
                One standard.
              </p>

              <p
                className="
                  absolute
                  bottom-[24px]
                  right-[28px]
                  z-10
                  text-[42px]
                  font-light
                  tracking-[-0.06em]
                "
              >
                20

                <sup className="ml-[2px] text-[15px]">
                  +
                </sup>
              </p>
            </article>
          </div>
        </div>

        {/* PARTNERS */}

        <div
          data-partners
          className="
            mx-auto
            mt-[7svh]
            max-w-[720px]
            opacity-0
            will-change-[transform,opacity]
          "
        >
          <p
            className="
              text-center
              text-[11px]
              uppercase
              tracking-[-0.02em]
            "
          >
            Our business partners
          </p>

          <div
            className="
              mt-[26px]
              grid
              grid-cols-5
              items-center
              divide-x
              divide-black/[0.08]
            "
          >
            {PARTNER_LOGOS.map(
              (
                src,
              ) => (
                <div
                  key={
                    src
                  }
                  className="
                    flex
                    h-[35px]
                    items-center
                    justify-center
                    px-[18px]
                  "
                >
                  <img
                    src={
                      src
                    }
                    alt=""
                    className="
                      max-h-[24px]
                      max-w-full
                      object-contain
                      opacity-80
                    "
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}