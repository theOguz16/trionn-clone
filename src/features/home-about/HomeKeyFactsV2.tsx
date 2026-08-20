/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

import {
  gsap,
  ScrollTrigger,
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
      className="inline-flex items-baseline text-[50px] font-normal leading-none tracking-[-0.07em]"
      aria-label="50 plus"
    >
      <DigitReel target={5} />
      <DigitReel target={0} />
      <sup className="ml-[3px] text-[16px] leading-none">+</sup>
    </span>
  );
}

function Counter15K() {
  return (
    <span
      data-counter
      className="inline-flex items-baseline text-[49px] font-normal leading-none tracking-[-0.07em]"
      aria-label="1.5K plus"
    >
      <DigitReel target={1} />
      <span className="mx-[1px]">.</span>
      <DigitReel target={5} />
      <span className="ml-[2px] tracking-[-0.04em]">K</span>
      <sup className="ml-[3px] text-[15px] leading-none">+</sup>
    </span>
  );
}

function Counter20() {
  return (
    <span
      data-counter
      className="inline-flex items-baseline text-[50px] font-normal leading-none tracking-[-0.07em]"
      aria-label="20 plus"
    >
      <DigitReel target={2} />
      <DigitReel target={0} />
      <sup className="ml-[3px] text-[16px] leading-none">+</sup>
    </span>
  );
}

