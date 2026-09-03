/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/client";
import { canvasManager } from "@/runtime/canvas/CanvasManager";

const DIGITS = Array.from({ length: 10 }, (_, index) => index);

const AWARD_LOGOS = [
  { src: "/awards/awwwards.svg", alt: "Awwwards" },
  { src: "/awards/ccda.svg", alt: "CSS Design Awards" },
  { src: "/awards/thefwa.svg", alt: "The FWA" },
  { src: "/awards/csswinner.svg", alt: "CSS Winner" },
  { src: "/awards/adesignaward.svg", alt: "A' Design Award" },
  { src: "/awards/gsap.svg", alt: "GSAP" },
] as const;

const PARTNERS = [
  { src: "/partners/credible.svg?v=trionn", alt: "Credible", width: 79, height: 17, desktopVw: 5.5, mobileVw: 17.1875 },
  { src: "/partners/yellowtail.svg?v=trionn", alt: "Yellowtail", width: 97, height: 16, desktopVw: 6.75, mobileVw: 21.09375 },
  { src: "/partners/luxury-presence.svg?v=trionn", alt: "Luxury Presence", width: 94, height: 34, desktopVw: 6.5, mobileVw: 20.3125 },
  { src: "/partners/technis.svg?v=trionn", alt: "Technis", width: 97, height: 17, desktopVw: 6.75, mobileVw: 21.09375 },
  { src: "/partners/ockto.svg?v=trionn", alt: "Ockto", width: 81, height: 23, desktopVw: 5.625, mobileVw: 17.578125 },
] as const;

function setTheme(theme: "dark" | "light") {
  document.documentElement.dataset.pageTheme = theme;
}

function DigitReel({ target }: { target: number }) {
  return (
    <span data-counter-digit data-target={target} className="relative inline-block h-[var(--counter-step)] w-[0.58em] overflow-hidden align-[-0.04em]" aria-hidden="true">
      <span data-digit-track className="absolute left-0 top-0 flex w-full flex-col items-center">
        {DIGITS.map((digit) => (
          <span key={digit} className="flex h-[var(--counter-step)] w-full shrink-0 items-center justify-center">{digit}</span>
        ))}
      </span>
    </span>
  );
}

function Counter50() {
  return <span data-counter className="inline-flex [--counter-step:0.848214em] items-start font-normal leading-[0.892857] tracking-[-0.06em] max-md:[--counter-step:0.857143em]" aria-label="50 plus"><DigitReel target={5} /><DigitReel target={0} /><sup data-counter-plus>+</sup></span>;
}

function Counter15K() {
  return <span data-counter data-counter-kind="15k" className="inline-flex [--counter-step:0.848214em] items-start font-normal leading-[0.892857] tracking-[-0.06em] max-md:[--counter-step:0.857143em]" aria-label="1.5K plus"><DigitReel target={1} /><span className="h-[var(--counter-step)]">.</span><DigitReel target={5} /><span className="h-[var(--counter-step)] tracking-[-0.04em]">K</span><sup data-counter-plus>+</sup></span>;
}

function Counter20() {
  return <span data-counter className="inline-flex [--counter-step:0.848214em] items-start font-normal leading-[0.892857] tracking-[-0.06em] max-md:[--counter-step:0.857143em]" aria-label="20 plus"><DigitReel target={2} /><DigitReel target={0} /><sup data-counter-plus>+</sup></span>;
}

