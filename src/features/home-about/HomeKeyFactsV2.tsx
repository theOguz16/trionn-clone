/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/client";
import { canvasManager } from "@/runtime/canvas/CanvasManager";

const DIGITS = Array.from({ length: 10 }, (_, index) => index);

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
    <span data-counter-digit data-target={target} className="relative inline-block h-[1em] w-[0.58em] overflow-hidden align-[-0.06em]" aria-hidden="true">
      <span data-digit-track className="absolute left-0 top-0 flex w-full flex-col items-center">
        {DIGITS.map((digit) => (
          <span key={digit} className="flex h-[1em] w-full shrink-0 items-center justify-center">{digit}</span>
        ))}
      </span>
    </span>
  );
}

function Counter50() {
  return <span data-counter className="inline-flex items-baseline text-[46px] font-normal leading-none tracking-[-0.07em]" aria-label="50 plus"><DigitReel target={5} /><DigitReel target={0} /><sup className="ml-[3px] text-[15px] leading-none">+</sup></span>;
}

function Counter15K() {
  return <span data-counter className="inline-flex items-baseline text-[46px] font-normal leading-none tracking-[-0.07em]" aria-label="1.5K plus"><DigitReel target={1} /><span className="mx-[1px]">.</span><DigitReel target={5} /><span className="ml-[2px] tracking-[-0.04em]">K</span><sup className="ml-[3px] text-[14px] leading-none">+</sup></span>;
}

function Counter20() {
  return <span data-counter className="inline-flex items-baseline text-[46px] font-normal leading-none tracking-[-0.07em]" aria-label="20 plus"><DigitReel target={2} /><DigitReel target={0} /><sup className="ml-[3px] text-[15px] leading-none">+</sup></span>;
}

function PartnerWordmarks() {
  return (
    <div className="mt-[27px] grid grid-cols-5 items-center divide-x divide-black/[0.08]">
      {PARTNERS.map((partner) => (
        <div key={partner.src} className="flex h-[38px] items-center justify-center px-5">
          <img src={partner.src} alt={partner.alt} width={partner.width} height={partner.height} className="block h-auto max-h-[38px] max-w-full" />
        </div>
      ))}
    </div>
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

    gsap.set(cards, { transformOrigin: "50% 0%", backfaceVisibility: "hidden", force3D: true, willChange: "transform, opacity" });
    gsap.set(cards[0], { rotationX: -42, autoAlpha: 0.52 });
    gsap.set(cards[1], { rotationX: -56, autoAlpha: 0.46 });
    gsap.set(cards[2], { rotationX: -68, autoAlpha: 0.44 });
    tracks.flat().forEach(({ track }) => gsap.set(track, { y: 0 }));

    const timeline = gsap.timeline({ paused: true, defaults: { overwrite: true } });
    timeline
      .to(cards[0], { rotationX: 0, autoAlpha: 1, duration: 0.72, ease: "sine.inOut" }, 0)
      .to(cards[1], { rotationX: 0, autoAlpha: 1, duration: 0.76, ease: "sine.inOut" }, 0.28)
      .to(cards[2], { rotationX: 0, autoAlpha: 1, duration: 0.8, ease: "sine.inOut" }, 0.56);

    tracks.forEach((counterTracks, counterIndex) => {
      counterTracks.forEach(({ track, target }) => {
        timeline.to(track, { y: `${-target}em`, duration: 0.24, ease: "sine.out" }, 0.34 + counterIndex * 0.28);
      });
    });
    timeline.to({}, { duration: 0.12 }, 1.42);

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
      onLeaveBack: () => { delete document.documentElement.dataset.keyfactsActive; },
    });

    return () => {
      delete document.documentElement.dataset.keyfactsActive;
      trigger.kill();
      timeline.kill();
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative z-[50] bg-[#dedddb] text-[#414141]">
      <div className="min-h-[100svh] overflow-hidden bg-[#dedddb] px-[2.1vw] pb-[6svh] pt-[7svh] max-md:px-5">
        <div data-keyfacts-header className="text-center">
          <h2 className="text-[clamp(4rem,5vw,5.75rem)] font-normal leading-[0.95] tracking-[-0.062em]">Key facts</h2>
          <p className="mx-auto mt-[19px] max-w-[205px] text-[13px] leading-[1.18] tracking-[-0.025em]">A snapshot of our<br />experience and impact.</p>
        </div>

        <div data-facts-grid className="mx-auto mt-[4.8svh] grid w-full max-w-[1000px] grid-cols-1 items-start gap-[18px] md:grid-cols-3" style={{ perspective: "1200px", perspectiveOrigin: "50% 0%", transformStyle: "preserve-3d" }}>
          <div data-card-shell className="relative z-[30] origin-top">
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#34343c] text-[#e7e6e3]">
              <div className="absolute inset-x-0 bottom-0 top-[55px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1760719438551-6c5408b122e9?auto=format&fit=crop&q=82&w=900')" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
              <p className="absolute left-[31px] top-[33px] z-10 text-[12px] uppercase tracking-[-0.025em]">Featured &amp; Awards</p>
              <img src="https://trionn.com/images/thefwa.svg" alt="FWA" className="absolute bottom-[78px] left-[31px] z-10 h-[22px] w-[58px] object-contain brightness-0 invert" />
              <p className="absolute bottom-[30px] left-[31px] z-10 max-w-[176px] text-[13px] leading-[1.18] text-white/70">Featured on top design<br />platforms worldwide.</p>
              <div className="absolute bottom-[22px] right-[27px] z-10"><Counter50 /></div>
            </article>
          </div>

          <div data-card-shell className="relative z-[10] origin-top">
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#e6e4e2] text-[#474747]">
              <p className="absolute left-1/2 top-[33px] -translate-x-1/2 whitespace-nowrap text-[12px] uppercase tracking-[-0.025em]">Projects completed</p>
              <div className="absolute left-1/2 top-[104px] flex h-[166px] w-[166px] -translate-x-1/2 items-center justify-center rounded-full bg-[#f8f7f5]"><Counter15K /></div>
              <p className="absolute bottom-[30px] left-1/2 w-[232px] -translate-x-1/2 text-center text-[13px] leading-[1.22] text-black/58">90% of our clients seek our<br />services for a second project.</p>
            </article>
          </div>

          <div data-card-shell className="relative z-[20] origin-top">
            <article className="relative h-[395px] overflow-hidden rounded-[6px] bg-[#34343c] text-[#e7e6e3]">
              <div className="absolute left-[30px] right-[30px] top-[79px] h-[212px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562569633-622303bafef5?auto=format&fit=crop&q=82&w=900')" }} />
              <p className="absolute right-[29px] top-[33px] z-10 text-[12px] uppercase tracking-[-0.025em]">Our team members</p>
              <p className="absolute bottom-[34px] left-[31px] z-10 max-w-[150px] text-[13px] leading-[1.15] text-white/60">Different skills.<br />One standard.</p>
              <div className="absolute bottom-[22px] right-[28px] z-10"><Counter20 /></div>
            </article>
          </div>
        </div>

        <div className="mx-auto mt-[9svh] max-w-[720px]">
          <p className="text-center text-[11px] uppercase tracking-[-0.02em]">Our business partners</p>
          <PartnerWordmarks />
        </div>
      </div>
    </section>
  );
}
