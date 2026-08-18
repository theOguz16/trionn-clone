"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  TransitionLink,
} from "@/components/motion/TransitionLink";

import {
  gsap,
  useGSAP,
} from "@/lib/gsap/client";

import {
  audioManager,
} from "@/runtime/audio/AudioManager";

import {
  scrollManager,
} from "@/runtime/scroll/ScrollManager";

const navigationItems = [
  {
    label: "Work",
    href: "/work",
  },

  {
    label: "Services",
    href: "/services",
  },

  {
    label: "About",
    href: "/about",
  },

  {
    label: "Contact",
    href: "/contact",
  },
];

const socialItems = [
  {
    label: "Linkedin",
    href:
      "https://www.linkedin.com/company/trionn/",
  },

  {
    label: "Facebook",
    href:
      "https://www.facebook.com/trionndesign/",
  },

  {
    label: "Dribbble",
    href:
      "https://dribbble.com/trionn",
  },

  {
    label: "Instagram",
    href:
      "https://www.instagram.com/trionn/",
  },
];

function BrandMark() {
  return (
    <span className="flex items-center gap-[4px]">
      <svg
        aria-hidden="true"
        viewBox="0 0 22 20"
        className="h-[18px] w-[20px]"
        fill="none"
      >
        <path
          d="M2.5 15.5L7.2 7.2L9 10.2L12.5 3.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        <path
          d="M6.2 15.5H13.1L10.9 11.7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        <path
          d="M13 5.7L19.2 15.5H14.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        <path
          d="M2 11.4H5.2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>

      <span className="text-[15px] font-medium leading-none tracking-[-0.045em]">
        TRIONN
      </span>

      <sup className="-ml-[2px] self-start pt-[1px] text-[4px] font-normal tracking-normal">
        ®
      </sup>
    </span>
  );
}

