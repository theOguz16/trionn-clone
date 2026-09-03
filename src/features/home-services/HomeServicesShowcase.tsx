"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  gsap,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap/client";

import {
  canvasManager,
} from "@/runtime/canvas/CanvasManager";

import {
  ServicesScene,
} from "./ServicesScene";

import {
  getServicesScrollState,
  mapMasterToSceneProgress,
} from "./servicesScrollState";

import {
  ServicesContent,
} from "@/features/home-work/HomeSelectedWork";

const SERVICE_WORDS = [
  "A.I.",
  "Design",
  "Development",
  "Branding",
] as const;

/*
 * ====================================================
 * REFERENCE-LOCKED BREAKUP
 * ====================================================
 *
 * Artık modulo/random scatter yok.
 *
 * 29 glyph'in HER BİRİ için
 * ayrı koordinat var.
 *
 * Koordinatlar headline'ın başlangıç
 * pozisyonuna göre vw/vh offset.
 *
 * flat indices:
 *
 * 00-03 A.I.
 * 04-09 DESIGN
 * 10-20 DEVELOPMENT
 * 21-28 BRANDING
 */
const SCATTER_LAYOUT = [
  /*
   * STEP 5 — BREAKUP COMPOSITION
   *
   * Referanstaki yakın/uzak derinlik katmanları deterministic.
   * Birkaç glyph kontrollü olarak viewport dışına taşar.
   */

  // A.I.
  { x: -42, y: -18, r: -58, s: 1.42, a: 0.92 },
  { x: 4, y: -47, r: 18, s: 0.4, a: 0.64 },
  { x: 26, y: -43, r: 82, s: 0.78, a: 0.94 },
  { x: -8, y: -30, r: 0, s: 0.3, a: 0.58 },

  // DESIGN
  { x: -48, y: 3, r: -66, s: 1.85, a: 0.97 },
  { x: -27, y: -6, r: -22, s: 0.82, a: 0.84 },
  { x: -18, y: -18, r: 54, s: 0.94, a: 0.9 },
  { x: 9, y: -25, r: 28, s: 0.52, a: 0.74 },
  { x: 31, y: -13, r: 74, s: 1.2, a: 0.94 },
  { x: 49, y: 4, r: -82, s: 1.42, a: 0.96 },

  // DEVELOPMENT
  { x: -51, y: 14, r: 97, s: 1.6, a: 0.96 },
  { x: -35, y: 26, r: -18, s: 0.86, a: 0.82 },
  { x: -24, y: 12, r: 48, s: 0.74, a: 0.8 },
  { x: -14, y: 32, r: -55, s: 0.68, a: 0.76 },
  { x: -4, y: 4, r: 88, s: 0.58, a: 0.7 },
  { x: 13, y: 20, r: 32, s: 0.72, a: 0.78 },

  /*
   * Sağ alt foreground P, referansta viewport crop'unu taşıyor.
   */
  { x: 31, y: 35, r: 3, s: 4.6, a: 0.99 },

  { x: 2, y: 31, r: 104, s: 0.72, a: 0.76 },
  { x: 28, y: 8, r: -44, s: 0.86, a: 0.82 },
  { x: 48, y: -2, r: 14, s: 1.18, a: 0.92 },
  { x: 44, y: 24, r: -74, s: 0.88, a: 0.82 },

  // BRANDING
  { x: -43, y: 37, r: 28, s: 1.62, a: 0.94 },
  { x: -29, y: 43, r: -52, s: 0.8, a: 0.76 },
  { x: -18, y: 34, r: 24, s: 0.88, a: 0.84 },
  { x: 12, y: 41, r: -36, s: 0.82, a: 0.82 },
  { x: 32, y: 36, r: 61, s: 1.16, a: 0.9 },
  { x: 37, y: 6, r: 104, s: 0.54, a: 0.7 },
  { x: 20, y: 42, r: -69, s: 0.82, a: 0.78 },
  { x: 52, y: 18, r: 17, s: 1.34, a: 0.94 },
] as const;

const WORD_OFFSETS = [
  0,
  4,
  10,
  21,
] as const;

function clamp01(value: number) {
  return Math.min(
    1,
    Math.max(0, value),
  );
}

function smoothRange(
  value: number,
  start: number,
  end: number,
) {
  const t =
    clamp01(
      (value - start) /
        (end - start),
    );

  return t * t * (3 - 2 * t);
}

function mix(
  from: number,
  to: number,
  progress: number,
) {
  return (
    from +
    (to - from) *
      progress
  );
}

type MotionKeyframe = {
  at: number;
  value: number;
};

function valueAtKeyframes(
  progress: number,
  keyframes: readonly MotionKeyframe[],
) {
  const first = keyframes[0];
  const last =
    keyframes[keyframes.length - 1];

  if (!first || !last) {
    return 0;
  }

  if (progress <= first.at) {
    return first.value;
  }

  for (
    let index = 1;
    index < keyframes.length;
    index += 1
  ) {
    const previous = keyframes[index - 1];
    const next = keyframes[index];

    if (progress <= next.at) {
      return mix(
        previous.value,
        next.value,
        smoothRange(
          progress,
          previous.at,
          next.at,
        ),
      );
    }
  }

  return last.value;
}

