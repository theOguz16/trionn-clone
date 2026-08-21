/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/client";
import { canvasManager } from "@/runtime/canvas/CanvasManager";

const DIGITS = Array.from({ length: 10 }, (_, index) => index);
const GUIDE = "rgba(72, 72, 68, 0.16)";
const PLUS_STROKE = "rgba(67, 67, 64, 0.72)";

const PARTNERS = [
  { src: "https://trionn.com/images/partner1.svg", alt: "Credible", width: 88, height: 19 },
  { src: "https://trionn.com/images/partner2.svg", alt: "Yellowtail", width: 108, height: 18 },
  { src: "https://trionn.com/images/partner3.svg", alt: "Luxury Presence", width: 105, height: 38 },
  { src: "https://trionn.com/images/partner4.svg", alt: "Technis", width: 108, height: 19 },
  { src: "https://trionn.com/images/partner5.svg", alt: "Ockto", width: 91, height: 26 },
] as const;

function setTheme(theme: "dark" | "light") {
  document.documentElement.dataset.pageTheme = theme;
}

function DigitReel({ target }: { target: number }) {
  return (
    <span
      data-counter-digit
      data-target={target}
      className="relative inline-block h-[1em] w-[0.58em] overflow-hidden align-[-0.06em]"
      aria-hidden="true"
    >
      <span data-digit-track className="absolute left-0 top-0 flex w-full flex-col items-center">
        {DIGITS.map((digit) => (
          <span key={digit} className="flex h-[1em] w-full shrink-0 items-center justify-center">
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
    <div className="mt-[27px] grid grid-cols-5 items-center divide-x divide-black/[0.08]">
      {PARTNERS.map((partner) => (
        <div key={partner.src} className="flex h-[38px] items-center justify-center px-5">
          <img
            src={partner.src}
            alt={partner.alt}
            width={partner.width}
            height={partner.height}
            className="block h-auto max-h-[38px] max-w-full"
          />
        </div>
      ))}
    </div>
  );
}

function HandoffPlus() {
  return (
    <span
      data-keyfacts-handoff-plus
      aria-hidden="true"
      className="relative block h-[15px] w-[15px]"
    >
      <span
        className="absolute left-[7px] top-0 h-[15px] w-px"
        style={{ backgroundColor: PLUS_STROKE }}
      />
      <span
        className="absolute left-0 top-[7px] h-px w-[15px]"
        style={{ backgroundColor: PLUS_STROKE }}
      />
    </span>
  );
}

export function HomeKeyFacts() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const grid = section.querySelector<HTMLElement>("[data-facts-grid]");
    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-card-shell]"));
    const counters = Array.from(section.querySelectorAll<HTMLElement>("[data-counter]"));
    const handoff = section.querySelector<HTMLElement>("[data-keyfacts-handoff]");
    const handoffRule = section.querySelector<HTMLElement>("[data-keyfacts-handoff-rule]");
    const handoffStem = section.querySelector<HTMLElement>("[data-keyfacts-handoff-stem]");
    const handoffPlus = section.querySelector<HTMLElement>("[data-keyfacts-handoff-plus]");

    if (!grid || cards.length !== 3 || counters.length !== 3) return;

    const tracks = counters.map((counter) =>
      Array.from(counter.querySelectorAll<HTMLElement>("[data-counter-digit]"))
        .map((digit) => {
          const track = digit.querySelector<HTMLElement>("[data-digit-track]");
          if (!track) return null;
          return { track, target: Number(digit.dataset.target ?? "0") };
        })
        .filter((entry): entry is { track: HTMLElement; target: number } => entry !== null),
    );

    gsap.set(cards, {
      transformOrigin: "50% 0%",
      backfaceVisibility: "hidden",
      force3D: true,
      willChange: "transform, opacity",
    });
    gsap.set(cards[0], { rotationX: -42, autoAlpha: 0.52 });
    gsap.set(cards[1], { rotationX: -56, autoAlpha: 0.46 });
    gsap.set(cards[2], { rotationX: -72, autoAlpha: 0.44 });
    tracks.flat().forEach(({ track }) => gsap.set(track, { y: 0 }));

    const timeline = gsap.timeline({ paused: true, defaults: { overwrite: true } });
    timeline
      .to(cards[0], { rotationX: 0, autoAlpha: 1, duration: 0.72, ease: "sine.inOut" }, 0)
      .to(cards[1], { rotationX: 0, autoAlpha: 1, duration: 0.76, ease: "sine.inOut" }, 0.24)
      .to(cards[2], { rotationX: 0, autoAlpha: 1, duration: 0.8, ease: "sine.inOut" }, 0.48);

    tracks.forEach((counterTracks, counterIndex) => {
      counterTracks.forEach(({ track, target }) => {
        timeline.to(
          track,
          { y: `${-target}em`, duration: 0.24, ease: "sine.out" },
          0.3 + counterIndex * 0.24,
        );
      });
    });
    timeline.to({}, { duration: 0.12 }, 1.34);

    const activateLightSection = () => {
      document.documentElement.dataset.keyfactsActive = "true";
      setTheme("light");
      canvasManager.setActive("home-hero", false);
    };

    const trigger = ScrollTrigger.create({
      trigger: grid,
      start: "top 91%",
      end: () => `+=${Math.round(window.innerHeight * 0.58)}`,
      animation: timeline,
      scrub: true,
      invalidateOnRefresh: true,
      onEnter: activateLightSection,
      onEnterBack: activateLightSection,
      onLeave: activateLightSection,
      onLeaveBack: () => {
        delete document.documentElement.dataset.keyfactsActive;
      },
    });

    let handoffTimeline: gsap.core.Timeline | null = null;

    if (handoff && handoffRule && handoffStem && handoffPlus) {
      gsap.set(handoffRule, { scaleX: 0, transformOrigin: "50% 50%" });
      gsap.set(handoffStem, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(handoffPlus, {
        autoAlpha: 0,
        rotation: 0,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      handoffTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: handoff,
          start: "top 82%",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      handoffTimeline
        .to(handoffRule, { scaleX: 1, duration: 0.34, ease: "none" }, 0)
        .to(handoffPlus, { autoAlpha: 1, duration: 0.08, ease: "none" }, 0.1)
        .to(handoffPlus, { rotation: 270, duration: 0.76, ease: "none" }, 0.12)
        .to(handoffStem, { scaleY: 1, duration: 0.58, ease: "none" }, 0.3);
    }

    return () => {
      const ownsLightTheme =
        document.documentElement.dataset.keyfactsActive === "true";

      delete document.documentElement.dataset.keyfactsActive;

      if (ownsLightTheme) {
        delete document.documentElement.dataset.pageTheme;
        canvasManager.setActive("home-hero", true);
      }

      trigger.kill();
      timeline.kill();
      handoffTimeline?.scrollTrigger?.kill();
      handoffTimeline?.kill();
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative z-[50] bg-[#dedddb] text-[#414141]">
      <div className="min-h-[100svh] overflow-hidden bg-[#dedddb] px-[2.1vw] pt-[7svh] max-md:px-5">
        <div data-keyfacts-header className="text-center">
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
          className="mx-auto mt-[4.8svh] grid w-full max-w-[1000px] grid-cols-1 items-start gap-[18px] md:grid-cols-3"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 0%",
            transformStyle: "preserve-3d",
          }}
        >
          <div data-card-shell className="relative z-[30] origin-top">
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#34343c] text-[#eee]">
              <img
                src="/keyfacts-awards-card.png"
                alt="Lion holding a trophy"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute left-[24px] top-[25px] z-10 rounded-[2px] bg-[#34343c]/90 px-[6px] py-[4px] backdrop-blur-[1px]">
                <p className="text-[12px] uppercase tracking-[-0.025em]">Featured &amp; Awards</p>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 h-[96px] bg-gradient-to-t from-[#34343c] via-[#34343c]/92 to-transparent" />

              <img
                src="https://trionn.com/images/thefwa.svg"
                alt="FWA"
                className="absolute bottom-[62px] left-[31px] z-20 h-[20px] w-[58px] object-contain brightness-0 invert"
              />

              <p className="absolute bottom-[20px] left-[31px] z-20 max-w-[170px] text-[13px] leading-[1.15] text-white/74">
                Featured on top design
                <br />
                platforms worldwide.
              </p>

              <div className="absolute bottom-[16px] right-[25px] z-20 text-white/90">
                <Counter50 />
              </div>
            </article>
          </div>

          <div data-card-shell className="relative z-[10] origin-top">
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#e6e4e2] text-[#474747]">
              <p className="absolute left-1/2 top-[33px] -translate-x-1/2 whitespace-nowrap text-[12px] uppercase tracking-[-0.025em]">
                Projects completed
              </p>
              <div className="absolute left-1/2 top-[104px] flex h-[166px] w-[166px] -translate-x-1/2 items-center justify-center rounded-full bg-[#f8f7f5]">
                <Counter15K />
              </div>
              <p className="absolute bottom-[30px] left-1/2 w-[232px] -translate-x-1/2 text-center text-[13px] leading-[1.22] text-black/58">
                90% of our clients seek our
                <br />
                services for a second project.
              </p>
            </article>
          </div>

          <div data-card-shell className="relative z-[20] origin-top">
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#34343c] text-[#eee]">
              <img
                src="/keyfacts-team-card.png"
                alt="Lion team portrait"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute right-[23px] top-[25px] z-10 rounded-[2px] bg-[#34343c]/88 px-[6px] py-[4px] backdrop-blur-[1px]">
                <p className="text-[12px] uppercase tracking-[-0.025em]">Our team members</p>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 h-[86px] bg-gradient-to-t from-[#34343c] via-[#34343c]/94 to-transparent" />

              <p className="absolute bottom-[23px] left-[31px] z-20 max-w-[150px] text-[13px] leading-[1.15] text-white/65">
                Different skills.
                <br />
                One standard.
              </p>

              <div className="absolute bottom-[15px] right-[27px] z-20 text-white/90">
                <Counter20 />
              </div>
            </article>
          </div>
        </div>

        <div className="mx-auto mt-[7svh] max-w-[720px]">
          <p className="text-center text-[11px] uppercase tracking-[-0.02em]">
            Our business partners
          </p>
          <PartnerWordmarks />
        </div>

        <div
          data-keyfacts-handoff
          className="relative mx-auto mt-[8.5svh] h-[28svh] min-h-[190px] w-full max-w-[1000px]"
        >
          <div
            data-keyfacts-handoff-rule
            className="absolute left-1/2 top-0 h-px w-[48%] -translate-x-1/2"
            style={{ backgroundColor: GUIDE }}
          />

          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <HandoffPlus />
          </div>

          <div
            data-keyfacts-handoff-stem
            className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2"
            style={{ backgroundColor: GUIDE }}
          />
        </div>
      </div>
    </section>
  );
}
