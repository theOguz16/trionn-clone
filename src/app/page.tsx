import type {
  Metadata,
} from "next";

import {
  HomeHero,
} from "@/features/home-hero/HomeHero";

import {
  HomeAboutIntro,
} from "@/features/home-about/HomeAboutIntro";

import {
  HomeStripeWipe,
} from "@/features/home-about/HomeStripeWipe";

import {
  HomeKeyFacts,
} from "@/features/home-about/HomeKeyFacts";

import {
  HomeSelectedWork,
} from "@/features/home-work/HomeSelectedWork";

import {
  HomeServicesShowcase,
} from "@/features/home-services/HomeServicesShowcase";

import {
  HomeClientStories,
} from "@/features/home-testimonials/HomeClientStories";

import {
  HomeDesignInMotion,
} from "@/features/home-design-motion/HomeDesignInMotion";

import {
  HomeAudioFooter,
} from "@/features/home-footer/HomeAudioFooter";

import {
  ServicesDebugHud,
} from "@/features/home-services/ServicesDebugHud";

const servicesDebugEnabled =
  process.env.NEXT_PUBLIC_SERVICES_DEBUG ===
  "true";

export const metadata:
  Metadata = {
    title:
      "TRIONN | AI-Powered Creative Design & Development Studio in India",

    description:
      "Independent AI-powered digital design and development studio creating purposeful digital experiences.",
  };

export default function HomePage() {
  return (
    <main
      data-home-page
      className="relative z-[1] w-full overflow-x-clip bg-transparent"
    >
      <HomeHero />

      <HomeAboutIntro />

      <HomeStripeWipe />

      <HomeKeyFacts />

      <HomeSelectedWork />

      <HomeServicesShowcase />

      <HomeClientStories />

      <HomeDesignInMotion />

      <HomeAudioFooter />

      {servicesDebugEnabled ? (
        <ServicesDebugHud />
      ) : null}
    </main>
  );
}
