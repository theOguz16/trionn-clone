/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

import {
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap/client";

const DIGITS = Array.from(
  { length: 10 },
  (_, index) => index,
);

type CardPose = {
  z: number;
  rotateX: number;
  opacity: number;
};

type HingeSwing = {
  forward: number;
  backward: number;
  settle: number;
};

const CARD_STARTS: CardPose[] = [
  {
    z: -104,
    rotateX: -16,
    opacity: 0.72,
  },
  {
    z: -262,
    rotateX: -33,
    opacity: 0.48,
  },
  {
    z: -430,
    rotateX: -50,
    opacity: 0.26,
  },
];

const CARD_WINDOWS = [
  [0.08, 0.7],
  [0.2, 0.84],
  [0.34, 0.96],
] as const;

const HINGE_SWINGS: HingeSwing[] = [
  {
    forward: 4.5,
    backward: -2.6,
    settle: 0.9,
  },
  {
    forward: 7,
    backward: -4.2,
    settle: 1.6,
  },
  {
    forward: 10.5,
    backward: -6.2,
    settle: 2.2,
  },
];

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

function segmentLerp(
  value: number,
  start: number,
  end: number,
  from: number,
  to: number,
) {
  return lerp(
    from,
    to,
    smootherStep(
      mapRange(value, start, end),
    ),
  );
}

function getHingeRotation(
  index: number,
  progress: number,
) {
  const start = CARD_STARTS[index].rotateX;
  const swing = HINGE_SWINGS[index];

  if (progress <= 0.62) {
    return segmentLerp(
      progress,
      0,
      0.62,
      start,
      0,
    );
  }

  if (progress <= 0.76) {
    return segmentLerp(
      progress,
      0.62,
      0.76,
      0,
      swing.forward,
    );
  }

  if (progress <= 0.87) {
    return segmentLerp(
      progress,
      0.76,
      0.87,
      swing.forward,
      swing.backward,
    );
  }

  if (progress <= 0.95) {
    return segmentLerp(
      progress,
      0.87,
      0.95,
      swing.backward,
      swing.settle,
    );
  }

  return segmentLerp(
    progress,
    0.95,
    1,
    swing.settle,
    0,
  );
}

function setTheme(
  theme: "dark" | "light",
) {
  document.documentElement.dataset.pageTheme = theme;
}

function DigitReel({
  target,
}: {
  target: number;
}) {
  return (
    <span
      data-counter-digit
      data-target={target}
      className="relative inline-block h-[1em] w-[0.58em] overflow-hidden align-[-0.06em]"
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

function PartnerWordmarks() {
  return (
    <div className="mt-[27px] grid grid-cols-5 items-center divide-x divide-black/[0.08] text-[#454545]">
      <div className="flex h-[46px] items-center justify-center px-5">
        <span className="text-[20px] font-semibold tracking-[-0.065em]">
          credible
        </span>
      </div>

      <div className="flex h-[46px] items-center justify-center px-5">
        <span className="text-[18px] font-semibold tracking-[-0.035em]">
          Yellowtail
        </span>
      </div>

      <div className="flex h-[46px] items-center justify-center gap-[8px] px-5">
        <span className="text-[23px] font-light leading-none">♮</span>
        <span className="text-[10px] font-medium uppercase leading-[1.05] tracking-[0.08em]">
          Luxury
          <br />
          Presence
        </span>
      </div>

      <div className="flex h-[46px] items-center justify-center px-5">
        <span className="-skew-x-[12deg] text-[20px] font-bold tracking-[-0.07em]">
          technis
        </span>
      </div>

      <div className="flex h-[46px] items-center justify-center gap-[7px] px-5">
        <span className="flex h-[19px] w-[19px] items-center justify-center rounded-full border-[5px] border-[#4a4a4a]" />
        <span className="text-[14px] font-semibold tracking-[0.03em]">
          OCKTO
        </span>
      </div>
    </div>
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
      const counters = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-counter]",
        ),
      );
      const partners =
        section.querySelector<HTMLElement>(
          "[data-partners]",
        );

      if (
        !header ||
        cardShells.length !== 3 ||
        counters.length !== 3 ||
        !partners
      ) {
        return;
      }

      const counterTracks = counters.map((counter) =>
        Array.from(
          counter.querySelectorAll<HTMLElement>(
            "[data-counter-digit]",
          ),
        )
          .map((digit) => {
            const track =
              digit.querySelector<HTMLElement>(
                "[data-digit-track]",
              );

            if (!track) {
              return null;
            }

            return {
              track,
              target: Number(
                digit.dataset.target ?? "0",
              ),
            };
          })
          .filter(
            (
              entry,
            ): entry is {
              track: HTMLElement;
              target: number;
            } => entry !== null,
          ),
      );

      const updateHeader = (progress: number) => {
        const p = smootherStep(
          mapRange(progress, 0.03, 0.22),
        );

        header.style.opacity = `${p}`;
        header.style.transform =
          `translate3d(0, ${20 * (1 - p)}px, 0)`;
      };

      const updateCard = (
        index: number,
        progress: number,
      ) => {
        const shell = cardShells[index];
        const start = CARD_STARTS[index];
        const [windowStart, windowEnd] =
          CARD_WINDOWS[index];
        const rawLocal = mapRange(
          progress,
          windowStart,
          windowEnd,
        );

        const depthProgress = smootherStep(rawLocal);
        const settleProgress = smootherStep(
          mapRange(rawLocal, 0.78, 1),
        );
        const z =
          lerp(start.z, 0, depthProgress) +
          8 * settleProgress * (1 - settleProgress);
        const rotateX = getHingeRotation(
          index,
          rawLocal,
        );
        const opacity = lerp(
          start.opacity,
          1,
          smootherStep(
            mapRange(rawLocal, 0, 0.78),
          ),
        );

        shell.style.transform =
          `translate3d(0, 0, ${z}px) rotateX(${rotateX}deg)`;
        shell.style.opacity = `${opacity}`;

        const counterProgress = smootherStep(
          mapRange(rawLocal, 0.52, 0.9),
        );

        counters[index].style.opacity = `${0.4 + counterProgress * 0.6}`;

        for (const entry of counterTracks[index]) {
          entry.track.style.transform =
            `translate3d(0, ${-(entry.target * counterProgress)}em, 0)`;
        }
      };

      const updatePartners = (progress: number) => {
        const p = smootherStep(
          mapRange(progress, 0.84, 0.985),
        );

        partners.style.opacity = `${p}`;
        partners.style.transform =
          `translate3d(0, ${16 * (1 - p)}px, 0)`;
      };

      const update = (rawProgress: number) => {
        const progress = clamp01(rawProgress);
        updateHeader(progress);

        for (let index = 0; index < cardShells.length; index += 1) {
          updateCard(index, progress);
        }

        updatePartners(progress);
      };

      let rafId = 0;
      let queuedProgress = 0;

      const scheduleUpdate = (progress: number) => {
        queuedProgress = progress;

        if (rafId !== 0) {
          return;
        }

        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          update(queuedProgress);
        });
      };

      setTheme("light");
      update(0);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 94%",
        end: "bottom 58%",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scheduleUpdate(self.progress);
        },
        onEnter: (self) => {
          setTheme("light");
          scheduleUpdate(self.progress);
        },
        onEnterBack: (self) => {
          setTheme("light");
          scheduleUpdate(self.progress);
        },
        onLeave: () => {
          scheduleUpdate(1);
          setTheme("light");
        },
        onLeaveBack: () => {
          if (rafId !== 0) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
          }
          update(0);
          setTheme("dark");
        },
      });

      update(trigger.progress);

      return () => {
        trigger.kill();

        if (rafId !== 0) {
          window.cancelAnimationFrame(rafId);
        }
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
          className="text-center opacity-0 will-change-[transform,opacity]"
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
          className="mx-auto mt-[6.3svh] grid w-full max-w-[1040px] grid-cols-1 items-start gap-[20px] [perspective:1240px] [perspective-origin:50%_0%] md:grid-cols-3"
        >
          <div
            data-card-shell
            className="relative z-[30] origin-top opacity-0 will-change-[transform,opacity] [backface-visibility:hidden] [contain:layout_paint] [transform-style:preserve-3d]"
          >
            <article className="relative h-[410px] overflow-hidden rounded-[6px] bg-[#414146] text-[#e7e6e3]">
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

              <div className="absolute bottom-[91px] left-[31px] z-10 flex h-[22px] w-[54px] items-center justify-center rounded-full border border-white/50 text-[12px] font-semibold tracking-[-0.03em] text-white">
                FWA
              </div>

              <p className="absolute bottom-[32px] left-[31px] z-10 max-w-[172px] text-[13px] leading-[1.18] text-white/70">
                Featured on top design
                <br />
                platforms worldwide.
              </p>

              <div className="absolute bottom-[25px] right-[27px] z-10">
                <Counter50 />
              </div>
            </article>
          </div>

          <div
            data-card-shell
            className="relative z-[10] origin-top opacity-0 will-change-[transform,opacity] [backface-visibility:hidden] [contain:layout_paint] [transform-style:preserve-3d]"
          >
            <article className="relative h-[410px] overflow-hidden rounded-[6px] bg-[#e7e5e3] text-[#474747]">
              <p className="absolute left-1/2 top-[34px] -translate-x-1/2 whitespace-nowrap text-[12px] uppercase tracking-[-0.025em]">
                Projects completed
              </p>

              <div className="absolute left-1/2 top-[108px] flex h-[170px] w-[170px] -translate-x-1/2 items-center justify-center rounded-full bg-[#f8f7f5]">
                <Counter15K />
              </div>

              <p className="absolute bottom-[32px] left-1/2 w-[225px] -translate-x-1/2 text-center text-[13px] leading-[1.22] text-black/58">
                90% of our clients seek our
                <br />
                services for a second project.
              </p>
            </article>
          </div>

          <div
            data-card-shell
            className="relative z-[20] origin-top opacity-0 will-change-[transform,opacity] [backface-visibility:hidden] [contain:layout_paint] [transform-style:preserve-3d]"
          >
            <article className="relative h-[410px] overflow-hidden rounded-[6px] bg-[#414146] text-[#e7e6e3]">
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
          className="mx-auto mt-[8svh] max-w-[760px] opacity-0 will-change-[transform,opacity]"
        >
          <p className="text-center text-[11px] uppercase tracking-[-0.02em]">
            Our business partners
          </p>

          <PartnerWordmarks />
        </div>
      </div>
    </section>
  );
}
