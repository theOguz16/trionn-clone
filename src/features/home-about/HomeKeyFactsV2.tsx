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

      if (
        !header ||
        cards.length !== 3 ||
        counters.length !== 3
      ) {
        return;
      }

      const tracks = counters.map((counter) =>
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

      gsap.set(header, {
        autoAlpha: 0,
        y: 18,
      });

      gsap.set(cards[0], {
        scaleY: 0.76,
        autoAlpha: 0.72,
        transformOrigin: "50% 0%",
        force3D: false,
      });

      gsap.set(cards[1], {
        scaleY: 0.56,
        autoAlpha: 0.48,
        transformOrigin: "50% 0%",
        force3D: false,
      });

      gsap.set(cards[2], {
        scaleY: 0.36,
        autoAlpha: 0.26,
        transformOrigin: "50% 0%",
        force3D: false,
      });

      tracks.flat().forEach(({ track }) => {
        gsap.set(track, {
          y: 0,
          force3D: false,
        });
      });

      const timeline = gsap.timeline({
        paused: true,
        defaults: {
          overwrite: true,
        },
      });

      timeline.to(
        header,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.14,
          ease: "power2.out",
        },
        0.02,
      );

      timeline
        .to(
          cards[0],
          {
            scaleY: 1.035,
            autoAlpha: 1,
            duration: 0.3,
            ease: "power2.out",
            force3D: false,
          },
          0.08,
        )
        .to(
          cards[0],
          {
            scaleY: 0.992,
            duration: 0.08,
            ease: "power1.inOut",
            force3D: false,
          },
          0.38,
        )
        .to(
          cards[0],
          {
            scaleY: 1,
            duration: 0.07,
            ease: "power1.out",
            force3D: false,
          },
          0.46,
        );

      timeline
        .to(
          cards[1],
          {
            scaleY: 1.045,
            autoAlpha: 1,
            duration: 0.32,
            ease: "power2.out",
            force3D: false,
          },
          0.18,
        )
        .to(
          cards[1],
          {
            scaleY: 0.988,
            duration: 0.09,
            ease: "power1.inOut",
            force3D: false,
          },
          0.5,
        )
        .to(
          cards[1],
          {
            scaleY: 1,
            duration: 0.07,
            ease: "power1.out",
            force3D: false,
          },
          0.59,
        );

      timeline
        .to(
          cards[2],
          {
            scaleY: 1.055,
            autoAlpha: 1,
            duration: 0.34,
            ease: "power2.out",
            force3D: false,
          },
          0.28,
        )
        .to(
          cards[2],
          {
            scaleY: 0.985,
            duration: 0.1,
            ease: "power1.inOut",
            force3D: false,
          },
          0.62,
        )
        .to(
          cards[2],
          {
            scaleY: 1,
            duration: 0.08,
            ease: "power1.out",
            force3D: false,
          },
          0.72,
        );

      tracks.forEach((counterTracks, index) => {
        counterTracks.forEach(({ track, target }) => {
          timeline.to(
            track,
            {
              y: `${-target}em`,
              duration: 0.2,
              ease: "power2.out",
              force3D: false,
            },
            0.26 + index * 0.12,
          );
        });
      });

      timeline.to({}, { duration: 0.2 }, 0.8);

      const setProgress = (progress: number) => {
        timeline.progress(
          Math.max(0, Math.min(1, progress)),
          false,
        );
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 94%",
        end: "bottom 64%",
        invalidateOnRefresh: true,

        onUpdate: (self) => {
          canvasManager.setActive(
            "home-hero",
            false,
          );
          setProgress(self.progress);
        },

        onEnter: (self) => {
          setTheme("light");
          canvasManager.setActive(
            "home-hero",
            false,
          );
          setProgress(self.progress);
        },

        onEnterBack: (self) => {
          setTheme("light");
          canvasManager.setActive(
            "home-hero",
            false,
          );
          setProgress(self.progress);
        },

        onLeave: () => {
          canvasManager.setActive(
            "home-hero",
            false,
          );
          setProgress(1);
          setTheme("light");
        },

        onLeaveBack: () => {
          setProgress(0);
          setTheme("dark");
        },
      });

      setProgress(trigger.progress);

      return () => {
        trigger.kill();
        timeline.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[50] -mt-[14svh] min-h-[132svh] bg-[#dedddb] text-[#414141]"
    >
      <div className="min-h-[132svh] overflow-hidden bg-[#dedddb] px-[2.1vw] pb-[7svh] pt-[7svh] max-md:px-5">
        <div
          data-keyfacts-header
          className="text-center opacity-0"
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

        <div className="mx-auto mt-[6.3svh] grid w-full max-w-[1040px] grid-cols-1 items-start gap-[20px] md:grid-cols-3">
          <div
            data-card-shell
            className="relative z-[30] origin-top opacity-0"
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
            className="relative z-[10] origin-top opacity-0"
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
            className="relative z-[20] origin-top opacity-0"
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

        <div className="mx-auto mt-[6.5svh] max-w-[760px]">
          <p className="text-center text-[11px] uppercase tracking-[-0.02em]">
            Our business partners
          </p>

          <PartnerWordmarks />
        </div>
      </div>
    </section>
  );
}
