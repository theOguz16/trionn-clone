"use client";

import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/client";
import { canvasManager } from "@/runtime/canvas/CanvasManager";

import { ServicesScene } from "./ServicesScene";

const SERVICE_WORDS = ["A.I.", "Design", "Development", "Branding"] as const;

const SCATTER_VECTORS = [
  { x: -33, y: -16, r: -13, s: 1.0 },
  { x: -23, y: 21, r: 9, s: 0.86 },
  { x: 28, y: -19, r: 15, s: 0.92 },
  { x: 37, y: 16, r: -10, s: 0.78 },
  { x: -39, y: 8, r: 17, s: 0.72 },
  { x: 18, y: 29, r: -15, s: 0.83 },
  { x: -13, y: -30, r: 8, s: 0.88 },
  { x: 43, y: -5, r: 12, s: 0.76 },
  { x: -28, y: 30, r: -18, s: 0.8 },
  { x: 8, y: -35, r: 19, s: 0.9 },
  { x: 34, y: 28, r: -8, s: 0.74 },
  { x: -43, y: -23, r: 14, s: 0.7 },
] as const;

function WordChars({ word, wordIndex }: { word: string; wordIndex: number }) {
  return (
    <div data-service-word data-service-word-index={wordIndex} className="whitespace-nowrap">
      {word.split("").map((char, charIndex) => (
        <span
          key={`${word}-${charIndex}`}
          data-service-char
          data-service-char-index={charIndex}
          className="inline-block will-change-transform"
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
      className="absolute right-[7%] top-[12%] flex h-[82px] items-stretch gap-[7px] opacity-70 max-md:hidden"
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className="block w-px bg-white/55"
          style={{ transform: `translateY(${index % 2 === 0 ? 0 : 5}px)` }}
        />
      ))}
    </div>
  );
}

