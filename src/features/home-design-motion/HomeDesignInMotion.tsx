"use client";

import { useRef } from "react";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap/client";

import { DesignMotionOrbit } from "./DesignMotionOrbit";
import styles from "./HomeDesignInMotion.module.css";

const DRIBBBLE_URL = "https://dribbble.com/trionnstudio";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothRange(progress: number, start: number, end: number) {
  const value = clamp01((progress - start) / (end - start));
  return value * value * (3 - 2 * value);
}

export function HomeDesignInMotion() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      if (!section || !canvas) return;

      const design = section.querySelector<HTMLElement>("[data-motion-design]");
      const motion = section.querySelector<HTMLElement>("[data-motion-word]");
      const caption = section.querySelector<HTMLElement>("[data-motion-caption]");
      const stripes = Array.from(
        section.querySelectorAll<HTMLElement>("[data-motion-dark-stripe]"),
      );
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const orbit = new DesignMotionOrbit(canvas);

      const setTheme = (theme: "light" | "dark") => {
        document.documentElement.dataset.pageTheme = theme;
      };

      let orbitTicking = false;
      let currentProgress = 0;
      const tickOrbit = () => {
        orbit.render(reducedMotion ? 0.73 : currentProgress);
      };
      const setOrbitTicking = (active: boolean) => {
        if (active === orbitTicking) return;
        orbitTicking = active;
        if (active) gsap.ticker.add(tickOrbit);
        else gsap.ticker.remove(tickOrbit);
      };

      const render = (progress: number) => {
        currentProgress = progress;
        const titleProgress = clamp01(0.156 + progress * 2.004);
        const titleOpacity = 1 - smoothRange(progress, 0.36, 0.47);

        if (design) {
          design.style.opacity = `${titleOpacity}`;
          design.style.transform = `translate3d(${(-34.4 + titleProgress * 134.4).toFixed(3)}vw,0,0)`;
        }
        if (motion) {
          motion.style.opacity = `${titleOpacity}`;
          motion.style.transform = `translate3d(${(29.4 - titleProgress * 129.4).toFixed(3)}vw,0,0)`;
        }
        if (caption) {
          caption.style.opacity = `${1 - smoothRange(progress, 0.31, 0.45)}`;
        }

        tickOrbit();

        const mobile = window.innerWidth < 768;
        const stripeStart = (mobile ? 3 : 5) / (mobile ? 4.5 : 6.5);
        const stripeProgress = clamp01(
          (progress - stripeStart) / (1 - stripeStart),
        );
        stripes.forEach((stripe, index) => {
          const timelineTime = stripeProgress * 0.7;
          const delay =
            (0.3 * (stripes.length - 1 - index)) /
            Math.max(1, stripes.length - 1);
          const local = clamp01((timelineTime - delay) / 0.3);
          stripe.style.transform = `scaleY(${local})`;
        });

        setTheme(stripeProgress > 0.7 ? "dark" : "light");
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onEnter: () => setTheme("light"),
        onEnterBack: () => setTheme("light"),
        onLeave: () => setTheme("dark"),
        onLeaveBack: () => setTheme("light"),
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => {
          orbit.resize();
          render(self.progress);
        },
      });

      const orbitActivityTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 200%",
        end: "bottom top",
        onToggle: (self) => {
          orbit.setActive(self.isActive);
          setOrbitTicking(self.isActive);
        },
      });

      const resize = () => {
        orbit.resize();
        render(trigger.progress);
      };
      window.addEventListener("resize", resize);
      render(trigger.progress);

      return () => {
        setOrbitTicking(false);
        window.removeEventListener("resize", resize);
        orbitActivityTrigger.kill();
        trigger.kill();
        orbit.dispose();
        delete document.documentElement.dataset.pageTheme;
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="design-in-motion"
      data-home-design-motion
      aria-labelledby="design-in-motion-heading"
      className={styles.section}
    >
      <div data-motion-stage className={styles.stage}>
        <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />

        <div className={styles.title}>
          <h2
            id="design-in-motion-heading"
            data-motion-design
            className={`${styles.displayLine} ${styles.designLine}`}
          >
            Design in
          </h2>
          <span data-motion-caption className={styles.caption}>
            Exploring ideas through
            <br />
            daily design practice.
          </span>
          <span
            data-motion-word
            aria-hidden="true"
            className={`${styles.displayLine} ${styles.motionLine}`}
          >
            Motion
          </span>
        </div>

        <p data-motion-intro className={styles.intro}>
          Concepts, explorations, and interface{" "}
          <br />
          experiments shared openly as part of{" "}
          <br />
          our creative process.
        </p>

        <a
          href={DRIBBBLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          <span>View on Dribbble</span>
          <span aria-hidden="true">→</span>
        </a>

        <div aria-hidden="true" className={styles.darkWipe}>
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              data-motion-dark-stripe
              className={styles.darkStripe}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
