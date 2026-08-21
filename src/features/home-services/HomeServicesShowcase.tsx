"use client";

import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/client";
import { canvasManager } from "@/runtime/canvas/CanvasManager";

import { ServicesScene } from "./ServicesScene";

const SERVICE_WORDS = ["A.I.", "Design", "Development", "Branding"] as const;

const SCATTER_VECTORS = [
  { x: -22, y: -11, r: -22, s: 0.76 },
  { x: -16, y: 14, r: 15, s: 0.68 },
  { x: 19, y: -13, r: 24, s: 0.72 },
  { x: 25, y: 11, r: -17, s: 0.64 },
  { x: -27, y: 6, r: 27, s: 0.6 },
  { x: 13, y: 20, r: -24, s: 0.68 },
  { x: -9, y: -21, r: 14, s: 0.7 },
  { x: 29, y: -4, r: 19, s: 0.62 },
  { x: -19, y: 20, r: -28, s: 0.64 },
  { x: 6, y: -24, r: 30, s: 0.72 },
  { x: 23, y: 19, r: -14, s: 0.61 },
  { x: -29, y: -15, r: 22, s: 0.58 },
] as const;

function WordChars({ word, wordIndex }: { word: string; wordIndex: number }) {
  return (
    <div data-service-word data-service-word-index={wordIndex} className="whitespace-nowrap">
      {word.split("").map((char, charIndex) => (
        <span
          key={`${word}-${charIndex}`}
          data-service-char
          data-service-char-index={charIndex}
          className="inline-block origin-center will-change-transform"
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </div>
  );
}

function LeftLineMotif() {
  return (
    <div
      data-service-detail-motif
      aria-hidden="true"
      className="absolute right-[7.5%] top-[13.5%] flex h-[80px] items-stretch gap-[6px] opacity-65 max-md:hidden"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <span key={index} className="block w-px bg-white/50" />
      ))}
    </div>
  );
}

function RightRingMotif() {
  return (
    <div
      data-service-detail-motif
      aria-hidden="true"
      className="absolute right-[4.5%] top-[13.5%] h-[88px] w-[112px] overflow-hidden opacity-65 max-md:hidden"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <span
          key={`left-${index}`}
          className="absolute rounded-full border border-white/48"
          style={{
            width: `${38 + index * 17}px`,
            height: `${38 + index * 17}px`,
            left: `${-18 - index * 8}px`,
            top: `${44 - (38 + index * 17) / 2}px`,
          }}
        />
      ))}
      {Array.from({ length: 4 }).map((_, index) => (
        <span
          key={`right-${index}`}
          className="absolute rounded-full border border-white/48"
          style={{
            width: `${38 + index * 17}px`,
            height: `${38 + index * 17}px`,
            right: `${-18 - index * 8}px`,
            top: `${44 - (38 + index * 17) / 2}px`,
          }}
        />
      ))}
    </div>
  );
}

function ServiceDetailPanels() {
  return (
    <div
      data-service-detail-stage
      className="pointer-events-none absolute inset-0 z-[3] opacity-0"
    >
      <article
        data-service-detail-panel="left"
        className="absolute left-[8.2vw] top-[52%] h-[26.5svh] min-h-[250px] w-[39vw] min-w-[500px] -translate-y-1/2 bg-[rgba(7,12,17,0.3)] px-[2.3vw] py-[4.4svh] backdrop-blur-[1px] max-md:left-5 max-md:top-[42%] max-md:h-auto max-md:min-h-0 max-md:w-[calc(100%-40px)] max-md:min-w-0 max-md:px-5 max-md:py-5"
      >
        <h3 className="max-w-[280px] text-[clamp(1.55rem,1.75vw,2rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#f0eee8] max-md:text-[1.5rem]">
          AI &amp; Intelligent
          <br />
          Automation
        </h3>

        <LeftLineMotif />

        <p className="absolute bottom-[3.7svh] left-[2.3vw] max-w-[300px] text-[11.5px] font-normal leading-[1.27] tracking-[-0.015em] text-[#d7d6d1] max-md:static max-md:mt-8 max-md:max-w-[310px] max-md:text-[11px]">
          AI-powered solutions designed to enhance products, automate workflows,
          and unlock smarter digital experiences.
        </p>
      </article>

      <article
        data-service-detail-panel="right"
        className="absolute right-[8.2vw] top-[49.2%] h-[24.8svh] min-h-[238px] w-[30vw] min-w-[390px] -translate-y-1/2 bg-[rgba(7,12,17,0.3)] px-[2.15vw] py-[4.1svh] backdrop-blur-[1px] max-md:bottom-[15svh] max-md:right-5 max-md:top-auto max-md:h-auto max-md:min-h-0 max-md:w-[calc(100%-40px)] max-md:min-w-0 max-md:px-5 max-md:py-5 max-md:translate-y-0"
      >
        <h3 className="max-w-[265px] text-[clamp(1.55rem,1.75vw,2rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#f0eee8] max-md:text-[1.5rem]">
          Website &amp;
          <br />
          Mobile Design
        </h3>

        <RightRingMotif />

        <p className="absolute bottom-[3.5svh] left-[2.15vw] max-w-[285px] text-[11.5px] font-normal leading-[1.27] tracking-[-0.015em] text-[#d7d6d1] max-md:static max-md:mt-8 max-md:max-w-[310px] max-md:text-[11px]">
          High-quality website and app experiences designed to attract users and
          keep them coming back.
        </p>
      </article>
    </div>
  );
}

