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
        "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-out hover:scale-[1.045] focus:outline-none",
        light
          ? "bg-black/[0.065] text-black/60"
          : "bg-white/[0.075] text-white/80",
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-[14px] w-[14px]"
        fill="none"
      >
        <path
          d="M3.7 8H6.8L10.5 5V15L6.8 12H3.7V8Z"
          fill="currentColor"
        />
        <path
          d="M12.4 7.1C13.8 8.5 13.8 11.5 12.4 12.9"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {soundOn ? (
          <path
            d="M14.4 5.5C16.8 7.8 16.8 12.2 14.4 14.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M4.8 4.2L15.8 15.8"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}

function SlideSwapText({
  text,
}: {
  text: string;
}) {
  return (
    <span className="relative inline-grid overflow-hidden align-top">
      <span
        aria-hidden="true"
        className="invisible whitespace-nowrap"
      >
        {text}
      </span>

      <span
        aria-hidden="true"
        className="absolute inset-0 whitespace-nowrap transition-transform duration-[430ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[115%]"
      >
        {text}
      </span>

      <span
        aria-hidden="true"
        className="absolute inset-0 translate-y-[115%] whitespace-nowrap transition-transform duration-[430ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
      >
        {text}
      </span>
    </span>
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
    > | null>(null);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    soundOn,
    setSoundOn,
  ] = useState(true);

  const [
    hoveredMenuIndex,
    setHoveredMenuIndex,
  ] = useState<number | null>(
    null,
  );

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
          autoAlpha: 0,
          pointerEvents:
            "none",
        },
      );

      gsap.set(
        backdrop,
        {
          autoAlpha: 0,
        },
      );

      /*
       * The reference reads like the right-hand card unfolds from the
       * header controls. A compact top-right clip gives us that origin
       * without physically sliding the whole panel across the page.
       */
      gsap.set(
        panel,
        {
          clipPath:
            "inset(0 0 92% 74% round 18px)",
          x: 8,
          scale: 0.985,
          transformOrigin:
            "100% 0%",
          willChange:
            "clip-path, transform",
        },
      );

      gsap.set(
        "[data-menu-controls]",
        {
          autoAlpha: 0,
          y: -5,
        },
      );

      gsap.set(
        "[data-menu-nav-item]",
        {
          autoAlpha: 0,
          y: 18,
        },
      );

      gsap.set(
        "[data-menu-secondary]",
        {
          autoAlpha: 0,
          y: 12,
        },
      );

      const timeline =
        gsap.timeline({
          paused: true,
          defaults: {
            overwrite:
              "auto",
          },
          onStart: () => {
            gsap.set(
              layer,
              {
                autoAlpha: 1,
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
                  autoAlpha: 0,
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
            autoAlpha: 1,
            duration: 0.28,
            ease:
              "power2.out",
          },
          0,
        )
        .to(
          panel,
          {
            clipPath:
              "inset(0 0 0% 0% round 10px)",
            x: 0,
            scale: 1,
            duration: 0.82,
            ease:
              "expo.inOut",
          },
          0,
        )
        .to(
          "[data-menu-controls]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
            ease:
              "power3.out",
          },
          0.22,
        )
        .to(
          "[data-menu-nav-item]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.52,
            stagger: 0.055,
            ease:
              "expo.out",
          },
          0.29,
        )
        .to(
          "[data-menu-secondary]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.46,
            stagger: 0.05,
            ease:
              "power3.out",
          },
          0.4,
        );

      timeline.progress(0).pause();
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
      } else {
        timeline.reverse();
      }
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
            setIsOpen(false);
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

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleSound =
    async () => {
      const next =
        !soundOn;

      setSoundOn(next);

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
        className="relative z-[40] flex h-[76px] items-center justify-between px-[16px] md:px-[28px]"
      >
        <TransitionLink
          href="/"
          onClick={closeMenu}
          className="pointer-events-auto text-[#eeeeeb]"
        >
          <BrandMark />
        </TransitionLink>

        <div
          className={[
            "pointer-events-auto ml-auto flex items-center gap-[8px] transition-opacity duration-200",
            isOpen
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          ].join(" ")}
        >
          <SoundButton
            soundOn={soundOn}
            onClick={toggleSound}
          />

          <TransitionLink
            href="/contact"
            className="hidden h-[34px] items-center justify-center rounded-full bg-[#f5f5f2] px-[17px] text-[10px] font-normal uppercase tracking-[0.015em] !text-[#111] transition-transform duration-300 ease-out hover:scale-[1.025] focus:outline-none md:flex"
          >
            Let&apos;s talk
          </TransitionLink>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="site-navigation"
            aria-label="Open menu"
            onClick={() => {
              setIsOpen(true);
            }}
            className="flex h-[34px] items-center gap-[8px] rounded-full border border-white/55 bg-transparent px-[13px] text-[9px] font-normal uppercase tracking-[0.06em] text-[#eeeeeb] transition-[background-color,border-color] duration-300 hover:border-white/85 hover:bg-white/[0.045] focus:outline-none"
          >
            <span>Menu</span>
            <span className="flex w-[10px] flex-col gap-[3px]">
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
        aria-hidden={!isOpen}
        className="pointer-events-none fixed inset-0 z-[30] opacity-0"
      >
        <button
          ref={backdropRef}
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
          className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[1px] focus:outline-none"
        />

        <aside
          ref={panelRef}
          className="absolute bottom-[10px] right-[10px] top-[10px] w-[calc(100vw-20px)] overflow-hidden rounded-[10px] border border-black/[0.055] bg-[#f3f2ee] text-[#151515] shadow-[0_18px_70px_rgba(0,0,0,0.18)] sm:w-[min(468px,calc(100vw-20px))]"
        >
          {/* PANEL CONTROLS */}
          <div
            data-menu-controls
            className="absolute right-[16px] top-[16px] z-10 flex items-center gap-[8px]"
          >
            <SoundButton
              light
              soundOn={soundOn}
              onClick={toggleSound}
            />

            <TransitionLink
              href="/contact"
              onClick={closeMenu}
              className="hidden h-[34px] items-center rounded-full bg-[#0c0c0c] px-[17px] text-[10px] font-normal uppercase tracking-[0.015em] !text-white transition-transform duration-300 ease-out hover:scale-[1.025] sm:flex"
            >
              Let&apos;s talk
            </TransitionLink>

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="flex h-[34px] items-center gap-[8px] rounded-full border border-black/55 px-[13px] text-[9px] font-normal uppercase tracking-[0.06em] text-[#111] transition-[background-color,border-color] duration-300 hover:border-black/80 hover:bg-black/[0.035] focus:outline-none"
            >
              <span>Menu</span>
              <span className="relative block h-[10px] w-[10px]">
                <span className="absolute left-1/2 top-1/2 h-px w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-1/2 top-1/2 h-px w-[11px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <div className="flex h-full flex-col px-[24px] pb-[26px] pt-[142px] sm:px-[32px] sm:pb-[31px] sm:pt-[154px]">
            {/* MAIN NAV */}
            <nav
              aria-label="Main navigation"
              onMouseLeave={() => {
                setHoveredMenuIndex(
                  null,
                );
              }}
            >
              <ul className="space-y-[1px]">
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
                        key={item.label}
                        data-menu-nav-item
                        onMouseEnter={() => {
                          setHoveredMenuIndex(
                            index,
                          );
                        }}
                      >
                        <TransitionLink
                          href={item.href}
                          onClick={closeMenu}
                          style={{
                            opacity:
                              dimmed
                                ? 0.24
                                : 1,
                          }}
                          className="group flex w-full items-center justify-between py-[1px] text-[clamp(36px,4.4vw,46px)] font-normal leading-[0.98] tracking-[-0.055em] text-[#171717] transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                        >
                          <span className="transition-transform duration-[430ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[10px]">
                            {item.label}
                          </span>

                          <span
                            aria-hidden="true"
                            className={[
                              "mr-[2px] text-[15px] leading-none transition-[opacity,transform] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                              hovered
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-[10px] opacity-0",
                            ].join(" ")}
                          >
                            ↗
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
              data-menu-secondary
              href="/trionn-story"
              aria-label="The TRIONN name Story"
              onClick={closeMenu}
              className="group mt-[26px] flex h-[42px] w-fit min-w-[274px] items-center rounded-full border border-black/[0.32] px-[14px] text-[13px] font-normal uppercase tracking-[-0.015em] transition-[border-color,background-color] duration-300 hover:border-black/55 hover:bg-black/[0.025]"
            >
              <span className="mr-[7px] shrink-0 text-[11px]">
                ✦
              </span>
              <SlideSwapText
                text="THE TRIONN NAME STORY"
              />
              <span className="ml-auto pl-[12px] text-[12px] transition-transform duration-[430ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]">
                ↗
              </span>
            </TransitionLink>

            {/* LOWER INFO */}
            <div className="mt-auto">
              <div
                data-menu-secondary
              >
                <p className="mb-[13px] text-[10px] font-normal uppercase tracking-[0.025em] text-black/38">
                  Business enquiry
                </p>

                <div className="space-y-[9px] text-[15px] leading-none tracking-[-0.02em] text-black/74">
                  <p className="flex items-center">
                    <span className="mr-[14px] w-[18px] shrink-0 text-[13px] text-black/38">
                      E.
                    </span>
                    <a
                      href="mailto:hello@trionn.com"
                      aria-label="hello@trionn.com"
                      className="group inline-flex overflow-hidden"
                    >
                      <SlideSwapText
                        text="hello@trionn.com"
                      />
                    </a>
                  </p>

                  <p className="flex items-center">
                    <span className="mr-[14px] w-[18px] shrink-0 text-[13px] text-black/38">
                      P.
                    </span>
                    <a
                      href="tel:+919824182099"
                      aria-label="+91 9824182099"
                      className="group inline-flex overflow-hidden"
                    >
                      <SlideSwapText
                        text="+91 98241 82099"
                      />
                    </a>
                  </p>
                </div>
              </div>

              <div
                data-menu-secondary
                className="mt-[42px]"
              >
                <p className="mb-[12px] text-[9.5px] font-normal uppercase tracking-[0.025em] text-black/36">
                  Social
                </p>

                <div className="grid grid-cols-2 gap-x-[38px] gap-y-[8px] text-[13px] leading-none text-black/68">
                  {socialItems.map(
                    (item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group w-fit overflow-hidden"
                      >
                        <SlideSwapText
                          text={item.label}
                        />
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
