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
    href: "https://www.linkedin.com/company/trionn/",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/trionndesign/",
  },
  {
    label: "Dribbble",
    href: "https://dribbble.com/trionn",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/trionn/",
  },
];

function NavLabel({
  children,
}: {
  children: string;
}) {
  return (
    <span className="relative block h-[0.88em] overflow-hidden">
      <span className="nav-label-primary block">
        {children}
      </span>

      <span className="nav-label-secondary absolute left-0 top-full block">
        {children}
      </span>
    </span>
  );
}

export function SiteHeader() {
  const rootRef =
    useRef<HTMLElement>(null);

  const menuLayerRef =
    useRef<HTMLDivElement>(null);

  const backdropRef =
    useRef<HTMLButtonElement>(null);

  const panelRef =
    useRef<HTMLDivElement>(null);

  const timelineRef =
    useRef<ReturnType<
      typeof gsap.timeline
    > | null>(null);

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

  // -------------------------
  // MENU ANIMATION
  // -------------------------

  useGSAP(
    () => {
      const layer =
        menuLayerRef.current;

      const backdrop =
        backdropRef.current;

      const panel =
        panelRef.current;

      if (
        !layer ||
        !backdrop ||
        !panel
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

      gsap.set(
        panel,
        {
          xPercent: 101,
        },
      );

      gsap.set(
        ".menu-nav-row",
        {
          yPercent: 110,
          rotate: 1.5,
        },
      );

      gsap.set(
        ".menu-detail",
        {
          y: 14,
          autoAlpha: 0,
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
            },
        });

      timeline
        .to(
          backdrop,
          {
            autoAlpha: 1,
            duration: 0.4,
            ease:
              "power2.out",
          },
          0,
        )
        .to(
          panel,
          {
            xPercent: 0,
            duration: 0.9,
            ease:
              "power4.inOut",
          },
          0,
        )
        .to(
          ".menu-nav-row",
          {
            yPercent: 0,
            rotate: 0,
            duration: 0.8,
            stagger: 0.055,
            ease:
              "power4.out",
          },
          0.42,
        )
        .to(
          ".menu-detail",
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.55,
            stagger: 0.035,
            ease:
              "power3.out",
          },
          0.52,
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

  // -------------------------
  // PLAY / REVERSE
  // -------------------------

  useEffect(() => {
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
  }, [isOpen]);

  // -------------------------
  // SCROLL LOCK
  // -------------------------

  useEffect(() => {
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
  }, [isOpen]);

  // -------------------------
  // ESC
  // -------------------------

  useEffect(() => {
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
  }, [isOpen]);

  // -------------------------
  // SOUND
  // -------------------------

  const toggleSound =
    async () => {
      const next =
        !soundOn;

      setSoundOn(
        next,
      );

      if (next) {
        await audioManager
          .unlock();

        audioManager
          .setMuted(
            false,
          );

        return;
      }

      audioManager
        .setMuted(
          true,
        );
    };

  const closeMenu =
    () => {
      setIsOpen(
        false,
      );
    };

  return (
    <header
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-[300] text-white"
    >
      {/* ===================== */}
      {/* GLOBAL HEADER */}
      {/* ===================== */}

      <div className="relative z-[40] flex h-[72px] items-center justify-between px-5 md:h-[84px] md:px-8">
        {/* LOGO */}

        <TransitionLink
          href="/"
          onClick={
            closeMenu
          }
          className="pointer-events-auto text-[19px] font-medium leading-none tracking-[-0.055em] md:text-[21px]"
        >
          TRIONN
          <sup className="ml-[2px] align-top text-[6px] font-normal tracking-normal">
            ®
          </sup>
        </TransitionLink>

        {/* DESKTOP CONTROLS */}

        <div className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-[5px] md:flex">
          <button
            type="button"
            aria-label="Display mode"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/10 bg-black/20 text-[11px] backdrop-blur-md"
          >
            ☼
          </button>

          <button
            type="button"
            aria-label={
              soundOn
                ? "Mute sound"
                : "Enable sound"
            }
            aria-pressed={
              soundOn
            }
            onClick={
              toggleSound
            }
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-md"
          >
            <span className="flex h-[11px] items-end gap-[2px]">
              <span
                className={[
                  "block w-px bg-white transition-[height] duration-300",
                  soundOn
                    ? "h-[5px]"
                    : "h-[2px]",
                ].join(
                  " ",
                )}
              />

              <span
                className={[
                  "block w-px bg-white transition-[height] duration-300",
                  soundOn
                    ? "h-[10px]"
                    : "h-[2px]",
                ].join(
                  " ",
                )}
              />

              <span
                className={[
                  "block w-px bg-white transition-[height] duration-300",
                  soundOn
                    ? "h-[7px]"
                    : "h-[2px]",
                ].join(
                  " ",
                )}
              />
            </span>
          </button>
        </div>

        {/* RIGHT */}

        <div className="pointer-events-auto flex items-center gap-5 text-[9px] font-medium uppercase tracking-[0.03em] md:gap-7 md:text-[10px]">
          {!isOpen && (
            <TransitionLink
              href="/contact"
              className="hidden md:block"
            >
              Let&apos;s talk
            </TransitionLink>
          )}

          <button
            type="button"
            aria-expanded={
              isOpen
            }
            aria-controls="site-navigation"
            aria-label={
              isOpen
                ? "Close menu"
                : "Open menu"
            }
            onClick={() => {
              setIsOpen(
                (
                  current,
                ) =>
                  !current,
              );
            }}
            className="flex items-center gap-3"
          >
            <span>
              {isOpen
                ? "Close"
                : "Menu"}
            </span>

            <span className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-md md:h-[38px] md:w-[38px]">
              <span
                className={[
                  "absolute h-px w-[13px] bg-white transition-transform duration-500",
                  isOpen
                    ? "rotate-45"
                    : "-translate-y-[3px]",
                ].join(
                  " ",
                )}
              />

              <span
                className={[
                  "absolute h-px w-[13px] bg-white transition-transform duration-500",
                  isOpen
                    ? "-rotate-45"
                    : "translate-y-[3px]",
                ].join(
                  " ",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* SLIDE MENU */}
      {/* ===================== */}

      <div
        id="site-navigation"
        ref={menuLayerRef}
        aria-hidden={
          !isOpen
        }
        className="pointer-events-none invisible fixed inset-0 z-[30]"
      >
        {/* BACKDROP */}

        <button
          ref={backdropRef}
          type="button"
          aria-label="Close navigation"
          onClick={
            closeMenu
          }
          className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[1px]"
        />

        {/* RIGHT PANEL */}

        <div
          ref={panelRef}
          className="absolute inset-y-0 right-0 w-full border-l border-white/[0.08] bg-[#090909] text-white shadow-[-40px_0_100px_rgba(0,0,0,0.22)] md:w-[min(760px,55vw)]"
        >
          <div className="flex h-[100svh] flex-col overflow-hidden px-5 pb-6 pt-[104px] md:px-8 md:pb-8 md:pt-[112px]">
            {/* NAVIGATION */}

            <nav
              aria-label="Main navigation"
              className="shrink-0"
            >
              <ul>
                {navigationItems.map(
                  (
                    item,
                  ) => (
                    <li
                      key={
                        item.label
                      }
                      className="overflow-hidden"
                    >
                      <TransitionLink
                        href={
                          item.href
                        }
                        onClick={
                          closeMenu
                        }
                        className="group block w-fit"
                      >
                        <span className="menu-nav-row block text-[clamp(3.6rem,7.2vw,6.8rem)] font-medium uppercase leading-[0.76] tracking-[-0.075em] md:text-[clamp(4.2rem,5.6vw,6.8rem)]">
                          <NavLabel>
                            {
                              item.label
                            }
                          </NavLabel>
                        </span>
                      </TransitionLink>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            {/* DETAILS */}

            <div className="mt-auto grid grid-cols-2 gap-x-5 gap-y-7 border-t border-white/[0.12] pt-5 md:grid-cols-2 md:gap-x-8">
              {/* BUSINESS */}

              <div className="menu-detail">
                <p className="mb-3 text-[8px] font-medium uppercase tracking-[0.08em] text-white/35 md:text-[9px]">
                  Business enquiry
                </p>

                <div className="text-[10px] leading-[1.65] tracking-[-0.01em] md:text-[11px]">
                  <p>
                    <span className="mr-2 text-white/35">
                      E.
                    </span>

                    <a
                      href="mailto:hello@trionn.com"
                      className="transition-opacity duration-300 hover:opacity-50"
                    >
                      hello@trionn.com
                    </a>
                  </p>

                  <p>
                    <span className="mr-2 text-white/35">
                      P.
                    </span>

                    <a
                      href="tel:+919824182099"
                      className="transition-opacity duration-300 hover:opacity-50"
                    >
                      +91 98241 82099
                    </a>
                  </p>
                </div>
              </div>

              {/* SOCIAL */}

              <div className="menu-detail">
                <p className="mb-3 text-[8px] font-medium uppercase tracking-[0.08em] text-white/35 md:text-[9px]">
                  Social
                </p>

                <div className="grid grid-cols-1 gap-y-[2px] text-[9px] uppercase leading-[1.55] tracking-[0.03em] md:text-[10px]">
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
                        className="w-fit text-white/70 transition-opacity duration-300 hover:opacity-40"
                      >
                        {
                          item.label
                        }
                      </a>
                    ),
                  )}
                </div>
              </div>

              {/* STORY */}

              <div className="menu-detail col-span-2 flex items-end justify-between border-t border-white/[0.08] pt-4">
                <TransitionLink
                  href="/trionn-story"
                  onClick={
                    closeMenu
                  }
                  className="group text-[9px] uppercase tracking-[0.05em] md:text-[10px]"
                >
                  <NavLabel>
                    ✦ The TRIONN name Story
                  </NavLabel>
                </TransitionLink>

                <div className="hidden text-right text-[8px] uppercase leading-[1.45] tracking-[0.05em] text-white/35 sm:block md:text-[9px]">
                  <p>
                    Est. 2012
                  </p>

                  <p>
                    14+ years shaping
                  </p>

                  <p>
                    digital direction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* LINK ROLLOVER */}
      {/* ===================== */}

      <style jsx global>{`
        .nav-label-primary,
        .nav-label-secondary {
          transition:
            transform 0.55s
              cubic-bezier(
                0.76,
                0,
                0.24,
                1
              ),
            opacity 0.55s ease;
        }

        #site-navigation
          a:hover
          .nav-label-primary {
          transform: translateY(-100%);
        }

        #site-navigation
          a:hover
          .nav-label-secondary {
          transform: translateY(-100%);
        }

        @media (pointer: coarse) {
          .nav-label-primary,
          .nav-label-secondary {
            transition: none;
          }
        }
      `}</style>
    </header>
  );
}