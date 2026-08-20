/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/gsap/client";

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

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group flex w-[214px] items-center justify-between border-b border-black/55 pb-[8px] font-mono text-[10px] uppercase leading-none tracking-[-0.02em] text-[#424242]"
    >
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-[5px]">
        →
      </span>
    </a>
  );
}

function IntroPanel() {
  return (
    <section className="relative h-[100svh] w-[50vw] flex-none bg-transparent">
      <div className="absolute left-[2.1vw] top-[46.7%] -translate-y-1/2">
        <h2 className="w-[43vw] text-[clamp(4.2rem,5vw,6rem)] font-normal leading-[0.88] tracking-[-0.068em] text-[#454545]">
          Selected work
          <br />
          &amp; explorations
        </h2>

        <div className="mt-[48px]">
          <ArrowLink href="/work">View all projects</ArrowLink>
        </div>
      </div>
    </section>
  );
}

function ProjectPanel({ project }: { project: (typeof PROJECTS)[number] }) {
  return (
    <article className="relative h-[100svh] w-[50vw] flex-none border-l border-black/[0.085] bg-transparent">
      <div className="absolute left-[8.45%] right-[8.45%] top-[22.25svh]">
        <a
          href={project.href}
          className="block h-[48.25svh] min-h-[390px] max-h-[585px] overflow-hidden rounded-[6px] bg-[#d8d8d6]"
        >
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </a>

        <div className="mt-[20px] grid grid-cols-[1fr_auto] items-end gap-8">
          <div>
            <h3 className="text-[25px] font-normal leading-[0.96] tracking-[-0.055em] text-[#484848]">
              {project.title}
            </h3>

            <p className="mt-[11px] max-w-[330px] text-[13px] font-normal leading-[1.25] tracking-[-0.027em] text-[#626262]">
              {project.description}
            </p>
          </div>

          <div className="pb-[1px]">
            <ArrowLink href={project.href}>Explore project</ArrowLink>
          </div>
        </div>
      </div>
    </article>
  );
}

function CollectionPanel() {
  return (
    <section className="relative h-[100svh] w-[50vw] flex-none border-l border-black/[0.085] bg-transparent">
      <div className="absolute left-1/2 top-[51.2%] w-[82%] -translate-x-1/2 -translate-y-1/2 text-center">
        <h3 className="mx-auto max-w-[470px] text-[30px] font-normal leading-[0.96] tracking-[-0.055em] text-[#474747]">
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
    </section>
  );
}

function ServicesContent() {
  return (
    <div className="relative h-[100svh] w-[100vw] bg-white text-[#202020]">
      <p className="absolute left-1/2 top-[10.2svh] -translate-x-1/2 text-[11px] font-normal uppercase leading-none tracking-[-0.03em]">
        Our services
      </p>

      <div className="absolute left-1/2 top-[52.5%] w-[76vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase">
        <div className="text-[clamp(5.8rem,8.25vw,9.1rem)] font-normal leading-[0.68] tracking-[-0.085em]">
          <div>A.I.</div>
          <div>Design</div>
          <div>Development</div>
          <div>Branding</div>
        </div>
      </div>

      <p className="absolute bottom-[7.5svh] left-[11.3vw] text-[11px] font-normal uppercase leading-none tracking-[-0.03em]">
        ✦ Design with intent. Built to work.
      </p>

      <div className="absolute bottom-[6.4svh] right-[2.1vw]">
        <ArrowLink href="/services">View services</ArrowLink>
      </div>
    </div>
  );
}

export function HomeSelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const services = servicesRef.current;

      if (!section || !track || !services) {
        return;
      }

      gsap.set(track, {
        x: 0,
        force3D: true,
        willChange: "transform",
      });

      gsap.set(services, {
        clipPath: "inset(0% 0% 0% 100%)",
        willChange: "clip-path",
      });

      /*
       * The source sequence is not a row of arbitrary-width cards. Every
       * stage before Services is exactly half a viewport wide. The track
       * travels 200vw so the final collection panel occupies the left half,
       * then the full-screen Services scene wipes over it from right to left.
       * Keeping the services typography fixed to the viewport while only its
       * clip edge moves is what produces the reference transition.
       */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(
        track,
        {
          x: () => -window.innerWidth * 2,
          duration: 0.78,
          ease: "none",
        },
        0,
      );

      timeline.to(
        services,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.22,
          ease: "none",
        },
        0.78,
      );

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[52] h-[540svh]"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #d1d1d0 100%)",
      }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 flex w-max items-stretch"
        >
          <IntroPanel />

          {PROJECTS.map((project) => (
            <ProjectPanel key={project.title} project={project} />
          ))}

          <CollectionPanel />
        </div>

        <div
          ref={servicesRef}
          className="absolute inset-0 z-[5] overflow-hidden"
        >
          <ServicesContent />
        </div>
      </div>
    </section>
  );
}
