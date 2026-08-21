"use client";

import { useRef } from "react";

import { ScrollTrigger, useGSAP } from "@/lib/gsap/client";

const SERVICE_WORDS = ["A.I.", "Design", "Development", "Branding"] as const;

function StoneSlab() {
  return (
    <div
      data-services-stone
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[34%] z-[2] h-[31vw] max-h-[455px] min-h-[300px] w-[28vw] min-w-[285px] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg]"
    >
      <div
        className="absolute inset-0 overflow-hidden shadow-[0_42px_90px_rgba(0,0,0,0.58)]"
        style={{
          clipPath:
            "polygon(9% 5%, 78% 0%, 96% 12%, 100% 72%, 86% 96%, 20% 100%, 4% 86%, 0% 19%)",
          background:
            "radial-gradient(circle at 34% 20%, rgba(238,235,226,.94) 0%, rgba(180,179,174,.9) 17%, transparent 38%), radial-gradient(circle at 72% 74%, rgba(31,34,36,.96) 0%, rgba(67,68,67,.92) 34%, transparent 64%), linear-gradient(142deg, #c8c6c0 0%, #858582 31%, #3c3f41 65%, #171b20 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-70 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, rgba(255,255,255,.42) 0 1px, transparent 1.7px), radial-gradient(circle at 72% 64%, rgba(0,0,0,.65) 0 1px, transparent 1.8px), radial-gradient(circle at 45% 78%, rgba(255,255,255,.24) 0 1px, transparent 1.6px)",
            backgroundSize: "17px 19px, 23px 21px, 29px 31px",
          }}
        />
        <div className="absolute inset-[5%] border border-white/5" />
      </div>
    </div>
  );
}

function ServicesFooter() {
  return (
    <>
      <p className="absolute bottom-[7.2svh] left-1/2 z-[5] -translate-x-1/2 whitespace-nowrap text-[10px] font-normal uppercase leading-none tracking-[-0.02em] text-[#e6e4df] max-md:bottom-[9svh] max-md:text-[9px]">
        ✦ Different disciplines. One standard of craft.
      </p>

      <a
        href="/services"
        className="group absolute bottom-[6.55svh] right-[2.1vw] z-[5] flex w-[214px] items-center justify-between border-b border-white/38 pb-[8px] font-mono text-[10px] uppercase leading-none tracking-[-0.02em] text-[#eceae4] max-md:right-5 max-md:w-[150px] max-md:text-[9px]"
      >
        <span>View services</span>
        <span className="transition-transform duration-300 group-hover:translate-x-[5px]">→</span>
      </a>
    </>
  );
}

export function HomeServicesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const setDarkTheme = () => {
        document.documentElement.dataset.pageTheme = "dark";
      };

      const restoreLightTheme = () => {
        document.documentElement.dataset.pageTheme = "light";
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        end: "bottom top",
        onEnter: setDarkTheme,
        onEnterBack: setDarkTheme,
        onLeaveBack: restoreLightTheme,
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-home-services-showcase
      className="relative z-[54] h-[100svh] min-h-[720px] overflow-hidden bg-[#0b1015] text-[#efede6]"
    >
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

      <p className="absolute left-1/2 top-[10.8svh] z-[5] -translate-x-1/2 whitespace-nowrap text-[11px] font-normal uppercase leading-none tracking-[-0.018em] text-[#eceae4] max-md:top-[12svh] max-md:text-[10px]">
        Our services
      </p>

      <StoneSlab />

      <div
        data-services-dark-words
        className="absolute left-1/2 top-[53%] z-[4] w-[86vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase"
      >
        <div className="text-[clamp(6rem,8.7vw,9.7rem)] font-normal leading-[0.715] tracking-[-0.073em] max-md:text-[clamp(3.4rem,14vw,6rem)] max-md:leading-[0.78] max-md:tracking-[-0.055em]">
          {SERVICE_WORDS.map((word) => (
            <div key={word}>{word}</div>
          ))}
        </div>
      </div>

      <ServicesFooter />
    </section>
  );
}
