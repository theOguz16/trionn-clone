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

const ABOUT_PHASE_START_DESKTOP = 0.18;
const ABOUT_PHASE_END_DESKTOP = 0.36;
const ABOUT_PHASE_START_MOBILE = 0.34;
const ABOUT_PHASE_END_MOBILE = 0.7;

/*
 * Trionn reveals each character with a short power1.out color fade and a
 * longer character-by-character scrub. These values are expressed directly
 * against the shared Hero ScrollTrigger progress so the reveal can be tuned
 * without moving the rule, supporting copy, or Focused Vision handoff.
 */
const ABOUT_CHAR_REVEAL_DESKTOP = {
  start: 0.08997,
  duration: 0.02352,
  stagger: 0.001421,
};
const ABOUT_CHAR_REVEAL_MOBILE = {
  start: 0.2263,
  duration: 0.0317,
  stagger: 0.0019,
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function mapAboutProgress(
  raw: number,
  isMobile: boolean,
) {
  const start = isMobile
    ? ABOUT_PHASE_START_MOBILE
    : ABOUT_PHASE_START_DESKTOP;
  const end = isMobile
    ? ABOUT_PHASE_END_MOBILE
    : ABOUT_PHASE_END_DESKTOP;

  return clamp01(
    (raw - start) /
      (end - start),
  );
}

function getFocusEntrance(
  raw: number,
  isMobile: boolean,
  isTablet: boolean,
) {
  const start = isMobile
    ? 0.5
    : 0.245;
  const end = isMobile
    ? 1
    : isTablet
      ? 0.49
      : 0.509;

  return clamp01(
    (raw - start) /
      (end - start),
  );
}

function AboutCta() {
  return (
    <TransitionLink
      href="/about"
      className="group relative flex h-[32px] w-[160px] items-start overflow-hidden border-b border-white/45 pt-[2px] font-mono text-[10px] uppercase tracking-[-0.02em] text-[#c5c5c2]"
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

function MarqueePlus() {
  return (
    <svg
      data-marquee-plus
      aria-hidden="true"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-[30.46875px] mt-[6.09375px] h-[18.28125px] w-[18.28125px] shrink-0 md:relative md:top-[0.739vw] md:mx-[4vw] md:mt-[0.5vw] md:h-[2vw] md:w-[2vw]"
    >
      <line
        x1="20.2256"
        y1="0"
        x2="20.2256"
        y2="40"
        stroke="#D8D8D8"
      />
      <line
        x1="40"
        y1="20.226"
        x2="0"
        y2="20.226"
        stroke="#D8D8D8"
      />
    </svg>
  );
}

function MarqueeGroup() {
  return (
    <div className="flex shrink-0 items-center uppercase">
      <span className="relative">Inspire</span>
      <MarqueePlus />
      <span className="relative">innovate</span>
      <MarqueePlus />
      <span className="relative">Impact</span>
      <MarqueePlus />
    </div>
  );
}

export function HomeAboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
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
        type: "chars,words",
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

      const keepNarrativeCanvasVisible = () => {
        if (!heroCanvas) {
          return;
        }

        /*
         * The reference keeps the model fully present behind the entire
         * Inspire / Innovate / Impact scene. HomeStripeWipe owns the later
         * physical occlusion and canvas retirement.
         */
        heroCanvas.style.setProperty(
          "--home-narrative-canvas-opacity",
          "1",
        );
      };

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(
            ["[data-about-label]", "[data-about-heading]"],
            {
              y: 0,
              autoAlpha: 1,
            },
          );

          gsap.set(chars, {
            color: "rgba(216,216,216,0.1)",
            willChange: "color",
          });

          gsap.set("[data-about-rule-line]", {
            scaleX: 0,
            transformOrigin: "left center",
          });

          gsap.set(
            ["[data-about-rule-wrap]", "[data-about-rule-plus]"],
            { autoAlpha: 0 },
          );

          gsap.set(
            ["[data-about-left]", "[data-about-right]"],
            {
              y: 20,
              autoAlpha: 0,
              filter: "blur(5px)",
            },
          );

          gsap.set(
            ["[data-focus-label]", "[data-focus-marquee]"],
            { autoAlpha: 1 },
          );
          gsap.set("[data-focus-label]", { y: 0 });
          gsap.set(marquee, { x: 0 });

          const aboutTimeline =
            gsap.timeline({ paused: true });

          const createCharacterReveal = ({
            start,
            duration,
            stagger,
          }: typeof ABOUT_CHAR_REVEAL_DESKTOP) =>
            gsap
              .timeline({ paused: true })
              .to(
                chars,
                {
                  color: "#d8d8d8",
                  duration,
                  stagger: {
                    each: stagger,
                    from: "start",
                  },
                  ease: "power1.out",
                },
                start,
              )
              .to({}, { duration: 0.001 }, 0.999);

          const desktopCharacterReveal =
            createCharacterReveal(
              ABOUT_CHAR_REVEAL_DESKTOP,
            );
          const mobileCharacterReveal =
            createCharacterReveal(
              ABOUT_CHAR_REVEAL_MOBILE,
            );

          const renderCharacterReveal = (
            rawProgress: number,
            isMobile: boolean,
          ) => {
            const reveal = isMobile
              ? mobileCharacterReveal
              : desktopCharacterReveal;

            reveal.progress(rawProgress);
          };

          aboutTimeline.to(
            "[data-about-rule-wrap]",
            { autoAlpha: 1, duration: 0.08, ease: "none" },
            0.12,
          );
          aboutTimeline.to(
            "[data-about-rule-line]",
            { scaleX: 1, duration: 0.13, ease: "none" },
            0.12,
          );
          aboutTimeline.to(
            "[data-about-rule-plus]",
            { autoAlpha: 1, duration: 0.08, ease: "none" },
            0.18,
          );
          aboutTimeline.to(
            "[data-about-left]",
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.12,
              ease: "none",
            },
            0.16,
          );
          aboutTimeline.to(
            "[data-about-right]",
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.12,
              ease: "none",
            },
            0.2,
          );

          aboutTimeline.to(
            "[data-about-heading]",
            { y: "-48svh", duration: 0.51, ease: "none" },
            0.5,
          );
          aboutTimeline.to(
            "[data-about-label]",
            { y: "-36svh", duration: 0.51, ease: "none" },
            0.5,
          );
          aboutTimeline.to(
            "[data-about-rule-wrap]",
            { y: "-38svh", duration: 0.49, ease: "none" },
            0.52,
          );
          aboutTimeline.to(
            ["[data-about-left]", "[data-about-right]"],
            {
              y: "-44svh",
              autoAlpha: 0,
              duration: 0.49,
              ease: "none",
            },
            0.52,
          );
          aboutTimeline.to(
            [
              "[data-about-label]",
              "[data-about-heading]",
              "[data-about-rule-wrap]",
            ],
            { autoAlpha: 0, duration: 0.08, ease: "none" },
            0.92,
          );
          aboutTimeline.to({}, { duration: 0.01 }, 0.99);

          const marqueeTween = gsap.to(marquee, {
            x: () => -(marquee.scrollWidth / 4),
            duration: () =>
              marquee.scrollWidth / 4 / 48,
            repeat: -1,
            ease: "none",
            paused: true,
          });

          const updateMarqueePlayback = (
            rawProgress: number,
            isMobile: boolean,
          ) => {
            const entranceStart = isMobile
              ? 0.5
              : 0.245;

            if (rawProgress >= entranceStart) {
              marqueeTween.play();
            } else {
              marqueeTween.pause(0);
            }
          };

          const refreshMarqueeMetrics = () => {
            const phase = marqueeTween.progress();

            marqueeTween
              .invalidate()
              .duration(
                marquee.scrollWidth / 4 / 48,
              )
              .progress(phase);
          };

          const trigger = ScrollTrigger.create({
            trigger: heroSection,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              const isMobile =
                window.innerWidth < 768;
              const aboutLocal = mapAboutProgress(
                self.progress,
                isMobile,
              );
              renderCharacterReveal(
                self.progress,
                isMobile,
              );
              aboutTimeline.invalidate().progress(aboutLocal);
              refreshMarqueeMetrics();
              updateMarqueePlayback(
                self.progress,
                isMobile,
              );
              const entrance = getFocusEntrance(
                self.progress,
                isMobile,
                window.innerWidth >= 768 && window.innerWidth < 1024,
              );
              gsap.set("[data-focus-stage]", {
                y: `${(1 - entrance) * (isMobile ? 100 : 107.64)}svh`,
              });
              keepNarrativeCanvasVisible();
            },
            onUpdate: (self) => {
              const isMobile =
                window.innerWidth < 768;
              const aboutLocal =
                mapAboutProgress(
                  self.progress,
                  isMobile,
                );
              renderCharacterReveal(
                self.progress,
                isMobile,
              );
              aboutTimeline.progress(aboutLocal);
              updateMarqueePlayback(
                self.progress,
                isMobile,
              );
              const entrance = getFocusEntrance(
                self.progress,
                isMobile,
                window.innerWidth >= 768 && window.innerWidth < 1024,
              );
              gsap.set("[data-focus-stage]", {
                y: `${(1 - entrance) * (isMobile ? 100 : 107.64)}svh`,
              });
              keepNarrativeCanvasVisible();
            },
          });

          const aboutLocal = mapAboutProgress(
            trigger.progress,
            window.innerWidth < 768,
          );
          renderCharacterReveal(
            trigger.progress,
            window.innerWidth < 768,
          );
          aboutTimeline.progress(aboutLocal);
          updateMarqueePlayback(
            trigger.progress,
            window.innerWidth < 768,
          );
          const entrance = getFocusEntrance(
            trigger.progress,
            window.innerWidth < 768,
            window.innerWidth >= 768 && window.innerWidth < 1024,
          );
          gsap.set("[data-focus-stage]", {
            y: `${(1 - entrance) * (window.innerWidth < 768 ? 100 : 107.64)}svh`,
          });
          keepNarrativeCanvasVisible();

          /*
           * Trionn's 1280x720 layout gives the About intro a 775px visual
           * interval. The final 55px therefore release the copy layer from
           * its pin while the following Focused Vision layer remains pinned.
           * Taller desktop, tablet, and mobile intervals are exactly one
           * viewport high and must stay at their existing zero offset.
           */
          let compactDesktopCopyRelease:
            ScrollTrigger | null = null;

          if (
            window.matchMedia(
              "(min-width: 1024px) and (max-width: 1399px) and (max-height: 774px)",
            ).matches
          ) {
            const renderCompactDesktopRelease = (
              progress: number,
            ) => {
              const releaseProgress =
                1 - Math.pow(1 - progress, 1.15);
              const ruleProgress =
                0.815 + 0.185 * progress;

              gsap.set("[data-about-copy-stage]", {
                y: -58 * releaseProgress,
              });
              gsap.set("[data-about-rule-line]", {
                scaleX: ruleProgress,
              });
            };

            compactDesktopCopyRelease =
              ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: () =>
                `+=${Math.max(1, 775 - window.innerHeight)}`,
              invalidateOnRefresh: true,
              onRefresh: (self) =>
                renderCompactDesktopRelease(self.progress),
              onUpdate: (self) =>
                renderCompactDesktopRelease(self.progress),
            });
          }

          return () => {
            trigger.kill();
            compactDesktopCopyRelease?.kill();
            desktopCharacterReveal.kill();
            mobileCharacterReveal.kill();
            aboutTimeline.kill();
            marqueeTween.kill();
          };
        },
      );

      media.add(
        "(prefers-reduced-motion: reduce)",
        () => {
          gsap.set(chars, { color: "#bebebb" });
          gsap.set(
            [
              "[data-about-label]",
              "[data-about-heading]",
              "[data-about-rule-wrap]",
              "[data-about-rule-line]",
              "[data-about-rule-plus]",
              "[data-about-left]",
              "[data-about-right]",
            ],
            {
              x: 0,
              y: 0,
              scaleX: 1,
              autoAlpha: 1,
              filter: "blur(0px)",
            },
          );
          gsap.set(
            [
              "[data-focus-label]",
              "[data-focus-marquee]",
            ],
            { autoAlpha: 0 },
          );
          keepNarrativeCanvasVisible();
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
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-home-about
      className="relative z-[20] bg-transparent text-[#bebebb]"
    >
      <style>{`
        canvas[data-home-narrative-canvas] {
          opacity: var(--home-narrative-canvas-opacity, 1) !important;
        }
      `}</style>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          data-about-copy-stage
          className="absolute inset-0 z-[25] will-change-transform"
        >
          <div
            data-about-label
            className="absolute left-[var(--layout-gutter)] top-[18.28svh] z-[25] font-mono text-[15.3072px] uppercase leading-none tracking-[var(--tracking-mono-label)] text-[var(--color-text-light)]"
          >
            About
          </div>

        <div
          data-about-heading
          className="absolute left-[10.541vw] right-[var(--layout-gutter)] top-[16.67svh] z-[25]"
        >
          <h2
            aria-label={ABOUT_HEADING}
            className="max-w-[1260px] text-[clamp(3.15rem,4.55vw,5.2rem)] font-normal leading-[1.015] tracking-[-0.058em]"
          >
            <span
              aria-hidden="true"
              className="inline-block w-1/12"
            />
            <span
              ref={headingRef}
              aria-hidden="true"
              className="inline! pl-3"
            >
              {ABOUT_HEADING}
            </span>
          </h2>
        </div>

          <div
            data-about-rule-wrap
            className="absolute left-[10.541vw] right-[10.541vw] top-[68.43svh] z-[25]"
          >
          <div data-about-rule-line className="h-px w-full bg-white/[0.18]" />
          <span
            data-about-rule-plus
            className="absolute left-[55.83vw] top-[-9px] text-[15px] font-light leading-none text-white/55"
          >
            +
          </span>
          </div>

        <div
          data-about-left
          className="absolute left-[10.541vw] top-[78.11svh] z-[25] w-[16vw]"
        >
          <p className="text-[15.3072px] font-normal uppercase leading-none tracking-[-0.02em] text-[#d8d8d8]">
            We design for longevity
            <br />
            clarity first, craft always,
            <br />
            built to scale.
          </p>
        </div>

        <div
          data-about-right
          className="absolute left-[66.833vw] top-[78.11svh] z-[25] w-[22.625vw]"
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
        </div>

        <div
          data-focus-stage
          className="pointer-events-none absolute inset-0 z-[30] will-change-transform"
        >
          <p
            data-focus-label
            className="absolute left-[10.541vw] top-[63svh] text-[12px] font-normal uppercase leading-none tracking-[-0.02em] text-[#d8d8d8]"
          >
            Focused vision.
            <br />
            Measured execution.
          </p>

          <p
            data-focus-outcome
            className="absolute left-[2.5vw] right-[2.5vw] top-[76.985svh] text-center text-[1.063vw] font-normal uppercase leading-none tracking-[-0.02em] text-[#d8d8d8]"
          >
            ✦ From idea to outcome.
          </p>

          <div
            data-focus-marquee
            aria-hidden="true"
            className="absolute left-0 top-[86svh] z-[40] flex w-full justify-center overflow-hidden text-[#dededb]"
          >
            <div
              ref={marqueeRef}
              className="flex w-max shrink-0 whitespace-nowrap text-[clamp(5.75rem,9.164vw,8.25rem)] font-normal uppercase leading-none tracking-[-0.08em] text-[#d8d8d8] will-change-transform"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <MarqueeGroup key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
