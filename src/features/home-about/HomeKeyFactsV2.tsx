/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

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

const DIGITS = Array.from(
  { length: 10 },
  (_, index) => index,
);

type CardPose = {
  z: number;
  y: number;
  rotateX: number;
  rotateZ: number;
  opacity: number;
  blur: number;
};

/*
 * All three cards hang from the SAME top line.
 *
 * The reference gets its stagger from depth and inclination, not from
 * moving the cards to different vertical positions. Think of three cards
 * clipped to one clothesline: left resolves first, center follows, right
 * follows last, but their top edge always shares one horizontal anchor.
 */
const CARD_STARTS: CardPose[] = [
  {
    z: -150,
    y: 0,
    rotateX: -15,
    rotateZ: 0,
    opacity: 0.64,
    blur: 1.9,
  },
  {
    z: -305,
    y: 0,
    rotateX: -31,
    rotateZ: 0,
    opacity: 0.42,
    blur: 3.1,
  },
  {
    z: -470,
    y: 0,
    rotateX: -47,
    rotateZ: 0,
    opacity: 0.24,
    blur: 4.3,
  },
];

/*
 * The cards retain a little backward attitude after settling, while their
 * top edge remains pinned to the shared line.
 */
const CARD_ENDS: CardPose[] = [
  {
    z: 0,
    y: 0,
    rotateX: -3.8,
    rotateZ: 0,
    opacity: 1,
    blur: 0,
  },
  {
    z: 0,
    y: 0,
    rotateX: -2,
    rotateZ: 0,
    opacity: 1,
    blur: 0,
  },
  {
    z: 0,
    y: 0,
    rotateX: -4.4,
    rotateZ: 0,
    opacity: 1,
    blur: 0,
  },
];

