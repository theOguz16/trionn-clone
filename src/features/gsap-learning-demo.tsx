"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap/client";

export function GsapLearningDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(boxRef.current, {
        x: 600,
        rotation: 360,
        scale: 1.5,

        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
          markers: true,
        },
      });
    },
    {
      scope: sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[200vh] items-start bg-neutral-950 px-10 py-40"
    >
      <div
        ref={boxRef}
        className="h-32 w-32 bg-orange-500"
      />
    </section>
  );
}