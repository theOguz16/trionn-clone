"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  gsap,
  useGSAP,
} from "@/lib/gsap/client";

import {
  scrollManager,
} from "@/runtime/scroll/ScrollManager";

type PageTransitionContextValue = {
  navigate: (href: string) => void;
  isTransitioning: boolean;
};

const PageTransitionContext =
  createContext<PageTransitionContextValue | null>(
    null,
  );

type PageTransitionProviderProps = {
  children: ReactNode;
};

export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef =
    useRef<HTMLDivElement>(null);

  const orangeRef =
    useRef<HTMLDivElement>(null);

  const panelRef =
    useRef<HTMLDivElement>(null);

  const labelRef =
    useRef<HTMLDivElement>(null);

  const pendingHrefRef =
    useRef<string | null>(null);

  const previousOverflowRef =
    useRef<string | null>(null);

  const transitioningRef =
    useRef(false);

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  // -------------------------
  // INITIAL STATE
  // -------------------------

  useGSAP(() => {
    const overlay =
      overlayRef.current;

    const orange =
      orangeRef.current;

    const panel =
      panelRef.current;

    const label =
      labelRef.current;

    if (
      !overlay ||
      !orange ||
      !panel ||
      !label
    ) {
      return;
    }

    gsap.set(
      [orange, panel],
      {
        scaleY: 0,
        transformOrigin:
          "bottom center",
      },
    );

    gsap.set(
      label,
      {
        yPercent: 130,
        opacity: 0,
      },
    );

    gsap.set(
      overlay,
      {
        pointerEvents: "none",
      },
    );
  }, []);

  // -------------------------
  // SCROLL LOCK
  // -------------------------

  const lockScroll =
    useCallback(() => {
      if (
        previousOverflowRef.current !==
        null
      ) {
        return;
      }

      previousOverflowRef.current =
        document.documentElement.style.overflow;

      document.documentElement.style.overflow =
        "hidden";

      scrollManager.stop();
    }, []);

  const unlockScroll =
    useCallback(() => {
      if (
        previousOverflowRef.current ===
        null
      ) {
        return;
      }

      const previousOverflow =
        previousOverflowRef.current;
      const menuOpen =
        document.querySelector<HTMLElement>(
          "header[data-menu-open]",
        )?.dataset.menuOpen === "true";
      const bodyOwnsScrollLock =
        document.body.style.overflow ===
          "hidden" ||
        document.body.style.position ===
          "fixed";

      document.documentElement.style.overflow =
        previousOverflow === "hidden" &&
        !menuOpen &&
        !bodyOwnsScrollLock
          ? ""
          : previousOverflow;

      previousOverflowRef.current =
        null;

      scrollManager.start();
    }, []);

  // -------------------------
  // NAVIGATE
  // -------------------------

  const navigate =
    useCallback(
      (href: string) => {
        if (
          transitioningRef.current
        ) {
          return;
        }

        const currentUrl =
          new URL(
            window.location.href,
          );

        const targetUrl =
          new URL(
            href,
            window.location.href,
          );

        // External URL.
        if (
          targetUrl.origin !==
          currentUrl.origin
        ) {
          window.location.href =
            targetUrl.href;

          return;
        }

        const samePage =
          targetUrl.pathname ===
            currentUrl.pathname &&
          targetUrl.search ===
            currentUrl.search;

        // Same-page anchor.
        if (
          samePage &&
          targetUrl.hash
        ) {
          const target =
            document.querySelector(
              targetUrl.hash,
            );

          if (
            target instanceof
            HTMLElement
          ) {
            scrollManager.scrollTo(
              target,
              {
                offset: 0,
              },
            );
          }

          return;
        }

        // Exact same URL.
        if (
          samePage &&
          targetUrl.hash ===
            currentUrl.hash
        ) {
          return;
        }

        const overlay =
          overlayRef.current;

        const orange =
          orangeRef.current;

        const panel =
          panelRef.current;

        const label =
          labelRef.current;

        if (
          !overlay ||
          !orange ||
          !panel ||
          !label
        ) {
          router.push(href);

          return;
        }

        transitioningRef.current =
          true;

        setIsTransitioning(
          true,
        );

        pendingHrefRef.current =
          targetUrl.pathname +
          targetUrl.search +
          targetUrl.hash;

        lockScroll();

        gsap.killTweensOf(
          [
            orange,
            panel,
            label,
          ],
        );

        gsap.set(
          overlay,
          {
            pointerEvents:
              "auto",
          },
        );

        gsap.set(
          [orange, panel],
          {
            transformOrigin:
              "bottom center",
          },
        );

        gsap
          .timeline()
          .to(
            orange,
            {
              scaleY: 1,
              duration: 0.55,
              ease: "power4.inOut",
            },
          )
          .to(
            panel,
            {
              scaleY: 1,
              duration: 0.62,
              ease: "power4.inOut",
            },
            0.08,
          )
          .to(
            label,
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.45,
              ease: "power3.out",
            },
            0.35,
          )
          .call(() => {
            router.push(
              pendingHrefRef.current ??
                href,
              {
                scroll: false,
              },
            );
          });
      },
      [
        lockScroll,
        router,
      ],
    );

  // -------------------------
  // ROUTE ARRIVED
  // -------------------------

  useEffect(() => {
    if (
      !transitioningRef.current
    ) {
      return;
    }

    const overlay =
      overlayRef.current;

    const orange =
      orangeRef.current;

    const panel =
      panelRef.current;

    const label =
      labelRef.current;

    if (
      !overlay ||
      !orange ||
      !panel ||
      !label
    ) {
      transitioningRef.current =
        false;

      setIsTransitioning(
        false,
      );

      unlockScroll();

      return;
    }

    const pendingHref =
      pendingHrefRef.current;

    const pendingUrl =
      pendingHref
        ? new URL(
            pendingHref,
            window.location.origin,
          )
        : null;

    // Route commit edildikten sonra
    // yeni sayfanın başına geç.
    window.scrollTo(
      0,
      0,
    );

    requestAnimationFrame(
      () => {
        requestAnimationFrame(
          () => {
            gsap.set(
              [orange, panel],
              {
                transformOrigin:
                  "top center",
              },
            );

            gsap
              .timeline({
                onComplete:
                  () => {
                    gsap.set(
                      overlay,
                      {
                        pointerEvents:
                          "none",
                      },
                    );

                    gsap.set(
                      label,
                      {
                        yPercent:
                          130,
                        opacity: 0,
                      },
                    );

                    transitioningRef.current =
                      false;

                    setIsTransitioning(
                      false,
                    );

                    pendingHrefRef.current =
                      null;

                    unlockScroll();

                    if (
                      pendingUrl?.hash
                    ) {
                      const target =
                        document.querySelector(
                          pendingUrl.hash,
                        );

                      if (
                        target instanceof
                        HTMLElement
                      ) {
                        scrollManager
                          .scrollTo(
                            target,
                          );
                      }
                    }
                  },
              })
              .to(
                label,
                {
                  yPercent:
                    -130,
                  opacity: 0,
                  duration: 0.3,
                  ease: "power3.in",
                },
              )
              .to(
                panel,
                {
                  scaleY: 0,
                  duration: 0.68,
                  ease: "power4.inOut",
                },
                0.12,
              )
              .to(
                orange,
                {
                  scaleY: 0,
                  duration: 0.58,
                  ease: "power4.inOut",
                },
                0.2,
              );
          },
        );
      },
    );
  }, [
    pathname,
    unlockScroll,
  ]);

  // -------------------------
  // CLEANUP
  // -------------------------

  useEffect(() => {
    return () => {
      unlockScroll();
    };
  }, [unlockScroll]);

  return (
    <PageTransitionContext.Provider
      value={{
        navigate,
        isTransitioning,
      }}
    >
      {children}

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-[1000]"
      >
        <div
          ref={orangeRef}
          className="absolute inset-0 bg-[#ff5a00]"
        />

        <div
          ref={panelRef}
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#080808]"
        >
          <div
            ref={labelRef}
            className="text-[clamp(3rem,10vw,9rem)] font-semibold uppercase leading-none tracking-[-0.07em] text-[#f3f1eb]"
          >
            Motion
          </div>

          <div className="absolute bottom-7 left-5 right-5 flex justify-between text-[10px] uppercase tracking-[0.18em] text-white/40 md:left-10 md:right-10">
            <span>
              Creative Development
            </span>

            <span>
              Loading
            </span>
          </div>
        </div>
      </div>
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context =
    useContext(
      PageTransitionContext,
    );

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider.",
    );
  }

  return context;
}
