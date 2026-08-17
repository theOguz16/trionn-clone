import {
  HomeHero,
} from "@/features/home-hero/HomeHero";

export default function Home() {
  return (
    <main>
      <HomeHero />

      <section className="flex min-h-screen items-center justify-center bg-[#ece9df] px-6 text-black">
        <p className="max-w-3xl text-center text-4xl font-medium leading-tight md:text-7xl">
          Architecture before
          spectacle.
        </p>
      </section>
    </main>
  );
}