function windowVisibilityFromTravel(
  value: number,
  start: number,
  end: number,
) {
  const entrance =
    smoothRange(
      value,
      start,
      start + 0.12,
    );

  const exit =
    1 -
    smoothRange(
      value,
      end - 0.12,
      end,
    );

  return Math.min(
    entrance,
    exit,
  );
}

function WordChars({
  word,
  wordIndex,
}: {
  word: string;
  wordIndex: number;
}) {
  return (
    <div
      data-service-word
      data-service-word-index={wordIndex}
      className="whitespace-nowrap"
    >
      {word
        .split("")
        .map(
          (
            char,
            charIndex,
          ) => (
            <span
              key={`${word}-${charIndex}`}
              data-service-char
              data-service-char-index={
                charIndex
              }
              className="relative inline-block origin-center will-change-transform"
            >
              {char === " "
                ? "\u00a0"
                : char}
            </span>
          ),
        )}
    </div>
  );
}

/*
 * ====================================================
 * MOTIFS
 * ====================================================
 */

function VerticalLines() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-[9%] top-[15%] flex h-[82px] gap-[6px] opacity-55"
    >
      {Array.from({
        length: 9,
      }).map(
        (_, index) => (
          <span
            key={index}
            className="h-full w-px bg-white/48"
          />
        ),
      )}
    </div>
  );
}

function SplitRings() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-[6%] top-[14%] h-[90px] w-[110px] overflow-hidden opacity-58"
    >
      {Array.from({
        length: 5,
      }).map(
        (_, index) => {
          const size =
            34 +
            index * 15;

          return (
            <span
              key={`l-${index}`}
              className="absolute rounded-full border border-white/48"
              style={{
                width: size,
                height: size,

                left:
                  -18 -
                  index * 7,

                top:
                  45 -
                  size / 2,
              }}
            />
          );
        },
      )}

      {Array.from({
        length: 5,
      }).map(
        (_, index) => {
          const size =
            34 +
            index * 15;

          return (
            <span
              key={`r-${index}`}
              className="absolute rounded-full border border-white/48"
              style={{
                width: size,
                height: size,

                right:
                  -18 -
                  index * 7,

                top:
                  45 -
                  size / 2,
              }}
            />
          );
        },
      )}
    </div>
  );
}

function CircleRings() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-[9%] top-[15%] h-[88px] w-[88px] opacity-58"
    >
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <span
            key={index}
            className="absolute rounded-full border border-white/48"
            style={{
              inset:
                index * 9,
            }}
          />
        ),
      )}
    </div>
  );
}

function WordPressRings() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-[8%] top-[13%] h-[92px] w-[92px] opacity-58"
    >
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <span
            key={index}
            className="absolute rounded-[34%] border border-white/48"
            style={{
              inset:
                index * 8,

              borderLeftColor:
                "transparent",

              transform:
                `rotate(${index * 5 - 8}deg)`,
            }}
          />
        ),
      )}
    </div>
  );
}

function NestedSquares() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-[9%] top-[13%] h-[88px] w-[88px] opacity-60"
    >
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <span
            key={index}
            className="absolute border border-white/50"
            style={{
              inset:
                index * 9,
            }}
          />
        ),
      )}
    </div>
  );
}

function BrandingLines() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-[8%] top-[14%] flex h-[86px] w-[92px] flex-col items-center justify-center gap-[6px] opacity-60"
    >
      {Array.from({
        length: 9,
      }).map(
        (_, index) => {
          const distance =
            Math.abs(
              index - 4,
            );

          return (
            <span
              key={index}
              className="block h-px bg-white/50"
              style={{
                width:
                  70 -
                  distance * 8,
              }}
            />
          );
        },
      )}
    </div>
  );
}

/*
 * ====================================================
 * CARDS
 * ====================================================
 */

type ServiceCardProps = {
  id: string;
  title: ReactNode;
  description: string;
  positionClass: string;
  motif: ReactNode;
  sizeClass?: string;
};

function ServiceCard({
  id,
  title,
  description,
  positionClass,
  motif,
  sizeClass = "w-[26vw] min-w-[360px]",
}: ServiceCardProps) {
  return (
    <article
      data-service-card={id}
      className={`
        absolute
        h-[25svh]
        min-h-[235px]
        bg-[rgba(3,7,9,0.76)]
        px-[2.1vw]
        py-[3.7svh]
        opacity-0
        backdrop-blur-[1px]
        will-change-[transform,opacity]
        ${positionClass}
        ${sizeClass}
      `}
    >
      <h3
        data-service-card-title
        className="max-w-[270px] text-[clamp(1.625rem,1.82vw,1.9375rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#eeeae4]"
      >
        {title}
      </h3>

      {motif}

      <p
        data-service-card-description
        className="absolute bottom-[3.35svh] left-[2.1vw] max-w-[310px] text-[clamp(15px,1.05vw,17px)] font-normal leading-[1.24] tracking-[-0.02em] text-[#cbc9c4]"
      >
        {description}
      </p>
    </article>
  );
}

