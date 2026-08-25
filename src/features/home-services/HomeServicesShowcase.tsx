"use client";

import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/client";
import { canvasManager } from "@/runtime/canvas/CanvasManager";

import { ServicesScene } from "./ServicesScene";
import {
  getServicesScrollState,
  mapMasterToSceneProgress,
  SERVICES_SCROLL_PHASES,
} from "./servicesScrollState";

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

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

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

function VerticalLineMotif() {
  return (
    <div data-service-detail-motif aria-hidden="true" className="absolute right-[8%] top-[14%] flex h-[82px] items-stretch gap-[6px] opacity-60 max-md:hidden">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} className="block w-px bg-white/52" />
      ))}
    </div>
  );
}

function SplitRingMotif() {
  return (
    <div data-service-detail-motif aria-hidden="true" className="absolute right-[4.5%] top-[14%] h-[88px] w-[112px] overflow-hidden opacity-60 max-md:hidden">
      {Array.from({ length: 4 }).map((_, index) => {
        const size = 38 + index * 17;
        return <span key={`left-${index}`} className="absolute rounded-full border border-white/48" style={{ width: `${size}px`, height: `${size}px`, left: `${-18 - index * 8}px`, top: `${44 - size / 2}px` }} />;
      })}
      {Array.from({ length: 4 }).map((_, index) => {
        const size = 38 + index * 17;
        return <span key={`right-${index}`} className="absolute rounded-full border border-white/48" style={{ width: `${size}px`, height: `${size}px`, right: `${-18 - index * 8}px`, top: `${44 - size / 2}px` }} />;
      })}
    </div>
  );
}

function ConcentricCircleMotif() {
  return (
    <div data-service-detail-motif aria-hidden="true" className="absolute right-[8%] top-[13%] h-[92px] w-[92px] max-md:hidden">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="absolute rounded-full border border-white/52" style={{ inset: `${index * 9}px` }} />
      ))}
    </div>
  );
}

function WordPressMotif() {
  return (
    <div data-service-detail-motif aria-hidden="true" className="absolute right-[7%] top-[12%] h-[94px] w-[94px] opacity-70 max-md:hidden">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="absolute rounded-[30%] border border-white/52" style={{ inset: `${index * 9}px`, borderLeftColor: "transparent", transform: `rotate(${index * 5 - 10}deg)` }} />
      ))}
    </div>
  );
}

