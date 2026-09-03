import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import "lenis/dist/lenis.css";
import "./globals.css";

import {
  AppRuntime,
} from "@/components/layout/AppRuntime";

import {
  SiteHeader,
} from "@/components/layout/SiteHeader";

import {
  InitialPreloader,
} from "@/components/layout/InitialPreloader";

import {
  PageTransitionProvider,
} from "@/runtime/transition/PageTransitionProvider";

import {
  trionnBodyFont,
  trionnDisplayFont,
  trionnEditorialFont,
  trionnMonoFont,
} from "./fonts";

export const metadata:
  Metadata = {
  title: {
    default:
      "Motion Lab",

    template:
      "%s — Motion Lab",
  },

  description:
    "An experimental motion-first web experience built with Next.js, GSAP and Three.js.",
};

type RootLayoutProps = {
  children:
    ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${trionnDisplayFont.variable} ${trionnBodyFont.variable} ${trionnMonoFont.variable} ${trionnEditorialFont.variable}`}
    >
      <head>
        <link
          rel="preload"
          href="/models/trionn-test-model.optimized.glb"
          as="fetch"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
      </head>

      <body>
        <AppRuntime>
          <PageTransitionProvider>
            <SiteHeader />

            {children}
          </PageTransitionProvider>
        </AppRuntime>

        <InitialPreloader />
      </body>
    </html>
  );
}
