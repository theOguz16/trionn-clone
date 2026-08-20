"use client";

import { useRef } from "react";

import { TransitionLink } from "@/components/motion/TransitionLink";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  useGSAP,
} from "@/lib/gsap/client";

const ABOUT_HEADING =
  "Trionn is an independent digital studio crafting meaningful brand experiences through strategy, design, and technology.";

const NARRATIVE_ABOUT_START = 0.19;
const NARRATIVE_ABOUT_END = 0.88;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function mapNarrativeProgress(raw: number) {
  return clamp01(
    (raw - NARRATIVE_ABOUT_START) /
      (NARRATIVE_ABOUT_END - NARRATIVE_ABOUT_START),
  );
}

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
      const heroSection =
        section?.previousElementSibling instanceof HTMLElement
          ? section.previousElementSibling
          : null;
      const heroCanvas =
        heroSection?.querySelector<HTMLCanvasElement>("canvas") ?? null;

      if (!section || !heading || !marquee || !heroSection) {
        return;
      }

      const split = new SplitText(heading, {
        type: "chars,words,lines",
      });

      const chars = split.chars;
      const media = gsap.matchMedia();

      if (heroCanvas) {
        heroCanvas.setAttribute("data-home-narrative-canvas", "");
        heroCanvas.style.setProperty(
          "--home-narrative-canvas-opacity",
          "1",
        );
      }

      const setCanvasOpacity = (localProgress: number) => {
        if (!heroCanvas) {
          return;
        }

        /*
         * The Hero scene rejoins over raw 0.50 -> 0.62. In About-local
         * progress that is approximately 0.45 -> 0.62. Keep it fully
         * visible through the join, then remove the WebGL layer quickly
         * once the symbol has settled.
         */
        const fade = clamp01((localProgress - 0.6) / 0.12);
        const opacity = 1 - fade;

        heroCanvas.style.setProperty(
          "--home-narrative-canvas-opacity",
          opacity.toFixed(4),
        );
      };

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(
            ["[data-about-label]", "[data-about-heading]"],
            {
              y: () => window.innerHeight * 0.42,
            },
          );

          gsap.set(chars, {
            color: "rgba(190,190,187,0.105)",
            willChange: "color",
          });

          gsap.set("[data-about-rule-line]", {
            scaleX: 0,
            transformOrigin: "left center",
          });

          gsap.set(
            ["[data-about-rule-wrap]", "[data-about-rule-plus]"],
            {
              autoAlpha: 0,
            },
          );

          gsap.set(
            ["[data-about-left]", "[data-about-right]"],
            {
              y: 28,
              autoAlpha: 0,
              filter: "blur(5px)",
            },
          );

          gsap.set("[data-focus-stage]", {
            y: 0,
          });

          gsap.set(
            ["[data-focus-label]", "[data-focus-marquee]"],
            {
              autoAlpha: 0,
            },
          );

          gsap.set("[data-focus-label]", {
            y: 34,
          });

          gsap.set(marquee, {
            x: "-6vw",
          });

          const timelineClock = { value: 0 };
          const timeline = gsap.timeline({ paused: true });

          /* ABOUT ENTER */
          timeline.to(
            ["[data-about-label]", "[data-about-heading]"],
            {
              y: 0,
              duration: 0.17,
              ease: "none",
            },
            0,
          );

          /* CHARACTER REVEAL */
          timeline.to(
            chars,
            {
              color: "#bebebb",
              duration: 0.1,
              stagger: {
                each: 0.0018,
                from: "start",
              },
              ease: "none",
            },
            0.045,
          );

          /* RULE + COPY */
          timeline.to(
            "[data-about-rule-wrap]",
            {
              autoAlpha: 1,
              duration: 0.06,
              ease: "none",
            },
            0.125,
          );

          timeline.to(
            "[data-about-rule-line]",
            {
              scaleX: 1,
              duration: 0.145,
              ease: "none",
            },
            0.125,
          );

          timeline.to(
            "[data-about-rule-plus]",
            {
              autoAlpha: 1,
              duration: 0.075,
              ease: "none",
            },
            0.155,
          );

          timeline.to(
            "[data-about-left]",
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.13,
              ease: "none",
            },
            0.145,
          );

          timeline.to(
            "[data-about-right]",
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.13,
              ease: "none",
            },
            0.17,
          );

          /*
           * ABOUT TRAVELS UP. The copy clears space before the symbol
           * starts reassembling and the focus phrase arrives.
           */
          timeline.to(
            "[data-about-heading]",
            {
              y: "-48svh",
              duration: 0.25,
              ease: "none",
            },
            0.31,
          );

          timeline.to(
            "[data-about-label]",
            {
              y: "-36svh",
              duration: 0.25,
              ease: "none",
            },
            0.31,
          );

          timeline.to(
            "[data-about-rule-wrap]",
            {
              y: "-38svh",
              duration: 0.27,
              ease: "none",
            },
            0.33,
          );

          timeline.to(
            "[data-about-left]",
            {
              y: "-39svh",
              duration: 0.28,
              ease: "none",
            },
            0.33,
          );

          timeline.to(
            "[data-about-right]",
            {
              y: "-39svh",
              duration: 0.28,
              ease: "none",
            },
            0.33,
          );

          /* FOCUSED VISION */
          timeline.to(
            "[data-focus-label]",
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.1,
              ease: "none",
            },
            0.39,
          );

          /*
           * INSPIRE / INNOVATE / IMPACT enters at local ~0.44. This
           * corresponds to hero raw ~0.49, immediately before the model
           * begins its 0.50 -> 0.62 rejoin.
           */
          timeline.to(
            "[data-focus-marquee]",
            {
              autoAlpha: 1,
              duration: 0.055,
              ease: "none",
            },
            0.435,
          );

          /* Phrase rises into the viewport while the model rejoins. */
          timeline.to(
            "[data-focus-stage]",
            {
              y: "-34svh",
              duration: 0.2,
              ease: "none",
            },
            0.455,
          );

          timeline.to(
            marquee,
            {
              x: "-42vw",
              duration: 0.2,
              ease: "none",
            },
            0.455,
          );

          timeline.to(
            ["[data-about-label]", "[data-about-heading]", "[data-about-rule-wrap]"],
            {
              autoAlpha: 0,
              duration: 0.035,
              ease: "none",
            },
            0.57,
          );

          timeline.to(
            ["[data-about-left]", "[data-about-right]"],
            {
              y: "-69svh",
              autoAlpha: 0,
              duration: 0.18,
              ease: "none",
            },
            0.56,
          );

          /* Short center hold while the assembled symbol disappears. */
          timeline.to(
            {},
            {
              duration: 0.065,
            },
            0.655,
          );

          /*
           * The phrase no longer freezes in the middle. It keeps moving
           * upward and fades out before the stripe wipe takes ownership.
           */
          timeline.to(
            "[data-focus-stage]",
            {
              y: "-88svh",
              duration: 0.22,
              ease: "none",
            },
            0.72,
          );

          timeline.to(
            marquee,
            {
              x: "-58vw",
              duration: 0.22,
              ease: "none",
            },
            0.72,
          );

          timeline.to(
            "[data-focus-marquee]",
            {
              autoAlpha: 0,
              duration: 0.13,
              ease: "none",
            },
            0.82,
          );

          timeline.to(
            "[data-focus-label]",
            {
              y: "-24svh",
              autoAlpha: 0,
              duration: 0.14,
              ease: "none",
            },
            0.73,
          );

          timeline.to(
            timelineClock,
            {
              value: 1,
              duration: 0.01,
              ease: "none",
            },
            0.99,
          );

          const trigger = ScrollTrigger.create({
            trigger: heroSection,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const local = mapNarrativeProgress(self.progress);
              timeline.progress(local);
              setCanvasOpacity(local);
            },
          });

          const local = mapNarrativeProgress(trigger.progress);
          timeline.progress(local);
          setCanvasOpacity(local);

          return () => {
            trigger.kill();
            timeline.kill();
          };
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

          setCanvasOpacity(1);
        },
      );

      return () => {
        media.revert();
        split.revert();

        if (heroCanvas) {
          heroCanvas.removeAttribute("data-home-narrative-canvas");
          heroCanvas.style.removeProperty(
            "--home-narrative-canvas-opacity",
          );
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
      className="relative z-[20] -mt-[520svh] h-[460svh] bg-transparent text-[#bebebb]"
    >
      <style>{`
        canvas[data-home-narrative-canvas] {
          opacity: var(--home-narrative-canvas-opacity, 1) !important;
        }
      `}</style>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
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
              <span>Inspire</span>
              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">+</span>
              <span>Innovate</span>
              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">+</span>
              <span>Impact</span>
              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">+</span>
              <span>Inspire</span>
              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">+</span>
              <span>Innovate</span>
              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">+</span>
              <span>Impact</span>
              <span className="mx-[2.7vw] text-[38px] font-light leading-none text-[#aaa9a6]">+</span>
              <span>Inspire</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