function SoundButton({
  soundOn,
  light = false,
  onClick,
}: {
  soundOn: boolean;
  light?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        soundOn
          ? "Mute sound"
          : "Enable sound"
      }
      aria-pressed={soundOn}
      className={[
        "flex h-[28px] w-[28px] items-center justify-center rounded-full focus:outline-none",

        light
          ? "bg-black/[0.065] text-black/55"
          : "bg-white/[0.07] text-white/75",
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-[11px] w-[11px]"
        fill="none"
      >
        <path
          d="M4 8H7L10.4 5.2V14.8L7 12H4V8Z"
          fill="currentColor"
        />

        <path
          d="M12.4 7.1C13.8 8.5 13.8 11.5 12.4 12.9"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {soundOn ? (
          <path
            d="M14.4 5.5C16.8 7.8 16.8 12.2 14.4 14.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M5 4L16 16"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}

function SwapText({
  text,
}: {
  text: string;
}) {
  const renderChars =
    (
      layer:
        "a" | "b",
    ) =>
      text
        .split("")
        .map(
          (
            char,
            index,
          ) => (
            <span
              key={`${layer}-${char}-${index}`}
              data-swap-char
              className="inline-block"
            >
              {char === " "
                ? "\u00a0"
                : char}
            </span>
          ),
        );

  return (
    <span
      data-swap-track
      data-swap-active="a"
      className="relative inline-grid overflow-hidden"
    >
      <span
        aria-hidden="true"
        className="invisible whitespace-nowrap"
      >
        {text}
      </span>

      <span
        aria-hidden="true"
        data-swap-layer="a"
        className="absolute inset-0 flex whitespace-nowrap"
      >
        {renderChars(
          "a",
        )}
      </span>

      <span
        aria-hidden="true"
        data-swap-layer="b"
        className="absolute inset-0 flex whitespace-nowrap opacity-0"
      >
        {renderChars(
          "b",
        )}
      </span>
    </span>
  );
}

function playSwapAnimation(
  root:
    HTMLElement,
) {
  const track =
    root.querySelector<HTMLElement>(
      "[data-swap-track]",
    );

  if (!track) {
    return;
  }

  const activeKey =
    track.dataset
      .swapActive ===
    "b"
      ? "b"
      : "a";

  const incomingKey =
    activeKey === "a"
      ? "b"
      : "a";

  const outgoing =
    track.querySelector<HTMLElement>(
      `[data-swap-layer="${activeKey}"]`,
    );

  const incoming =
    track.querySelector<HTMLElement>(
      `[data-swap-layer="${incomingKey}"]`,
    );

  if (
    !outgoing ||
    !incoming
  ) {
    return;
  }

  const outgoingChars =
    Array.from(
      outgoing.querySelectorAll<HTMLElement>(
        "[data-swap-char]",
      ),
    );

  const incomingChars =
    Array.from(
      incoming.querySelectorAll<HTMLElement>(
        "[data-swap-char]",
      ),
    );

  const allChars = [
    ...outgoingChars,
    ...incomingChars,
  ];

  gsap.killTweensOf(
    allChars,
  );

  gsap.killTweensOf(
    [
      outgoing,
      incoming,
    ],
  );

  gsap.set(
    outgoing,
    {
      autoAlpha:
        1,
    },
  );

  gsap.set(
    outgoingChars,
    {
      x:
        0,

      y:
        0,

      autoAlpha:
        1,

      filter:
        "blur(0px)",
    },
  );

  gsap.set(
    incoming,
    {
      autoAlpha:
        1,
    },
  );

  gsap.set(
    incomingChars,
    {
      x:
        -13,

      y: (
        index,
      ) =>
        index %
          2 ===
        0
          ? 3
          : -3,

      autoAlpha:
        0,

      filter:
        "blur(2px)",
    },
  );

  const timeline =
    gsap.timeline({
      onComplete:
        () => {
          gsap.set(
            outgoing,
            {
              autoAlpha:
                0,
            },
          );

          gsap.set(
            incomingChars,
            {
              x:
                0,

              y:
                0,

              autoAlpha:
                1,

              filter:
                "blur(0px)",
            },
          );

          track.dataset
            .swapActive =
            incomingKey;
        },
    });

  /*
   * First copy:
   * wave -> blur -> disappear.
   */
  timeline.to(
    outgoingChars,
    {
      x:
        9,

      y: (
        index,
      ) =>
        Math.sin(
          index *
            1.18,
        ) *
        4,

      autoAlpha:
        0,

      filter:
        "blur(3px)",

      duration:
        0.3,

      stagger: {
        each:
          0.015,

        from:
          "start",
      },

      ease:
        "power2.in",
    },

    0,
  );

  /*
   * Second copy:
   * rewrites from the left with
   * a tiny spring/bounce.
   */
  timeline.to(
    incomingChars,
    {
      x:
        0,

      y:
        0,

      autoAlpha:
        1,

      filter:
        "blur(0px)",

      duration:
        0.4,

      stagger: {
        each:
          0.018,

        from:
          "start",
      },

      ease:
        "back.out(1.65)",
    },

    0.13,
  );
}

export function SiteHeader() {
  const rootRef =
    useRef<HTMLElement>(
      null,
    );

  const layerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const panelRef =
    useRef<HTMLElement>(
      null,
    );

  const backdropRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const timelineRef =
    useRef<ReturnType<
      typeof gsap.timeline
    > | null>(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(false);

  const [
    soundOn,
    setSoundOn,
  ] =
    useState(true);

  const [
    hoveredMenuIndex,
    setHoveredMenuIndex,
  ] =
    useState<
      number | null
    >(null);

  useGSAP(
    () => {
      const layer =
        layerRef.current;

      const panel =
        panelRef.current;

      const backdrop =
        backdropRef.current;

      if (
        !layer ||
        !panel ||
        !backdrop
      ) {
        return;
      }

      gsap.set(
        layer,
        {
          autoAlpha:
            0,

          pointerEvents:
            "none",
        },
      );

      gsap.set(
        backdrop,
        {
          autoAlpha:
            0,
        },
      );

      /*
       * The card does not physically
       * slide across the viewport.
       * Its background is revealed
       * in place.
       */
      gsap.set(
        panel,
        {
          clipPath:
            "inset(0 0 100% 92% round 6px)",

          willChange:
            "clip-path",
        },
      );

      gsap.set(
        "[data-menu-controls]",
        {
          autoAlpha:
            0,

          y:
            -3,

          filter:
            "blur(3px)",
        },
      );

      gsap.set(
        "[data-menu-item]",
        {
          autoAlpha:
            0,

          y:
            8,

          filter:
            "blur(4px)",
        },
      );

      const timeline =
        gsap.timeline({
          paused:
            true,

          defaults: {
            overwrite:
              "auto",
          },

          onStart:
            () => {
              gsap.set(
                layer,
                {
                  autoAlpha:
                    1,

                  pointerEvents:
                    "auto",
                },
              );
            },

          onReverseComplete:
            () => {
              gsap.set(
                layer,
                {
                  autoAlpha:
                    0,

                  pointerEvents:
                    "none",
                },
              );

              setHoveredMenuIndex(
                null,
              );
            },
        });

      timeline
        .to(
          backdrop,
          {
            autoAlpha:
              1,

            duration:
              0.3,

            ease:
              "power2.out",
          },

          0,
        )

        .to(
          panel,
          {
            clipPath:
              "inset(0 0 0% 0% round 6px)",

            duration:
              0.7,

            ease:
              "power4.inOut",
          },

          0,
        )

        .to(
          "[data-menu-controls]",
          {
            autoAlpha:
              1,

            y:
              0,

            filter:
              "blur(0px)",

            duration:
              0.36,

            ease:
              "power3.out",
          },

          0.25,
        )

        .to(
          "[data-menu-item]",
          {
            autoAlpha:
              1,

            y:
              0,

            filter:
              "blur(0px)",

            duration:
              0.4,

            stagger:
              0.04,

            ease:
              "power3.out",
          },

          0.34,
        );

      timelineRef.current =
        timeline;

      return () => {
        timeline.kill();

        timelineRef.current =
          null;
      };
    },

    {
      scope:
        rootRef,
    },
  );

  useEffect(
    () => {
      const timeline =
        timelineRef.current;

      if (!timeline) {
        return;
      }

      if (isOpen) {
        timeline.play();

        return;
      }

      timeline.reverse();
    },

    [
      isOpen,
    ],
  );

  useEffect(
    () => {
      if (!isOpen) {
        return;
      }

      const html =
        document.documentElement;

      const previousOverflow =
        html.style.overflow;

      html.style.overflow =
        "hidden";

      scrollManager.stop();

      return () => {
        html.style.overflow =
          previousOverflow;

        scrollManager.start();
      };
    },

    [
      isOpen,
    ],
  );

  useEffect(
    () => {
      if (!isOpen) {
        return;
      }

      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.key ===
            "Escape"
          ) {
            setIsOpen(
              false,
            );
          }
        };

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },

    [
      isOpen,
    ],
  );

  const closeMenu =
    () => {
      setIsOpen(
        false,
      );
    };

  const toggleSound =
    async () => {
      const next =
        !soundOn;

      setSoundOn(
        next,
      );

      if (next) {
        await audioManager.unlock();

        audioManager.setMuted(
          false,
        );

        return;
      }

      audioManager.setMuted(
        true,
      );
    };

  return (
    <header
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-[300]"
    >
      {/* CLOSED HEADER */}

      <div
        data-hero-nav-vibrate
        className="relative z-[40] flex h-[72px] items-center justify-between px-[18px] md:px-[32px]"
      >
        <TransitionLink
          href="/"
          onClick={
            closeMenu
          }
          className="pointer-events-auto text-[#eeeeeb]"
        >
          <BrandMark />
        </TransitionLink>

        <div
          className={[
            "pointer-events-auto ml-auto flex items-center gap-[7px] transition-opacity duration-200",

            isOpen
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          ].join(" ")}
        >
          <SoundButton
            soundOn={
              soundOn
            }
            onClick={
              toggleSound
            }
          />

          <TransitionLink
            href="/contact"
            className="hidden h-[31px] items-center justify-center rounded-full bg-[#f5f5f2] px-[16px] text-[11.5px] font-normal uppercase tracking-[-0.005em] !text-[#111] focus:outline-none md:flex"
          >
            Let&apos;s talk
          </TransitionLink>

          <button
            type="button"
            aria-expanded={
              isOpen
            }
            aria-controls="site-navigation"
            aria-label="Open menu"
            onClick={() => {
              setIsOpen(
                true,
              );
            }}
            className="flex h-[31px] items-center gap-[6px] rounded-full border border-white/60 bg-transparent px-[12px] text-[7.5px] font-normal uppercase tracking-[0.035em] text-[#eeeeeb] focus:outline-none"
          >
            <span>
              Menu
            </span>

            <span className="flex w-[8px] flex-col gap-[2.5px]">
              <span className="h-px w-full bg-current" />

              <span className="h-px w-full bg-current" />
            </span>
          </button>
        </div>
      </div>

      {/* OPEN MENU */}

      <div
        id="site-navigation"
        ref={layerRef}
        aria-hidden={
          !isOpen
        }
        className="pointer-events-none fixed inset-0 z-[30] opacity-0"
      >
        <button
          ref={backdropRef}
          type="button"
          aria-label="Close navigation"
          onClick={
            closeMenu
          }
          className="absolute inset-0 cursor-default bg-black/[0.1] focus:outline-none"
        />

        <aside
          ref={panelRef}
          className="absolute bottom-3 right-3 top-3 w-[calc(100vw-24px)] overflow-hidden rounded-[6px] bg-[#fafafa] text-[#151515] shadow-[0_10px_45px_rgba(0,0,0,0.16)] md:w-[356px]"
        >
          {/* PANEL CONTROLS */}

          <div
            data-menu-controls
            className="absolute right-[17px] top-[17px] z-10 flex items-center gap-[7px]"
          >
            <SoundButton
              light
              soundOn={
                soundOn
              }
              onClick={
                toggleSound
              }
            />

            <a
              href="/contact"
              style={{
                color:
                  "#ffffff",

                WebkitTextFillColor:
                  "#ffffff",
              }}
              className="flex h-[31px] items-center rounded-full bg-[#090909] px-[16px] text-[11.5px] font-normal uppercase tracking-[-0.005em]"
            >
              Let&apos;s talk
            </a>

            <button
              type="button"
              aria-label="Close menu"
              onClick={
                closeMenu
              }
              className="flex h-[31px] items-center gap-[6px] rounded-full border border-black/75 px-[12px] text-[7.5px] font-normal uppercase tracking-[0.035em] text-[#111] focus:outline-none"
            >
              <span>
                Menu
              </span>

              <span className="text-[11px] leading-none">
                ×
              </span>
            </button>
          </div>

          <div className="flex h-full flex-col px-[27px] pb-[29px] pt-[222px]">
            {/* MAIN NAV */}

            <nav
              aria-label="Main navigation"
              onMouseLeave={() => {
                setHoveredMenuIndex(
                  null,
                );
              }}
            >
              <ul className="space-y-[4px]">
                {navigationItems.map(
                  (
                    item,
                    index,
                  ) => {
                    const hovered =
                      hoveredMenuIndex ===
                      index;

                    const dimmed =
                      hoveredMenuIndex !==
                        null &&
                      !hovered;

                    return (
                      <li
                        key={
                          item.label
                        }
                        data-menu-item
                        onMouseEnter={() => {
                          setHoveredMenuIndex(
                            index,
                          );
                        }}
                      >
                        <TransitionLink
                          href={
                            item.href
                          }
                          onClick={
                            closeMenu
                          }
                          style={{
                            opacity:
                              dimmed
                                ? 0.25
                                : 1,
                          }}
                          className="flex w-full items-center justify-between text-[29px] font-normal leading-[1.12] tracking-[-0.052em] text-[#171717] transition-opacity duration-300"
                        >
                          <span>
                            {
                              item.label
                            }
                          </span>

                          <span
                            className={[
                              "text-[11px] transition-[opacity,transform] duration-250",

                              hovered
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-[5px] opacity-0",
                            ].join(" ")}
                          >
                            →
                          </span>
                        </TransitionLink>
                      </li>
                    );
                  },
                )}
              </ul>
            </nav>

            {/* NAME STORY */}

            <TransitionLink
              data-menu-item
              href="/trionn-story"
              aria-label="The TRIONN name Story"
              onClick={
                closeMenu
              }
              onMouseEnter={
                (
                  event,
                ) => {
                  playSwapAnimation(
                    event.currentTarget,
                  );
                }
              }
              className="group relative mt-[21px] flex h-[35px] w-[214px] items-center overflow-hidden rounded-full border border-black/[0.32] px-[12px] text-[10px] font-normal uppercase tracking-[-0.01em]"
            >
              <span className="mr-[5px] shrink-0">
                ✦
              </span>

              <SwapText
                text="THE TRIONN NAME STORY"
              />

              <span className="absolute right-[11px] translate-x-[7px] text-[10px] opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </TransitionLink>

            {/* LOWER INFO */}

            <div className="mb-[19px] mt-auto">
              <div
                data-menu-item
              >
                <p className="mb-[12px] text-[10px] font-normal uppercase tracking-[-0.005em] text-black/35">
                  Business enquiry
                </p>

                <div className="space-y-[7px] text-[13px] leading-none text-black/72">
                  <p className="flex items-center">
                    <span className="mr-[14px] w-[12px] text-[12px] text-black/35">
                      E.
                    </span>

                    <a
                      href="mailto:hello@trionn.com"
                      aria-label="hello@trionn.com"
                      onMouseEnter={
                        (
                          event,
                        ) => {
                          playSwapAnimation(
                            event.currentTarget,
                          );
                        }
                      }
                      className="transition-opacity duration-200"
                    >
                      <SwapText
                        text="hello@trionn.com"
                      />
                    </a>
                  </p>

                  <p className="flex items-center">
                    <span className="mr-[14px] w-[12px] text-[12px] text-black/35">
                      P.
                    </span>

                    <a
                      href="tel:+919824182099"
                      aria-label="+91 9824182099"
                      onMouseEnter={
                        (
                          event,
                        ) => {
                          playSwapAnimation(
                            event.currentTarget,
                          );
                        }
                      }
                      className="transition-opacity duration-200"
                    >
                      <SwapText
                        text="+91 9824182099"
                      />
                    </a>
                  </p>
                </div>
              </div>

              <div
                data-menu-item
                className="mt-[44px]"
              >
                <p className="mb-[11px] text-[9px] font-normal uppercase tracking-[-0.005em] text-black/34">
                  Social
                </p>

                <div className="grid grid-cols-2 gap-x-[32px] gap-y-[5px] text-[12px] leading-none text-black/70">
                  {socialItems.map(
                    (
                      item,
                    ) => (
                      <a
                        key={
                          item.label
                        }
                        href={
                          item.href
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="w-fit transition-opacity duration-250 hover:opacity-40"
                      >
                        {
                          item.label
                        }
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}