function PartnerWordmarks() {
  return (
    <div data-partners className="mt-[7.5vw] max-md:mt-[7.2svh]">
      <p data-partners-title className="text-center leading-none tracking-[-0.02em]">
        Our business partners
      </p>

      <div
        data-partner-static
        className="mx-auto mt-[2.5vw] hidden w-max items-center justify-center md:flex"
      >
        {PARTNERS.map((partner) => (
          <div
            key={partner.src}
            className="flex shrink-0 items-center justify-center border-r border-black/[0.09] px-[2.5vw] last:border-r-0"
          >
            <img
              src={partner.src}
              alt={partner.alt}
              width={partner.width}
              height={partner.height}
              className="block h-auto max-h-[34px] shrink-0"
              style={{ width: `min(${partner.width}px, ${partner.desktopVw}vw)` }}
            />
          </div>
        ))}
      </div>

      <div
        data-partner-marquee
        className="relative -mx-[30.46875px] mt-[30.46875px] overflow-hidden md:hidden"
      >
        <div data-partner-track className="flex w-max whitespace-nowrap will-change-transform">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div
              key={groupIndex}
              aria-hidden={groupIndex === 1 ? "true" : undefined}
              className="flex shrink-0 items-center"
            >
              {PARTNERS.map((partner) => (
                <div
                  key={`${groupIndex}-${partner.src}`}
                  className="flex h-[29px] shrink-0 items-center justify-center border-r border-black/[0.09] px-[30.46875px]"
                >
                  <img
                    src={partner.src}
                    alt={groupIndex === 0 ? partner.alt : ""}
                    width={partner.width}
                    height={partner.height}
                    className="block h-auto max-h-[29px] shrink-0"
                    style={{ width: `min(${partner.width}px, ${partner.mobileVw}vw)` }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
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
    const partnerTitle = section.querySelector<HTMLElement>("[data-partners-title]");
    const partnerTrack = section.querySelector<HTMLElement>("[data-partner-track]");

    if (
      !grid ||
      cards.length !== 3 ||
      counters.length !== 3
    ) return;

    const tracks = counters.map((counter) =>
      Array.from(counter.querySelectorAll<HTMLElement>("[data-counter-digit]"))
        .map((digit) => {
          const track = digit.querySelector<HTMLElement>("[data-digit-track]");
          if (!track) return null;
          return {
            digit,
            track,
            target: Number(digit.dataset.target ?? "0"),
          };
        })
        .filter((entry): entry is { digit: HTMLElement; track: HTMLElement; target: number } => entry !== null),
    );

    tracks.flat().forEach(({ track }) => gsap.set(track, { y: 0 }));

    const activateLightSection = () => {
      document.documentElement.dataset.keyfactsActive = "true";
      setTheme("light");
      canvasManager.setActive("home-hero", false);
    };

    const deactivateLightSection = () => {
      delete document.documentElement.dataset.keyfactsActive;
      setTheme("dark");
    };

    const media = gsap.matchMedia();

    media.add("(min-width: 768px)", () => {
      gsap.set(grid, { x: 0 });
      gsap.set(partnerTitle, {
        autoAlpha: 0,
        filter: "blur(12px)",
      });
      gsap.set(cards, {
        transformOrigin: "50% 0%",
        backfaceVisibility: "hidden",
        force3D: true,
        willChange: "transform, opacity",
      });
      gsap.set(cards, { rotationX: -92, autoAlpha: 0 });

      const timeline = gsap.timeline({ paused: true });
      timeline
        .to(cards[0], { rotationX: 0, autoAlpha: 1, duration: 0.66, ease: "none" }, 0.07)
        .to(cards[1], { rotationX: 0, duration: 0.62, ease: "none" }, 0.25)
        .to(cards[1], { autoAlpha: 1, duration: 0.66, ease: "none" }, 0.29)
        .to(cards[2], { rotationX: 0, autoAlpha: 1, duration: 0.605, ease: "none" }, 0.387);

      tracks.forEach((counterTracks, counterIndex) => {
        counterTracks.forEach(({ digit, track, target }) => {
          timeline.to(
            track,
            {
              // The desktop cards begin rotated in 3D. A visual bounding box
              // is therefore compressed by perspective when GSAP resolves
              // this value; offsetHeight keeps the reel step tied to the
              // untransformed layout height.
              y: () => -target * digit.offsetHeight,
              duration: 0.18,
              ease: "sine.out",
            },
            0.3 + counterIndex * 0.22,
          );
        });
      });
      timeline.to({}, { duration: 0.01 }, 0.99);

      const trigger = ScrollTrigger.create({
        trigger: grid,
        start: "top 96%",
        end: () => `+=${Math.round(window.innerHeight * 0.58)}`,
        animation: timeline,
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: activateLightSection,
        onEnterBack: activateLightSection,
        onLeave: activateLightSection,
        onLeaveBack: deactivateLightSection,
      });

      const partnerReveal = partnerTitle
        ? ScrollTrigger.create({
            trigger: partnerTitle,
            start: "top 90%",
            once: true,
            onEnter: () => {
              gsap.to(partnerTitle, {
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.5,
                ease: "power2.out",
              });
            },
          })
        : null;

      let tabletPartnerTween: gsap.core.Tween | null = null;

      if (
        partnerTrack &&
        window.matchMedia("(max-width: 900px)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        tabletPartnerTween = gsap.to(partnerTrack, {
          x: () => -(partnerTrack.scrollWidth / 2),
          duration: () => partnerTrack.scrollWidth / 2 / 30.46875,
          ease: "none",
          repeat: -1,
        });
      }

      return () => {
        tabletPartnerTween?.kill();
        partnerReveal?.kill();
        trigger.kill();
        timeline.kill();
      };
    });

    media.add("(max-width: 767px)", () => {
      gsap.set(cards, {
        rotationX: 0,
        autoAlpha: 1,
        clearProps: "transformOrigin",
      });
      gsap.set(grid, { x: 0 });

      const timeline = gsap.timeline({ paused: true });

      tracks.forEach((counterTracks, counterIndex) => {
        counterTracks.forEach(({ digit, track, target }) => {
          timeline.to(
            track,
            {
              y: () => -target * digit.offsetHeight,
              duration: 0.14,
              ease: "sine.out",
            },
            0.04 + counterIndex * 0.18,
          );
        });
      });
      timeline.to({}, { duration: 0.01 }, 0.99);

      const trigger = ScrollTrigger.create({
        id: "keyfacts-cards-mobile",
        trigger: section,
        start: "top 82%",
        end: "bottom 18%",
        animation: timeline,
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: activateLightSection,
        onEnterBack: activateLightSection,
        onLeave: activateLightSection,
        onLeaveBack: deactivateLightSection,
      });

      const cardRail = gsap.timeline({
        scrollTrigger: {
          id: "keyfacts-mobile-pin",
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      cardRail
        .to(
          grid,
          {
            x: () => -window.innerWidth * 1.540241,
            duration: 0.465,
            ease: "none",
          },
          0,
        )
        .to({}, { duration: 0.535 });

      let partnerTween: gsap.core.Tween | null = null;

      if (
        partnerTrack &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        partnerTween = gsap.to(partnerTrack, {
          x: () => -(partnerTrack.scrollWidth / 2),
          duration: () => partnerTrack.scrollWidth / 2 / 30.46875,
          ease: "none",
          repeat: -1,
        });
      }

      return () => {
        partnerTween?.kill();
        cardRail.scrollTrigger?.kill();
        cardRail.kill();
        trigger.kill();
        timeline.kill();
      };
    });

    return () => {
      const ownsLightTheme =
        document.documentElement.dataset.keyfactsActive === "true";

      delete document.documentElement.dataset.keyfactsActive;

      if (ownsLightTheme) {
        delete document.documentElement.dataset.pageTheme;
        canvasManager.setActive("home-hero", true);
      }

      media.revert();
    };
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      data-home-key-facts
      className="relative z-[50] min-h-[100svh] bg-[linear-gradient(180deg,var(--color-bg-light)_0%,#fff_100%)] text-[var(--color-text-dark)]"
    >
      <div className="layout-gutter min-h-[100svh] overflow-hidden pb-[10vw] pt-[6.25vw] max-md:h-auto max-md:min-h-[700px] max-md:overflow-visible max-md:pb-[9svh] max-md:pt-[9svh]">
        <div data-keyfacts-header className="text-center">
          <h2 className="text-[clamp(4rem,5vw,5.75rem)] font-normal leading-[0.95] tracking-[-0.062em]">Key facts</h2>
          <p className="mx-auto mt-[1.5vw] max-w-[205px] leading-normal max-md:mt-[18.28125px] max-md:leading-[18.5px]">A snapshot of our<br />experience and impact.</p>
        </div>

        <div
          data-facts-grid
          aria-label="Key facts cards"
          className="mx-auto mt-[5vw] flex w-[77.25vw] max-w-[1112px] items-start gap-[1.5vw] max-md:mx-0 max-md:mt-[30.46875px] max-md:w-[calc(100vw-36.5625px)] max-md:max-w-none max-md:gap-[18.28125px] max-md:overflow-visible max-md:pl-[33.7734px] max-md:pr-[18.28125px]"
          style={{ perspective: "1400px", perspectiveOrigin: "50% 50%", transformStyle: "preserve-3d" }}
        >
          <div data-card-shell className="relative z-[30] min-w-0 flex-1 origin-top max-md:w-[min(301.6406px,calc(100vw-70px))] max-md:min-w-[min(301.6406px,calc(100vw-70px))] max-md:flex-none">
            <article data-keyfact-card className="relative aspect-[99/122] w-full overflow-hidden rounded-[var(--radius-common)] bg-[#272727] text-[#d8d8d8] max-md:h-[clamp(300px,85.9375vw,335.15625px)] max-md:aspect-auto">
              <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 hidden h-full w-full object-cover md:block">
                <source src="/videos/keyfacts/awards-card-desktop.mp4" type="video/mp4" />
              </video>
              <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover md:hidden">
                <source src="/videos/keyfacts/awards-card-mobile.mp4" type="video/mp4" />
              </video>

              <div data-keyfact-card-content className="absolute inset-0 z-[2] flex flex-col justify-between p-[2.5vw] max-md:p-[24.375px]">
                <span data-keyfacts-card-title>Featured &amp; Awards</span>

                <div>
                  <div data-awards-logos className="relative mb-[0.5vw] h-[3vw] w-1/3 max-md:mb-[6.09375px] max-md:h-[36.5625px]">
                    {AWARD_LOGOS.map((logo, index) => (
                      <img
                        key={logo.src}
                        src={logo.src}
                        alt={logo.alt}
                        className="absolute inset-0 h-full w-full object-contain object-left opacity-0"
                        style={{ animationDelay: `${index * 4}s` }}
                      />
                    ))}
                  </div>

                  <div className="flex items-end justify-between gap-x-[1.5vw] max-md:gap-x-[18.28125px]">
                    <p data-keyfacts-card-copy className="w-9/12 opacity-80">Featured on top design<br className="md:hidden" /> platforms worldwide.</p>
                    <Counter50 />
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div data-card-shell className="relative z-[10] min-w-0 flex-1 origin-top max-md:w-[min(257.2969px,calc(100vw-104px))] max-md:min-w-[min(257.2969px,calc(100vw-104px))] max-md:flex-none">
            <article data-keyfact-card className="relative flex aspect-[99/122] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-common)] bg-[#e6e4e2] p-[2.5vw] text-center text-[#434343] max-md:h-[clamp(300px,85.9375vw,335.15625px)] max-md:aspect-auto max-md:p-[24.375px]">
              <span data-keyfacts-card-title>projects completed</span>
              <div className="relative flex flex-1 items-center justify-center">
                <div data-keyfact-counter-circle className="absolute left-1/2 top-1/2 aspect-square w-[12.5vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white max-md:w-[152.34375px]" />
                <div className="relative z-[2] flex items-center"><Counter15K /></div>
              </div>
              <p data-keyfacts-card-copy className="opacity-80">90% of our clients seek our<br />services for a second project.</p>
            </article>
          </div>

          <div data-card-shell className="relative z-[20] min-w-0 flex-1 origin-top max-md:w-[min(301.6406px,calc(100vw-70px))] max-md:min-w-[min(301.6406px,calc(100vw-70px))] max-md:flex-none">
            <article data-keyfact-card className="relative aspect-[99/122] w-full overflow-hidden rounded-[var(--radius-common)] bg-[#2f3135] text-[#d8d8d8] max-md:h-[clamp(300px,85.9375vw,335.15625px)] max-md:aspect-auto">
              <div data-keyfact-card-content className="absolute inset-0 z-[2] flex flex-col justify-between p-[2.5vw] max-md:p-[24.375px]">
                <span data-keyfacts-card-title className="text-right">our team members</span>

                <div className="flex flex-1 overflow-hidden rounded-[var(--radius-common)] py-[3.125vw] max-md:py-[15.234375px]">
                  <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture className="hidden h-full w-full scale-[1.01] rounded-[var(--radius-common)] object-cover object-top md:block">
                    <source src="/videos/keyfacts/team-desktop.mp4" type="video/mp4" />
                  </video>
                  <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture className="h-full w-full scale-[1.01] rounded-[var(--radius-common)] object-cover object-top md:hidden">
                    <source src="/videos/keyfacts/team-mobile.mp4" type="video/mp4" />
                  </video>
                </div>

                <div className="flex items-end justify-between">
                  <p data-keyfacts-card-copy className="text-[#d8d8d8]/60">Different skills.<br />One standard.</p>
                  <Counter20 />
                </div>
              </div>
            </article>
          </div>
        </div>

        <PartnerWordmarks />
      </div>
    </section>
  );
}