function PartnerWordmarks() {
  return (
    <div className="mt-[27px] grid grid-cols-5 items-center divide-x divide-black/[0.08] text-[#444]">
      <div className="flex h-[42px] items-center justify-center px-[18px]">
        <span className="text-[21px] font-semibold tracking-[-0.065em]">
          credible
        </span>
      </div>

      <div className="flex h-[42px] items-center justify-center px-[18px]">
        <span className="text-[20px] font-semibold tracking-[-0.04em]">
          Yellowtail
        </span>
      </div>

      <div className="flex h-[42px] items-center justify-center gap-[7px] px-[18px]">
        <span className="text-[25px] font-light leading-none">♮</span>
        <span className="text-[11px] font-medium uppercase leading-[1.02] tracking-[0.075em]">
          Luxury
          <br />
          Presence
        </span>
      </div>

      <div className="flex h-[42px] items-center justify-center px-[18px]">
        <span className="-skew-x-[12deg] text-[22px] font-bold tracking-[-0.075em]">
          technis
        </span>
      </div>

      <div className="flex h-[42px] items-center justify-center gap-[7px] px-[18px]">
        <span className="h-[20px] w-[20px] rounded-full border-[5px] border-[#474747]" />
        <span className="text-[15px] font-semibold tracking-[0.025em]">
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
      const grid =
        section.querySelector<HTMLElement>(
          "[data-facts-grid]",
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
        !grid ||
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

      gsap.set(cards, {
        transformOrigin: "50% 0%",
        transformPerspective: 1120,
        backfaceVisibility: "hidden",
        willChange: "transform, opacity",
      });

      gsap.set(counterTracks.flat().map(({ track }) => track), {
        y: 0,
        willChange: "transform",
      });

      const themeTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 99%",
        end: "bottom top",

        onEnter: () => {
          setTheme("light");
          canvasManager.setActive("home-hero", false);
        },

        onEnterBack: () => {
          setTheme("light");
          canvasManager.setActive("home-hero", false);
        },

        onUpdate: () => {
          canvasManager.setActive("home-hero", false);
        },

        onLeave: () => {
          canvasManager.setActive("home-hero", false);
        },

        onLeaveBack: () => {
          setTheme("dark");
        },
      });

      const headerTween = gsap.fromTo(
        header,
        {
          autoAlpha: 0,
          y: 22,
        },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: header,
            start: "top 99%",
            end: "top 73%",
            scrub: true,
          },
        },
      );

      /*
       * Match the Trionn screenshots: all three cards hang from the same
       * top edge and simply unfold toward the viewer. No scale, translateZ,
       * bounce, or secondary wobble. The stagger alone creates the frame
       * where left is moderately open, center is deeper, and right is almost
       * horizontal. Final state is exactly rotationX(0deg) for every card.
       */
      const cardsTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: "top 99%",
          end: "top 38%",
          scrub: true,
          invalidateOnRefresh: true,

          onEnter: () => {
            gsap.set(cards, {
              willChange: "transform, opacity",
            });
            canvasManager.setActive("home-hero", false);
          },

          onEnterBack: () => {
            gsap.set(cards, {
              willChange: "transform, opacity",
            });
            canvasManager.setActive("home-hero", false);
          },

          onLeave: () => {
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
          },
        },
      });

      cardsTimeline
        .fromTo(
          cards[0],
          {
            rotationX: -78,
            autoAlpha: 0.36,
          },
          {
            rotationX: 0,
            autoAlpha: 1,
            duration: 0.62,
            ease: "none",
          },
          0.02,
        )
        .fromTo(
          cards[1],
          {
            rotationX: -82,
            autoAlpha: 0.24,
          },
          {
            rotationX: 0,
            autoAlpha: 1,
            duration: 0.64,
            ease: "none",
          },
          0.16,
        )
        .fromTo(
          cards[2],
          {
            rotationX: -84,
            autoAlpha: 0.16,
          },
          {
            rotationX: 0,
            autoAlpha: 1,
            duration: 0.64,
            ease: "none",
          },
          0.3,
        );

      counterTracks.forEach((tracks, index) => {
        tracks.forEach(({ track, target }) => {
          cardsTimeline.to(
            track,
            {
              y: `${-target}em`,
              duration: 0.2,
              ease: "power2.out",
            },
            0.34 + index * 0.13,
          );
        });
      });

      cardsTimeline.to({}, { duration: 0.06 }, 0.94);

      const partnersTween = gsap.fromTo(
        partners,
        {
          autoAlpha: 0,
          y: 18,
        },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: partners,
            start: "top 97%",
            end: "top 74%",
            scrub: true,
          },
        },
      );

      return () => {
        themeTrigger.kill();
        headerTween.scrollTrigger?.kill();
        headerTween.kill();
        cardsTimeline.scrollTrigger?.kill();
        cardsTimeline.kill();
        partnersTween.scrollTrigger?.kill();
        partnersTween.kill();
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
          <h2 className="text-[clamp(4.4rem,5.35vw,6rem)] font-normal leading-[0.94] tracking-[-0.062em]">
            Key facts
          </h2>

          <p className="mx-auto mt-[18px] max-w-[210px] text-[14px] leading-[1.16] tracking-[-0.025em]">
            A snapshot of our
            <br />
            experience and impact.
          </p>
        </div>

        <div
          data-facts-grid
          className="mx-auto mt-[4.8svh] grid w-full max-w-[1000px] grid-cols-1 items-start gap-[18px] md:grid-cols-3"
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

              <p className="absolute left-[31px] top-[33px] z-10 text-[13px] uppercase tracking-[-0.028em]">
                Featured &amp; Awards
              </p>

              <div className="absolute bottom-[78px] left-[31px] z-10 flex h-[25px] items-center">
                <img
                  src="https://trionn.com/images/thefwa.svg"
                  alt="FWA"
                  className="max-h-[22px] w-[58px] object-contain brightness-0 invert"
                />
              </div>

              <p className="absolute bottom-[30px] left-[31px] z-10 max-w-[176px] text-[14px] leading-[1.16] text-white/70">
                Featured on top design
                <br />
                platforms worldwide.
              </p>

              <div className="absolute bottom-[22px] right-[27px] z-10">
                <Counter50 />
              </div>
            </article>
          </div>

          <div
            data-card-shell
            className="relative z-[20] origin-top"
          >
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#e7e5e3] text-[#474747]">
              <p className="absolute left-1/2 top-[33px] -translate-x-1/2 whitespace-nowrap text-[13px] uppercase tracking-[-0.028em]">
                Projects completed
              </p>

              <div className="absolute left-1/2 top-[104px] flex h-[166px] w-[166px] -translate-x-1/2 items-center justify-center rounded-full bg-[#f8f7f5]">
                <Counter15K />
              </div>

              <p className="absolute bottom-[30px] left-1/2 w-[232px] -translate-x-1/2 text-center text-[14px] leading-[1.2] text-black/58">
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
                className="absolute left-[30px] right-[30px] top-[79px] h-[212px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1562569633-622303bafef5?auto=format&fit=crop&q=82&w=900')",
                }}
              />

              <p className="absolute right-[29px] top-[33px] z-10 text-[13px] uppercase tracking-[-0.028em]">
                Our team members
              </p>

              <p className="absolute bottom-[34px] left-[31px] z-10 max-w-[150px] text-[14px] leading-[1.14] text-white/60">
                Different skills.
                <br />
                One standard.
              </p>

              <div className="absolute bottom-[22px] right-[28px] z-10">
                <Counter20 />
              </div>
            </article>
          </div>
        </div>

        <div
          data-partners
          className="mx-auto mt-[7svh] max-w-[720px]"
        >
          <p className="text-center text-[12px] uppercase tracking-[-0.02em]">
            Our business partners
          </p>

          <PartnerWordmarks />
        </div>
      </div>
    </section>
  );
}
