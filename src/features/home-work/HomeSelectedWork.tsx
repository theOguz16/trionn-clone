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
      className="group flex w-[214px] items-center justify-between border-b pb-[8px] font-mono text-[10px] uppercase leading-none tracking-[-0.02em]"
      style={{
        color: "#444442",
        borderColor: "rgba(50, 50, 48, 0.68)",
      }}
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
      <div
        data-work-intro-rise
        className="absolute left-[2.1vw] top-[53.2%] -translate-y-1/2"
      >
        <h2 className="w-[43vw] text-[clamp(4.2rem,5vw,6rem)] font-normal leading-[0.88] tracking-[-0.068em] text-[#454545]">
          Selected work
          <br />
          &amp; explorations
        </h2>

        <div className="mt-[64px]">
          <ArrowLink href="/work">View all projects</ArrowLink>
        </div>
      </div>
    </section>
  );
}

function ProjectPanel({
  project,
  index,
}: {
  project: (typeof PROJECTS)[number];
  index: number;
}) {
  return (
    <article className="relative h-[100svh] w-[50vw] flex-none border-l border-black/[0.085] bg-transparent">
      <div
        data-project-rise
        data-project-index={index}
        className="absolute left-[8.45%] right-[8.45%] top-[19.5svh]"
      >
        <a
          href={project.href}
          className="block h-[50.15svh] min-h-[410px] max-h-[610px] overflow-hidden rounded-[6px] bg-[#d8d8d6]"
        >
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </a>

        <div className="mt-[16px] grid grid-cols-[1fr_auto] items-end gap-8">
          <div>
            <h3 className="text-[25px] font-normal leading-[0.96] tracking-[-0.055em] text-[#484848]">
              {project.title}
            </h3>

            <p className="mt-[11px] max-w-[285px] text-[13px] font-normal leading-[1.25] tracking-[-0.027em] text-[#626262]">
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
      <div
        data-collection-rise
        className="absolute left-1/2 top-[57.4%] w-[82%] -translate-x-1/2 -translate-y-1/2 text-center"
      >
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
    <div className="relative h-[100svh] w-[100vw] bg-[#fbfbfb] text-[#202020]">
      <p className="absolute left-1/2 top-[11.2svh] -translate-x-1/2 text-[11px] font-normal uppercase leading-none tracking-[-0.03em]">
        Our services
      </p>

      <div
        data-services-rise
        className="absolute left-1/2 top-[50.6%] w-[76vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase"
      >
        <div
          className="text-[clamp(5.8rem,8.25vw,9.1rem)] font-normal leading-[0.68] tracking-[-0.085em]"
          style={{ transform: "scaleX(1.035)" }}
        >
          <div>A.I.</div>
          <div>Design</div>
          <div>Development</div>
          <div>Branding</div>
        </div>
      </div>

      <p className="absolute bottom-[7.7svh] left-[42vw] text-[11px] font-normal uppercase leading-none tracking-[-0.03em]">
        ✦ Design with intent. Built to work.
      </p>

      <div className="absolute bottom-[7.7svh] right-[2.1vw]">
        <ArrowLink href="/services">View services</ArrowLink>
      </div>
    </div>
  );
}

function TransitionPlus({ marker }: { marker: "entry" | "services" }) {
  return (
    <span
      data-transition-plus={marker}
      aria-hidden="true"
      className="relative block h-[12px] w-[12px]"
    >
      <span className="absolute left-1/2 top-1/2 h-px w-[10px] -translate-x-1/2 -translate-y-1/2 bg-[#5a5a57]" />
      <span className="absolute left-1/2 top-1/2 h-[10px] w-px -translate-x-1/2 -translate-y-1/2 bg-[#5a5a57]" />
    </span>
  );
}

