"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  gsap,
} from "@/lib/gsap/client";

const TOTAL_FRAMES = 371;

const EXPLODE_START = 0.35;
const EXPLODE_END = 0.53;

const CARDS_START = 0.56;
const CARDS_END = 1;

const FRAME_BATCH_SIZE = 20;

const services = [
  "AI & Intelligent Automation",
  "Website & Mobile Design",
  "Product Design",
  "Web Development",
  "WordPress Development",
  "Branding",
];

type GlyphState = {
  element: HTMLSpanElement;

  originX: number;
  originY: number;

  directionX: number;
  directionY: number;

  distance: number;
  rotation: number;
};

function clamp(
  value: number,
  min = 0,
  max = 1,
) {
  return Math.min(
    max,
    Math.max(
      min,
      value,
    ),
  );
}

function mapRange(
  value: number,
  start: number,
  end: number,
) {
  return clamp(
    (value - start) /
      (end - start),
  );
}

function seededRandom(
  seed: number,
) {
  const value =
    Math.sin(
      seed * 12.9898 +
        78.233,
    ) *
    43758.5453;

  return (
    value -
    Math.floor(
      value,
    )
  );
}

function frameUrl(
  frame: number,
) {
  return `/services/frames/frame-${String(
    frame,
  ).padStart(
    3,
    "0",
  )}.webp`;
}

function scheduleIdle(
  callback: () => void,
) {
  if (
    typeof window
      .requestIdleCallback ===
    "function"
  ) {
    return window
      .requestIdleCallback(
        callback,
        {
          timeout: 700,
        },
      );
  }

  return window.setTimeout(
    callback,
    40,
  );
}

function cancelIdle(
  id: number,
) {
  if (
    typeof window
      .cancelIdleCallback ===
    "function"
  ) {
    window.cancelIdleCallback(
      id,
    );

    return;
  }

  window.clearTimeout(
    id,
  );
}

