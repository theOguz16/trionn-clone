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
    mobileImage: "https://trionn.com/images/projects/myworker/myworker_m.jpg",
    href: "/work/myworker-ai",
  },
  {
    title: "Pulse Studio",
    description:
      "A motion-led studio website showcasing artists, projects, and culture.",
    image: "https://trionn.com/images/projects/pulse-studio/pulse-studio.jpg",
    mobileImage: "https://trionn.com/images/projects/pulse-studio/pulse-studio_m.jpg",
    href: "/work/pulse-studio",
  },
  {
    title: "Loftloom",
    description:
      "Seamless real estate platform for effortless property discovery.",
    image: "https://trionn.com/images/projects/loftloom/loftloom.jpg",
    mobileImage: "https://trionn.com/images/projects/loftloom/loftloom_m.jpg",
    href: "/work/loftloom",
  },
] as const;

const GUIDE = "var(--color-divider-dark)";
const PLUS_STROKE = "rgba(67, 67, 64, 0.72)";

function ArrowLink({
  href,
  children,
  widthClassName = "w-[214px]",
  textClassName = "text-[10px]",
  geometryClassName = "",
}: {
  href: string;
  children: ReactNode;
  widthClassName?: string;
  textClassName?: string;
  geometryClassName?: string;
}) {
  return (
    <a
      href={href}
      className={`group flex ${widthClassName} ${geometryClassName} items-center justify-between border-b pb-[8px] font-mono ${textClassName} uppercase leading-none tracking-[-0.02em]`}
      style={{
        color: "var(--color-text-dark)",
        borderColor: "var(--color-divider-dark)",
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
    <section
      data-work-panel
      className="relative h-[100svh] w-[50vw] flex-none bg-transparent"
    >
      <div className="absolute inset-0 flex items-center justify-center max-md:block">
        <div
          data-work-intro-rise
          className="relative top-[4.72svh] w-[31.25vw] max-md:absolute max-md:left-[2.1vw] max-md:top-[51.6%] max-md:w-auto max-md:-translate-y-1/2"
        >
          <h2 className="w-full whitespace-nowrap text-[clamp(4.35rem,5.2vw,6.2rem)] font-normal leading-[0.9] tracking-[-0.064em] text-[#454545] max-md:w-[44vw] max-md:whitespace-normal">
            Selected work
            <br />
            &amp; explorations
          </h2>

          <div className="mt-[3vw] max-md:mt-[58px]">
            <ArrowLink
              href="/work"
              widthClassName="w-[12.5vw] max-w-[180px] max-md:w-[214px]"
              geometryClassName="h-[36px] !pb-0 max-md:h-auto max-md:!pb-[8px]"
            >
              View all projects
            </ArrowLink>
          </div>
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
      data-work-panel
      className="relative h-[100svh] w-[50vw] flex-none bg-transparent"
      style={{ boxShadow: `inset 1px 0 ${GUIDE}` }}
    >
      <div
        data-project-panel-inner
        className="absolute inset-0 flex items-center px-[10%] max-md:block max-md:px-0"
      >
        <div
          data-project-rise
          data-project-index={index}
          className="h-[34.867vw] w-full md:relative md:top-[-0.305px] max-md:absolute max-md:left-[6.8%] max-md:right-[6.8%] max-md:top-[16.8svh] max-md:h-auto max-md:w-auto"
        >
          <a
            href={project.href}
            className="block aspect-[670/460] w-full overflow-hidden rounded-[5px] bg-[#d8d8d6] max-md:h-[53.5svh] max-md:min-h-[430px] max-md:max-h-[640px] max-md:aspect-auto"
          >
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.015]"
            />
          </a>

          <div className="mt-[1.5vw] grid grid-cols-[minmax(0,1fr)_auto] items-start gap-[3vw] max-md:mt-[18px] max-md:items-end max-md:gap-[30px]">
            <div>
              <h3 className="text-[27px] font-normal leading-[0.95] tracking-[-0.05em] text-[#484848]">
                {project.title}
              </h3>
              <p className="mt-[1vw] max-w-[20vw] text-[12px] font-normal leading-[1.28] tracking-[-0.018em] text-[#626262] max-md:mt-[9px] max-md:max-w-[292px]">
                {project.description}
              </p>
            </div>

            <div className="pt-[3.25vw] max-md:pb-[2px] max-md:pt-0">
              <ArrowLink
                href={project.href}
                widthClassName="w-[12.5vw] max-w-[180px] max-md:w-[214px]"
                geometryClassName="h-[36px] !pb-0 max-md:h-auto max-md:!pb-[8px]"
              >
                Explore project
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CollectionPanel() {
  return (
    <section
      data-work-panel
      className="relative h-[100svh] w-[50vw] flex-none bg-transparent"
      style={{ boxShadow: `inset 1px 0 ${GUIDE}` }}
    >
      <div className="absolute inset-0 flex items-center max-md:block">
        <div
          data-collection-rise
          className="relative top-[3.53svh] w-full text-center max-md:absolute max-md:left-1/2 max-md:top-[51%] max-md:w-[84%] max-md:-translate-x-1/2 max-md:-translate-y-1/2"
        >
          <h3 className="mx-auto max-w-[29vw] whitespace-nowrap text-[2.25vw] font-normal leading-none tracking-[-0.048em] text-[#474747] max-md:max-w-[500px] max-md:whitespace-normal max-md:text-[31px] max-md:leading-[0.98]">
            Discover our complete collection
            <br />
            of digital experiences, brands,
            <br />
            and platforms.
          </h3>

          <div className="mt-[3vw] flex justify-center max-md:mt-[45px]">
            <ArrowLink
              href="/work"
              widthClassName="w-[12.5vw] max-w-[180px] max-md:w-[168px]"
              geometryClassName="h-[36px] !pb-0 max-md:h-auto max-md:!pb-[8px]"
            >
              View all projects
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileSelectedWork() {
  return (
    <section
      data-mobile-selected-work
      className="relative z-[52] overflow-hidden bg-[linear-gradient(180deg,var(--color-bg-off-white)_0%,#dedddb_100%)] text-[var(--color-text-dark)] md:hidden"
    >
      <header className="px-[4.6875vw] pb-[15.625vw] pt-[31.25vw] text-center">
        <h2 className="mx-auto w-[41.1vw] font-display text-[clamp(25px,7.8125vw,30.46875px)] font-normal leading-[0.88] tracking-[-0.06em]">
          Selected work
          <br />
          &amp; explorations
        </h2>
      </header>

      <div>
        {PROJECTS.map((project) => (
          <article
            key={project.title}
            className="px-[4.6875vw] pb-[15.625vw] pt-[15.625vw]"
          >
            <a
              href={project.href}
              aria-label={project.title}
              className="block aspect-[670/460] w-full overflow-hidden rounded-[1.5625vw] bg-[#d8d8d6]"
            >
              <picture className="block h-full w-full">
                <source media="(max-width: 767px)" srcSet={project.mobileImage} />
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </picture>
            </a>

            <h3 className="mt-[4.6875vw] font-display text-[clamp(18px,5.46875vw,21.3281px)] font-normal leading-none tracking-[-0.04em] text-[#484848]">
              {project.title}
            </h3>

            <p
              className="mt-[3.125vw] max-w-[62.5vw] text-[clamp(13.5px,3.90625vw,15.2344px)] font-normal leading-[normal] text-[#626262]"
            >
              {project.description}
            </p>

            <div className="mt-[7.8125vw]">
              <ArrowLink
                href={project.href}
                widthClassName="w-[39.0625vw]"
                textClassName="text-[12.1875px] !leading-[normal] tracking-[-0.06em]"
                geometryClassName="relative h-[7.8125vw] !pb-0 after:absolute after:-inset-y-[10px] after:inset-x-0 after:content-['']"
              >
                Explore project
              </ArrowLink>
            </div>
          </article>
        ))}
      </div>

      <section data-mobile-work-collection className="layout-gutter py-[31.25vw] text-center">
        <h3 className="mx-auto w-[78.125vw] whitespace-nowrap font-display text-[clamp(18px,5.46875vw,21.3281px)] font-normal leading-none tracking-[-0.04em] text-[#474747]">
          Discover our complete collection
          <br />
          of digital experiences, brands,
          <br />
          and platforms.
        </h3>

        <div className="mt-[9.375vw] flex justify-center">
          <ArrowLink
            href="/work"
            widthClassName="w-[39.0625vw]"
            textClassName="text-[12.1875px] !leading-[normal] tracking-[-0.06em]"
            geometryClassName="relative h-[7.8125vw] !pb-0 after:absolute after:-inset-y-[10px] after:inset-x-0 after:content-['']"
          >
            View all projects
          </ArrowLink>
        </div>
      </section>

      <ServicesContent />
    </section>
  );
}

export function ServicesContent() {
  return (
    <section
      data-white-services
      className="relative h-[100svh] min-h-[700px] w-[100vw] overflow-hidden bg-[var(--color-bg-off-white)] text-[#202020] md:min-h-0"
    >
      <p className="absolute left-1/2 top-[12svh] -translate-x-1/2 scale-x-[0.875] text-[15.3072px] font-normal uppercase leading-none tracking-[-0.02em] text-[#30302e] max-md:top-[14.45svh] max-md:scale-x-100 max-md:text-[13.7109px]">
        Our services
      </p>

      <div
        data-services-rise
        className="absolute left-1/2 top-[50.85%] w-[53.26vw] -translate-x-1/2 -translate-y-1/2 text-center uppercase max-md:top-[49%] max-md:w-[90.8vw]"
      >
        <div
          className="text-[clamp(6.15rem,9.164vw,9.7rem)] font-normal leading-[0.672] tracking-[-0.08em] max-md:text-[clamp(50px,15.625vw,60.9375px)]"
        >
          <div>A.I.</div>
          <div>Design</div>
          <div>Development</div>
          <div>Branding</div>
        </div>
      </div>

      <p className="absolute bottom-[9.1svh] left-1/2 -translate-x-1/2 whitespace-nowrap text-[12.6px] font-normal uppercase leading-none tracking-[-0.018em] text-[#3f3f3d] max-md:bottom-[15.4svh] max-md:text-[clamp(11.25px,3.515625vw,13.7109px)]">
        ✦ Design with intent. Built to work.
      </p>

      <div className="absolute bottom-[8svh] right-[2.5vw] max-md:bottom-[8.2svh] max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2">
        <ArrowLink
          href="/services"
          widthClassName="w-[180px]"
          textClassName="text-[12.6px]"
        >
          View services
        </ArrowLink>
      </div>
    </section>
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

      const setupDesktop = (): (() => void) | undefined => {
        const introRise = section.querySelector<HTMLElement>(
          "[data-work-intro-rise]",
        );
        const projectRises = Array.from(
          section.querySelectorAll<HTMLElement>("[data-project-rise]"),
        );
        const collectionRise = section.querySelector<HTMLElement>(
          "[data-collection-rise]",
        );
        const panels = Array.from(
          section.querySelectorAll<HTMLElement>("[data-work-panel]"),
        );
        const boundaryPlus = servicesBoundary.querySelector<HTMLElement>(
          '[data-transition-plus="services"]',
        );

        if (
          !introRise ||
          projectRises.length !== PROJECTS.length ||
          panels.length !== PROJECTS.length + 2 ||
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
        y: 0,
        force3D: true,
      });

      projectRises.forEach((projectRise, index) => {
        gsap.set(projectRise, {
          y: index === 0 ? 24.845 : 549.789,
          force3D: true,
        });
      });

      gsap.set(collectionRise, {
        y: 526.58,
        force3D: true,
      });

      gsap.set(services, {
        clipPath: "inset(0% 0% 0% 100%)",
        willChange: "clip-path",
      });

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

      const usesWideTimeline =
        window.innerWidth >= 1400;
      const usesTabletTimeline =
        window.innerWidth >= 768 &&
        window.innerWidth < 1024;
      const firstTrackDuration =
        usesWideTimeline ? 0.665 : 0.568;
      const handoffStart =
        usesWideTimeline ? 0.669 : 0.568;
      const handoffDuration =
        usesWideTimeline ? 0.297 : 0.42575;
      const plusStart =
        usesWideTimeline ? 0.67 : 0.54;
      const plusDuration =
        usesWideTimeline ? 0.324 : 0.45;

      timeline.to(
        introRise,
        {
          y: 0,
          duration: 0.1,
          ease: "power1.out",
        },
        0,
      );

      timeline.to(
        track,
        {
          x: () =>
            -panels[0].getBoundingClientRect().width *
            (usesTabletTimeline ? 3.02 : 3.009375),
          duration: firstTrackDuration,
          ease: "none",
        },
        0,
      );

      const projectStarts = [0, 0, 0.1955];
      const projectDurations = [0.1, 0.233, 0.2534];

      projectRises.forEach((projectRise, index) => {
        timeline.to(
          projectRise,
          {
            y: 0,
            duration: projectDurations[index],
            ease: "power1.out",
          },
          projectStarts[index],
        );
      });

      timeline.to(
        collectionRise,
        {
          y: 0,
          duration: 0.2473,
          ease: "power1.out",
        },
        0.38,
      );

      timeline.to(
        track,
        {
          x: () => -(track.scrollWidth + 8),
          duration: handoffDuration,
          ease: "none",
        },
        handoffStart,
      );

      timeline.to(
        services,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: handoffDuration,
          ease: "none",
        },
        handoffStart,
      );

      timeline.to(
        servicesBoundary,
        {
          x: 0,
          duration: handoffDuration,
          ease: "none",
        },
        handoffStart,
      );

      timeline.to(
        boundaryPlus,
        {
          rotation: 540,
          duration: plusDuration,
          ease: "none",
        },
        plusStart,
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
      };

      const desktopQuery = window.matchMedia("(min-width: 768px)");
      let teardownDesktop: (() => void) | undefined;

      const syncDesktop = () => {
        if (desktopQuery.matches && !teardownDesktop) {
          teardownDesktop = setupDesktop();
        } else if (!desktopQuery.matches && teardownDesktop) {
          teardownDesktop();
          teardownDesktop = undefined;
        }
      };

      syncDesktop();
      desktopQuery.addEventListener("change", syncDesktop);
      window.addEventListener("resize", syncDesktop);

      return () => {
        desktopQuery.removeEventListener("change", syncDesktop);
        window.removeEventListener("resize", syncDesktop);
        teardownDesktop?.();
      };
    },
    { scope: sectionRef },
  );

  return (
    <>
      <MobileSelectedWork />

      <section
        ref={sectionRef}
        data-desktop-selected-work
        className="relative z-[52] hidden h-[452svh] bg-[var(--color-bg-off-white)] md:block"
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
    </>
  );
}
