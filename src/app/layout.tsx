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
  PageTransitionProvider,
} from "@/runtime/transition/PageTransitionProvider";

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
    <html lang="en">
      <body>
        <AppRuntime>
          <PageTransitionProvider>
            <SiteHeader />

            <main>
              {children}
            </main>
          </PageTransitionProvider>
        </AppRuntime>
      </body>
    </html>
  );
}