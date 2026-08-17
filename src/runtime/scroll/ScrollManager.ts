import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap/client";

class ScrollManager {
  private lenis: Lenis | null = null;

  private readonly tick = (time: number) => {
    this.lenis?.raf(time * 1000);
  };

  init() {
    if (this.lenis) {
      return;
    }

    this.lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      lerp: 0.1,
    });

    this.lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(this.tick);

    gsap.ticker.lagSmoothing(0);
  }

  start() {
    this.lenis?.start();
  }

  stop() {
    this.lenis?.stop();
  }

  scrollTo(
    target: number | string | HTMLElement,
    options?: Parameters<Lenis["scrollTo"]>[1],
  ) {
    this.lenis?.scrollTo(target, options);
  }

  get instance() {
    return this.lenis;
  }

  destroy() {
    if (!this.lenis) {
      return;
    }

    gsap.ticker.remove(this.tick);

    this.lenis.destroy();
    this.lenis = null;
  }
}

export const scrollManager = new ScrollManager();