function ServicesFooter() {
  return (
    <>
      <p className="absolute bottom-[7.2svh] left-1/2 z-[6] -translate-x-1/2 whitespace-nowrap text-[10px] font-normal uppercase leading-none tracking-[-0.02em] text-[#e6e4df] max-md:bottom-[9svh] max-md:text-[9px]">
        ✦ Different disciplines. One standard of craft.
      </p>

      <a
        href="/services"
        className="group absolute bottom-[6.55svh] right-[2.1vw] z-[6] flex w-[214px] items-center justify-between border-b border-white/38 pb-[8px] font-mono text-[10px] uppercase leading-none tracking-[-0.02em] text-[#eceae4] max-md:right-5 max-md:w-[150px] max-md:text-[9px]"
      >
        <span>View services</span>
        <span className="transition-transform duration-300 group-hover:translate-x-[5px]">→</span>
      </a>
    </>
  );
}

export function HomeServicesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ServicesScene | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;

    if (!section || !canvas) return;

    const scene = new ServicesScene(canvas);
    sceneRef.current = scene;
    const unregister = canvasManager.register(scene, false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        canvasManager.setActive(scene.id, entry.isIntersecting);
      },
      {
        rootMargin: "25% 0px",
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      sceneRef.current = null;
      unregister();
    };
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const words = Array.from(
        section.querySelectorAll<HTMLElement>("[data-service-word]"),
      );
      const chars = Array.from(
        section.querySelectorAll<HTMLElement>("[data-service-char]"),
      );
      const wordStack = section.querySelector<HTMLElement>(
        "[data-services-dark-words]",
      );
      const detailStage = section.querySelector<HTMLElement>(
        "[data-service-detail-stage]",
      );
      const leftPanel = section.querySelector<HTMLElement>(
        '[data-service-detail-panel="left"]',
      );
      const rightPanel = section.querySelector<HTMLElement>(
        '[data-service-detail-panel="right"]',
      );
      const detailMotifs = Array.from(
        section.querySelectorAll<HTMLElement>("[data-service-detail-motif]"),
      );

      if (
        words.length !== SERVICE_WORDS.length ||
        !wordStack ||
        !detailStage ||
        !leftPanel ||
        !rightPanel
      ) {
        return;
      }

      const setDarkTheme = () => {
        document.documentElement.dataset.pageTheme = "dark";
      };

      const restoreLightTheme = () => {
        document.documentElement.dataset.pageTheme = "light";
      };

      const themeTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        end: "bottom top",
        onEnter: setDarkTheme,
        onEnterBack: setDarkTheme,
        onLeaveBack: restoreLightTheme,
      });

      const progressTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          sceneRef.current?.setProgress(self.progress);
        },
      });

      gsap.set(chars, {
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        scale: 1,
        autoAlpha: 1,
      });
      gsap.set(detailStage, { autoAlpha: 0 });
      gsap.set(leftPanel, { xPercent: -7, autoAlpha: 0 });
      gsap.set(rightPanel, { xPercent: 7, autoAlpha: 0 });
      gsap.set(detailMotifs, { scale: 0.9, autoAlpha: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(
        wordStack,
        {
          scale: 0.99,
          duration: 0.14,
          ease: "none",
        },
        0,
      );

      words.forEach((word, wordIndex) => {
        const wordChars = Array.from(
          word.querySelectorAll<HTMLElement>("[data-service-char]"),
        );

        wordChars.forEach((char, charIndex) => {
          const vector =
            SCATTER_VECTORS[(wordIndex * 5 + charIndex) % SCATTER_VECTORS.length];
          const depthFactor = 0.92 + wordIndex * 0.045;
          const delay = wordIndex * 0.026 + charIndex * 0.004;

          timeline.to(
            char,
            {
              xPercent: vector.x * depthFactor,
              yPercent: vector.y * depthFactor,
              rotation: vector.r,
              scale: vector.s,
              autoAlpha: 0.34 + ((charIndex + wordIndex) % 4) * 0.11,
              duration: 0.34,
              ease: "power1.inOut",
            },
            0.17 + delay,
          );
        });
      });

      timeline.to(
        wordStack,
        {
          scale: 0.965,
          duration: 0.16,
          ease: "none",
        },
        0.52,
      );

      timeline.to(
        chars,
        {
          autoAlpha: 0,
          scale: 0.52,
          duration: 0.14,
          stagger: {
            each: 0.003,
            from: "random",
          },
          ease: "power1.in",
        },
        0.62,
      );

      timeline.to(
        wordStack,
        {
          autoAlpha: 0,
          duration: 0.06,
          ease: "none",
        },
        0.67,
      );

      timeline.to(
        detailStage,
        {
          autoAlpha: 1,
          duration: 0.07,
          ease: "none",
        },
        0.69,
      );

      timeline.to(
        leftPanel,
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 0.19,
          ease: "power2.out",
        },
        0.71,
      );

      timeline.to(
        rightPanel,
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 0.19,
          ease: "power2.out",
        },
        0.74,
      );

      timeline.to(
        detailMotifs,
        {
          scale: 1,
          autoAlpha: 0.68,
          duration: 0.17,
          stagger: 0.02,
          ease: "power1.out",
        },
        0.78,
      );

      return () => {
        themeTrigger.kill();
        progressTrigger.kill();
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-home-services-showcase
      className="relative z-[54] h-[420svh] bg-[#070c11] text-[#efede6]"
    >
      <div className="sticky top-0 h-[100svh] min-h-[720px] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 17% 50%, rgba(131,141,145,.34) 0%, rgba(68,78,83,.19) 29%, transparent 59%), radial-gradient(ellipse at 77% 34%, rgba(48,59,68,.46) 0%, rgba(8,14,19,.14) 47%, transparent 73%), radial-gradient(ellipse at 55% 82%, rgba(77,84,84,.24) 0%, transparent 53%), linear-gradient(112deg, #05090d 0%, #172027 43%, #04080c 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-75"
          style={{
            background:
              "radial-gradient(circle at 23% 55%, rgba(219,222,218,.14), transparent 20%), radial-gradient(circle at 48% 45%, rgba(255,255,255,.075), transparent 27%), radial-gradient(circle at 76% 66%, rgba(169,181,184,.12), transparent 24%)",
            filter: "blur(34px)",
            transform: "scale(1.13)",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,3,6,.23) 0%, transparent 25%, transparent 70%, rgba(0,2,5,.55) 100%), radial-gradient(ellipse at center, transparent 39%, rgba(0,0,0,.48) 100%)",
          }}
        />

        <ServiceDetailPanels />

        <canvas
          ref={canvasRef}
          data-services-canvas
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
        />

        <p className="absolute left-1/2 top-[10.8svh] z-[6] -translate-x-1/2 whitespace-nowrap text-[11px] font-normal uppercase leading-none tracking-[-0.018em] text-[#eceae4] max-md:top-[12svh] max-md:text-[10px]">
          Our services
        </p>

        <div
          data-services-dark-words
          className="absolute left-1/2 top-[53%] z-[5] w-[86vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase will-change-transform"
        >
          <div className="text-[clamp(6rem,8.7vw,9.7rem)] font-normal leading-[0.715] tracking-[-0.073em] max-md:text-[clamp(3.4rem,14vw,6rem)] max-md:leading-[0.78] max-md:tracking-[-0.055em]">
            {SERVICE_WORDS.map((word, index) => (
              <WordChars key={word} word={word} wordIndex={index} />
            ))}
          </div>
        </div>

        <ServicesFooter />
      </div>
    </section>
  );
}