function ServiceDetailCards() {
  return (
    <div data-service-detail-stage className="pointer-events-none absolute inset-0 z-[3] opacity-0">
      <article data-service-card="ai" className="absolute left-[9.8vw] top-[57.5%] h-[25.5svh] min-h-[242px] w-[31.8vw] min-w-[430px] -translate-y-1/2 bg-[rgba(6,11,16,0.25)] px-[2.15vw] py-[4svh] backdrop-blur-[1px] will-change-[top,transform,opacity] max-md:left-5 max-md:top-[38%] max-md:h-auto max-md:min-h-0 max-md:w-[calc(100%_-_40px)] max-md:min-w-0 max-md:px-5 max-md:py-5">
        <h3 className="max-w-[270px] text-[clamp(1.55rem,1.72vw,1.95rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#f0eee8] max-md:text-[1.5rem]">AI &amp; Intelligent<br />Automation</h3>
        <VerticalLineMotif />
        <p className="absolute bottom-[3.45svh] left-[2.15vw] max-w-[285px] text-[11px] font-normal leading-[1.3] tracking-[-0.015em] text-[#d7d6d1] max-md:static max-md:mt-8 max-md:max-w-[310px]">AI-powered solutions designed to enhance products, automate workflows, and unlock smarter digital experiences.</p>
      </article>

      <article data-service-card="website" className="absolute right-[6.6vw] top-[45.5%] h-[25.5svh] min-h-[242px] w-[30.8vw] min-w-[408px] -translate-y-1/2 bg-[rgba(6,11,16,0.25)] pb-[3.8svh] pl-[4.8vw] pr-[1.8vw] pt-[4svh] backdrop-blur-[1px] will-change-[top,transform,opacity] max-md:bottom-[13svh] max-md:right-5 max-md:top-auto max-md:h-auto max-md:min-h-0 max-md:w-[calc(100%_-_40px)] max-md:min-w-0 max-md:translate-y-0 max-md:px-5 max-md:py-5">
        <h3 className="max-w-[240px] text-[clamp(1.5rem,1.68vw,1.9rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#f0eee8] max-md:text-[1.5rem]">Website &amp;<br />Mobile Design</h3>
        <SplitRingMotif />
        <p className="absolute bottom-[3.45svh] left-[4.8vw] max-w-[255px] text-[11px] font-normal leading-[1.3] tracking-[-0.015em] text-[#d7d6d1] max-md:static max-md:mt-8 max-md:max-w-[310px]">High-quality website and app experiences designed to attract users and keep them coming back.</p>
      </article>

      <article data-service-card="web" className="absolute left-[2.5vw] top-[108%] h-[25svh] min-h-[236px] w-[25.5vw] min-w-[360px] -translate-y-1/2 bg-[rgba(6,11,16,0.27)] px-[2.15vw] py-[3.8svh] opacity-0 backdrop-blur-[1px] will-change-[top,transform,opacity] max-md:hidden">
        <h3 className="max-w-[220px] text-[clamp(1.55rem,1.72vw,1.95rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#f0eee8]">Web<br />Development</h3>
        <ConcentricCircleMotif />
        <p className="absolute bottom-[3.4svh] left-[2.15vw] max-w-[260px] text-[11px] font-normal leading-[1.3] tracking-[-0.015em] text-[#d7d6d1]">Custom web development delivered with a product-focused, design-conscious approach.</p>
      </article>

      <article data-service-card="wordpress" className="absolute right-[2.5vw] top-[-18%] h-[25svh] min-h-[236px] w-[25.5vw] min-w-[360px] -translate-y-1/2 bg-[rgba(6,11,16,0.27)] px-[2.15vw] py-[3.8svh] opacity-0 backdrop-blur-[1px] will-change-[top,transform,opacity] max-md:hidden">
        <h3 className="max-w-[240px] text-[clamp(1.5rem,1.68vw,1.9rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#f0eee8]">WordPress<br />Development</h3>
        <WordPressMotif />
        <p className="absolute bottom-[3.4svh] left-[2.15vw] max-w-[265px] text-[11px] font-normal leading-[1.3] tracking-[-0.015em] text-[#d7d6d1]">WordPress development focused on performance, clarity, and experiences that convert visitors into loyal users.</p>
      </article>
    </div>
  );
}

