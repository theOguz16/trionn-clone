/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/client";

const PROJECTS = [
  {
    title: "MyWorker AI",
    description:
      "AI platform simplifying hiring, management, and workforce scaling.",
    image: "https://trionn.com/images/projects/myworker/myworker.jpg",
    href: "/work/myworker-ai",
  },
  {
    title: "Pulse Studio",
    description:
      "A motion-led studio website showcasing artists, projects, and culture.",
    image: "https://trionn.com/images/projects/pulse-studio/pulse-studio.jpg",
    href: "/work/pulse-studio",
  },
  {
    title: "Loftloom",
    description:
      "Seamless real estate platform for effortless property discovery.",
    image: "https://trionn.com/images/projects/loftloom/loftloom.jpg",
    href: "/work/loftloom",
  },
] as const;

function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex w-[162px] items-center justify-between border-b border-black/55 pb-[7px] font-mono text-[10px] uppercase tracking-[-0.015em] text-[#3f3f3f]"
    >
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-[4px]">
        →
      </span>
    </a>
  );
}

function ProjectPanel({
  project,
}: {
  project: (typeof PROJECTS)[number];
}) {
  return (
    <article className="relative h-[100svh] w-[52vw] min-w-[720px] flex-none border-l border-black/[0.09] bg-[#eeeeed] max-lg:min-w-[620px] max-md:w-[92vw] max-md:min-w-0">
      <div className="mx-auto flex h-full w-[79.5%] flex-col pt-[18.1svh]">
        <a
          href={project.href}
          className="block h-[50.5svh] min-h-[390px] max-h-[470px] overflow-hidden rounded-[6px] bg-[#d9d9d7]"
        >
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </a>

        <div className="mt-[20px] grid grid-cols-[1fr_auto] gap-8">
          <div>
            <h3 className="text-[26px] font-normal leading-none tracking-[-0.055em] text-[#464646]">
              {project.title}
            </h3>
            <p className="mt-[12px] max-w-[305px] text-[13px] leading-[1.24] tracking-[-0.025em] text-[#656565]">
              {project.description}
            </p>
          </div>

          <div className="self-end pb-[2px]">
            <ArrowLink href={project.href}>Explore project</ArrowLink>
          </div>
        </div>
      </div>
    </article>
  );
}

function IntroPanel() {
  return (
    <div className="relative h-[100svh] w-[31vw] min-w-[420px] flex-none bg-[#eeeeed] max-md:w-[82vw] max-md:min-w-0">
      <div className="absolute left-[-1.25vw] top-[46.8svh] -translate-y-1/2">
        <h2 className="w-[31vw] min-w-[420px] text-[clamp(3.9rem,4.25vw,4.9rem)] font-normal leading-[0.9] tracking-[-0.067em] text-[#484848] max-md:w-[82vw] max-md:min-w-0">
          Selected work
          <br />
          &amp; explorations
        </h2>

        <div className="mt-[48px] ml-[1.8vw]">
          <ArrowLink href="/work">View all projects</ArrowLink>
        </div>
      </div>
    </div>
  );
}

function CollectionPanel() {
  return (
    <div className="relative h-[100svh] w-[38vw] min-w-[560px] flex-none border-l border-black/[0.09] bg-[#eeeeed] max-md:w-[92vw] max-md:min-w-0">
      <div className="absolute left-1/2 top-[51%] w-[78%] -translate-x-1/2 -translate-y-1/2 text-center">
        <h3 className="mx-auto max-w-[420px] text-[29px] font-normal leading-[0.98] tracking-[-0.055em] text-[#474747]">
          Discover our complete collection
          <br />
          of digital experiences, brands,
          <br />
          and platforms.
        </h3>

        <div className="mt-[49px] flex justify-center">
          <ArrowLink href="/work">View all projects</ArrowLink>
        </div>
      </div>
    </div>
  );
}

function ServicesPanel() {
  return (
    <section className="relative h-[100svh] w-[100vw] flex-none border-l border-black/[0.1] bg-[#f4f4f3] text-[#242424]">
      <p className="absolute left-1/2 top-[10.4svh] -translate-x-1/2 text-[11px] uppercase tracking-[-0.03em]">
        Our services
      </p>

      <div className="absolute left-1/2 top-[53.5%] w-[74vw] max-w-[1110px] -translate-x-1/2 -translate-y-1/2 text-center uppercase">
        <div className="text-[clamp(5.8rem,8.6vw,9.2rem)] font-normal leading-[0.67] tracking-[-0.085em]">
          <div>A.I.</div>
          <div>Design</div>
          <div>Development</div>
          <div>Branding</div>
        </div>
      </div>

      <p className="absolute bottom-[7.5svh] left-[11.3vw] text-[11px] uppercase tracking-[-0.03em]">
        ✦ Design with intent. Built to work.
      </p>

      <div className="absolute bottom-[6.4svh] right-[2.2vw]">
        <ArrowLink href="/services">View services</ArrowLink>
      </div>
    </section>
  );
}

export function HomeSelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;

      if (!section || !track) {
        return;
      }

      const getTravel = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.set(track, {
        x: 0,
        force3D: true,
        willChange: "transform",
      });

      const tween = gsap.to(track, {
        x: () => -getTravel(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const trigger = tween.scrollTrigger as ScrollTrigger | undefined;

      return () => {
        trigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[52] h-[420svh] bg-[#eeeeed]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#eeeeed]">
        <div ref={trackRef} className="flex h-full w-max items-stretch">
          <IntroPanel />
          {PROJECTS.map((project) => (
            <ProjectPanel key={project.title} project={project} />
          ))}
          <CollectionPanel />
          <ServicesPanel />
        </div>
      </div>
    </section>
  );
}
