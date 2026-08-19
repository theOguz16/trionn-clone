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

const UI_FONT =
  '"Helvetica Neue", Helvetica, Arial, sans-serif';

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

type MotionVariant =
  | "rewrite"
  | "wave"
  | "pill";

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
        "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-out hover:scale-[1.04] focus:outline-none",
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

function MotionText({
  text,
  variant,
}: {
  text: string;
  variant: MotionVariant;
}) {
  const renderChars = (
    layer: "a" | "b",
  ) =>
    text.split("").map(
      (
        char,
        index,
      ) => (
        <span
          key={`${layer}-${index}-${char}`}
          data-motion-char
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
      data-motion-track
      data-motion-variant={variant}
      data-motion-active="a"
      className="relative inline-grid overflow-hidden align-top"
    >
      <span
        aria-hidden="true"
        className="invisible whitespace-nowrap"
      >
        {text}
      </span>

      <span
        aria-hidden="true"
        data-motion-layer="a"
        className="absolute inset-0 flex whitespace-nowrap"
      >
        {renderChars("a")}
      </span>

      <span
        aria-hidden="true"
        data-motion-layer="b"
        className="absolute inset-0 flex whitespace-nowrap opacity-0"
      >
        {renderChars("b")}
      </span>
    </span>
  );
}

function playTextMotion(
  root: HTMLElement,
) {
  const track =
    root.querySelector<HTMLElement>(
      "[data-motion-track]",
    );

  if (!track) {
    return;
  }

  const variant =
    (track.dataset
      .motionVariant ??
      "rewrite") as MotionVariant;

  const activeKey =
    track.dataset
      .motionActive ===
    "b"
      ? "b"
      : "a";

  const incomingKey =
    activeKey === "a"
      ? "b"
      : "a";

  const outgoing =
    track.querySelector<HTMLElement>(
      `[data-motion-layer="${activeKey}"]`,
    );

  const incoming =
    track.querySelector<HTMLElement>(
      `[data-motion-layer="${incomingKey}"]`,
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
        "[data-motion-char]",
      ),
    );

  const incomingChars =
    Array.from(
      incoming.querySelectorAll<HTMLElement>(
        "[data-motion-char]",
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
    [outgoing, incoming],
  );

  gsap.set(
    outgoing,
    {
      autoAlpha: 1,
    },
  );
  gsap.set(
    outgoingChars,
    {
      x: 0,
      y: 0,
      rotation: 0,
      autoAlpha: 1,
    },
  );
  gsap.set(
    incoming,
    {
      autoAlpha: 1,
    },
  );

  const timeline =
    gsap.timeline({
      defaults: {
        overwrite:
          "auto",
      },
      onComplete: () => {
        gsap.set(
          outgoing,
          {
            autoAlpha: 0,
          },
        );
        gsap.set(
          incomingChars,
          {
            x: 0,
            y: 0,
            rotation: 0,
            autoAlpha: 1,
          },
        );
        track.dataset
          .motionActive =
          incomingKey;
      },
    });

  if (
    variant ===
    "wave"
  ) {
    gsap.set(
      incomingChars,
      {
        x: -7,
        y: (
          index,
        ) =>
          13 +
          Math.sin(
            index * 1.22,
          ) *
            7,
        rotation: (
          index,
        ) =>
          Math.sin(
            index * 0.92,
          ) *
          -4,
        autoAlpha: 0,
      },
    );

    timeline
      .to(
        outgoingChars,
        {
          x: 7,
          y: (
            index,
          ) =>
            Math.sin(
              index * 1.22,
            ) *
            -8,
          rotation: (
            index,
          ) =>
            Math.sin(
              index * 0.9,
            ) *
            4,
          autoAlpha: 0,
          duration: 0.25,
          stagger: {
            each: 0.018,
            from: "start",
          },
          ease:
            "power2.in",
        },
        0,
      )
      .to(
        incomingChars,
        {
          x: 0,
          y: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 0.5,
          stagger: {
            each: 0.032,
            from: "start",
          },
          ease:
            "back.out(1.85)",
        },
        0.13,
      );

    return;
  }

  if (
    variant ===
    "pill"
  ) {
    gsap.set(
      incomingChars,
      {
        x: -5,
        y: 8,
        autoAlpha: 0,
      },
    );

    timeline
      .to(
        outgoingChars,
        {
          y: -8,
          autoAlpha: 0,
          duration: 0.16,
          stagger: {
            each: 0.01,
            from: "start",
          },
          ease:
            "power2.in",
        },
        0,
      )
      .to(
        incomingChars,
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.34,
          stagger: {
            each: 0.024,
            from: "start",
          },
          ease:
            "back.out(1.65)",
        },
        0.09,
      );

    return;
  }

  /*
   * Story + E/P rewrite:
   * disappear first, then rebuild left-to-right with a slower bounce.
   */
  gsap.set(
    incomingChars,
    {
      x: -10,
      y: 12,
      rotation: -3,
      autoAlpha: 0,
    },
  );

  timeline
    .to(
      outgoingChars,
      {
        y: -10,
        autoAlpha: 0,
        duration: 0.17,
        stagger: {
          each: 0.006,
          from: "start",
        },
        ease:
          "power2.in",
      },
      0,
    )
    .to(
      incomingChars,
      {
        x: 0,
        y: 0,
        rotation: 0,
        autoAlpha: 1,
        duration: 0.46,
        stagger: {
          each: 0.038,
          from: "start",
        },
        ease:
          "back.out(2.05)",
      },
      0.14,
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
  const closedControlsRef =
    useRef<HTMLDivElement>(
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
      const closedControls =
        closedControlsRef.current;

      if (
        !layer ||
        !panel ||
        !backdrop ||
        !closedControls
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
        closedControls,
        {
          autoAlpha: 1,
          scale: 1,
          transformOrigin:
            "100% 50%",
        },
      );

      /*
       * Start from a Menu-pill-sized capsule in the card's top-right.
       * The card then unfolds downward/leftward instead of appearing as
       * a generic clipped rectangle.
       */
      gsap.set(
        panel,
        {
          clipPath:
            "inset(0 0 calc(100% - 38px) calc(100% - 96px) round 999px)",
          transformOrigin:
            "100% 0%",
          willChange:
            "clip-path",
        },
      );

      gsap.set(
        "[data-menu-controls]",
        {
          autoAlpha: 0,
          y: -4,
        },
      );

      gsap.set(
        "[data-menu-nav-item]",
        {
          autoAlpha: 0,
          y: 20,
        },
      );

      gsap.set(
        "[data-menu-secondary]",
        {
          autoAlpha: 0,
          y: 13,
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
            gsap.set(
              closedControls,
              {
                pointerEvents:
                  "none",
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
              gsap.set(
                closedControls,
                {
                  pointerEvents:
                    "auto",
                },
              );
              setHoveredMenuIndex(
                null,
              );
            },
        });

      timeline
        .to(
          closedControls,
          {
            autoAlpha: 0,
            scale: 0.94,
            duration: 0.18,
            ease:
              "power2.in",
          },
          0,
        )
        .to(
          backdrop,
          {
            autoAlpha: 1,
            duration: 0.32,
            ease:
              "power2.out",
          },
          0.05,
        )
        .to(
          panel,
          {
            clipPath:
              "inset(0 0 0% 0% round 10px)",
            duration: 0.88,
            ease:
              "power4.inOut",
          },
          0,
        )
        .to(
          "[data-menu-controls]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.34,
            ease:
              "power3.out",
          },
          0.28,
        )
        .to(
          "[data-menu-nav-item]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.045,
            ease:
              "power3.out",
          },
          0.36,
        )
        .to(
          "[data-menu-secondary]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.045,
            ease:
              "power3.out",
          },
          0.46,
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
    [isOpen],
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
    [isOpen],
  );

  useEffect(
    () => {
      if (!isOpen) {
        return;
      }

      const handleKeyDown = (
        event: KeyboardEvent,
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
    [isOpen],
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
          ref={closedControlsRef}
          style={{
            fontFamily:
              UI_FONT,
          }}
          className="pointer-events-auto ml-auto flex items-center gap-[8px]"
        >
          <SoundButton
            soundOn={soundOn}
            onClick={toggleSound}
          />

          <TransitionLink
            href="/contact"
            aria-label="Let's talk"
            onMouseEnter={(
              event,
            ) => {
              playTextMotion(
                event.currentTarget,
              );
            }}
            className="group hidden h-[34px] items-center justify-center overflow-hidden rounded-full bg-[#f5f5f2] px-[17px] text-[11px] font-normal leading-none tracking-[-0.015em] !text-[#111] focus:outline-none md:flex"
          >
            <MotionText
              text="let's talk"
              variant="pill"
            />
          </TransitionLink>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="site-navigation"
            aria-label="Open menu"
            onMouseEnter={(
              event,
            ) => {
              playTextMotion(
                event.currentTarget,
              );
            }}
            onClick={() => {
              setIsOpen(true);
            }}
            className="group flex h-[34px] items-center gap-[8px] rounded-full border border-white/55 bg-transparent px-[13px] text-[10.5px] font-normal leading-none tracking-[-0.01em] text-[#eeeeeb] transition-[background-color,border-color] duration-300 hover:border-white/80 hover:bg-white/[0.035] focus:outline-none"
          >
            <MotionText
              text="Menu"
              variant="pill"
            />
            <span className="flex w-[10px] flex-col gap-[3px]">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </span>
          </button>
        </div>
      </div>

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
          className="absolute inset-0 cursor-default bg-black/20 focus:outline-none"
        />

        <aside
          ref={panelRef}
          style={{
            fontFamily:
              UI_FONT,
          }}
          className="absolute bottom-[10px] right-[10px] top-[10px] w-[calc(100vw-20px)] overflow-hidden rounded-[10px] border border-black/[0.05] bg-[#f3f2ee] text-[#151515] shadow-[0_18px_70px_rgba(0,0,0,0.18)] sm:w-[min(468px,calc(100vw-20px))]"
        >
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
              aria-label="Let's talk"
              onClick={closeMenu}
              onMouseEnter={(
                event,
              ) => {
                playTextMotion(
                  event.currentTarget,
                );
              }}
              className="group hidden h-[34px] items-center overflow-hidden rounded-full bg-[#0c0c0c] px-[17px] text-[11px] font-normal leading-none tracking-[-0.015em] !text-white sm:flex"
            >
              <MotionText
                text="let's talk"
                variant="pill"
              />
            </TransitionLink>

            <button
              type="button"
              aria-label="Close menu"
              onMouseEnter={(
                event,
              ) => {
                playTextMotion(
                  event.currentTarget,
                );
              }}
              onClick={closeMenu}
              className="group flex h-[34px] items-center gap-[8px] rounded-full border border-black/55 px-[13px] text-[10.5px] font-normal leading-none tracking-[-0.01em] text-[#111] transition-[background-color,border-color] duration-300 hover:border-black/80 hover:bg-black/[0.025] focus:outline-none"
            >
              <MotionText
                text="Menu"
                variant="pill"
              />
              <span className="relative block h-[10px] w-[10px]">
                <span className="absolute left-1/2 top-1/2 h-px w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-1/2 top-1/2 h-px w-[11px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <div className="flex h-full flex-col px-[24px] pb-[26px] pt-[145px] sm:px-[32px] sm:pb-[31px] sm:pt-[154px]">
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
                      >
                        <TransitionLink
                          href={item.href}
                          aria-label={item.label}
                          onClick={closeMenu}
                          onMouseEnter={(
                            event,
                          ) => {
                            setHoveredMenuIndex(
                              index,
                            );
                            playTextMotion(
                              event.currentTarget,
                            );
                          }}
                          style={{
                            opacity:
                              dimmed
                                ? 0.22
                                : 1,
                          }}
                          className="group flex w-full items-center justify-between py-[1px] text-[clamp(38px,4.5vw,47px)] font-normal leading-[0.98] tracking-[-0.045em] text-[#171717] transition-opacity duration-300"
                        >
                          <MotionText
                            text={item.label}
                            variant="wave"
                          />

                          <span
                            aria-hidden="true"
                            className={[
                              "mr-[2px] text-[15px] leading-none transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                              hovered
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-[9px] opacity-0",
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

            <TransitionLink
              data-menu-secondary
              href="/trionn-story"
              aria-label="The TRIONN name Story"
              onClick={closeMenu}
              onMouseEnter={(
                event,
              ) => {
                playTextMotion(
                  event.currentTarget,
                );
              }}
              className="group mt-[26px] flex h-[42px] w-fit min-w-[274px] items-center rounded-full border border-black/[0.32] px-[14px] text-[13px] font-normal leading-none tracking-[-0.018em] transition-[border-color,background-color] duration-300 hover:border-black/55 hover:bg-black/[0.02]"
            >
              <span className="mr-[7px] shrink-0 text-[11px]">
                ✦
              </span>
              <MotionText
                text="The TRIONN name Story"
                variant="rewrite"
              />
              <span className="ml-auto pl-[12px] text-[12px]">
                ↗
              </span>
            </TransitionLink>

            <div className="mt-auto">
              <div
                data-menu-secondary
              >
                <p className="mb-[13px] text-[10px] font-normal uppercase tracking-[0.025em] text-black/38">
                  Business enquiry
                </p>

                <div className="space-y-[9px] text-[15px] font-normal leading-none tracking-[-0.025em] text-black/76">
                  <p className="flex items-center">
                    <span className="mr-[14px] w-[18px] shrink-0 text-[13px] text-black/38">
                      E.
                    </span>
                    <a
                      href="mailto:hello@trionn.com"
                      aria-label="hello@trionn.com"
                      onMouseEnter={(
                        event,
                      ) => {
                        playTextMotion(
                          event.currentTarget,
                        );
                      }}
                      className="group inline-flex overflow-hidden"
                    >
                      <MotionText
                        text="hello@trionn.com"
                        variant="rewrite"
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
                      onMouseEnter={(
                        event,
                      ) => {
                        playTextMotion(
                          event.currentTarget,
                        );
                      }}
                      className="group inline-flex overflow-hidden"
                    >
                      <MotionText
                        text="+91 98241 82099"
                        variant="rewrite"
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

                <div className="grid grid-cols-2 gap-x-[38px] gap-y-[8px] text-[13px] font-normal leading-none tracking-[-0.015em] text-black/68">
                  {socialItems.map(
                    (item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={item.label}
                        onMouseEnter={(
                          event,
                        ) => {
                          playTextMotion(
                            event.currentTarget,
                          );
                        }}
                        className="group w-fit overflow-hidden"
                      >
                        <MotionText
                          text={item.label}
                          variant="pill"
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
