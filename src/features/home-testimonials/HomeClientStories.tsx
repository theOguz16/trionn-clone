"use client";

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  TransitionLink,
} from "@/components/motion/TransitionLink";

type Testimonial = {
  id: string;
  company: string;
  quote: string;
  person: string;
  role: string;
  country: string;
  photo: string;
  videoUrl?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "luxury-presence",
    company: "Luxury Presence",
    quote:
      "I've worked with Sunny and his team on several projects and he's one of the best UI/UX designers and front-end developers I know. He's meticulous in his attention to detail and has a true passion for creating beautiful user interfaces.",
    person: "Malte Kramer",
    role: "Founder & CEO",
    country: "USA",
    photo: "/testimonials/malte.webp",
    videoUrl:
      "https://www.youtube.com/embed/rOAsYNtPAmQ?autoplay=1",
  },
  {
    id: "credible",
    company: "Credible",
    quote:
      "The Trionn team is extremely reliable, professional and talented. It has been a great pleasure collaborating with them over many",
    person: "Stephen Dash",
    role: "Founder & CEO",
    country: "USA",
    photo: "/testimonials/stephen.webp",
  },
  {
    id: "fast-resume",
    company: "Fast Resume",
    quote:
      "Sunny and his award winning team are second to none when it comes to responsive web design. Their ability to take an idea and make it a work of art has always been a great experience. When you find companies like his you make sure to keep them close.",
    person: "Doug Petrie",
    role: "Founder & CEO",
    country: "USA",
    photo: "/testimonials/doug.webp",
    videoUrl:
      "https://www.youtube.com/embed/eKB_kigzDwA?autoplay=1",
  },
  {
    id: "technis",
    company: "Technis",
    quote:
      "Sunny and his team is a very professional, with whom I am used to working on different projects. listening, versatile, very smart, I recommend without hesitation.",
    person: "Jean-Baptiste Biolay",
    role: "General Manager",
    country: "UAE",
    photo: "/testimonials/jean.webp",
  },
  {
    id: "ventigence",
    company: "Ventigence",
    quote:
      "Trionn team did an amazing development work for my company. They were fast, flexible and very professional. If your organization needs website design, I guess you know who I would recommend to be the 1st on your list.",
    person: "Zoltan Csonka",
    role: "Founder & CEO",
    country: "UAE",
    photo: "/testimonials/zoltan.webp",
    videoUrl:
      "https://www.youtube.com/embed/9F4WsbJ1mrc?autoplay=1",
  },
];

function wrapIndex(index: number) {
  return (
    (index + TESTIMONIALS.length) %
    TESTIMONIALS.length
  );
}

function CompanyMark({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    // These are the portraits used by the reference carousel.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={testimonial.photo}
      alt={testimonial.person}
      className="block h-[42px] w-[42px] shrink-0 object-cover md:h-[51.2px] md:w-[51.2px] lg:h-[64px] lg:w-[64px]"
    />
  );
}

