"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import { ScrollTrigger } from "@/lib/gsap/client";

import { canvasManager } from "@/runtime/canvas/CanvasManager";
import { audioManager } from "@/runtime/audio/AudioManager";
import { qualityManager } from "@/runtime/quality/QualityManager";
import { scrollManager } from "@/runtime/scroll/ScrollManager";

type AppRuntimeProps = {
  children: ReactNode;
};

export function AppRuntime({
  children,
}: AppRuntimeProps) {
  useEffect(() => {
    qualityManager.init();

    audioManager.load({
      src: "/audio/thunder.mp3",
      type: "audio/mpeg",
    });

    scrollManager.init();
    canvasManager.init();

    let refreshFrame:
      number | null = null;

    const refreshLayout = () => {
      if (refreshFrame !== null) {
        window.cancelAnimationFrame(
          refreshFrame,
        );
      }

      refreshFrame =
        window.requestAnimationFrame(
          () => {
            refreshFrame = null;
            ScrollTrigger.refresh();
          },
        );
    };

    window.addEventListener(
      "orientationchange",
      refreshLayout,
    );

    window.visualViewport?.addEventListener(
      "resize",
      refreshLayout,
    );

    return () => {
      window.removeEventListener(
        "orientationchange",
        refreshLayout,
      );
      window.visualViewport?.removeEventListener(
        "resize",
        refreshLayout,
      );

      if (refreshFrame !== null) {
        window.cancelAnimationFrame(
          refreshFrame,
        );
      }

      canvasManager.destroy();
      scrollManager.destroy();
      void audioManager.destroy();
    };
  }, []);

  return children;
}
