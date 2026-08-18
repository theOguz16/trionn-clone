"use client";

import { useRef } from "react";

import { TransitionLink } from "@/components/motion/TransitionLink";
import {
  gsap,
  SplitText,
  useGSAP,
} from "@/lib/gsap/client";

const ABOUT_HEADING =
  "Trionn is an independent digital studio crafting meaningful brand experiences through strategy, design, and technology.";

function AboutCta() {
  return (
    <TransitionLink
      href="/about"
      className="group relative flex h-[32px] w-[165px] items-start overflow-hidden border-b border-white/45 pt-[2px] font-mono text-[10px] uppercase tracking-[-0.02em] text-[#c5c5c2]"
    >
      <span className="whitespace-nowrap transition-transform duration-500 ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:translate-x-[14px]">
        More about us
      </span>

      <span className="absolute right-0 top-[2px] transition-[opacity,transform] duration-300 group-hover:translate-x-[8px] group-hover:opacity-0">
        →
      </span>

      <span className="absolute left-0 top-[2px] -translate-x-[8px] opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        →
      </span>
    </TransitionLink>
  );
}

export function HomeAboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const marquee = marqueeRef.current;

      if (!section || !heading || !marquee) {
        return;
      }

      const split = new SplitText(heading, {
        type: "chars,words,lines",
      });

      const chars = split.chars;
      const media = gsap.matchMedia();

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(
            [
              "[data-about-label]",
              "[data-about-heading]",
            ],
            {
              y: () =>
                window.innerHeight * 0.42,
            },
          );

          gsap.set(chars, {
            color:
              "rgba(190,190,187,0.105)",
            willChange: "color",
          });

          gsap.set(
            "[data-about-rule-line]",
            {
              scaleX: 0,
              transformOrigin:
                "left center",
            },
          );

          gsap.set(
            [
              "[data-about-rule-wrap]",
              "[data-about-rule-plus]",
            ],
            {
              autoAlpha: 0,
            },
          );

          gsap.set(
            [
              "[data-about-left]",
              "[data-about-right]",
            ],
            {
              y: 28,
              autoAlpha: 0,
              filter: "blur(5px)",
            },
          );

          gsap.set(
            "[data-focus-stage]",
            {
              y: 0,
            },
          );

          gsap.set(
            [
              "[data-focus-label]",
              "[data-focus-marquee]",
            ],
            {
              autoAlpha: 0,
            },
          );

          gsap.set(
            "[data-focus-label]",
            {
              y: 34,
            },
          );

          gsap.set(marquee, {
            x: "-6vw",
          });

          const timelineClock = {
            value: 0,
          };

          const timeline =
            gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.35,
                invalidateOnRefresh:
                  true,
              },
            });

          /*
           * ABOUT ENTER
           */

          timeline.to(
            [
              "[data-about-label]",
              "[data-about-heading]",
            ],
            {
              y: 0,
              duration: 0.18,
              ease: "none",
            },
            0,
          );

          /*
           * CHARACTER REVEAL
           */

          timeline.to(
            chars,
            {
              color: "#bebebb",

              duration: 0.09,

              stagger: {
                each: 0.0018,
                from: "start",
              },

              ease: "none",
            },
            0.055,
          );

          /*
           * RULE + PLUS
           */

          timeline.to(
            "[data-about-rule-wrap]",
            {
              autoAlpha: 1,
              duration: 0.06,
              ease: "none",
            },
            0.14,
          );

          timeline.to(
            "[data-about-rule-line]",
            {
              scaleX: 1,
              duration: 0.15,
              ease: "none",
            },
            0.14,
          );

          timeline.to(
            "[data-about-rule-plus]",
            {
              autoAlpha: 1,
              duration: 0.08,
              ease: "none",
            },
            0.17,
          );

          /*
           * COPY
           */

          timeline.to(
            "[data-about-left]",
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.14,
              ease: "none",
            },
            0.155,
          );

          timeline.to(
            "[data-about-right]",
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.14,
              ease: "none",
            },
            0.18,
          );

          /*
           * ABOUT TRAVELS UPWARD
           */

          timeline.to(
            "[data-about-heading]",
            {
              y: "-48svh",
              duration: 0.27,
              ease: "none",
            },
            0.4,
          );

          timeline.to(
            "[data-about-label]",
            {
              y: "-36svh",
              duration: 0.27,
              ease: "none",
            },
            0.4,
          );

          timeline.to(
            "[data-about-rule-wrap]",
            {
              y: "-38svh",
              duration: 0.29,
              ease: "none",
            },
            0.42,
          );

          timeline.to(
            "[data-about-left]",
            {
              y: "-39svh",
              duration: 0.3,
              ease: "none",
            },
            0.42,
          );

          timeline.to(
            "[data-about-right]",
            {
              y: "-39svh",
              duration: 0.3,
              ease: "none",
            },
            0.42,
          );

          /*
           * FOCUSED VISION
           */

          timeline.to(
            "[data-focus-label]",
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.12,
              ease: "none",
            },
            0.49,
          );

          timeline.to(
            "[data-about-left]",
            {
              y: "-68svh",
              duration: 0.23,
              ease: "none",
            },
            0.7,
          );

          timeline.to(
            "[data-about-right]",
            {
              y: "-72svh",
              duration: 0.24,
              ease: "none",
            },
            0.7,
          );

          /*
           * IMPACT / INSPIRE / INNOVATE
           *
           * It appears near the bottom.
           */

          timeline.to(
            "[data-focus-marquee]",
            {
              autoAlpha: 1,
              duration: 0.065,
              ease: "none",
            },
            0.59,
          );

          /*
           * 86svh - 34svh ≈ 52svh.
           *
           * The row genuinely reaches
           * the middle of the viewport.
           */

          timeline.to(
            "[data-focus-stage]",
            {
              y: "-34svh",
              duration: 0.22,
              ease: "none",
            },
            0.62,
          );

          /*
           * Horizontal movement happens
           * while it rises.
           */

          timeline.to(
            marquee,
            {
              x: "-42vw",
              duration: 0.22,
              ease: "none",
            },
            0.62,
          );

          timeline.to(
            [
              "[data-about-label]",
              "[data-about-heading]",
              "[data-about-rule-wrap]",
            ],
            {
              autoAlpha: 0,
              duration: 0.03,
              ease: "none",
            },
            0.75,
          );

          /*
           * NO FADE OUT.
           *
           * Once the marquee reaches
           * center at ~0.84 it stays
           * exactly there.
           *
           * HomeStripeWipe will cover it
           * physically a little later.
           */

          /*
           * Force timeline duration to
           * exactly 1.
           *
           * This makes all timing numbers
           * above correspond directly to
           * ScrollTrigger progress.
           */
          timeline.to(
            timelineClock,
            {
              value: 1,
              duration: 0.01,
              ease: "none",
            },
            0.99,
          );
        },
      );

      media.add(
        "(prefers-reduced-motion: reduce)",
        () => {
          gsap.set(chars, {
            color: "#bebebb",
          });

          gsap.set(
            [
              "[data-about-label]",
              "[data-about-heading]",
              "[data-about-rule-wrap]",
              "[data-about-rule-line]",
              "[data-about-rule-plus]",
              "[data-about-left]",
              "[data-about-right]",
              "[data-focus-label]",
              "[data-focus-marquee]",
            ],
            {
              x: 0,
              y: 0,
              scaleX: 1,
              autoAlpha: 1,
              filter: "blur(0px)",
            },
          );
        },
      );

      return () => {
        media.revert();
        split.revert();
      };
    },
    {
      scope: sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[20] -mt-[520svh] h-[460svh] bg-transparent text-[#bebebb]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* ABOUT */}

        <div
          data-about-label
          className="absolute left-[2.1vw] top-[17.5svh] z-[25] font-mono text-[11px] uppercase tracking-[0.01em] text-[#c4c4c1] max-md:left-5"
        >
          About
        </div>

        <div
          data-about-heading
          className="absolute left-[18.2vw] right-[3vw] top-[15.5svh] z-[25] max-md:left-5 max-md:right-5"
        >
          <h2
            ref={headingRef}
            className="max-w-[1260px] text-[clamp(3.15rem,4.55vw,5.2rem)] font-normal leading-[1.015] tracking-[-0.058em]"
          >
            {ABOUT_HEADING}
          </h2>
        </div>

        {/* RULE */}

        <div
          data-about-rule-wrap
          className="absolute left-[10.2vw] right-[2.1vw] top-[46.8svh] z-[25]"
        >
          <div
            data-about-rule-line
            className="h-px w-full bg-white/[0.18]"
          />

          <span
            data-about-rule-plus
            className="absolute left-[63.2%] top-[-9px] text-[15px] font-light leading-none text-white/55"
          >
            +
          </span>
        </div>

        {/* LEFT COPY */}

        <div
          data-about-left
          className="absolute left-[10.2vw] top-[53.7svh] z-[25] w-[290px]"
        >
          <p className="text-[12px] font-normal uppercase leading-[1.18] tracking-[-0.02em] text-[#cacac7]">
            We design for longevity
            <br />
            clarity first, craft always,
            <br />
            built to scale.
          </p>
        </div>

        {/* RIGHT COPY */}

        <div
          data-about-right
          className="absolute left-[66.4vw] top-[53.7svh] z-[25] w-[320px]"
        >
          <p className="text-[13px] font-normal leading-[1.28] tracking-[-0.025em] text-[#c6c6c3]">
            Our mission is to make
            technology feel human by
            designing digital products
            that are intuitive,
            purposeful, and meaningful
            to people.
          </p>

          <div className="pointer-events-auto mt-[64px]">
            <AboutCta />
          </div>
        </div>

        {/* FOCUS */}

        <div
          data-focus-stage
          className="pointer-events-none absolute inset-0 z-[30] will-change-transform"
        >
          <p
            data-focus-label
            className="absolute left-[10.2vw] top-[63svh] text-[12px] font-normal uppercase leading-[1.08] tracking-[-0.02em] text-[#cececb]"
          >
            Focused vision.
            <br />
            Measured execution.
          </p>

          <div
            data-focus-marquee
            className="absolute left-0 top-[86svh] z-[40] w-full overflow-visible"
          >
            <div
              ref={marqueeRef}
              className="flex w-max items-center whitespace-nowrap text-[clamp(5rem,7.35vw,8.35rem)] font-normal uppercase leading-none tracking-[-0.066em] text-[#dededb] will-change-transform"
            >
              <span>
                Inspire
              </span>

              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">
                +
              </span>

              <span>
                Innovate
              </span>

              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">
                +
              </span>

              <span>
                Impact
              </span>

              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">
                +
              </span>

              <span>
                Inspire
              </span>

              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">
                +
              </span>

              <span>
                Innovate
              </span>

              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">
                +
              </span>

              <span>
                Impact
              </span>

              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">
                +
              </span>

              <span>
                Inspire
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}