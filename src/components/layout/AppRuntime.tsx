"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import { canvasManager } from "@/runtime/canvas/CanvasManager";
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

    scrollManager.init();
    canvasManager.init();

    return () => {
      canvasManager.destroy();
      scrollManager.destroy();
    };
  }, []);

  return children;
}