export function ServicesSequence() {
  const sectionRef =
    useRef<HTMLElement>(
      null,
    );

  const stickyRef =
    useRef<HTMLDivElement>(
      null,
    );

  const frameRef =
    useRef<HTMLImageElement>(
      null,
    );

  const headingRef =
    useRef<HTMLDivElement>(
      null,
    );

  const glyphLayerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const cardRefs =
    useRef<
      Array<
        HTMLDivElement | null
      >
    >([]);

  const stripeRefs =
    useRef<
      Array<
        HTMLDivElement | null
      >
    >([]);

  const [
    hasFrames,
    setHasFrames,
  ] =
    useState(false);

  // --------------------------------
  // FRAME ASSET PROBE
  // --------------------------------

  useEffect(() => {
    const probe =
      new Image();

    let cancelled =
      false;

    probe.onload =
      () => {
        if (!cancelled) {
          setHasFrames(
            true,
          );
        }
      };

    probe.onerror =
      () => {
        if (!cancelled) {
          setHasFrames(
            false,
          );
        }
      };

    probe.src =
      frameUrl(0);

    return () => {
      cancelled =
        true;
    };
  }, []);

  // --------------------------------
  // FRAME PRELOAD
  // --------------------------------

  useEffect(() => {
    if (!hasFrames) {
      return;
    }

    let cursor =
      1;

    let idleId =
      0;

    let cancelled =
      false;

    const preloadBatch =
      () => {
        if (cancelled) {
          return;
        }

        const end =
          Math.min(
            cursor +
              FRAME_BATCH_SIZE,
            TOTAL_FRAMES,
          );

        for (
          let index =
            cursor;
          index < end;
          index += 1
        ) {
          const image =
            new Image();

          image.decoding =
            "async";

          image.src =
            frameUrl(
              index,
            );

          if (
            typeof image.decode ===
            "function"
          ) {
            void image
              .decode()
              .catch(
                () => {
                  // Browser cache can
                  // still use the image.
                },
              );
          }
        }

        cursor =
          end;

        if (
          cursor <
          TOTAL_FRAMES
        ) {
          idleId =
            scheduleIdle(
              preloadBatch,
            );
        }
      };

    idleId =
      scheduleIdle(
        preloadBatch,
      );

    return () => {
      cancelled =
        true;

      cancelIdle(
        idleId,
      );
    };
  }, [hasFrames]);

  // --------------------------------
  // SERVICES RUNTIME
  // --------------------------------

  useEffect(() => {
    const section =
      sectionRef.current;

    const sticky =
      stickyRef.current;

    const heading =
      headingRef.current;

    const glyphLayer =
      glyphLayerRef.current;

    if (
      !section ||
      !sticky ||
      !heading ||
      !glyphLayer
    ) {
      return;
    }

    let sectionTop =
      0;

    let scrollRange =
      1;

    let viewportWidth =
      window.innerWidth;

    let viewportHeight =
      window.innerHeight;

    let videoIndex =
      0;

    let glyphs:
      GlyphState[] = [];

    // ------------------------------
    // GLYPH MEASUREMENT
    // ------------------------------

    const measureGlyphs =
      () => {
        glyphLayer.replaceChildren();

        glyphs =
          [];

        heading.style.visibility =
          "visible";

        const stickyBounds =
          sticky.getBoundingClientRect();

        const lines =
          Array.from(
            heading.querySelectorAll<HTMLElement>(
              "[data-services-line]",
            ),
          );

        let globalIndex =
          0;

        for (
          const line of
          lines
        ) {
          const textNode =
            line.firstChild;

          if (
            !textNode ||
            textNode.nodeType !==
              Node.TEXT_NODE
          ) {
            continue;
          }

          const text =
            textNode.textContent ??
            "";

          const style =
            window.getComputedStyle(
              line,
            );

          for (
            let index = 0;
            index <
            text.length;
            index += 1
          ) {
            const character =
              text[index];

            if (
              character ===
              " "
            ) {
              globalIndex +=
                1;

              continue;
            }

            const range =
              document.createRange();

            range.setStart(
              textNode,
              index,
            );

            range.setEnd(
              textNode,
              index + 1,
            );

            const bounds =
              range.getBoundingClientRect();

            const element =
              document.createElement(
                "span",
              );

            element.textContent =
              character;

            element.style.position =
              "absolute";

            element.style.left =
              `${
                bounds.left -
                stickyBounds.left
              }px`;

            element.style.top =
              `${
                bounds.top -
                stickyBounds.top
              }px`;

            element.style.width =
              `${bounds.width}px`;

            element.style.height =
              `${bounds.height}px`;

            element.style.fontFamily =
              style.fontFamily;

            element.style.fontSize =
              style.fontSize;

            element.style.fontWeight =
              style.fontWeight;

            element.style.letterSpacing =
              style.letterSpacing;

            element.style.lineHeight =
              style.lineHeight;

            element.style.color =
              "currentColor";

            element.style.willChange =
              "transform, opacity";

            element.style.transformOrigin =
              "50% 50%";

            glyphLayer.appendChild(
              element,
            );

            const angle =
              seededRandom(
                globalIndex +
                  13,
              ) *
                Math.PI *
                2 -
              Math.PI;

            const distance =
              Math.max(
                viewportWidth,
                viewportHeight,
              ) *
              (
                0.35 +
                seededRandom(
                  globalIndex +
                    47,
                ) *
                  0.55
              );

            glyphs.push(
              {
                element,

                originX:
                  bounds.left -
                  stickyBounds.left,

                originY:
                  bounds.top -
                  stickyBounds.top,

                directionX:
                  Math.cos(
                    angle,
                  ),

                directionY:
                  Math.sin(
                    angle,
                  ) *
                  (
                    0.35 +
                    seededRandom(
                      globalIndex +
                        83,
                    ) *
                      0.7
                  ),

                distance,

                rotation:
                  (
                    seededRandom(
                      globalIndex +
                        121,
                    ) -
                    0.5
                  ) *
                  420,
              },
            );

            globalIndex +=
              1;
          }
        }

        /*
         * Original heading remains
         * responsible for layout.
         * Overlay glyphs become
         * the visible copy.
         */
        heading.style.visibility =
          "hidden";
      };

    // ------------------------------
    // LAYOUT
    // ------------------------------

    const measureLayout =
      () => {
        viewportWidth =
          window.innerWidth;

        viewportHeight =
          window.innerHeight;

        const bounds =
          section.getBoundingClientRect();

        sectionTop =
          window.scrollY +
          bounds.top;

        scrollRange =
          Math.max(
            1,
            section.offsetHeight -
              viewportHeight,
          );

        measureGlyphs();
      };

    // ------------------------------
    // HEADLINE EXPLOSION
    // ------------------------------

    const renderGlyphs =
      (
        progress: number,
      ) => {
        const explode =
          mapRange(
            progress,
            EXPLODE_START,
            EXPLODE_END,
          );

        const eased =
          1 -
          Math.pow(
            1 -
              explode,
            3,
          );

        for (
          const glyph of
          glyphs
        ) {
          const x =
            glyph.directionX *
            glyph.distance *
            eased;

          const y =
            glyph.directionY *
            glyph.distance *
            eased;

          const rotation =
            glyph.rotation *
            eased;

          const opacity =
            1 -
            mapRange(
              explode,
              0.56,
              1,
            );

          glyph.element.style.transform =
            `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

          glyph.element.style.opacity =
            `${opacity}`;
        }
      };

    // ------------------------------
    // CARDS
    // ------------------------------

    const renderCards =
      (
        progress: number,
      ) => {
        const cardsProgress =
          mapRange(
            progress,
            CARDS_START,
            CARDS_END,
          );

        cardRefs.current.forEach(
          (
            card,
            index,
          ) => {
            if (!card) {
              return;
            }

            const pairIndex =
              Math.floor(
                index / 2,
              );

            const side =
              index %
                2 ===
              0
                ? -1
                : 1;

            /*
             * Published Trionn
             * structure introduces
             * left/right pairs with
             * staggered timing.
             */
            const pairOffset =
              pairIndex *
              0.2;

            const local =
              clamp(
                (
                  cardsProgress -
                  pairOffset
                ) /
                  Math.max(
                    0.001,
                    1 -
                      pairOffset,
                  ),
              );

            const arc =
              local <=
              0.5
                ? Math.sin(
                    local *
                      Math.PI,
                  )
                : 1;

            const startX =
              side *
              viewportWidth *
              0.58;

            const peakX =
              side *
              viewportWidth *
              0.19;

            const x =
              startX +
              arc *
                (
                  peakX -
                  startX
                );

            const startY =
              viewportHeight *
              (
                0.56 +
                pairIndex *
                  0.09
              );

            const endY =
              -viewportHeight *
              (
                0.12 +
                pairIndex *
                  0.16
              );

            const y =
              startY +
              (
                endY -
                startY
              ) *
                local;

            const opacity =
              mapRange(
                local,
                0,
                0.16,
              );

            const scale =
              0.92 +
              local *
                0.08;

            card.style.transform =
              `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;

            card.style.opacity =
              `${opacity}`;
          },
        );
      };

    // ------------------------------
    // PALETTE
    // ------------------------------

    const renderPalette =
      (
        progress: number,
      ) => {
        const palette =
          mapRange(
            progress,
            0.76,
            0.94,
          );

        const eased =
          palette *
          palette *
          (
            3 -
            2 *
              palette
          );

        const dark =
          9;

        const lightR =
          239;

        const lightG =
          237;

        const lightB =
          231;

        const red =
          Math.round(
            dark +
              (
                lightR -
                dark
              ) *
                eased,
          );

        const green =
          Math.round(
            dark +
              (
                lightG -
                dark
              ) *
                eased,
          );

        const blue =
          Math.round(
            dark +
              (
                lightB -
                dark
              ) *
                eased,
          );

        sticky.style.backgroundColor =
          `rgb(${red}, ${green}, ${blue})`;

        sticky.style.color =
          eased >
          0.52
            ? "#090909"
            : "#ffffff";

        cardRefs.current.forEach(
          (card) => {
            if (!card) {
              return;
            }

            card.style.borderColor =
              eased >
              0.52
                ? "rgba(9,9,9,0.18)"
                : "rgba(255,255,255,0.18)";

            card.style.backgroundColor =
              eased >
              0.52
                ? "rgba(9,9,9,0.035)"
                : "rgba(255,255,255,0.045)";
          },
        );
      };

    // ------------------------------
    // STRIPE WIPE
    // ------------------------------

    const renderStripes =
      (
        progress: number,
      ) => {
        const stripeProgress =
          mapRange(
            progress,
            0.92,
            1,
          );

        stripeRefs.current.forEach(
          (
            stripe,
            index,
          ) => {
            if (!stripe) {
              return;
            }

            const delayed =
              clamp(
                stripeProgress *
                  1.35 -
                  index *
                    0.045,
              );

            const eased =
              1 -
              Math.pow(
                1 -
                  delayed,
                3,
              );

            stripe.style.transform =
              `scaleY(${eased})`;
          },
        );
      };

    // ------------------------------
    // FRAME SEQUENCE
    // ------------------------------

    const renderFrame =
      (
        progress: number,
      ) => {
        if (
          !hasFrames ||
          !frameRef.current
        ) {
          return;
        }

        const targetFrame =
          progress *
          (
            TOTAL_FRAMES -
            1
          );

        /*
         * Published Trionn easing.
         */
        videoIndex +=
          (
            targetFrame -
            videoIndex
          ) *
          0.12;

        const frame =
          Math.round(
            videoIndex,
          );

        const nextUrl =
          frameUrl(
            frame,
          );

        if (
          frameRef.current
            .dataset.frame !==
          `${frame}`
        ) {
          frameRef.current.src =
            nextUrl;

          frameRef.current.dataset.frame =
            `${frame}`;
        }
      };

    // ------------------------------
    // MAIN TICK
    // ------------------------------

    const tick =
      () => {
        const linear =
          clamp(
            (
              window.scrollY -
              sectionTop
            ) /
              scrollRange,
          );

        /*
         * mapServicesScrollProgress()
         * in Trionn also provides
         * mobile-specific remapping.
         *
         * Exact mobile curve is not
         * public, so desktop uses the
         * raw shared 0..1 progress.
         */
        const progress =
          linear;

        renderFrame(
          progress,
        );

        renderGlyphs(
          progress,
        );

        renderCards(
          progress,
        );

        renderPalette(
          progress,
        );

        renderStripes(
          progress,
        );
      };

    const handleResize =
      () => {
        measureLayout();

        tick();
      };

    let cancelled =
      false;

    void document.fonts.ready.then(
      () => {
        if (
          cancelled
        ) {
          return;
        }

        measureLayout();

        tick();
      },
    );

    window.addEventListener(
      "resize",
      handleResize,
    );

    gsap.ticker.add(
      tick,
    );

    return () => {
      cancelled =
        true;

      gsap.ticker.remove(
        tick,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      glyphLayer.replaceChildren();

      heading.style.visibility =
        "visible";
    };
  }, [hasFrames]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[520svh]"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-[100svh] overflow-hidden bg-[#090909] text-white"
      >
        {/* FRAME SEQUENCE */}

        {hasFrames && (
          // The sequence swaps preloaded frame URLs on every tick; next/image's
          // optimization wrapper is intentionally unsuitable for this canvas-like surface.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={frameRef}
            src={frameUrl(
              0,
            )}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75"
          />
        )}

        {!hasFrames && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.05),transparent_34%),#090909]"
          />
        )}

        {/* ORIGINAL HEADING FOR MEASUREMENT */}

        <div
          ref={headingRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(4rem,12vw,12rem)] font-medium uppercase leading-[0.73] tracking-[-0.08em]"
        >
          <div data-services-line>
            OUR
          </div>

          <div data-services-line>
            SERVICES
          </div>
        </div>

        {/* MEASURED GLYPHS */}

        <div
          ref={glyphLayerRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
        />

        {/* SERVICE CARDS */}

        <div className="absolute inset-0 z-20">
          {services.map(
            (
              service,
              index,
            ) => (
              <div
                key={
                  service
                }
                ref={(
                  element,
                ) => {
                  cardRefs
                    .current[
                    index
                  ] =
                    element;
                }}
                className="absolute left-1/2 top-1/2 w-[min(38vw,430px)] border border-white/20 bg-white/[0.045] p-5 opacity-0 backdrop-blur-sm will-change-transform md:p-6"
              >
                <div className="flex items-start justify-between gap-8">
                  <span className="text-[9px] uppercase tracking-[0.1em] opacity-50">
                    {String(
                      index +
                        1,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span className="text-right text-[clamp(1rem,1.6vw,1.5rem)] font-medium leading-[1.05] tracking-[-0.04em]">
                    {
                      service
                    }
                  </span>
                </div>

                <div className="mt-12 h-px w-full bg-current opacity-20" />

                <p className="mt-4 text-[8px] uppercase tracking-[0.09em] opacity-55 md:text-[9px]">
                  View capability
                </p>
              </div>
            ),
          )}
        </div>

        {/* STRIPE WIPE */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 grid grid-cols-8"
        >
          {Array.from(
            {
              length:
                8,
            },
          ).map(
            (
              _,
              index,
            ) => (
              <div
                key={
                  index
                }
                ref={(
                  element,
                ) => {
                  stripeRefs
                    .current[
                    index
                  ] =
                    element;
                }}
                className="origin-bottom scale-y-0 bg-[#efede7] will-change-transform"
              />
            ),
          )}
        </div>

        {/* SMALL LABEL */}

        <div className="pointer-events-none absolute left-5 top-6 z-20 text-[8px] uppercase tracking-[0.12em] opacity-50 md:left-10 md:top-8 md:text-[9px]">
          What we do
        </div>
      </div>
    </section>
  );
}
