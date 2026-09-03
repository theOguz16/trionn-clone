"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { usePathname } from "next/navigation";

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

const MONO_UI_FONT =
  'var(--font-trionn-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

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
    <svg
      data-brand-mark
      aria-hidden="true"
      viewBox="0 0 94 25"
      fill="none"
    >
      <g fill="currentColor">
        <path
          stroke="currentColor"
          strokeWidth=".25"
          d="m10.796 14.06 2.007.002h.071l.037.061 4.524 7.815.11.19-.22-.003-2.02-.034-.071-.001-.035-.06-1.738-2.96H2.5l.114-.19 1.04-1.725.036-.06h8.65l-1.652-2.848-.11-.188zM16.898 2.36l.98 1.76.035.06-.036.062-1.72 3.007 5.351 9.227.11.191-.22-.003-2.02-.034-.07-.002-.036-.06-4.262-7.345-1.603 2.792-.109.188-.108-.188-1.017-1.765-.036-.062.036-.063 1.718-2.96 2.79-4.807.11-.19zm-6.615-.422.98 1.76.034.06-.035.062-4.265 7.352h3.667l-.106.186-.97 1.725-.037.064H.178l.114-.19 1.04-1.725.037-.06h3.34l5.356-9.235.11-.19z"
        />
        <path d="M90.46 10.92q-.71 0-1.27-.32a2.37 2.37 0 0 1-.87-.87A2.5 2.5 0 0 1 88 8.46q0-.71.32-1.26.32-.56.87-.88.56-.32 1.27-.32t1.26.32q.56.32.88.88.32.55.32 1.26t-.32 1.27a2.34 2.34 0 0 1-.88.87 2.46 2.46 0 0 1-1.26.32m0-.57q.87 0 1.36-.51.5-.51.5-1.38t-.5-1.38q-.49-.51-1.36-.51t-1.37.51q-.49.51-.49 1.38t.49 1.38q.5.51 1.37.51m-.36-.69h-.6v-2.4h1.17q.46 0 .68.19t.22.52a.66.66 0 0 1-.46.64l.53 1v.05h-.65l-.49-.96h-.4zm0-1.95v.54h.49a.5.5 0 0 0 .24-.05q.11-.05.11-.21 0-.17-.11-.22a.5.5 0 0 0-.24-.06zM74.722 17.15h.4V6h4.195l4.59 11.15h.4V6h2.112v13h-4.125L77.72 7.85h-.4V19H73.11L68.535 7.85h-.4V19h-2.112V6h4.108zM58.023 6a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13m0 2.241a4.259 4.259 0 1 0 0 8.518 4.259 4.259 0 0 0 0-8.518M50.023 19H47.78V6h2.242zM40.747 6c1 0 1.857.147 2.562.448l.132.059c.648.3 1.152.73 1.503 1.293l.07.113q.5.863.498 2.057a3.6 3.6 0 0 1-.388 1.667q-.38.75-1.096 1.278-.42.308-.937.52l2.984 5.207.206.358h-2.419l-.049-.087-2.802-5.043h-2.697V19h-2.28V6zm-2.433 5.94 2.355.004c.606 0 1.096-.101 1.48-.294.39-.202.676-.467.868-.796.194-.332.292-.478.292-.884 0-.464-.094-.63-.277-.967-.178-.329-.46-.586-.858-.77l-.003-.001c-.39-.188-.905-.288-1.556-.288l-2.301-.005zM34.534 8.108h-4.096V19h-2.341V8.108H24V6h10.534z" />
      </g>
    </svg>
  );
}