export function HomeSelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const entryFrameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesBoundaryRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const entryFrame = entryFrameRef.current;
      const track = trackRef.current;
      const services = servicesRef.current;
      const servicesBoundary = servicesBoundaryRef.current;

      if (!section || !entryFrame || !track || !services || !servicesBoundary) {
        return;
      }

      const introRise = section.querySelector<HTMLElement>(
        "[data-work-intro-rise]",
      );
      const projectRises = Array.from(
        section.querySelectorAll<HTMLElement>("[data-project-rise]"),
      );
      const collectionRise = section.querySelector<HTMLElement>(
        "[data-collection-rise]",
      );
      const servicesRise = section.querySelector<HTMLElement>(
        "[data-services-rise]",
      );
      const entryPlusWrap = entryFrame.querySelector<HTMLElement>(
        "[data-entry-plus-wrap]",
      );
      const entryPlus = entryFrame.querySelector<HTMLElement>(
        '[data-transition-plus="entry"]',
      );
      const boundaryPlus = servicesBoundary.querySelector<HTMLElement>(
        '[data-transition-plus="services"]',
      );

      if (
        !introRise ||
        projectRises.length !== PROJECTS.length ||
        !collectionRise ||
        !servicesRise ||
        !entryPlusWrap ||
        !entryPlus ||
        !boundaryPlus
      ) {
        return;
      }

      gsap.set(entryFrame, {
        yPercent: 100,
        force3D: true,
        willChange: "transform",
      });

      gsap.set(track, {
        x: 0,
        force3D: true,
        willChange: "transform",
      });

      gsap.set(introRise, {
        y: "8svh",
        force3D: true,
        willChange: "transform",
      });

      gsap.set(projectRises, {
        y: "12svh",
        force3D: true,
        willChange: "transform",
      });

      gsap.set(collectionRise, {
        y: "10svh",
        force3D: true,
        willChange: "transform",
      });

      gsap.set(services, {
        clipPath: "inset(0% 0% 0% 100%)",
        willChange: "clip-path",
      });

      gsap.set(servicesRise, {
        y: "20svh",
        force3D: true,
        willChange: "transform",
      });

      gsap.set(entryPlusWrap, {
        autoAlpha: 1,
      });

      gsap.set(servicesBoundary, {
        x: () => window.innerWidth,
        autoAlpha: 1,
        force3D: true,
        willChange: "transform, opacity",
      });

      gsap.set([entryPlus, boundaryPlus], {
        rotation: 0,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      /*
       * Key Facts is 152svh tall and pinned for its final 52svh. This section
       * overlaps it by 100svh, so our trigger begins exactly when that pin
       * releases. The work viewport then rises 100svh while Key Facts moves
       * up by the same physical distance: no dead scroll and no early cover.
       */
      timeline.to(
        entryFrame,
        {
          yPercent: 0,
          duration: 0.15,
          ease: "none",
        },
        0,
      );

      timeline.to(
        entryPlus,
        {
          rotation: 360,
          duration: 0.15,
          ease: "none",
        },
        0,
      );

      timeline.to(
        introRise,
        {
          y: 0,
          duration: 0.18,
          ease: "power1.out",
        },
        0.025,
      );

      timeline.to(
        entryPlusWrap,
        {
          autoAlpha: 0,
          duration: 0.025,
          ease: "none",
        },
        0.135,
      );

      /*
       * The work rail is deliberately slower than the previous pass. With a
       * 780svh section this gives roughly 120svh of vertical scroll for every
       * 50vw project step while keeping motion continuous on every gesture.
       */
      timeline.to(
        track,
        {
          x: () => -window.innerWidth * 1.5,
          duration: 0.54,
          ease: "none",
        },
        0.155,
      );

      projectRises.forEach((projectRise, index) => {
        const starts = [0.055, 0.31, 0.49];

        timeline.to(
          projectRise,
          {
            y: 0,
            duration: 0.2,
            ease: "power1.out",
          },
          starts[index],
        );
      });

      timeline.to(
        collectionRise,
        {
          y: 0,
          duration: 0.18,
          ease: "power1.out",
        },
        0.655,
      );

      /* Collection -> Services gets a full, readable wipe instead of a snap. */
      timeline.to(
        track,
        {
          x: () => -window.innerWidth * 2,
          duration: 0.25,
          ease: "none",
        },
        0.75,
      );

      timeline.to(
        services,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.25,
          ease: "none",
        },
        0.75,
      );

      timeline.to(
        servicesBoundary,
        {
          x: 0,
          duration: 0.25,
          ease: "none",
        },
        0.75,
      );

      timeline.to(
        boundaryPlus,
        {
          rotation: 360,
          duration: 0.25,
          ease: "none",
        },
        0.75,
      );

      timeline.to(
        servicesRise,
        {
          y: 0,
          duration: 0.22,
          ease: "power1.out",
        },
        0.765,
      );

      timeline.to(
        servicesBoundary,
        {
          autoAlpha: 0,
          duration: 0.02,
          ease: "none",
        },
        0.98,
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
      className="relative z-[52] -mt-[100svh] h-[780svh] bg-transparent"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-transparent">
        <div
          ref={entryFrameRef}
          className="absolute -top-[2px] bottom-0 left-0 right-0 overflow-hidden"
          style={{
            height: "calc(100% + 2px)",
            background:
              "linear-gradient(180deg, #fbfbfb 0%, #f4f4f4 48%, #dedddb 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute left-[2.1vw] right-[2.1vw] top-[2px] z-[8] h-px"
            style={{ backgroundColor: "#d7d6d3" }}
          />

          <div
            data-entry-plus-wrap
            className="pointer-events-none absolute left-1/2 top-[2px] z-[9] -translate-x-1/2 -translate-y-1/2"
          >
            <TransitionPlus marker="entry" />
          </div>

          <div
            ref={trackRef}
            className="absolute inset-y-0 left-0 flex w-max items-stretch"
          >
            <IntroPanel />

            {PROJECTS.map((project, index) => (
              <ProjectPanel
                key={project.title}
                project={project}
                index={index}
              />
            ))}

            <CollectionPanel />
          </div>

          <div
            ref={servicesRef}
            className="absolute inset-0 z-[5] overflow-hidden"
          >
            <ServicesContent />
          </div>

          <div
            ref={servicesBoundaryRef}
            className="pointer-events-none absolute bottom-0 left-0 top-0 z-[7] w-px"
            style={{ backgroundColor: "#d7d6d3" }}
          >
            <div className="absolute left-1/2 top-[50.5%] -translate-x-1/2 -translate-y-1/2">
              <TransitionPlus marker="services" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
