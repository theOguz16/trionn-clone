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

function ArrowLink({
  href,
  children,
  widthClassName = "w-[214px]",
  textClassName = "text-[10px]",
}: {
  href: string;
  children: ReactNode;
  widthClassName?: string;
  textClassName?: string;
}) {
  return (
    <a
      href={href}
      className={`group flex ${widthClassName} items-center justify-between border-b pb-[8px] font-mono ${textClassName} uppercase leading-none tracking-[-0.02em]`}
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

function TransitionPlus({ marker }: { marker: "services" }) {
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
        className="absolute left-1/2 top-[51%] w-[84%] -translate-x-1/2 -translate-y-1/2 text-center"
      >
        <h3 className="mx-auto max-w-[500px] text-[31px] font-normal leading-[0.98] tracking-[-0.048em] text-[#474747]">
          Discover our complete collection
          <br />
          of digital experiences, brands,
          <br />
          and platforms.
        </h3>

        <div className="mt-[45px] flex justify-center">
          <ArrowLink href="/work" widthClassName="w-[168px]">
            View all projects
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}

function ServicesContent() {
  return (
    <div className="relative h-[100svh] w-[100vw] bg-[#fbfbfb] text-[#202020]">
      <p className="absolute left-1/2 top-[10.8svh] -translate-x-1/2 text-[11px] font-normal uppercase leading-none tracking-[-0.02em] text-[#30302e]">
        Our services
      </p>

      <div
        data-services-rise
        className="absolute left-1/2 top-1/2 w-[84vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase"
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

      <p className="absolute bottom-[6.8svh] left-1/2 -translate-x-1/2 text-[11px] font-normal uppercase leading-none tracking-[-0.02em] text-[#444442]">
        ✦ Design with intent. Built to work.
      </p>

      <div className="absolute bottom-[6.2svh] right-[2.1vw]">
        <ArrowLink
          href="/services"
          widthClassName="w-[164px]"
          textClassName="text-[11px]"
        >
          View services
        </ArrowLink>
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

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      const services = servicesRef.current;
      const servicesBoundary = servicesBoundaryRef.current;

      if (!section || !stage || !track || !services || !servicesBoundary) {
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
      const boundaryPlus = servicesBoundary.querySelector<HTMLElement>(
        '[data-transition-plus="services"]',
      );

      if (
        !introRise ||
        projectRises.length !== PROJECTS.length ||
        !collectionRise ||
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

      gsap.set(services, {
        clipPath: "inset(0% 0% 0% 100%)",
        willChange: "clip-path",
      });

      /*
       * Do not animate or set transform on data-services-rise.
       * Its Tailwind translate transform keeps the word stack fixed at the
       * viewport center during both the split handoff and full takeover.
       */

      gsap.set(servicesBoundary, {
        x: () => window.innerWidth,
        autoAlpha: 1,
        force3D: true,
        willChange: "transform, opacity",
      });

      gsap.set(boundaryPlus, {
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

      timeline.to(
        introRise,
        {
          y: 0,
          duration: 0.18,
          ease: "power1.out",
        },
        0,
      );

      /*
       * Stop the work rail with Loftloom in the left half and Collection in
       * the right half, matching the source frame immediately before Services.
       */
      timeline.to(
        track,
        {
          x: () => -window.innerWidth * 1.5,
          duration: 0.66,
          ease: "none",
        },
        0,
      );

      const projectStarts = [0.02, 0.2, 0.38];

      projectRises.forEach((projectRise, index) => {
        timeline.to(
          projectRise,
          {
            y: 0,
            duration: 0.24,
            ease: "power1.out",
          },
          projectStarts[index],
        );
      });

      timeline.to(
        collectionRise,
        {
          y: 0,
          duration: 0.18,
          ease: "power1.out",
        },
        0.46,
      );

      /* Reveal the right half as soon as the Loftloom + Collection frame lands. */
      timeline.to(
        services,
        {
          clipPath: "inset(0% 0% 0% 50%)",
          duration: 0.12,
          ease: "none",
        },
        0.66,
      );

      timeline.to(
        servicesBoundary,
        {
          x: () => window.innerWidth * 0.5,
          duration: 0.12,
          ease: "none",
        },
        0.66,
      );

      timeline.to(
        boundaryPlus,
        {
          rotation: 270,
          duration: 0.12,
          ease: "none",
        },
        0.66,
      );

      /* Brief split composition, then Services takes the full viewport. */
      timeline.to(
        services,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.14,
          ease: "none",
        },
        0.84,
      );

      timeline.to(
        servicesBoundary,
        {
          x: 0,
          duration: 0.14,
          ease: "none",
        },
        0.84,
      );

      timeline.to(
        boundaryPlus,
        {
          rotation: 540,
          duration: 0.14,
          ease: "none",
        },
        0.84,
      );

      timeline.to(
        servicesBoundary,
        {
          autoAlpha: 0,
          duration: 0.025,
          ease: "none",
        },
        0.975,
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
      className="relative z-[52] h-[680svh] bg-[#fbfbfb]"
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
