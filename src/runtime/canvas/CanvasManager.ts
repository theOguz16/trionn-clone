import { gsap } from "@/lib/gsap/client";
import { qualityManager } from "@/runtime/quality/QualityManager";

import type {
  RuntimeFrame,
  RuntimeScene,
} from "./RuntimeScene";

type SceneRecord = {
  scene: RuntimeScene;
  active: boolean;
};

class CanvasManager {
  private scenes = new Map<string, SceneRecord>();

  private initialized = false;

  private tickerAttached = false;

  private resizeFrame: number | null = null;

  private lastReducedTick = 0;

  private readonly tick = (
    time: number,
    deltaTime: number,
    frame: number,
  ) => {
    if (
      qualityManager.prefersReducedMotion &&
      time - this.lastReducedTick < 0.1
    ) {
      return;
    }

    this.lastReducedTick = time;

    const runtimeFrame: RuntimeFrame = {
      time,
      delta: Math.min(deltaTime / 1000, 0.05),
      frame,
    };

    if (
      qualityManager.observeFrame(
        deltaTime,
      )
    ) {
      this.resizeActiveScenes();
    }

    for (const record of this.scenes.values()) {
      if (!record.active) {
        continue;
      }

      record.scene.update(runtimeFrame);
    }
  };

  private readonly handleResize = () => {
    if (this.resizeFrame !== null) {
      return;
    }

    this.resizeFrame =
      window.requestAnimationFrame(
        () => {
          this.resizeFrame = null;
          this.resizeActiveScenes();
        },
      );
  };

  private readonly handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      this.resizeActiveScenes();
    }

    this.reconcileTicker();
  };

  private resizeActiveScenes() {
    for (const record of this.scenes.values()) {
      if (!record.active) {
        continue;
      }

      record.scene.resize();
    }
  }

  private reconcileTicker() {
    const shouldRun =
      document.visibilityState === "visible" &&
      Array.from(
        this.scenes.values(),
      ).some(({ active }) => active);

    if (shouldRun === this.tickerAttached) {
      return;
    }

    if (shouldRun) {
      gsap.ticker.add(this.tick);
    } else {
      gsap.ticker.remove(this.tick);
    }

    this.tickerAttached = shouldRun;
  }

  init() {
    if (this.initialized) {
      return;
    }

    window.addEventListener(
      "resize",
      this.handleResize,
    );

    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );

    this.initialized = true;
  }

  register(
    scene: RuntimeScene,
    active = false,
  ) {
    this.init();

    if (this.scenes.has(scene.id)) {
      throw new Error(
        `Scene with id "${scene.id}" is already registered.`,
      );
    }

    this.scenes.set(scene.id, {
      scene,
      active,
    });

    scene.resize();

    this.reconcileTicker();

    return () => {
      this.unregister(scene.id);
    };
  }

  unregister(id: string) {
    const record = this.scenes.get(id);

    if (!record) {
      return;
    }

    record.scene.destroy();

    this.scenes.delete(id);

    this.reconcileTicker();
  }

  setActive(
    id: string,
    active: boolean,
  ) {
    const record = this.scenes.get(id);

    if (!record) {
      return;
    }

    if (record.active === active) {
      return;
    }

    record.active = active;

    if (active) {
      record.scene.resize();
    }

    this.reconcileTicker();
  }

  destroy() {
    if (!this.initialized) {
      return;
    }

    if (this.tickerAttached) {
      gsap.ticker.remove(this.tick);
      this.tickerAttached = false;
    }

    window.removeEventListener(
      "resize",
      this.handleResize,
    );

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );

    if (this.resizeFrame !== null) {
      window.cancelAnimationFrame(
        this.resizeFrame,
      );
      this.resizeFrame = null;
    }

    for (const record of this.scenes.values()) {
      record.scene.destroy();
    }

    this.scenes.clear();

    this.initialized = false;
  }
}

export const canvasManager = new CanvasManager();
