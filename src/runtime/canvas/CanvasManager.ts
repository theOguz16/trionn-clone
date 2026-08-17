import { gsap } from "@/lib/gsap/client";

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

  private readonly tick = (
    time: number,
    deltaTime: number,
    frame: number,
  ) => {
    const runtimeFrame: RuntimeFrame = {
      time,
      delta: Math.min(deltaTime / 1000, 0.05),
      frame,
    };

    for (const record of this.scenes.values()) {
      if (!record.active) {
        continue;
      }

      record.scene.update(runtimeFrame);
    }
  };

  private readonly handleResize = () => {
    for (const record of this.scenes.values()) {
      record.scene.resize();
    }
  };

  init() {
    if (this.initialized) {
      return;
    }

    gsap.ticker.add(this.tick);

    window.addEventListener(
      "resize",
      this.handleResize,
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
  }

  setActive(
    id: string,
    active: boolean,
  ) {
    const record = this.scenes.get(id);

    if (!record) {
      return;
    }

    record.active = active;
  }

  destroy() {
    if (!this.initialized) {
      return;
    }

    gsap.ticker.remove(this.tick);

    window.removeEventListener(
      "resize",
      this.handleResize,
    );

    for (const record of this.scenes.values()) {
      record.scene.destroy();
    }

    this.scenes.clear();

    this.initialized = false;
  }
}

export const canvasManager = new CanvasManager();