const CARD_WINDOWS = [
  [0.14, 0.62],
  [0.2, 0.72],
  [0.26, 0.82],
] as const;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothStep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function smootherStep(value: number) {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function mapRange(
  value: number,
  start: number,
  end: number,
) {
  return clamp01(
    (value - start) /
      Math.max(0.0001, end - start),
  );
}

function lerp(
  from: number,
  to: number,
  progress: number,
) {
  return from + (to - from) * progress;
}

function setTheme(
  theme: "dark" | "light",
) {
  document.documentElement.dataset.pageTheme = theme;
}

function DigitReel({
  target,
  className = "",
}: {
  target: number;
  className?: string;
}) {
  return (
    <span
      data-counter-digit
      data-target={target}
      className={`relative inline-block h-[1em] w-[0.58em] overflow-hidden align-[-0.06em] ${className}`}
      aria-hidden="true"
    >
      <span
        data-digit-track
        className="absolute left-0 top-0 flex w-full flex-col items-center will-change-transform"
      >
        {DIGITS.map((digit) => (
          <span
            key={digit}
            className="flex h-[1em] w-full shrink-0 items-center justify-center"
          >
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

function Counter50() {
  return (
    <span
      data-counter
      className="inline-flex items-baseline text-[46px] font-normal leading-none tracking-[-0.07em]"
      aria-label="50 plus"
    >
      <DigitReel target={5} />
      <DigitReel target={0} />
      <sup className="ml-[3px] text-[15px] leading-none">+</sup>
    </span>
  );
}

function Counter15K() {
  return (
    <span
      data-counter
      className="inline-flex items-baseline text-[46px] font-normal leading-none tracking-[-0.07em]"
      aria-label="1.5K plus"
    >
      <DigitReel target={1} />
      <span className="mx-[1px]">.</span>
      <DigitReel target={5} />
      <span className="ml-[2px] tracking-[-0.04em]">K</span>
      <sup className="ml-[3px] text-[14px] leading-none">+</sup>
    </span>
  );
}

function Counter20() {
  return (
    <span
      data-counter
      className="inline-flex items-baseline text-[46px] font-normal leading-none tracking-[-0.07em]"
      aria-label="20 plus"
    >
      <DigitReel target={2} />
      <DigitReel target={0} />
      <sup className="ml-[3px] text-[15px] leading-none">+</sup>
    </span>
  );
}

export function HomeKeyFacts() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const header =
        section.querySelector<HTMLElement>(
          "[data-keyfacts-header]",
        );
      const cardShells = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-card-shell]",
        ),
      );
      const cardSurfaces = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-card-surface]",
        ),
      );
      const counters = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-counter]",
        ),
      );
      const digitTracks = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-counter-digit]",
        ),
      );
      const partners =
        section.querySelector<HTMLElement>(
          "[data-partners]",
        );

      if (
        !header ||
        cardShells.length !== 3 ||
        cardSurfaces.length !== 3 ||
        counters.length !== 3 ||
        !partners
      ) {
        return;
      }

      const updateHeader = (progress: number) => {
        const p = smootherStep(
          mapRange(progress, 0.02, 0.22),
        );

        header.style.opacity = `${p}`;
        header.style.transform =
          `translate3d(0, ${28 * (1 - p)}px, 0)`;
        header.style.filter =
          `blur(${4 * (1 - p)}px)`;
      };

      const updateCard = (
        index: number,
        progress: number,
      ) => {
        const shell = cardShells[index];
        const surface = cardSurfaces[index];
        const start = CARD_STARTS[index];
        const end = CARD_ENDS[index];
        const [windowStart, windowEnd] =
          CARD_WINDOWS[index];
        const rawLocal = mapRange(
          progress,
          windowStart,
          windowEnd,
        );

        /*
         * Depth resolves first. Angle resolves later. The top edge remains
         * pinned to one line for every card throughout the whole journey.
         */
        const depthProgress =
          smootherStep(rawLocal);
        const angleProgress =
          smoothStep(
            mapRange(rawLocal, 0.18, 1),
          );
        const settle = smoothStep(
          mapRange(rawLocal, 0.78, 1),
        );

        const z =
          lerp(start.z, end.z, depthProgress) +
          14 * settle * (1 - settle);
        const y = 0;
        const rotateX =
          lerp(
            start.rotateX,
            end.rotateX,
            angleProgress,
          );
        const rotateZ = 0;
        const opacity =
          lerp(
            start.opacity,
            end.opacity,
            depthProgress,
          );
        const blur =
          lerp(
            start.blur,
            end.blur,
            depthProgress,
          );

        shell.style.transformOrigin =
          "50% 0%";
        shell.style.transform = [
          `translate3d(0, ${y}px, ${z}px)`,
          `rotateX(${rotateX}deg)`,
          `rotateZ(${rotateZ}deg)`,
        ].join(" ");
        shell.style.opacity = `${opacity}`;
        surface.style.filter = `blur(${blur}px)`;

        const counterProgress =
          smootherStep(
            mapRange(rawLocal, 0.5, 0.94),
          );

        counters[index].style.opacity =
          `${0.35 + counterProgress * 0.65}`;

        const tracks = Array.from(
          counters[index].querySelectorAll<HTMLElement>(
            "[data-counter-digit]",
          ),
        );

        tracks.forEach((digit) => {
          const target = Number(
            digit.dataset.target ?? "0",
          );
          const track =
            digit.querySelector<HTMLElement>(
              "[data-digit-track]",
            );

          if (!track) {
            return;
          }

          const position =
            target * counterProgress;

          track.style.transform =
            `translate3d(0, ${-position}em, 0)`;
        });
      };

      const updatePartners = (progress: number) => {
        const p = smootherStep(
          mapRange(progress, 0.8, 0.97),
        );

        partners.style.opacity = `${p}`;
        partners.style.transform =
          `translate3d(0, ${24 * (1 - p)}px, 0)`;
        partners.style.filter =
          `blur(${2.5 * (1 - p)}px)`;
      };

      const update = (rawProgress: number) => {
        const progress = clamp01(rawProgress);

        updateHeader(progress);
        cardShells.forEach((_, index) => {
          updateCard(index, progress);
        });
        updatePartners(progress);
      };

      digitTracks.forEach((digit) => {
        const track =
          digit.querySelector<HTMLElement>(
            "[data-digit-track]",
          );
        if (track) {
          track.style.transform =
            "translate3d(0, 0, 0)";
        }
      });

      setTheme("light");
      update(0);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 94%",
        end: "bottom 68%",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          update(self.progress);
        },
        onEnter: (self) => {
          setTheme("light");
          update(self.progress);
        },
        onEnterBack: (self) => {
          setTheme("light");
          update(self.progress);
        },
        onLeave: () => {
          update(1);
          setTheme("light");
        },
        onLeaveBack: () => {
          update(0);
          setTheme("dark");
        },
      });

      update(trigger.progress);

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[50] -mt-[14svh] min-h-[132svh] bg-[#dedddb] text-[#414141]"
    >
      <div className="min-h-[132svh] overflow-hidden bg-[#dedddb] px-[2.1vw] pb-[8svh] pt-[7svh] max-md:px-5">
        <div
          data-keyfacts-header
          className="text-center opacity-0 will-change-[transform,opacity,filter]"
        >
          <h2 className="text-[clamp(4rem,5vw,5.75rem)] font-normal leading-[0.95] tracking-[-0.062em]">
            Key facts
          </h2>

          <p className="mx-auto mt-[19px] max-w-[205px] text-[13px] leading-[1.18] tracking-[-0.025em]">
            A snapshot of our
            <br />
            experience and impact.
          </p>
        </div>

        <div
          data-facts-grid
          className="mx-auto mt-[6.3svh] grid w-full max-w-[1040px] grid-cols-1 items-start gap-[18px] [perspective:1450px] [perspective-origin:50%_0%] md:grid-cols-3"
        >
          <div
            data-card-shell
            className="relative z-[3] origin-top opacity-0 will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d]"
          >
            <article
              data-card-surface
              className="relative h-[410px] overflow-hidden rounded-[6px] bg-[#414146] text-[#e7e6e3] will-change-[filter]"
            >
              <div
                className="absolute inset-x-0 bottom-0 top-[56px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1760719438551-6c5408b122e9?auto=format&fit=crop&q=82&w=900')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

              <p className="absolute left-[31px] top-[34px] z-10 text-[12px] uppercase tracking-[-0.025em]">
                Featured &amp; Awards
              </p>

              <div className="absolute bottom-[83px] left-[31px] z-10 flex w-[155px] flex-wrap items-center gap-x-[8px] gap-y-[4px]">
                {AWARD_LOGOS.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-[17px] max-w-[42px] object-contain brightness-0 invert opacity-80"
                  />
                ))}
              </div>

              <p className="absolute bottom-[32px] left-[31px] z-10 max-w-[172px] text-[13px] leading-[1.18] text-white/70">
                Featured on top design
                platforms worldwide.
              </p>

              <div className="absolute bottom-[25px] right-[27px] z-10">
                <Counter50 />
              </div>
            </article>
          </div>

          <div
            data-card-shell
            className="relative z-[2] origin-top opacity-0 will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d]"
          >
            <article
              data-card-surface
              className="relative h-[410px] overflow-hidden rounded-[6px] bg-[#e7e5e3] text-[#474747] will-change-[filter]"
            >
              <p className="absolute left-1/2 top-[34px] -translate-x-1/2 whitespace-nowrap text-[12px] uppercase tracking-[-0.025em]">
                Projects completed
              </p>

              <div className="absolute left-1/2 top-[108px] flex h-[170px] w-[170px] -translate-x-1/2 items-center justify-center rounded-full bg-[#f8f7f5]">
                <Counter15K />
              </div>

              <p className="absolute bottom-[32px] left-1/2 w-[225px] -translate-x-1/2 text-center text-[13px] leading-[1.22] text-black/58">
                90% of our clients seek our
                services for a second project.
              </p>
            </article>
          </div>

          <div
            data-card-shell
            className="relative z-[1] origin-top opacity-0 will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d]"
          >
            <article
              data-card-surface
              className="relative h-[410px] overflow-hidden rounded-[6px] bg-[#414146] text-[#e7e6e3] will-change-[filter]"
            >
              <div
                className="absolute left-[30px] right-[30px] top-[80px] h-[220px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1562569633-622303bafef5?auto=format&fit=crop&q=82&w=900')",
                }}
              />

              <p className="absolute right-[29px] top-[34px] z-10 text-[12px] uppercase tracking-[-0.025em]">
                Our team members
              </p>

              <p className="absolute bottom-[36px] left-[31px] z-10 max-w-[145px] text-[13px] leading-[1.15] text-white/60">
                Different skills.
                <br />
                One standard.
              </p>

              <div className="absolute bottom-[25px] right-[28px] z-10">
                <Counter20 />
              </div>
            </article>
          </div>
        </div>

        <div
          data-partners
          className="mx-auto mt-[8svh] max-w-[760px] opacity-0 will-change-[transform,opacity,filter]"
        >
          <p className="text-center text-[11px] uppercase tracking-[-0.02em]">
            Our business partners
          </p>

          <div className="mt-[27px] grid grid-cols-5 items-center divide-x divide-black/[0.08]">
            {PARTNER_LOGOS.map((src) => (
              <div
                key={src}
                className="flex h-[38px] items-center justify-center px-[18px]"
              >
                <img
                  src={src}
                  alt=""
                  className="max-h-[24px] max-w-full object-contain opacity-80"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
