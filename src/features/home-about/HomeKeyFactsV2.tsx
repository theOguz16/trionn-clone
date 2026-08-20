/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

import {
  gsap,
  useGSAP,
} from "@/lib/gsap/client";

import {
  canvasManager,
} from "@/runtime/canvas/CanvasManager";

const DIGITS = Array.from(
  { length: 10 },
  (_, index) => index,
);

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
        className="absolute left-0 top-0 flex w-full flex-col items-center"
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
      className="inline-flex items-baseline text-[54px] font-normal leading-none tracking-[-0.07em]"
      aria-label="50 plus"
    >
      <DigitReel target={5} />
      <DigitReel target={0} />
      <sup className="ml-[3px] text-[17px] leading-none">+</sup>
    </span>
  );
}

function Counter15K() {
  return (
    <span
      data-counter
      className="inline-flex items-baseline text-[53px] font-normal leading-none tracking-[-0.07em]"
      aria-label="1.5K plus"
    >
      <DigitReel target={1} />
      <span className="mx-[1px]">.</span>
      <DigitReel target={5} />
      <span className="ml-[2px] tracking-[-0.04em]">K</span>
      <sup className="ml-[3px] text-[16px] leading-none">+</sup>
    </span>
  );
}

function Counter20() {
  return (
    <span
      data-counter
      className="inline-flex items-baseline text-[54px] font-normal leading-none tracking-[-0.07em]"
      aria-label="20 plus"
    >
      <DigitReel target={2} />
      <DigitReel target={0} />
      <sup className="ml-[3px] text-[17px] leading-none">+</sup>
    </span>
  );
}