function ServicesFooter() {
  return (
    <>
      <p className="absolute bottom-[7.2svh] left-1/2 z-[6] -translate-x-1/2 whitespace-nowrap text-[10px] font-normal uppercase leading-none tracking-[-0.02em] text-[#e6e4df] max-md:bottom-[9svh] max-md:text-[9px]">✦ Different disciplines. One standard of craft.</p>
      <a href="/services" className="group absolute bottom-[6.55svh] right-[2.1vw] z-[6] flex w-[214px] items-center justify-between border-b border-white/38 pb-[8px] font-mono text-[10px] uppercase leading-none tracking-[-0.02em] text-[#eceae4] max-md:right-5 max-md:w-[150px] max-md:text-[9px]">
        <span>View services</span><span className="transition-transform duration-300 group-hover:translate-x-[5px]">→</span>
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
    const observer = new IntersectionObserver(([entry]) => canvasManager.setActive(scene.id, entry.isIntersecting), { rootMargin: "25% 0px" });
    observer.observe(section);

    return () => {
      observer.disconnect();
      sceneRef.current = null;
      unregister();
    };
  }, []);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const words = Array.from(section.querySelectorAll<HTMLElement>("[data-service-word]"));
    const chars = Array.from(section.querySelectorAll<HTMLElement>("[data-service-char]"));
    const wordStack = section.querySelector<HTMLElement>("[data-services-dark-words]");
    const detailStage = section.querySelector<HTMLElement>("[data-service-detail-stage]");
    const aiCard = section.querySelector<HTMLElement>('[data-service-card="ai"]');
    const websiteCard = section.querySelector<HTMLElement>('[data-service-card="website"]');
    const webCard = section.querySelector<HTMLElement>('[data-service-card="web"]');
    const wordpressCard = section.querySelector<HTMLElement>('[data-service-card="wordpress"]');
    const smokeLayers = Array.from(section.querySelectorAll<HTMLElement>("[data-services-smoke]"));

    if (words.length !== SERVICE_WORDS.length || !wordStack || !detailStage || !aiCard || !websiteCard || !webCard || !wordpressCard) return;

    const aiMotifs = Array.from(aiCard.querySelectorAll<HTMLElement>("[data-service-detail-motif]"));
    const websiteMotifs = Array.from(websiteCard.querySelectorAll<HTMLElement>("[data-service-detail-motif]"));
    const webMotifs = Array.from(webCard.querySelectorAll<HTMLElement>("[data-service-detail-motif]"));
    const wordpressMotifs = Array.from(wordpressCard.querySelectorAll<HTMLElement>("[data-service-detail-motif]"));

    const themeTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom top",
      onEnter: () => { document.documentElement.dataset.pageTheme = "dark"; },
      onEnterBack: () => { document.documentElement.dataset.pageTheme = "dark"; },
      onLeaveBack: () => { document.documentElement.dataset.pageTheme = "light"; },
    });

    gsap.set(chars, { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, autoAlpha: 1 });
    gsap.set(detailStage, { autoAlpha: 0 });
    gsap.set([aiCard, websiteCard, webCard, wordpressCard], { autoAlpha: 0 });
    gsap.set([...aiMotifs, ...websiteMotifs, ...webMotifs, ...wordpressMotifs], { scale: 0.9, autoAlpha: 0 });
    gsap.set(smokeLayers, { transformOrigin: "50% 50%" });

    const smokeTimeline = gsap.timeline({ paused: true });
    if (smokeLayers[0]) smokeTimeline.fromTo(smokeLayers[0], { xPercent: -4, yPercent: 2, scale: 1.1, rotation: -1.5 }, { xPercent: 5, yPercent: -3, scale: 1.18, rotation: 1.2, ease: "none", duration: 1 }, 0);
    if (smokeLayers[1]) smokeTimeline.fromTo(smokeLayers[1], { xPercent: 5, yPercent: -2, scale: 1.06, rotation: 1.2 }, { xPercent: -6, yPercent: 4, scale: 1.16, rotation: -1, ease: "none", duration: 1 }, 0);
    if (smokeLayers[2]) smokeTimeline.fromTo(smokeLayers[2], { xPercent: -2, yPercent: 3, scale: 1.02 }, { xPercent: 3, yPercent: -4, scale: 1.12, ease: "none", duration: 1 }, 0);

    const introTimeline = gsap.timeline({ paused: true });
    introTimeline.to(wordStack, { scale: 0.99, duration: SERVICES_SCROLL_PHASES.intro.end, ease: "none" }, 0);

    words.forEach((word, wordIndex) => {
      const wordChars = Array.from(word.querySelectorAll<HTMLElement>("[data-service-char]"));
      wordChars.forEach((char, charIndex) => {
        const vector = SCATTER_VECTORS[(wordIndex * 5 + charIndex) % SCATTER_VECTORS.length];
        const depthFactor = 0.92 + wordIndex * 0.045;
        const staggerOffset = wordIndex * 0.012 + charIndex * 0.0025;
        introTimeline.to(char, {
          xPercent: vector.x * depthFactor,
          yPercent: vector.y * depthFactor,
          rotation: vector.r,
          scale: vector.s,
          autoAlpha: 0.34 + ((charIndex + wordIndex) % 4) * 0.11,
          duration: 0.16,
          ease: "power1.inOut",
        }, SERVICES_SCROLL_PHASES.breakup.start + staggerOffset);
      });
    });

    introTimeline.to(wordStack, { scale: 0.965, duration: 0.1, ease: "none" }, SERVICES_SCROLL_PHASES.transition.start);
    introTimeline.to(chars, { autoAlpha: 0, scale: 0.52, duration: 0.08, stagger: { each: 0.002, from: "random" }, ease: "power1.in" }, 0.41);
    introTimeline.to(wordStack, { autoAlpha: 0, duration: 0.04, ease: "none" }, 0.47);
    introTimeline.to({}, { duration: 0.5 }, 0.5);

    const progressTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const state = getServicesScrollState(self.progress);
        const detailVisible = state.detailA;

        section.dataset.servicesPhase = state.phase;
        section.style.setProperty("--services-progress", state.master.toFixed(4));
        section.style.setProperty("--services-detail-a", state.detailA.toFixed(4));
        section.style.setProperty("--services-detail-b", state.detailB.toFixed(4));
        section.style.setProperty("--services-detail-c", state.detailC.toFixed(4));
        section.style.setProperty("--services-final", state.final.toFixed(4));

        introTimeline.progress(state.master, false);
        smokeTimeline.progress(state.master, false);
        sceneRef.current?.setProgress(mapMasterToSceneProgress(state.master));

        gsap.set(detailStage, { autoAlpha: detailVisible });

        const aiTopAfterDetailB = mix(57.5, 27, state.detailB);
        const aiTop = mix(aiTopAfterDetailB, 24, state.final);
        gsap.set(aiCard, {
          top: `${aiTop}%`,
          left: `${mix(9.8, 10.8, state.final)}vw`,
          xPercent: mix(-7, 0, state.detailA),
          scale: mix(1, 0.96, state.final),
          autoAlpha: state.detailA,
        });

        const websiteTopAfterDetailB = mix(45.5, 76, state.detailB);
        const websiteTop = mix(websiteTopAfterDetailB, 79, state.final);
        gsap.set(websiteCard, {
          top: `${websiteTop}%`,
          right: `${mix(6.6, 5.2, state.final)}vw`,
          xPercent: mix(7, 0, state.detailA),
          scale: mix(1, 0.96, state.final),
          autoAlpha: state.detailA,
        });

        const webTop = mix(108, 77, state.detailB);
        gsap.set(webCard, {
          top: `${mix(webTop, 78, state.final)}%`,
          left: `${mix(2.5, 2.6, state.final)}vw`,
          xPercent: mix(-5, 0, state.detailB),
          scale: mix(1, 0.98, state.final),
          autoAlpha: state.detailB,
        });

        const wordpressTop = mix(-18, 26, state.detailC);
        gsap.set(wordpressCard, {
          top: `${mix(wordpressTop, 24, state.final)}%`,
          right: `${mix(2.5, 2.6, state.final)}vw`,
          xPercent: mix(5, 0, state.detailC),
          scale: mix(1, 0.98, state.final),
          autoAlpha: state.detailC,
        });

        gsap.set([...aiMotifs, ...websiteMotifs], { scale: mix(0.9, 1, state.detailA), autoAlpha: state.detailA * 0.68 });
        gsap.set(webMotifs, { scale: mix(0.9, 1, state.detailB), autoAlpha: state.detailB * 0.7 });
        gsap.set(wordpressMotifs, { scale: mix(0.9, 1, state.detailC), autoAlpha: state.detailC * 0.72 });
      },
    });

    return () => {
      themeTrigger.kill();
      progressTrigger.kill();
      smokeTimeline.kill();
      introTimeline.kill();
      delete section.dataset.servicesPhase;
      section.style.removeProperty("--services-progress");
      section.style.removeProperty("--services-detail-a");
      section.style.removeProperty("--services-detail-b");
      section.style.removeProperty("--services-detail-c");
      section.style.removeProperty("--services-final");
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} data-home-services-showcase data-services-phase="intro" className="relative z-[54] h-[700svh] bg-[#05090d] text-[#efede6]">
      <div className="sticky top-0 h-[100svh] min-h-[720px] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 18% 47%, rgba(126,137,142,.28) 0%, rgba(52,62,68,.15) 32%, transparent 61%), radial-gradient(ellipse at 78% 36%, rgba(62,74,82,.38) 0%, rgba(6,12,17,.13) 43%, transparent 70%), linear-gradient(112deg, #020609 0%, #0d151b 42%, #020609 100%)" }} />
        <div data-services-smoke aria-hidden="true" className="absolute -inset-[18%] opacity-80 will-change-transform" style={{ background: "radial-gradient(ellipse at 15% 48%, rgba(225,230,227,.31) 0%, rgba(142,152,154,.21) 14%, rgba(67,76,81,.11) 29%, transparent 53%), radial-gradient(ellipse at 34% 27%, rgba(207,213,210,.24) 0%, rgba(88,98,103,.15) 21%, transparent 47%), radial-gradient(ellipse at 30% 77%, rgba(190,199,198,.17) 0%, rgba(69,79,84,.07) 26%, transparent 43%)", filter: "blur(30px)" }} />
        <div data-services-smoke aria-hidden="true" className="absolute -inset-[20%] opacity-75 will-change-transform" style={{ background: "radial-gradient(ellipse at 79% 38%, rgba(211,218,216,.19) 0%, rgba(78,89,95,.17) 21%, rgba(25,33,39,.08) 36%, transparent 49%), radial-gradient(ellipse at 66% 71%, rgba(178,188,191,.21) 0%, rgba(67,78,84,.12) 25%, transparent 52%), radial-gradient(ellipse at 94% 24%, rgba(122,133,137,.15) 0%, transparent 36%)", filter: "blur(38px)" }} />
        <div data-services-smoke aria-hidden="true" className="absolute -inset-[14%] opacity-70 will-change-transform" style={{ background: "radial-gradient(ellipse at 48% 42%, rgba(236,237,231,.15) 0%, rgba(121,130,133,.1) 20%, transparent 41%), radial-gradient(ellipse at 52% 78%, rgba(196,202,198,.13) 0%, rgba(73,82,86,.06) 22%, transparent 39%), radial-gradient(ellipse at 7% 73%, rgba(158,168,171,.14) 0%, transparent 35%)", filter: "blur(24px)" }} />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,3,6,.32) 0%, transparent 23%, transparent 67%, rgba(0,2,5,.64) 100%), radial-gradient(ellipse at center, transparent 29%, rgba(0,0,0,.58) 100%), radial-gradient(ellipse at 72% 26%, rgba(0,0,0,.22) 0%, transparent 36%), radial-gradient(ellipse at 26% 72%, rgba(0,0,0,.18) 0%, transparent 34%)" }} />

        <ServiceDetailCards />
        <canvas ref={canvasRef} data-services-canvas aria-hidden="true" className="pointer-events-none absolute inset-0 z-[4] h-full w-full" />
        <p className="absolute left-1/2 top-[10.8svh] z-[6] -translate-x-1/2 whitespace-nowrap text-[11px] font-normal uppercase leading-none tracking-[-0.018em] text-[#eceae4] max-md:top-[12svh] max-md:text-[10px]">Our services</p>
        <div data-services-dark-words className="absolute left-1/2 top-[53%] z-[5] w-[86vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase will-change-transform">
          <div className="text-[clamp(6rem,8.7vw,9.7rem)] font-normal leading-[0.715] tracking-[-0.073em] max-md:text-[clamp(3.4rem,14vw,6rem)] max-md:leading-[0.78] max-md:tracking-[-0.055em]">
            {SERVICE_WORDS.map((word, index) => <WordChars key={word} word={word} wordIndex={index} />)}
          </div>
        </div>
        <ServicesFooter />
      </div>
    </section>
  );
}