function SoundButton({
  soundOn,
  playing,
  light = false,
  onClick,
}: {
  soundOn: boolean;
  playing: boolean;
  light?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-sound-button
      data-audio-playing={playing ? "true" : "false"}
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
        data-sound-icon
        aria-hidden="true"
        viewBox="0 0 16 15"
        fill="none"
      >
        <g opacity="0.4" fill="currentColor">
          <path d="M13.722 1.457a.37.37 0 0 0-.525.529c1.329 1.339 2.061 3.12 2.061 5.014s-.732 3.675-2.061 5.015a.375.375 0 0 0 .525.529C15.191 11.063 16 9.094 16 7s-.809-4.062-2.278-5.543" />
          <path d="M12.165 4.034a.37.37 0 0 0-.525.529c.645.65 1 1.515 1 2.436s-.355 1.787-1 2.437a.375.375 0 0 0 .525.529A4.2 4.2 0 0 0 13.382 7a4.2 4.2 0 0 0-1.217-2.966" />
          <path d="M9.409.06a.59.59 0 0 0-.62.067L4.593 3.451l-.203.161v3.382a.385.385 0 1 1-.769 0V3.622h-2.57C.472 3.622 0 4.098 0 4.682v4.636c0 .584.472 1.06 1.051 1.06h3.326l2.902 2.298v-2.625a.385.385 0 1 1 .768 0v3.234l.742.588a.59.59 0 0 0 .62.067.59.59 0 0 0 .331-.533V.593A.59.59 0 0 0 9.409.06" />
        </g>
        {!soundOn && (
          <path
            d="m15 .708-13.293 13.293"
            stroke="currentColor"
            strokeOpacity="0.6"
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
  const pathname = usePathname();
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
  const menuButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );
  const closeMenuButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );
  const scrollPositionRef =
    useRef(0);
  const timelineRef =
    useRef<ReturnType<
      typeof gsap.timeline
    > | null>(null);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const audioSnapshot = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.getSnapshot,
    audioManager.getServerSnapshot,
  );
  const soundOn = !audioSnapshot.muted;
  const audioPlaying = audioSnapshot.status === "playing";

  const [
    isMobileMenu,
    setIsMobileMenu,
  ] = useState(false);

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
      const isMobile =
        isMobileMenu;

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

      gsap.set(
        panel,
        {
          clipPath:
            isMobile
              ? "inset(0 0 100% 0 round 0px)"
              : "inset(0 0 calc(100% - 38px) calc(100% - 96px) round 999px)",
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
              menuButtonRef.current?.focus({
                preventScroll: true,
              });
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
              isMobile
                ? "inset(0 0 0% 0% round 0px)"
                : "inset(0 0 0% 0% round 10px)",
            duration:
              isMobile
                ? 0.58
                : 0.88,
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
          isMobile
            ? 0.16
            : 0.28,
        )
        .to(
          "[data-menu-nav-item]",
          {
            autoAlpha: 1,
            y: 0,
            duration:
              isMobile
                ? 0.34
                : 0.48,
            stagger:
              isMobile
                ? 0.035
                : 0.045,
            ease:
              "power3.out",
          },
          isMobile
            ? 0.2
            : 0.36,
        )
        .to(
          "[data-menu-secondary]",
          {
            autoAlpha: 1,
            y: 0,
            duration:
              isMobile
                ? 0.3
                : 0.42,
            stagger: 0.045,
            ease:
              "power3.out",
          },
          isMobile
            ? 0.28
            : 0.46,
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
      dependencies: [
        isMobileMenu,
      ],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    const query =
      window.matchMedia(
        "(max-width: 767px)",
      );

    const sync = () => {
      setIsMobileMenu(
        query.matches,
      );
      setIsOpen(false);
    };

    sync();
    query.addEventListener(
      "change",
      sync,
    );

    return () => {
      query.removeEventListener(
        "change",
        sync,
      );
    };
  }, []);

  useEffect(() => {
    const frame =
      window.requestAnimationFrame(
        () => {
          setIsOpen(false);
          audioManager.stopCharge();
        },
      );

    return () => {
      window.cancelAnimationFrame(
        frame,
      );
    };
  }, [pathname]);

  useEffect(
    () => {
      const timeline =
        timelineRef.current;

      if (!timeline) {
        return;
      }

      if (isOpen) {
        if (
          window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches
        ) {
          timeline.progress(1).pause();
        } else {
          timeline.play();
        }
      } else {
        if (
          window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches
        ) {
          timeline.progress(0).pause();
          menuButtonRef.current?.focus({
            preventScroll: true,
          });
        } else {
          timeline.reverse();
        }
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
      const body =
        document.body;
      const previousOverflow =
        html.style.overflow;
      const previousBodyOverflow =
        body.style.overflow;
      const previousBodyPosition =
        body.style.position;
      const previousBodyTop =
        body.style.top;
      const previousBodyWidth =
        body.style.width;
      const main =
        document.querySelector<HTMLElement>(
          "main",
        );
      const mainWasInert =
        main?.inert ?? false;

      scrollPositionRef.current =
        window.scrollY;

      html.style.overflow =
        "hidden";
      body.style.overflow =
        "hidden";
      body.style.position =
        "fixed";
      body.style.top =
        `${-scrollPositionRef.current}px`;
      body.style.width =
        "100%";
      if (main) {
        main.inert = true;
      }
      scrollManager.stop();

      return () => {
        html.style.overflow =
          previousOverflow;
        body.style.overflow =
          previousBodyOverflow;
        body.style.position =
          previousBodyPosition;
        body.style.top =
          previousBodyTop;
        body.style.width =
          previousBodyWidth;
        if (main) {
          main.inert = mainWasInert;
        }
        window.scrollTo(
          0,
          scrollPositionRef.current,
        );
        scrollManager.scrollTo(
          scrollPositionRef.current,
          {
            immediate: true,
            force: true,
          },
        );
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
          return;
        }

        if (
          event.key !== "Tab"
        ) {
          return;
        }

        const layer =
          layerRef.current;

        if (!layer) {
          return;
        }

        const focusable =
          Array.from(
            layer.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter(
            (element) =>
              element.tabIndex >= 0 &&
              element.getClientRects()
                .length > 0,
          );

        if (
          focusable.length === 0
        ) {
          return;
        }

        const first =
          focusable[0];
        const last =
          focusable[
            focusable.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement ===
            first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement ===
            last
        ) {
          event.preventDefault();
          first.focus();
        }
      };

      const focusTimer =
        window.setTimeout(
          () => {
            closeMenuButtonRef.current?.focus({
              preventScroll: true,
            });
          },
          window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches
            ? 0
            : isMobileMenu
              ? 190
              : 310,
        );

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        window.clearTimeout(
          focusTimer,
        );
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [isOpen, isMobileMenu],
  );

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleSound =
    async () => {
      if (audioSnapshot.muted) {
        audioManager.unmute();
        await audioManager.unlock();

        return;
      }

      audioManager.mute();
    };

  const pillTextStyle = {
    fontFamily:
      MONO_UI_FONT,
  };

  return (
    <header
      ref={rootRef}
      data-menu-open={
        isOpen
          ? "true"
          : "false"
      }
      className="pointer-events-none"
    >
      <div
        data-hero-nav-vibrate
        data-header-bar
        className="fixed inset-x-0 top-0 z-[300] flex h-[63px] items-center justify-between px-[18px] md:h-[102px] md:px-[36px]"
      >
        <TransitionLink
          href="/"
          aria-label="Trionn home"
          onClick={closeMenu}
          className="pointer-events-auto text-[#eeeeeb]"
        >
          <BrandMark />
        </TransitionLink>

        <div
          ref={closedControlsRef}
          data-closed-controls
          inert={isOpen}
          className="pointer-events-auto ml-auto flex items-center gap-[7px]"
        >
          <SoundButton
            soundOn={soundOn}
            playing={audioPlaying}
            onClick={toggleSound}
          />

          <TransitionLink
            href="/contact"
            aria-label="Let's talk"
            style={pillTextStyle}
            onMouseEnter={(
              event,
            ) => {
              playTextMotion(
                event.currentTarget,
              );
            }}
            className="group flex items-center justify-center overflow-hidden rounded-full bg-[#f5f5f2] font-normal uppercase !text-[#111] focus:outline-none"
          >
            <MotionText
              text="LET'S TALK"
              variant="pill"
            />
          </TransitionLink>

          <button
            ref={menuButtonRef}
            data-header-menu-button
            type="button"
            aria-expanded={isOpen}
            aria-controls="site-navigation"
            aria-label="Open menu"
            style={pillTextStyle}
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
            className="group flex items-center rounded-full border border-white/60 bg-transparent font-normal uppercase text-[#eeeeeb] transition-[background-color,border-color] duration-200 hover:border-white/85 hover:bg-white/[0.035] focus:outline-none"
          >
            <span data-header-menu-label>
              <MotionText
                text="MENU"
                variant="pill"
              />
            </span>
            <span
              data-desktop-menu-icon
              className="flex w-[8px] flex-col gap-[2.5px]"
            >
              <span data-menu-line="top" className="h-px w-full bg-current" />
              <span data-menu-line="bottom" className="h-px w-full bg-current" />
            </span>
            <svg
              data-mobile-menu-icon
              aria-hidden="true"
              viewBox="0 0 40 40"
            >
              <path d="M0 16H40" />
              <path d="M0 25H40" />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="site-navigation"
        ref={layerRef}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className="pointer-events-none fixed inset-0 z-[290] opacity-0"
      >
        <button
          ref={backdropRef}
          type="button"
          tabIndex={-1}
          aria-label="Close navigation"
          onClick={closeMenu}
          className="absolute inset-0 cursor-default bg-black/20 focus:outline-none"
        />

        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          data-menu-panel
          className="absolute bottom-[10px] right-[10px] top-[10px] w-[calc(100vw-20px)] overflow-hidden rounded-[10px] border border-black/[0.05] bg-[#f3f2ee] text-[#151515] shadow-[0_18px_70px_rgba(0,0,0,0.18)] sm:w-[min(468px,calc(100vw-20px))]"
        >
          <div
            data-menu-controls
            className="absolute right-[17px] top-[17px] z-10 flex items-center gap-[7px]"
          >
            <SoundButton
              light
              soundOn={soundOn}
              playing={audioPlaying}
              onClick={toggleSound}
            />

            <TransitionLink
              href="/contact"
              aria-label="Let's talk"
              style={pillTextStyle}
              onClick={closeMenu}
              onMouseEnter={(
                event,
              ) => {
                playTextMotion(
                  event.currentTarget,
                );
              }}
              className="group flex items-center overflow-hidden rounded-full bg-[#0c0c0c] font-normal uppercase text-white"
            >
              <MotionText
                text="LET'S TALK"
                variant="pill"
              />
            </TransitionLink>

            <button
              ref={closeMenuButtonRef}
              data-header-menu-button
              type="button"
              aria-label="Close menu"
              style={pillTextStyle}
              onMouseEnter={(
                event,
              ) => {
                playTextMotion(
                  event.currentTarget,
                );
              }}
              onClick={closeMenu}
              className="group flex items-center rounded-full border border-black/70 font-normal uppercase text-[#111] transition-[background-color,border-color] duration-200 hover:border-black/90 hover:bg-black/[0.025] focus:outline-none"
            >
              <span data-header-menu-label>
                <MotionText
                  text="MENU"
                  variant="pill"
                />
              </span>
              <span className="relative block h-[9px] w-[9px]">
                <span className="absolute left-1/2 top-1/2 h-px w-[9px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-1/2 top-1/2 h-px w-[9px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <div
            data-menu-content
            className="flex h-full flex-col px-[24px] pb-[26px] pt-[145px] sm:px-[32px] sm:pb-[31px] sm:pt-[154px]"
          >
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
              className="group mt-[27px] flex h-[46px] w-fit min-w-[308px] items-center rounded-full border border-black/[0.34] px-[16px] text-[15.5px] font-normal leading-none tracking-[-0.025em] transition-[border-color,background-color] duration-300 hover:border-black/58 hover:bg-black/[0.02]"
            >
              <span className="mr-[9px] shrink-0 text-[12.5px]">
                ✦
              </span>
              <MotionText
                text="The TRIONN name Story"
                variant="rewrite"
              />
              <span className="ml-auto pl-[14px] text-[13px]">
                ↗
              </span>
            </TransitionLink>

            <div
              data-menu-footer
              className="mt-auto"
            >
              <div
                data-menu-secondary
                data-menu-enquiry
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
                data-menu-social
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

            <div
              data-menu-secondary
              data-menu-stat
              className="hidden"
            >
              <div className="flex flex-col items-center justify-center border-r border-white/20">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 28 18"
                  className="mb-[5px] h-[16px] w-[25px]"
                  fill="none"
                >
                  <ellipse cx="14" cy="9" rx="11" ry="7" stroke="currentColor" />
                  <ellipse cx="14" cy="9" rx="5" ry="7" stroke="currentColor" />
                  <path d="M3 9H25" stroke="currentColor" />
                </svg>
                <span>Est. 2012</span>
              </div>
              <div className="flex items-center px-[12px]">
                <span>
                  14+ years shaping
                  <br />
                  digital direction.
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