function RightRingMotif() {
  return (
    <div
      data-service-detail-motif
      aria-hidden="true"
      className="absolute right-[4%] top-[12%] h-[92px] w-[122px] overflow-hidden opacity-70 max-md:hidden"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`left-${index}`}
          className="absolute rounded-full border border-white/55"
          style={{
            width: `${36 + index * 18}px`,
            height: `${36 + index * 18}px`,
            left: `${-20 - index * 9}px`,
            top: `${46 - (36 + index * 18) / 2}px`,
          }}
        />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`right-${index}`}
          className="absolute rounded-full border border-white/55"
          style={{
            width: `${36 + index * 18}px`,
            height: `${36 + index * 18}px`,
            right: `${-20 - index * 9}px`,
            top: `${46 - (36 + index * 18) / 2}px`,
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
        className="absolute left-[10.4vw] top-[52.8%] h-[25.5svh] min-h-[245px] w-[31.8vw] min-w-[390px] -translate-y-1/2 bg-[rgba(8,13,18,0.52)] px-[2.1vw] py-[4.1svh] backdrop-blur-[2px] max-md:left-5 max-md:top-[42%] max-md:h-auto max-md:min-h-0 max-md:w-[calc(100%-40px)] max-md:min-w-0 max-md:px-5 max-md:py-5"
      >
        <h3 className="max-w-[285px] text-[clamp(1.7rem,2vw,2.25rem)] font-normal leading-[0.95] tracking-[-0.05em] text-[#f0eee8] max-md:text-[1.55rem]">
          AI &amp; Intelligent
          <br />
          Automation
        </h3>

        <LeftLineMotif />

        <p className="absolute bottom-[3.6svh] left-[2.1vw] max-w-[292px] text-[12px] font-normal leading-[1.24] tracking-[-0.018em] text-[#dad8d2] max-md:static max-md:mt-8 max-md:max-w-[310px] max-md:text-[11px]">
          AI-powered solutions designed to enhance products, automate workflows,
          and unlock smarter digital experiences.
        </p>
      </article>

      <article
        data-service-detail-panel="right"
        className="absolute right-[10.4vw] top-[43.6%] h-[25.5svh] min-h-[245px] w-[31.8vw] min-w-[390px] -translate-y-1/2 bg-[rgba(8,13,18,0.52)] px-[2.1vw] py-[4.1svh] backdrop-blur-[2px] max-md:bottom-[15svh] max-md:right-5 max-md:top-auto max-md:h-auto max-md:min-h-0 max-md:w-[calc(100%-40px)] max-md:min-w-0 max-md:px-5 max-md:py-5 max-md:translate-y-0"
      >
        <h3 className="max-w-[280px] text-[clamp(1.7rem,2vw,2.25rem)] font-normal leading-[0.95] tracking-[-0.05em] text-[#f0eee8] max-md:text-[1.55rem]">
          Website &amp;
          <br />
          Mobile Design
        </h3>

        <RightRingMotif />

        <p className="absolute bottom-[3.6svh] left-[2.1vw] max-w-[295px] text-[12px] font-normal leading-[1.24] tracking-[-0.018em] text-[#dad8d2] max-md:static max-md:mt-8 max-md:max-w-[310px] max-md:text-[11px]">
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
          scale: 0.985,
          duration: 0.16,
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
          const depthFactor = 1 + wordIndex * 0.08;
          const delay = wordIndex * 0.035 + charIndex * 0.006;

          timeline.to(
            char,
            {
              xPercent: vector.x * depthFactor,
              yPercent: vector.y * depthFactor,
              rotation: vector.r,
              scale: vector.s,
              autoAlpha: 0.24 + ((charIndex + wordIndex) % 4) * 0.14,
              duration: 0.42,
              ease: "power1.inOut",
            },
            0.16 + delay,
          );
        });
      });

      timeline.to(
        wordStack,
        {
          scale: 1.025,
          duration: 0.18,
          ease: "none",
        },
        0.58,
      );

      timeline.to(
        chars,
        {
          autoAlpha: 0,
          scale: 0.82,
          duration: 0.18,
          stagger: {
            each: 0.004,
            from: "random",
          },
          ease: "power1.in",
        },
        0.68,
      );

      timeline.to(
        wordStack,
        {
          autoAlpha: 0,
          duration: 0.08,
          ease: "none",
        },
        0.72,
      );

      timeline.to(
        detailStage,
        {
          autoAlpha: 1,
          duration: 0.08,
          ease: "none",
        },
        0.72,
      );

      timeline.to(
        leftPanel,
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 0.2,
          ease: "power2.out",
        },
        0.74,
      );

      timeline.to(
        rightPanel,
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 0.2,
          ease: "power2.out",
        },
        0.77,
      );

      timeline.to(
        detailMotifs,
        {
          scale: 1,
          autoAlpha: 0.72,
          duration: 0.18,
          stagger: 0.025,
          ease: "power1.out",
        },
        0.8,
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
      className="relative z-[54] h-[420svh] bg-[#0b1015] text-[#efede6]"
    >
      <div className="sticky top-0 h-[100svh] min-h-[720px] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 17% 48%, rgba(169,176,177,.34) 0%, rgba(88,98,103,.18) 28%, transparent 57%), radial-gradient(ellipse at 76% 30%, rgba(57,68,77,.44) 0%, rgba(12,18,24,.12) 45%, transparent 72%), radial-gradient(ellipse at 58% 86%, rgba(63,70,72,.28) 0%, transparent 55%), linear-gradient(112deg, #080d12 0%, #182129 42%, #060b10 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 25% 55%, rgba(229,231,227,.12), transparent 19%), radial-gradient(circle at 49% 43%, rgba(255,255,255,.06), transparent 24%), radial-gradient(circle at 76% 68%, rgba(182,191,194,.1), transparent 22%)",
            filter: "blur(28px)",
            transform: "scale(1.1)",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,5,8,.18) 0%, transparent 24%, transparent 72%, rgba(1,4,7,.48) 100%), radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,.42) 100%)",
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
