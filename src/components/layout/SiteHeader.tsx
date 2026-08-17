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
  scrollManager,
} from "@/runtime/scroll/ScrollManager";

const navigationItems = [
  {
    label: "Home",
    href: "/",
    index: "01",
  },
  {
    label: "Work",
    href: "/#work",
    index: "02",
  },
  {
    label: "About",
    href: "/about",
    index: "03",
  },
  {
    label: "Contact",
    href: "/#contact",
    index: "04",
  },
];

export function SiteHeader() {
  const rootRef =
    useRef<HTMLElement>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const panelRef =
    useRef<HTMLDivElement>(null);

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

  // -------------------------
  // MENU ANIMATION
  // -------------------------

  useGSAP(
    () => {
      const menu =
        menuRef.current;

      const panel =
        panelRef.current;

      if (
        !menu ||
        !panel
      ) {
        return;
      }

      gsap.set(
        menu,
        {
          autoAlpha: 0,
          pointerEvents:
            "none",
        },
      );

      gsap.set(
        panel,
        {
          clipPath:
            "inset(0 0 100% 0)",
        },
      );

      const timeline =
        gsap.timeline({
          paused: true,

          onStart:
            () => {
              gsap.set(
                menu,
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
                menu,
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
          panel,
          {
            clipPath:
              "inset(0 0 0% 0)",
            duration: 0.8,
            ease: "power4.inOut",
          },
        )
        .fromTo(
          ".site-nav-link",
          {
            yPercent: 120,
            rotate: 3,
          },
          {
            yPercent: 0,
            rotate: 0,
            stagger: 0.07,
            duration: 0.8,
            ease: "power4.out",
          },
          "-=0.4",
        )
        .fromTo(
          ".site-nav-meta",
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.45",
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
  // OPEN / CLOSE
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

    const previousOverflow =
      document
        .documentElement
        .style
        .overflow;

    document
      .documentElement
      .style
      .overflow =
      "hidden";

    scrollManager.stop();

    return () => {
      document
        .documentElement
        .style
        .overflow =
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

  const closeMenu =
    () => {
      setIsOpen(
        false,
      );
    };

  return (
    <header
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
    >
      {/* TOP BAR */}

      <div className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <TransitionLink
          href="/"
          onClick={
            closeMenu
          }
          className="pointer-events-auto text-sm font-semibold uppercase tracking-[-0.03em] mix-blend-difference"
        >
          Motion Lab
        </TransitionLink>

        <button
          type="button"
          aria-label={
            isOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={
            isOpen
          }
          onClick={() => {
            setIsOpen(
              (
                current,
              ) =>
                !current,
            );
          }}
          className="pointer-events-auto flex h-10 w-14 items-center justify-center"
        >
          <span className="relative block h-4 w-8">
            <span
              className={[
                "absolute left-0 top-[3px] block h-px w-full bg-white",
                "transition-transform duration-300",
                isOpen
                  ? "translate-y-[5px] rotate-45"
                  : "translate-y-0 rotate-0",
              ].join(
                " ",
              )}
            />

            <span
              className={[
                "absolute bottom-[3px] left-0 block h-px w-full bg-white",
                "transition-transform duration-300",
                isOpen
                  ? "-translate-y-[5px] -rotate-45"
                  : "translate-y-0 rotate-0",
              ].join(
                " ",
              )}
            />
          </span>
        </button>
      </div>

      {/* MENU */}

      <div
        ref={menuRef}
        aria-hidden={
          !isOpen
        }
        className="pointer-events-none invisible fixed inset-0 z-10"
      >
        <div
          ref={panelRef}
          className="absolute inset-0 bg-[#ff5a00] text-[#090909]"
        >
          <div className="flex h-full flex-col justify-between px-5 pb-7 pt-28 md:px-10 md:pb-10 md:pt-32">
            <nav
              aria-label="Main navigation"
              className="flex flex-1 items-center"
            >
              <ul className="w-full">
                {navigationItems.map(
                  (
                    item,
                  ) => (
                    <li
                      key={
                        item.label
                      }
                      className="border-b border-black/20"
                    >
                      <div className="overflow-hidden">
                        <TransitionLink
                          href={
                            item.href
                          }
                          onClick={
                            closeMenu
                          }
                          className="site-nav-link group flex items-end justify-between py-3 md:py-2"
                        >
                          <span className="text-[13vw] font-semibold uppercase leading-[0.85] tracking-[-0.075em] md:text-[8vw]">
                            {
                              item.label
                            }
                          </span>

                          <span className="mb-2 text-xs font-medium tabular-nums opacity-60 md:mb-4">
                            {
                              item.index
                            }
                          </span>
                        </TransitionLink>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="site-nav-meta mt-8 flex items-end justify-between gap-8 text-[10px] font-medium uppercase tracking-[0.14em] md:text-xs">
              <div>
                <p>
                  Independent
                </p>

                <p>
                  Creative
                  Development
                </p>
              </div>

              <div className="text-right">
                <p>
                  Istanbul
                </p>

                <p>
                  Türkiye ·
                  2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}