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

const GUIDE = "rgba(72, 72, 68, 0.16)";
const PLUS_STROKE = "rgba(67, 67, 64, 0.72)";

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group flex w-[214px] items-center justify-between border-b pb-[8px] font-mono text-[10px] uppercase leading-none tracking-[-0.02em]"
      style={{
        color: "#444442",
        borderColor: "rgba(50, 50, 48, 0.58)",
      }}
    >
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-[5px]">
        →
      </span>
    </a>
  );
}

function TransitionPlus({ marker }: { marker: "entry" | "services" }) {
  return (
    <span
      data-transition-plus={marker}
      aria-hidden="true"
      className="relative block h-[14px] w-[14px]"
    >
      <span
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
        style={{ backgroundColor: PLUS_STROKE }}
      />
      <span
        className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
        style={{ backgroundColor: PLUS_STROKE }}
      />
    </span>
  );
}

function IntroPanel() {
  return (
    <section className="relative h-[100svh] w-[50vw] flex-none bg-transparent">
      <div
        data-work-intro-rise
        className="absolute left-[2.1vw] top-[51.6%] -translate-y-1/2"
      >
        <h2 className="w-[44vw] text-[clamp(4.35rem,5.2vw,6.2rem)] font-normal leading-[0.9] tracking-[-0.064em] text-[#454545]">
          Selected work
          <br />
          &amp; explorations
        </h2>

        <div className="mt-[58px]">
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
    <article
      className="relative h-[100svh] w-[50vw] flex-none bg-transparent"
      style={{ borderLeft: `1px solid ${GUIDE}` }}
    >
      <div
        data-project-rise
        data-project-index={index}
        className="absolute left-[6.8%] right-[6.8%] top-[16.8svh]"
      >
        <a
          href={project.href}
          className="block h-[53.5svh] min-h-[430px] max-h-[640px] overflow-hidden rounded-[5px] bg-[#d8d8d6]"
        >
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.015]"
          />
        </a>

        <div className="mt-[18px] grid grid-cols-[minmax(0,1fr)_auto] items-end gap-[30px]">
          <div>
            <h3 className="text-[27px] font-normal leading-[0.95] tracking-[-0.05em] text-[#484848]">
              {project.title}
            </h3>
            <p className="mt-[9px] max-w-[292px] text-[12px] font-normal leading-[1.28] tracking-[-0.018em] text-[#626262]">
              {project.description}
            </p>
          </div>

          <div className="pb-[2px]">
            <ArrowLink href={project.href}>Explore project</ArrowLink>
          </div>
        </div>
      </div>
    </article>
  );
}

function CollectionPanel() {
  return (
    <section
      className="relative h-[100svh] w-[50vw] flex-none bg-transparent"
      style={{ borderLeft: `1px solid ${GUIDE}` }}
    >
      <div
        data-collection-rise
        className="absolute left-1/2 top-[54.8%] w-[84%] -translate-x-1/2 -translate-y-1/2 text-center"
      >
        <h3 className="mx-auto max-w-[500px] text-[31px] font-normal leading-[0.98] tracking-[-0.048em] text-[#474747]">
          Discover our complete collection
          <br />
          of digital experiences, brands,
          <br />
          and platforms.
        </h3>

        <div className="mt-[45px] flex justify-center">
          <ArrowLink href="/work">View all projects</ArrowLink>
        </div>
      </div>
    </section>
  );
}

function ServicesContent() {
  return (
    <div className="relative h-[100svh] w-[100vw] bg-[#fbfbfb] text-[#202020]">
      <div
        className="pointer-events-none absolute inset-x-[2.1vw] top-[11.2svh] h-px"
        style={{ backgroundColor: GUIDE }}
      />

      <p className="absolute left-1/2 top-[8.7svh] -translate-x-1/2 text-[10px] font-normal uppercase leading-none tracking-[-0.025em]">
        Our services
      </p>

      <div
        data-services-rise
        className="absolute left-1/2 top-[50.2%] w-[84vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase"
      >
        <div
          className="text-[clamp(6.1rem,8.8vw,9.8rem)] font-normal leading-[0.715] tracking-[-0.072em]"
          style={{ transform: "scaleX(1.018)" }}
        >
          <div>A.I.</div>
          <div>Design</div>
          <div>Development</div>
          <div>Branding</div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-[2.1vw] bottom-[12.1svh] h-px"
        style={{ backgroundColor: GUIDE }}
      />

      <p className="absolute bottom-[7.3svh] left-[2.1vw] text-[10px] font-normal uppercase leading-none tracking-[-0.025em] text-[#4e4e4b]">
        Independent digital studio
      </p>

      <p className="absolute bottom-[7.3svh] left-1/2 -translate-x-1/2 text-[10px] font-normal uppercase leading-none tracking-[-0.025em] text-[#4e4e4b]">
        ✦ Design with intent. Built to work.
      </p>

      <div className="absolute bottom-[6.7svh] right-[2.1vw]">
        <ArrowLink href="/services">View services</ArrowLink>
      </div>
    </div>
  );
}