function ServiceDetailStage() {
  return (
    <div
      data-service-detail-stage
      className="pointer-events-none absolute inset-0 z-[3] opacity-0"
    >
      <ServiceCard
        id="ai"
        positionClass="left-0 top-0"
        sizeClass="w-[32.4vw] min-w-[410px]"
        title={
          <>
            AI &amp; Intelligent
            <br />
            Automation
          </>
        }
        description="AI-powered solutions designed to enhance products, automate workflows, and unlock smarter digital experiences."
        motif={<VerticalLines />}
      />

      <ServiceCard
        id="website"
        positionClass="right-0 top-0"
        sizeClass="w-[32.4vw] min-w-[410px]"
        title={
          <>
            Website &amp;
            <br />
            Mobile Design
          </>
        }
        description="High-quality website and app experiences designed to attract users and keep them coming back."
        motif={<SplitRings />}
      />

      <ServiceCard
        id="web"
        positionClass="left-[9.2vw] top-0"
        title={
          <>
            Web
            <br />
            Development
          </>
        }
        description="Custom web development delivered with a product-focused, design-conscious approach."
        motif={<CircleRings />}
      />

      <ServiceCard
        id="wordpress"
        positionClass="right-[8.5vw] top-0"
        title={
          <>
            WordPress
            <br />
            Development
          </>
        }
        description="WordPress development focused on performance, clarity, and experiences that convert visitors into loyal users."
        motif={<WordPressRings />}
      />

      <ServiceCard
        id="product"
        positionClass="left-[9.2vw] top-0"
        title={
          <>
            Product
            <br />
            Design
          </>
        }
        description="Thoughtful product design that captures attention, deepens engagement, and builds lasting loyalty."
        motif={<NestedSquares />}
      />

      <ServiceCard
        id="branding"
        positionClass="right-[8.5vw] top-0"
        title="Branding"
        description="Impactful branding positions startups for success through credibility, clarity, and lasting loyalty."
        motif={<BrandingLines />}
      />
    </div>
  );
}

function ServicesFooter() {
  return (
    <>
      <p
        data-services-footer-copy
        className="absolute bottom-[10svh] left-1/2 z-[7] -translate-x-1/2 whitespace-nowrap text-[10px] font-normal uppercase leading-none tracking-[-0.02em] text-[#dfddd7]"
      >
        ✦ Different disciplines. One standard of craft.
      </p>

      <a
        data-services-footer-cta
        href="/services"
        className="group absolute bottom-[9.3svh] right-[2.1vw] z-[7] flex w-[214px] items-center justify-between border-b border-white/32 pb-[8px] font-mono text-[10px] uppercase leading-none tracking-[-0.02em] text-[#e7e5df]"
      >
        <span>
          View services
        </span>

        <span className="transition-transform duration-300 group-hover:translate-x-[5px]">
          →
        </span>
      </a>
    </>
  );
}

