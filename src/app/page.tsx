import type {
  Metadata,
} from "next";

import {
  HomeHero,
} from "@/features/home-hero/HomeHero";

import {
  ServicesSequence,
} from "@/features/services-sequence/ServicesSequence";

export const metadata:
  Metadata = {
    title:
      "TRIONN | AI-Powered Creative Design & Development Studio in India",

    description:
      "Independent digital studio creating meaningful brand experiences through strategy, design, technology, AI, and development.",
  };

export default function Home() {
  return (
    <main className="bg-[#090909]">
      <HomeHero />

      <ServicesSequence />
    </main>
  );
}