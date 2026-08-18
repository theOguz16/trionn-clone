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

export const metadata:
  Metadata = {
    title:
      "TRIONN | AI-Powered Creative Design & Development Studio in India",

    description:
      "Independent AI-powered digital design and development studio creating purposeful digital experiences.",
  };

export default function HomePage() {
  return (
    <main className="bg-[#090909]">
      <HomeHero />

      <HomeAboutIntro />

      <HomeStripeWipe />

      <HomeKeyFacts />
    </main>
  );
}