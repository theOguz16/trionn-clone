import type {
  Metadata,
} from "next";

import {
  TransitionLink,
} from "@/components/motion/TransitionLink";

export const metadata:
  Metadata = {
  title: "About",

  description:
    "About the Motion Lab experiment.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#d9d5cc] text-[#0a0a0a]">
      <section className="flex min-h-[100svh] flex-col justify-between px-5 pb-8 pt-32 md:px-10 md:pb-10 md:pt-36">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] opacity-50 md:text-xs">
          <span>
            About
          </span>

          <span>
            2026
          </span>
        </div>

        <div>
          <p className="mb-6 max-w-sm text-xs uppercase leading-relaxed tracking-[0.13em] opacity-50">
            Motion, WebGL,
            interaction and
            creative development.
          </p>

          <h1 className="max-w-[12ch] text-[13vw] font-semibold uppercase leading-[0.82] tracking-[-0.075em] md:text-[9vw]">
            Digital
            experiences
            should feel
            alive.
          </h1>
        </div>

        <div className="flex items-end justify-between">
          <p className="max-w-xs text-sm leading-relaxed opacity-60">
            This page is only
            structural for now.
            We&apos;ll build the
            actual About experience
            later.
          </p>

          <TransitionLink
            href="/"
            className="text-xs font-medium uppercase tracking-[0.14em]"
          >
            Back home →
          </TransitionLink>
        </div>
      </section>
    </div>
  );
}