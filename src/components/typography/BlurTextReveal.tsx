"use client";

import {
  useRef,
} from "react";

import {
  gsap,
  SplitText,
  useGSAP,
} from "@/lib/gsap/client";

type BlurTextRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
};

export function BlurTextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.08,
}: BlurTextRevealProps) {
  const textRef =
    useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const element =
        textRef.current;

      if (!element) {
        return;
      }

      const split =
        new SplitText(
          element,
          {
            type:
              "chars, words, lines",

            smartWrap:
              true,
          },
        );

      const chars =
        split.chars;

      const reducedMotion =
        window
          .matchMedia(
            "(prefers-reduced-motion: reduce)",
          )
          .matches;

      if (
        reducedMotion
      ) {
        gsap.set(
          element,
          {
            autoAlpha: 1,
            filter:
              "blur(0px)",
          },
        );

        gsap.set(
          chars,
          {
            autoAlpha: 1,
            filter:
              "blur(0px)",
          },
        );

        return () => {
          split.revert();
        };
      }

      gsap.set(
        element,
        {
          autoAlpha: 0,
          filter:
            "blur(12px)",
          willChange:
            "filter, opacity",
        },
      );

      gsap.set(
        chars,
        {
          autoAlpha: 0,
          filter:
            "blur(12px)",
          willChange:
            "filter, opacity",
        },
      );

      const timeline =
        gsap.timeline();

      timeline
        .to(
          element,
          {
            autoAlpha: 1,
            filter:
              "blur(0px)",
            duration: 0.5,
          },
          delay,
        )
        .to(
          chars,
          {
            autoAlpha: 1,
            filter:
              "blur(0px)",

            duration: 0.8,

            stagger: {
              each:
                stagger,

              from:
                "random",
            },

            ease:
              "power2.out",

            onComplete:
              () => {
                gsap.set(
                  [
                    element,
                    ...chars,
                  ],
                  {
                    clearProps:
                      "willChange",
                  },
                );
              },
          },
          delay,
        );

      return () => {
        timeline.kill();
        split.revert();
      };
    },
    {
      scope:
        textRef,

      dependencies: [
        text,
        delay,
        stagger,
      ],
    },
  );

  return (
    <span
      ref={textRef}
      className={
        className
      }
    >
      {text}
    </span>
  );
}