function PartnerWordmarks() {
  return (
    <div className="mt-[26px] grid grid-cols-5 items-center divide-x divide-black/[0.08] text-[#444]">
      <div className="flex h-[44px] items-center justify-center px-[18px]">
        <span className="text-[22px] font-semibold tracking-[-0.065em]">
          credible
        </span>
      </div>

      <div className="flex h-[44px] items-center justify-center px-[18px]">
        <span className="text-[21px] font-semibold tracking-[-0.04em]">
          Yellowtail
        </span>
      </div>

      <div className="flex h-[44px] items-center justify-center gap-[7px] px-[18px]">
        <span className="text-[26px] font-light leading-none">♮</span>
        <span className="text-[12px] font-medium uppercase leading-[1.02] tracking-[0.07em]">
          Luxury
          <br />
          Presence
        </span>
      </div>

      <div className="flex h-[44px] items-center justify-center px-[18px]">
        <span className="-skew-x-[12deg] text-[23px] font-bold tracking-[-0.075em]">
          technis
        </span>
      </div>

      <div className="flex h-[44px] items-center justify-center gap-[7px] px-[18px]">
        <span className="h-[21px] w-[21px] rounded-full border-[5px] border-[#474747]" />
        <span className="text-[16px] font-semibold tracking-[0.025em]">
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
      const cards = Array.from(
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
        cards.length !== 3 ||
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

      const allTracks = counterTracks
        .flat()
        .map(({ track }) => track);

      gsap.set(header, {
        autoAlpha: 0,
        y: 18,
      });

      gsap.set(cards, {
        transformOrigin: "50% 0%",
        transformPerspective: 900,
        backfaceVisibility: "hidden",
        willChange: "transform, opacity",
      });

      gsap.set(cards[0], {
        rotationX: -78,
        autoAlpha: 0.38,
      });

      gsap.set(cards[1], {
        rotationX: -82,
        autoAlpha: 0.26,
      });

      gsap.set(cards[2], {
        rotationX: -85,
        autoAlpha: 0.18,
      });

      gsap.set(partners, {
        autoAlpha: 0,
        y: 14,
      });

      gsap.set(allTracks, {
        y: 0,
      });

      /*
       * One shared scrub clock for the whole Key Facts scene. This keeps the
       * three planes synchronized, avoids several competing ScrollTriggers,
       * and matches the reference frame more predictably.
       *
       * At the middle of the unfold the intended visual relationship is
       * roughly: left ~30deg, center ~45deg, right ~60–65deg. The left card
       * therefore gets a much longer travel than before; it no longer snaps
       * upright while the other two are still nearly horizontal.
       */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 96%",
          end: "bottom 60%",
          scrub: true,
          invalidateOnRefresh: true,

          onEnter: () => {
            setTheme("light");
            canvasManager.setActive("home-hero", false);
          },

          onEnterBack: () => {
            setTheme("light");
            canvasManager.setActive("home-hero", false);
            gsap.set(cards, {
              willChange: "transform, opacity",
            });
          },

          onLeave: () => {
            canvasManager.setActive("home-hero", false);
            gsap.set(cards, {
              rotationX: 0,
              autoAlpha: 1,
              willChange: "auto",
            });
          },

          onLeaveBack: () => {
            gsap.set(cards, {
              willChange: "auto",
            });
            setTheme("dark");
          },
        },
      });

      timeline.to(
        header,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.15,
          ease: "none",
        },
        0.02,
      );

      timeline.to(
        cards[0],
        {
          rotationX: 0,
          autoAlpha: 1,
          duration: 0.78,
          ease: "none",
        },
        0.08,
      );

      timeline.to(
        cards[1],
        {
          rotationX: 0,
          autoAlpha: 1,
          duration: 0.74,
          ease: "none",
        },
        0.14,
      );

      timeline.to(
        cards[2],
        {
          rotationX: 0,
          autoAlpha: 1,
          duration: 0.68,
          ease: "none",
        },
        0.28,
      );

      counterTracks.forEach((tracks, index) => {
        tracks.forEach(({ track, target }) => {
          timeline.to(
            track,
            {
              y: `${-target}em`,
              duration: 0.18,
              ease: "power2.out",
            },
            0.39 + index * 0.11,
          );
        });
      });

      timeline.to(
        partners,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.17,
          ease: "none",
        },
        0.78,
      );

      timeline.to({}, { duration: 0.06 }, 0.95);

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[50] -mt-[16svh] min-h-[116svh] bg-[#dedddb] text-[#414141]"
    >
      <div className="min-h-[116svh] overflow-hidden bg-[#dedddb] px-[2.1vw] pb-[7svh] pt-[5svh] max-md:px-5">
        <div
          data-keyfacts-header
          className="text-center"
        >
          <h2 className="text-[clamp(4.65rem,5.55vw,6.2rem)] font-normal leading-[0.94] tracking-[-0.064em]">
            Key facts
          </h2>

          <p className="mx-auto mt-[17px] max-w-[220px] text-[15px] leading-[1.15] tracking-[-0.027em]">
            A snapshot of our
            <br />
            experience and impact.
          </p>
        </div>

        <div
          data-facts-grid
          className="mx-auto mt-[4.6svh] grid w-full max-w-[1000px] grid-cols-1 items-start gap-[18px] md:grid-cols-3"
        >
          <div
            data-card-shell
            className="relative z-[30] origin-top"
          >
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#414146] text-[#e7e6e3]">
              <div
                className="absolute inset-x-0 bottom-0 top-[55px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1760719438551-6c5408b122e9?auto=format&fit=crop&q=82&w=900')",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />

              <p className="absolute left-[31px] top-[32px] z-10 text-[14px] uppercase tracking-[-0.03em]">
                Featured &amp; Awards
              </p>

              <div className="absolute bottom-[80px] left-[31px] z-10 flex h-[25px] items-center">
                <img
                  src="https://trionn.com/images/thefwa.svg"
                  alt="FWA"
                  className="max-h-[22px] w-[58px] object-contain brightness-0 invert"
                />
              </div>

              <p className="absolute bottom-[30px] left-[31px] z-10 max-w-[184px] text-[15px] leading-[1.15] text-white/70">
                Featured on top design
                <br />
                platforms worldwide.
              </p>

              <div className="absolute bottom-[20px] right-[27px] z-10">
                <Counter50 />
              </div>
            </article>
          </div>

          <div
            data-card-shell
            className="relative z-[20] origin-top"
          >
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#e7e5e3] text-[#474747]">
              <p className="absolute left-1/2 top-[32px] -translate-x-1/2 whitespace-nowrap text-[14px] uppercase tracking-[-0.03em]">
                Projects completed
              </p>

              <div className="absolute left-1/2 top-[102px] flex h-[170px] w-[170px] -translate-x-1/2 items-center justify-center rounded-full bg-[#f8f7f5]">
                <Counter15K />
              </div>

              <p className="absolute bottom-[29px] left-1/2 w-[246px] -translate-x-1/2 text-center text-[15px] leading-[1.18] text-black/58">
                90% of our clients seek our
                <br />
                services for a second project.
              </p>
            </article>
          </div>

          <div
            data-card-shell
            className="relative z-[10] origin-top"
          >
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#414146] text-[#e7e6e3]">
              <div
                className="absolute left-[30px] right-[30px] top-[77px] h-[216px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1562569633-622303bafef5?auto=format&fit=crop&q=82&w=900')",
                }}
              />

              <p className="absolute right-[29px] top-[32px] z-10 text-[14px] uppercase tracking-[-0.03em]">
                Our team members
              </p>

              <p className="absolute bottom-[33px] left-[31px] z-10 max-w-[158px] text-[15px] leading-[1.13] text-white/60">
                Different skills.
                <br />
                One standard.
              </p>

              <div className="absolute bottom-[20px] right-[28px] z-10">
                <Counter20 />
              </div>
            </article>
          </div>
        </div>

        <div
          data-partners
          className="mx-auto mt-[6.8svh] max-w-[740px]"
        >
          <p className="text-center text-[13px] uppercase tracking-[-0.022em]">
            Our business partners
          </p>

          <PartnerWordmarks />
        </div>
      </div>
    </section>
  );
}