export function HomeClientStories() {
  const sectionRef =
    useRef<HTMLElement>(null);
  const tabRefs =
    useRef<Array<HTMLButtonElement | null>>(
      [],
    );

  const [activeIndex, setActiveIndex] =
    useState(0);
  const [isMobile, setIsMobile] =
    useState(false);
  const [autoplayPaused, setAutoplayPaused] =
    useState(false);

  const active =
    TESTIMONIALS[activeIndex];

  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 767px)",
    );
    const update = () => {
      setIsMobile(media.matches);
    };

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener(
        "change",
        update,
      );
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let ownsTheme = false;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            document.documentElement.dataset.pageTheme =
              "light";
            ownsTheme = true;
            section.dataset.clientStoriesActive =
              "true";
            return;
          }

          if (
            entry.boundingClientRect.top > 0 &&
            section.dataset.clientStoriesActive ===
              "true"
          ) {
            document.documentElement.dataset.pageTheme =
              "dark";
            ownsTheme = false;
          }

          delete section.dataset.clientStoriesActive;
        },
        {
          rootMargin: "-42% 0px -42% 0px",
        },
      );

    observer.observe(section);

    return () => {
      observer.disconnect();
      delete section.dataset.clientStoriesActive;

      if (ownsTheme) {
        delete document.documentElement.dataset.pageTheme;
      }
    };
  }, []);

  useEffect(() => {
    if (autoplayPaused) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) =>
        wrapIndex(current + 1),
      );
    }, 5_000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, autoplayPaused]);

  const selectTestimonial = (
    index: number,
    focusTab = false,
  ) => {
    const nextIndex = wrapIndex(index);
    setActiveIndex(nextIndex);

    if (focusTab) {
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown"
    ) {
      nextIndex = index + 1;
    } else if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      nextIndex = index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = TESTIMONIALS.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    selectTestimonial(
      nextIndex,
      true,
    );
  };

  return (
    <section
      ref={sectionRef}
      id="client-stories"
      data-home-client-stories
      aria-labelledby="client-stories-heading"
      className="layout-gutter relative z-[56] h-[856px] min-h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#c3c3c3_100%)] pt-[55px] text-[var(--color-text-dark)] md:h-[calc(100svh+10px)] md:min-h-0 md:pt-[5svh] lg:h-[calc(60.78svh+436px)] lg:pt-[16.6667svh]"
      onPointerEnter={() => setAutoplayPaused(true)}
      onPointerLeave={() => setAutoplayPaused(false)}
    >
      <div className="relative mx-auto h-full w-full max-w-[1248px]">
        <header className="grid grid-cols-1 gap-0 md:h-[46.5px] md:grid-cols-2 md:gap-x-[15.36px] lg:h-[72px] lg:grid-cols-12 lg:gap-x-[19.2px]">
          <h2
            id="client-stories-heading"
            className="font-display text-[30.4688px] font-normal leading-[0.88] tracking-[-0.06em] md:col-span-1 md:col-start-1 md:h-[46.5px] md:text-[6.283vw] md:leading-[0.9473] lg:col-span-5 lg:col-start-2 lg:h-auto lg:text-[5.938vw]"
          >
            Client stories
          </h2>

          <p className="mt-[18.3px] text-[15.2344px] leading-[1.215] tracking-[-0.025em] md:col-span-1 md:mt-0 md:pt-[10.24px] md:text-[12.8px] md:leading-normal md:tracking-normal lg:col-span-5 lg:pt-[20px] lg:text-[14.4px]">
            Great work is built through
            <br />
            partnership. Here&apos;s what
            <br />
            our clients say.
          </p>
        </header>

        <div
          aria-hidden="true"
          className="relative mb-[29.7px] mt-[30.5px] h-[13px] md:my-[2.36svh] lg:my-[8.72svh]"
        >
          <span className="absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 bg-black/[0.13]" />
          <span className="absolute left-1/2 top-1/2 grid h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 place-items-center bg-transparent text-[18px] font-light leading-none md:bg-[#e7e7e7] md:text-[15px]">
            +
          </span>
        </div>

        <div className="grid grid-cols-1 gap-[48px] md:grid-cols-2 md:gap-x-[15.36px] md:gap-y-0 lg:grid-cols-12 lg:gap-x-[19.2px]">
          <div className="absolute left-0 top-0 flex min-w-0 flex-col justify-between md:static md:col-span-1 md:col-start-1 md:min-h-[293px] lg:col-span-5 lg:col-start-2 lg:min-h-[413px]">
            <div
              role="tablist"
              aria-label="Client companies"
              aria-orientation={
                isMobile
                  ? "horizontal"
                  : "vertical"
              }
              className="hidden md:mx-0 md:flex md:flex-col md:gap-[10.24px] md:overflow-visible md:px-0 md:pb-0 lg:gap-[12.5px]"
            >
              {TESTIMONIALS.map(
                (testimonial, index) => {
                  const selected =
                    index === activeIndex;

                  return (
                    <button
                      key={testimonial.id}
                      ref={(node) => {
                        tabRefs.current[index] =
                          node;
                      }}
                      id={`client-tab-${testimonial.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`client-panel-${testimonial.id}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => {
                        selectTestimonial(index);
                      }}
                      onKeyDown={(event) => {
                        handleTabKeyDown(
                          event,
                          index,
                        );
                      }}
                      className={[
                        "group shrink-0 items-center gap-[9px] whitespace-nowrap border-0 bg-transparent p-0 text-left font-display uppercase transition-opacity duration-300 md:flex",
                        selected
                          ? "opacity-100"
                          : "opacity-30 hover:opacity-70",
                      ].join(" ")}
                    >
                      <span>{testimonial.company}</span>
                      <span
                        aria-hidden="true"
                        className={[
                          "text-[11.2px] transition-[opacity,transform] duration-300",
                          selected
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0",
                        ].join(" ")}
                      >
                        →
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            <div className="absolute left-0 top-[539px] flex items-center md:static md:mt-0">
              <button
                type="button"
                aria-label="Previous client story"
                onClick={() => {
                  selectTestimonial(
                    activeIndex - 1,
                  );
                }}
                className="grid h-[42px] w-[42px] place-items-center border border-black/[0.15] bg-transparent text-[14px] transition-colors hover:bg-black hover:text-white md:h-[51.2px] md:w-[51.2px] md:text-[15px] lg:h-[64px] lg:w-[64px] lg:text-[17px]"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next client story"
                onClick={() => {
                  selectTestimonial(
                    activeIndex + 1,
                  );
                }}
                className="-ml-px grid h-[42px] w-[42px] place-items-center border border-black/[0.15] bg-transparent text-[14px] transition-colors hover:bg-black hover:text-white md:h-[51.2px] md:w-[51.2px] md:text-[15px] lg:h-[64px] lg:w-[64px] lg:text-[17px]"
              >
                →
              </button>
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-5">
            <article
              key={active.id}
              id={`client-panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`client-tab-${active.id}`}
              tabIndex={0}
              data-client-story-panel
              className="relative flex min-h-0 flex-col md:min-h-[192px] md:justify-between lg:min-h-[300.781px]"
            >
              <div>
                <p className="mb-[18.3px] font-display text-[13.7109px] font-normal uppercase leading-none tracking-[-0.02em] md:hidden">
                  {active.company}
                </p>
                <blockquote className="font-display text-[21.3281px] font-normal leading-none tracking-[-0.04em] md:text-[17.92px] md:leading-none md:tracking-[-0.04em] lg:text-[28.8px]">
                  {active.quote}
                </blockquote>
              </div>

              <div className="mt-[32px] flex items-end justify-between gap-5 md:mt-0">
                <div className="flex items-end gap-[12px] md:gap-[19.2px]">
                  <CompanyMark
                    testimonial={active}
                  />
                  <div className="pb-0 text-[15.2344px] leading-[1.15] tracking-[-0.02em] md:pb-[2px] md:text-[11.52px] md:leading-normal md:tracking-normal lg:text-[14.4px]">
                    <p>{active.person}</p>
                    <p className="text-black/52 md:mt-[1px]">
                      {active.role} · {active.country}
                    </p>
                  </div>
                </div>
              </div>
              {active.videoUrl ? (
                <button
                  type="button"
                  data-client-story-listen
                  className="absolute right-0 top-[214px] flex w-[125px] items-center gap-[4px] font-mono text-[11.2px] uppercase leading-none tracking-[-0.06em] md:top-[179.9px] md:w-[103.875px] lg:top-[287px] lg:w-[113.648px]"
                  aria-label={`Listen to ${active.person}'s client story`}
                >
                  <span aria-hidden="true">▷</span>
                  <span>Listen to him!</span>
                </button>
              ) : null}
            </article>
          </div>
        </div>

        <TransitionLink
          href="/contact"
          className="absolute left-0 top-[458px] flex h-[32px] w-[152px] items-center justify-between border-b border-black/60 font-mono text-[10.664px] uppercase tracking-[-0.025em] transition-[width] duration-300 hover:w-[170px] md:left-[51.0714%] md:top-[381.84px] md:w-[128px] md:text-[10.24px] md:hover:w-[144px] lg:left-[50.796875%] lg:top-[591.38px] lg:w-[160px] lg:text-[11.2px] lg:tracking-[-0.06em] lg:hover:w-[180px]"
        >
          <span>Become a client</span>
          <span aria-hidden="true">→</span>
        </TransitionLink>
      </div>
    </section>
  );
}
