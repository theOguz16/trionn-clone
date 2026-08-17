"use client";

import {
  useEffect,
  useRef,
} from "react";

import { gsap } from "@/lib/gsap/client";
import { canvasManager } from "@/runtime/canvas/CanvasManager";

import { ThreeLearningScene } from "./ThreeLearningScene";

export function ThreeLearningDemo() {
  const sectionRef =
    useRef<HTMLElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section =
      sectionRef.current;

    const canvas =
      canvasRef.current;

    if (!section || !canvas) {
      return;
    }

    // -------------------------
    // THREE SCENE
    // -------------------------

    const scene =
      new ThreeLearningScene(canvas);

    const unregister =
      canvasManager.register(
        scene,
        false,
      );

    // -------------------------
    // VISIBILITY
    // -------------------------

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          canvasManager.setActive(
            scene.id,
            entry.isIntersecting,
          );
        },
        {
          rootMargin: "25% 0px",
        },
      );

    observer.observe(section);

    // -------------------------
    // SCROLL ANIMATION
    // -------------------------

    const timeline =
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          markers: true,
        },
      });

    timeline
      .to(
        scene.cube.rotation,
        {
          x: Math.PI * 2,
          y: Math.PI * 4,
          ease: "none",
        },
        0,
      )
      .to(
        scene.cube.position,
        {
          x: 1.5,
          ease: "none",
        },
        0,
      )
      .to(
        scene.cube.scale,
        {
          x: 1.4,
          y: 1.4,
          z: 1.4,
          ease: "none",
        },
        0,
      );

    // -------------------------
    // CLEANUP
    // -------------------------

    return () => {
      observer.disconnect();

      timeline.scrollTrigger?.kill();
      timeline.kill();

      unregister();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[250vh] bg-black text-white"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute left-8 top-8 z-10">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-500">
            Managed Three.js
          </p>

          <h2 className="mt-3 text-5xl font-bold">
            Render only when needed
          </h2>
        </div>

        <canvas
          ref={canvasRef}
          className="h-full w-full"
        />
      </div>
    </section>
  );
}