export function HomeServicesShowcase() {
  const sectionRef =
    useRef<HTMLElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const sceneRef =
    useRef<ServicesScene | null>(
      null,
    );

  const latestSceneProgressRef =
    useRef(0);

  useEffect(() => {
    const section =
      sectionRef.current;

    const canvas =
      canvasRef.current;

    if (
      !section ||
      !canvas
    ) {
      return;
    }

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
    ) {
      return;
    }

    let unregister:
      (() => void) | null = null;

    const ensureScene = () => {
      if (sceneRef.current) {
        return sceneRef.current;
      }

      const scene =
        new ServicesScene(canvas);

      scene.setProgress(
        latestSceneProgressRef.current,
      );

      sceneRef.current = scene;
      section.dataset.servicesSceneReady =
        "true";

      unregister =
        canvasManager.register(
          scene,
          false,
        );

      return scene;
    };

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            ensureScene();
          }

          const scene =
            sceneRef.current;

          if (!scene) {
            return;
          }

          const exitComplete =
            Number(
              section.style.getPropertyValue(
                "--services-exit-e",
              ) || "0",
            ) >= 0.999;

          canvasManager.setActive(
            scene.id,
            entry.isIntersecting &&
              !exitComplete,
          );
        },

        {
          rootMargin:
            "100% 0px",
        },
      );

    observer.observe(section);

    return () => {
      observer.disconnect();

      sceneRef.current = null;

      delete section.dataset.servicesSceneReady;

      unregister?.();
    };
  }, []);

  useGSAP(
    () => {
      const section =
        sectionRef.current;

      if (!section) {
        return;
      }

      const wordStack =
        section.querySelector<HTMLElement>(
          "[data-services-dark-words]",
        );

      const words =
        Array.from(
          section.querySelectorAll<HTMLElement>(
            "[data-service-word]",
          ),
        );

      const chars =
        Array.from(
          section.querySelectorAll<HTMLElement>(
            "[data-service-char]",
          ),
        );

      const detailStage =
        section.querySelector<HTMLElement>(
          "[data-service-detail-stage]",
        );

      const ai =
        section.querySelector<HTMLElement>(
          '[data-service-card="ai"]',
        );

      const website =
        section.querySelector<HTMLElement>(
          '[data-service-card="website"]',
        );

      const web =
        section.querySelector<HTMLElement>(
          '[data-service-card="web"]',
        );

      const wordpress =
        section.querySelector<HTMLElement>(
          '[data-service-card="wordpress"]',
        );

      const product =
        section.querySelector<HTMLElement>(
          '[data-service-card="product"]',
        );

      const branding =
        section.querySelector<HTMLElement>(
          '[data-service-card="branding"]',
        );

      const smokeLayers =
        Array.from(
          section.querySelectorAll<HTMLElement>(
            "[data-services-smoke]",
          ),
        );

      if (
        !wordStack ||
        !detailStage ||
        !ai ||
        !website ||
        !web ||
        !wordpress ||
        !product ||
        !branding
      ) {
        return;
      }

      const themeTrigger =
        ScrollTrigger.create({
          trigger: section,

          start:
            "top 70%",

          end:
            "bottom top",

          onEnter: () => {
            document.documentElement.dataset.pageTheme =
              "dark";
          },

          onEnterBack: () => {
            document.documentElement.dataset.pageTheme =
              "dark";
          },

          onLeaveBack: () => {
            document.documentElement.dataset.pageTheme =
              "light";
          },

          onLeave: () => {
            document.documentElement.dataset.pageTheme =
              "light";
          },
        });

      gsap.set(
        chars,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
        },
      );

      gsap.set(
        wordStack,
        {
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          autoAlpha: 1,
        },
      );

      gsap.set(
        detailStage,
        {
          autoAlpha: 0,
        },
      );

      gsap.set(
        [
          ai,
          website,
          web,
          wordpress,
          product,
          branding,
        ],
        {
          autoAlpha: 0,
          yPercent: -50,
          x: 0,
          y: 0,
        },
      );

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

      if (reducedMotion) {
        const reducedMobile =
          window.innerWidth < 768;

        section.dataset.servicesPhase =
          reducedMobile
            ? "pairA"
            : "intro";

        if (reducedMobile) {
          section.dataset.servicesReduced =
            "true";
        }

        latestSceneProgressRef.current =
          0;
        sceneRef.current?.setProgress(0);

        if (reducedMobile) {
          gsap.set(wordStack, {
            autoAlpha: 0,
          });

          gsap.set(detailStage, {
            autoAlpha: 1,
          });

          gsap.set(
            [
              ai,
              website,
              web,
              wordpress,
              product,
              branding,
            ],
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              yPercent: 0,
            },
          );
        }

        gsap.set(smokeLayers, {
          xPercent: 0,
          yPercent: 0,
          scale: 1,
          autoAlpha: 0.58,
        });

        return () => {
          themeTrigger.kill();
          delete section.dataset.servicesPhase;
          delete section.dataset.servicesReduced;
        };
      }

      /*
       * ==============================================
       * TYPOGRAPHY
       * ==============================================
       */

      const textTimeline =
        gsap.timeline({
          paused: true,
        });

      /*
       * Intro headline sabit.
       */
      textTimeline.to(
        wordStack,
        {
          scale: 1,
          yPercent: -50,
          duration: 0.15,
          ease: "none",
        },
        0,
      );

      /*
       * Overlap sırasında headline
       * yalnız hafif yukarı çıkıyor.
       */
      textTimeline.to(
        wordStack,
        {
          yPercent: -46,
          scale: 0.992,
          duration: 0.13,
          ease: "power1.inOut",
        },
        0.15,
      );

      /*
       * Her harf artık explicit layout.
       */
      if (window.innerWidth >= 768) {
        words.forEach(
        (
          word,
          wordIndex,
        ) => {
          const wordChars =
            Array.from(
              word.querySelectorAll<HTMLElement>(
                "[data-service-char]",
              ),
            );

          wordChars.forEach(
            (
              char,
              charIndex,
            ) => {
              const flatIndex =
                WORD_OFFSETS[
                  wordIndex
                ] +
                charIndex;

              const target =
                SCATTER_LAYOUT[
                  flatIndex
                ];

              if (!target) {
                return;
              }

              /*
               * Çok küçük stagger:
               * bütün kelime patlaması birlikte okunuyor,
               * fakat steril/senkron görünmüyor.
               */
              const delay =
                wordIndex *
                  0.0035 +
                charIndex *
                  0.0012;

              textTimeline.to(
                char,
                {
                  x:
                    `${target.x}vw`,

                  y:
                    `${target.y}vh`,

                  rotation:
                    target.r,

                  scale:
                    target.s,

                  autoAlpha:
                    target.a,

                  duration:
                    0.18,

                  ease:
                    "power2.inOut",
                },

                0.285 + delay,
              );
            },
          );
        },
        );

        /*
         * Breakup biterken temizle.
         */
        textTimeline.to(
          chars,
          {
            autoAlpha: 0,
            scale: 0.24,

            duration: 0.055,

            stagger: {
              each: 0.0013,
              from: "random",
            },

            ease: "power1.in",
          },
          0.44,
        );
      } else {
        textTimeline.to(
          wordStack,
          {
            yPercent: -72,
            scale: 0.94,
            autoAlpha: 0,
            duration: 0.18,
            ease: "power2.inOut",
          },
          0.28,
        );
      }

      textTimeline.to(
        wordStack,
        {
          autoAlpha: 0,

          duration: 0.035,

          ease: "none",
        },

        0.495,
      );

      textTimeline.to(
        {},
        {
          duration: 0.475,
        },

        0.525,
      );

      /*
       * ==============================================
       * MASTER SCROLL
       * ==============================================
       */

      const progressTrigger =
        ScrollTrigger.create({
          trigger: section,

          start:
            "top top",

          end:
            "bottom bottom",

          invalidateOnRefresh:
            true,

          onUpdate: (self) => {
            const isMobile =
              window.innerWidth < 768;

            const masterProgress =
              mapMasterToSceneProgress(
                self.progress,
                isMobile
                  ? "mobile"
                  : "desktop",
              );

            const state =
              getServicesScrollState(
                masterProgress,
              );

            const master =
              state.master;

            const entryProgress =
              isMobile
                ? smoothRange(
                    self.progress,
                    0.02,
                    0.18,
                  )
                : smoothRange(
                    self.progress,
                    0,
                    0.0832,
                  );

            section.style.setProperty(
              "--services-entry",
              entryProgress.toFixed(4),
            );

            section.dataset.servicesPhase =
              state.phase;

            section.style.setProperty(
              "--services-progress",
              master.toFixed(4),
            );

            section.style.setProperty(
              "--services-overlap",
              state.overlap.toFixed(
                4,
              ),
            );

            section.style.setProperty(
              "--services-breakup",
              state.breakup.toFixed(
                4,
              ),
            );

            section.style.setProperty(
              "--services-pair-a",
              state.pairA.toFixed(
                4,
              ),
            );

            section.style.setProperty(
              "--services-pair-b",
              state.pairB.toFixed(
                4,
              ),
            );

            section.style.setProperty(
              "--services-pair-c",
              state.pairC.toFixed(
                4,
              ),
            );

            const exitProgress =
              smoothRange(
                master,
                isMobile
                  ? 0.94
                  : 0.978,
                isMobile
                  ? 0.998
                  : 0.9996,
              );
            const isTablet =
              window.innerWidth >= 768 &&
              window.innerWidth < 1024;
            const isWide =
              window.innerWidth >= 1400;
            const exitTimelineTime =
              exitProgress *
              (isMobile
                ? 0.534
                : isTablet
                  ? 0.874
                  : isWide
                    ? 0.491
                    : 0.478);
            const exitStripes =
              Array.from(
                { length: 5 },
                (_, index) => {
                  const delay =
                    (0.3 * (4 - index)) /
                    4;
                  return clamp01(
                    (exitTimelineTime - delay) /
                      0.3,
                  );
                },
              );

            section.style.setProperty(
              "--services-exit",
              exitProgress.toFixed(4),
            );
            exitStripes.forEach(
              (value, index) => {
                section.style.setProperty(
                  `--services-exit-${String.fromCharCode(97 + index)}`,
                  value.toFixed(4),
                );
              },
            );

            if (exitStripes[3] >= 0.72) {
              section.dataset.servicesExitTheme =
                "light";
              document.documentElement.dataset.pageTheme =
                "light";
            } else if (
              section.dataset.servicesExitTheme ===
              "light"
            ) {
              delete section.dataset.servicesExitTheme;
              document.documentElement.dataset.pageTheme =
                "dark";
            }

            if (sceneRef.current) {
              canvasManager.setActive(
                sceneRef.current.id,
                exitStripes[4] < 0.999,
              );
            }

            latestSceneProgressRef.current =
              master;

            sceneRef.current?.setProgress(
              master,
            );

            textTimeline.progress(
              master,
              false,
            );

            /*
             * ==========================================
             * SMOKE
             * ==========================================
             */

            const breakupBoost =
              smoothRange(
                master,
                0.27,
                0.46,
              );

            const detailBoost =
              smoothRange(
                master,
                0.5,
                0.7,
              );

            if (smokeLayers[0]) {
              gsap.set(
                smokeLayers[0],
                {
                  xPercent:
                    mix(
                      -5,
                      5,
                      master,
                    ),

                  yPercent:
                    mix(
                      2,
                      -3,
                      master,
                    ),

                  scale:
                    1.08 +
                    breakupBoost *
                      0.12,

                  opacity:
                    0.56 +
                    breakupBoost *
                      0.21,
                },
              );
            }

            if (smokeLayers[1]) {
              gsap.set(
                smokeLayers[1],
                {
                  xPercent:
                    mix(
                      5,
                      -5,
                      master,
                    ),

                  yPercent:
                    mix(
                      -3,
                      4,
                      master,
                    ),

                  scale:
                    1.05 +
                    breakupBoost *
                      0.14,

                  opacity:
                    0.45 +
                    detailBoost *
                      0.23,
                },
              );
            }

            if (smokeLayers[2]) {
              gsap.set(
                smokeLayers[2],
                {
                  xPercent:
                    mix(
                      -2,
                      3,
                      master,
                    ),

                  yPercent:
                    mix(
                      3,
                      -4,
                      master,
                    ),

                  scale:
                    1.03 +
                    detailBoost *
                      0.08,

                  opacity:
                    0.38 +
                    breakupBoost *
                      0.17,
                },
              );
            }

            /*
             * ==========================================
             * DETAILS / TRUE VERTICAL CONVEYOR
             * ==========================================
             *
             * 1) Breakup biter.
             * 2) Stone cut fazi tamamlanir.
             * 3) Kartlar fiziksel olarak viewport'tan
             *    gecmeye baslar.
             *
             * Sol lane: AI -> Web -> Product (yukari)
             * Sag lane: Website -> WordPress -> Branding (asagi)
             */

            /*
             * CUT HOLD
             * --------
             * 0.69'da uc yontma tamam.
             * Kartlar hemen baslamiyor; Trionn'daki gibi
             * kisa bir "tamamlanmis stone" hold birakiyoruz.
             */
            const cardsStart =
              isMobile
                ? 0.56
                : 0.69;

            /*
             * DİKKAT:
             * Burada smoothRange kullanmiyoruz.
             * smoothstep orta bolgede hareketi ~1.5x hizlandiriyordu.
             * Linear progress + daha uzun section fiziksel scroll'u
             * belirgin sekilde yavaslatiyor.
             */
            const cardTravel =
              clamp01(
                (master - cardsStart) /
                  (1 - cardsStart),
              );

            const detailVisible =
              smoothRange(
                master,
                0.545,
                0.565,
              ) *
              (1 -
                smoothRange(
                  master,
                  0.91,
                  0.955,
                ));

            gsap.set(
              detailStage,
              {
                autoAlpha:
                  detailVisible,
              },
            );

            /*
             * Kart viewport'un kenarinda yumusak fade,
             * merkez bandinda uzun sure tam okunurluk.
             *
             * Onceki -18..118 bandi fazla genisti ve ayni anda
             * cok kart gorunmesine neden oluyordu.
             */
            const cardVisibility =
              (centerY: number) => {
                const enter =
                  smoothRange(
                    centerY,
                    isMobile
                      ? 11
                      : -12,
                    isMobile
                      ? 22
                      : 8,
                  );

                const leave =
                  1 -
                  smoothRange(
                    centerY,
                    isMobile
                      ? 66
                      : 92,
                    isMobile
                      ? 76
                      : 112,
                  );

                return Math.min(
                  enter,
                  leave,
                );
              };

            const placeCard = (
              card: HTMLElement,
              centerY: number,
              xFrom: number,
            ) => {
              const visibility =
                cardVisibility(
                  centerY,
                ) *
                detailVisible;

              /*
               * Kart lane boyunca kesintisiz ilerler.
               * x sadece viewport'a girerken cok hafif settle olur;
               * ana hareket tamamen dikeydir.
               */
              gsap.set(
                card,
                {
                  autoAlpha:
                    visibility,

                  y:
                    `${centerY}svh`,

                  yPercent:
                    -50,

                  x:
                    `${mix(
                      xFrom,
                      0,
                      clamp01(
                        visibility *
                          1.2,
                      ),
                    )}vw`,
                },
              );
            };

            if (isMobile) {
              const mobileCards = [
                ai,
                website,
                web,
                wordpress,
                product,
                branding,
              ];
              const mobileTravel =
                cardTravel * 312;

              mobileCards.forEach(
                (card, index) => {
                  placeCard(
                    card,
                    48 +
                      index * 52 -
                      mobileTravel,
                    0,
                  );
                },
              );

              const pairAProgress =
                windowVisibilityFromTravel(
                  cardTravel,
                  0,
                  0.36,
                );
              const pairBProgress =
                windowVisibilityFromTravel(
                  cardTravel,
                  0.3,
                  0.7,
                );
              const pairCProgress =
                windowVisibilityFromTravel(
                  cardTravel,
                  0.64,
                  1,
                );

              section.style.setProperty(
                "--services-pair-a",
                pairAProgress.toFixed(4),
              );
              section.style.setProperty(
                "--services-pair-b",
                pairBProgress.toFixed(4),
              );
              section.style.setProperty(
                "--services-pair-c",
                pairCProgress.toFixed(4),
              );

              return;
            }

            type DesktopCardMotion = {
              card: HTMLElement;
              enterStart: number;
              enterEnd: number;
              exitStart: number;
              exitEnd: number;
              xFrom: number;
              y: readonly MotionKeyframe[];
            };

            const placeDesktopCard = ({
              card,
              enterStart,
              enterEnd,
              exitStart,
              exitEnd,
              xFrom,
              y,
            }: DesktopCardMotion) => {
              const entrance =
                smoothRange(
                  cardTravel,
                  enterStart,
                  enterEnd,
                );
              const exit =
                1 -
                smoothRange(
                  cardTravel,
                  exitStart,
                  exitEnd,
                );
              const visibility =
                Math.min(
                  1,
                  Math.min(
                    entrance,
                    exit,
                  ) *
                    detailVisible *
                    1.65,
                );
              const descriptionIn =
                smoothRange(
                  cardTravel,
                  enterStart + 0.035,
                  enterEnd + 0.055,
                );
              const title =
                card.querySelector<HTMLElement>(
                  "[data-service-card-title]",
                );
              const description =
                card.querySelector<HTMLElement>(
                  "[data-service-card-description]",
                );
              const motif =
                card.querySelector<HTMLElement>(
                  ":scope > div",
                );

              gsap.set(card, {
                autoAlpha: visibility,
                y: `${valueAtKeyframes(
                  cardTravel,
                  y,
                )}svh`,
                yPercent: -50,
                x: `${mix(
                  xFrom,
                  0,
                  entrance,
                )}vw`,
              });

              gsap.set(
                [title, motif].filter(
                  Boolean,
                ),
                {
                  autoAlpha: visibility,
                  y: mix(
                    16,
                    0,
                    entrance,
                  ),
                },
              );

              if (description) {
                gsap.set(description, {
                  autoAlpha:
                    visibility *
                    descriptionIn,
                  y: mix(
                    12,
                    0,
                    descriptionIn,
                  ),
                });
              }
            };

            const desktopMotions:
              DesktopCardMotion[] = [
                {
                  card: ai,
                  enterStart: 0.03,
                  enterEnd: 0.15,
                  exitStart: 0.3,
                  exitEnd: 0.43,
                  xFrom: -7,
                  y: [
                    { at: 0, value: 118 },
                    { at: 0.16, value: 58 },
                    { at: 0.28, value: 58 },
                    { at: 0.44, value: -24 },
                  ],
                },
                {
                  card: website,
                  enterStart: 0.03,
                  enterEnd: 0.15,
                  exitStart: 0.3,
                  exitEnd: 0.43,
                  xFrom: 7,
                  y: [
                    { at: 0, value: -22 },
                    { at: 0.16, value: 42 },
                    { at: 0.28, value: 42 },
                    { at: 0.44, value: 118 },
                  ],
                },
                {
                  card: web,
                  enterStart: 0.28,
                  enterEnd: 0.42,
                  exitStart: 0.62,
                  exitEnd: 0.75,
                  xFrom: -5,
                  y: [
                    { at: 0.22, value: 116 },
                    { at: 0.43, value: 31 },
                    { at: 0.61, value: 30 },
                    { at: 0.76, value: -28 },
                  ],
                },
                {
                  card: wordpress,
                  enterStart: 0.3,
                  enterEnd: 0.44,
                  exitStart: 0.65,
                  exitEnd: 0.79,
                  xFrom: 5,
                  y: [
                    { at: 0.24, value: 118 },
                    { at: 0.45, value: 75 },
                    { at: 0.63, value: 72 },
                    { at: 0.8, value: 116 },
                  ],
                },
                {
                  card: branding,
                  enterStart: 0.3,
                  enterEnd: 0.43,
                  exitStart: 0.86,
                  exitEnd: 0.96,
                  xFrom: 5,
                  y: [
                    { at: 0.24, value: -25 },
                    { at: 0.44, value: 30 },
                    { at: 0.61, value: 32 },
                    { at: 0.82, value: 70 },
                    { at: 0.97, value: 116 },
                  ],
                },
                {
                  card: product,
                  enterStart: 0.58,
                  enterEnd: 0.72,
                  exitStart: 0.88,
                  exitEnd: 0.98,
                  xFrom: -5,
                  y: [
                    { at: 0.52, value: 115 },
                    { at: 0.73, value: 31 },
                    { at: 0.87, value: 32 },
                    { at: 0.99, value: -28 },
                  ],
                },
              ];

            desktopMotions.forEach(
              placeDesktopCard,
            );

            const pairAProgress =
              smoothRange(
                cardTravel,
                0.02,
                0.18,
              );

            const pairBProgress =
              smoothRange(
                cardTravel,
                0.27,
                0.48,
              );

            const pairCProgress =
              smoothRange(
                cardTravel,
                0.57,
                0.78,
              );

            section.style.setProperty(
              "--services-pair-a",
              pairAProgress.toFixed(4),
            );

            section.style.setProperty(
              "--services-pair-b",
              pairBProgress.toFixed(4),
            );

            section.style.setProperty(
              "--services-pair-c",
              pairCProgress.toFixed(4),
            );
          },
        });

      return () => {
        themeTrigger.kill();
        progressTrigger.kill();
        textTimeline.kill();

        delete section.dataset.servicesPhase;
        delete section.dataset.servicesExitTheme;

        [
          "--services-progress",
          "--services-entry",
          "--services-overlap",
          "--services-breakup",
          "--services-pair-a",
          "--services-pair-b",
          "--services-pair-c",
          "--services-exit",
          "--services-exit-a",
          "--services-exit-b",
          "--services-exit-c",
          "--services-exit-d",
          "--services-exit-e",
        ].forEach((property) => {
          section.style.removeProperty(
            property,
          );
        });
      };
    },

    {
      scope:
        sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      data-home-services-showcase
      data-services-phase="intro"
      className="relative z-[54] -mt-[200svh] h-[800svh] bg-transparent text-[#efede6] md:-mt-[59.57svh] md:h-[950svh] md:bg-[var(--color-bg-off-white)] lg:-mt-[52.22svh] lg:h-[950svh] min-[1400px]:-mt-[59.56svh] min-[1400px]:h-[950svh]"
    >
      <div
        data-services-sticky
        className="sticky top-0 h-[100svh] min-h-[700px] overflow-hidden bg-[var(--color-bg-deep)] md:min-h-[720px]"
      >
        <div
          data-services-entry-panel
          className="pointer-events-none absolute inset-0 z-[12] hidden overflow-hidden md:block"
          style={{
            opacity:
              "calc((1 - var(--services-entry, 0)) * 0.56)",
          }}
        >
          <ServicesContent />
        </div>

        <div
          data-services-entry-veil
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[13] hidden bg-[#858585] md:block"
          style={{
            opacity:
              "calc((1 - var(--services-entry, 0)) * 0.72)",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 18% 48%,rgba(114,125,131,.22) 0%,rgba(46,56,62,.13) 31%,transparent 61%),radial-gradient(ellipse at 80% 35%,rgba(64,74,81,.30) 0%,rgba(5,11,15,.10) 45%,transparent 72%),linear-gradient(112deg,#010406 0%,#0a1217 43%,#010406 100%)",
          }}
        />

        <div
          data-services-smoke
          aria-hidden="true"
          className="absolute -inset-[20%] will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse at 12% 44%,rgba(223,228,226,.48) 0%,rgba(140,150,153,.31) 12%,rgba(63,72,77,.20) 27%,transparent 50%),radial-gradient(ellipse at 31% 22%,rgba(190,199,199,.39) 0%,rgba(78,89,94,.23) 20%,transparent 43%),radial-gradient(ellipse at 22% 78%,rgba(180,190,191,.27) 0%,rgba(63,74,80,.14) 24%,transparent 42%)",

            filter:
              "blur(29px)",

            mixBlendMode:
              "screen",
          }}
        />

        <div
          data-services-smoke
          aria-hidden="true"
          className="absolute -inset-[22%] will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse at 83% 29%,rgba(188,198,200,.34) 0%,rgba(75,87,94,.29) 18%,rgba(17,26,32,.17) 34%,transparent 49%),radial-gradient(ellipse at 68% 73%,rgba(181,190,192,.34) 0%,rgba(60,72,79,.20) 24%,transparent 50%),radial-gradient(ellipse at 93% 52%,rgba(108,120,126,.28) 0%,transparent 36%)",

            filter:
              "blur(36px)",

            mixBlendMode:
              "screen",
          }}
        />

        <div
          data-services-smoke
          aria-hidden="true"
          className="absolute -inset-[15%] will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse at 47% 36%,rgba(220,224,220,.24) 0%,rgba(110,120,124,.19) 17%,transparent 38%),radial-gradient(ellipse at 54% 78%,rgba(183,191,190,.24) 0%,rgba(63,73,77,.12) 21%,transparent 38%),radial-gradient(ellipse at 7% 70%,rgba(150,161,165,.24) 0%,transparent 34%)",

            filter:
              "blur(23px)",

            mixBlendMode:
              "screen",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,rgba(0,3,6,.38) 0%,transparent 22%,transparent 67%,rgba(0,2,5,.74) 100%),radial-gradient(ellipse at center,transparent 29%,rgba(0,0,0,.66) 100%)",
          }}
        />

        <ServiceDetailStage />

        <canvas
          ref={canvasRef}
          data-services-canvas
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
        />

        <div
          data-services-main-ui
          className="absolute inset-0 z-[7] will-change-[opacity]"
          style={{
            opacity:
              "var(--services-entry, 0)",
          }}
        >
          <p
            data-services-label
            className="absolute left-1/2 top-[14.45svh] z-[7] -translate-x-1/2 whitespace-nowrap text-[11px] font-normal uppercase leading-none tracking-[-0.018em] text-[#e9e7e1]"
          >
            Our services
          </p>

          <div
            data-services-dark-words
            className="absolute left-1/2 top-[52%] z-[5] w-[88vw] text-center uppercase will-change-transform max-md:top-[49%] max-md:w-[calc(100vw-28px)]"
          >
            <div className="text-[clamp(5.7rem,8.26vw,9.2rem)] font-normal leading-[0.715] tracking-[-0.073em]">
              {SERVICE_WORDS.map(
                (
                  word,
                  index,
                ) => (
                  <WordChars
                    key={word}
                    word={word}
                    wordIndex={
                      index
                    }
                  />
                ),
              )}
            </div>
          </div>

          <ServicesFooter />
        </div>

        <div
          data-services-light-exit
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[20] flex flex-col overflow-hidden"
        >
          {Array.from(
            { length: 5 },
            (_, index) => (
              <div
                key={index}
                data-services-exit-stripe={index}
                className="min-h-0 flex-1 origin-bottom bg-white will-change-transform"
                style={{
                  transform: `scaleY(var(--services-exit-${String.fromCharCode(97 + index)}, 0))`,
                  marginTop:
                    index > 0
                      ? "-0.5px"
                      : undefined,
                  paddingBottom: "0.5px",
                }}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