export function HomeSelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesBoundaryRef = useRef<HTMLDivElement>(null);
  const entryGuideRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      const services = servicesRef.current;
      const servicesBoundary = servicesBoundaryRef.current;
      const entryGuide = entryGuideRef.current;

      if (
        !section ||
        !stage ||
        !track ||
        !services ||
        !servicesBoundary ||
        !entryGuide
      ) {
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
      const entryPlus = entryGuide.querySelector<HTMLElement>(
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
        !entryPlus ||
        !boundaryPlus
      ) {
        return;
      }

      gsap.set(track, {
        x: 0,
        force3D: true,
        willChange: "transform",
      });

      gsap.set(introRise, {
        y: "7svh",
        force3D: true,
      });

      gsap.set(projectRises, {
        y: "12svh",
        force3D: true,
      });

      gsap.set(collectionRise, {
        y: "10svh",
        force3D: true,
      });

      gsap.set(entryGuide, {
        autoAlpha: 1,
      });

      gsap.set(services, {
        clipPath: "inset(0% 0% 0% 100%)",
        willChange: "clip-path",
      });

      gsap.set(servicesRise, {
        y: "18svh",
        force3D: true,
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

      const entryTween = gsap.to(entryPlus, {
        rotation: 360,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        },
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

      timeline.to(
        introRise,
        {
          y: 0,
          duration: 0.18,
          ease: "power1.out",
        },
        0,
      );

      timeline.to(
        entryGuide,
        {
          autoAlpha: 0,
          duration: 0.055,
          ease: "none",
        },
        0.07,
      );

      timeline.to(
        track,
        {
          x: () => -window.innerWidth * 1.5,
          duration: 0.7,
          ease: "none",
        },
        0,
      );

      const projectStarts = [0.02, 0.25, 0.48];

      projectRises.forEach((projectRise, index) => {
        timeline.to(
          projectRise,
          {
            y: 0,
            duration: 0.27,
            ease: "power1.out",
          },
          projectStarts[index],
        );
      });

      timeline.to(
        collectionRise,
        {
          y: 0,
          duration: 0.2,
          ease: "power1.out",
        },
        0.58,
      );

      timeline.to(
        track,
        {
          x: () => -window.innerWidth * 2,
          duration: 0.3,
          ease: "none",
        },
        0.7,
      );

      timeline.to(
        services,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.3,
          ease: "none",
        },
        0.7,
      );

      timeline.to(
        servicesBoundary,
        {
          x: 0,
          duration: 0.3,
          ease: "none",
        },
        0.7,
      );

      timeline.to(
        boundaryPlus,
        {
          rotation: 540,
          duration: 0.3,
          ease: "none",
        },
        0.7,
      );

      timeline.to(
        servicesRise,
        {
          y: 0,
          duration: 0.28,
          ease: "power1.out",
        },
        0.71,
      );

      timeline.to(
        servicesBoundary,
        {
          autoAlpha: 0,
          duration: 0.04,
          ease: "none",
        },
        0.96,
      );

      return () => {
        entryTween.scrollTrigger?.kill();
        entryTween.kill();
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[52] h-[620svh] bg-[#fbfbfb]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={stageRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #fbfbfb 0%, #f4f4f4 48%, #dedddb 100%)",
          }}
        >
          <div
            ref={entryGuideRef}
            className="pointer-events-none absolute inset-0 z-[20]"
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ backgroundColor: GUIDE }}
            />

            <div
              className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2"
              style={{ backgroundColor: GUIDE }}
            />

            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <TransitionPlus marker="entry" />
            </div>
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
            style={{ backgroundColor: GUIDE }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <TransitionPlus marker="services" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
