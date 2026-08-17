"use client";

import {
  type ComponentProps,
  type MouseEvent,
} from "react";

import Link from "next/link";

import {
  usePageTransition,
} from "@/runtime/transition/PageTransitionProvider";

type TransitionLinkProps =
  Omit<
    ComponentProps<typeof Link>,
    "href"
  > & {
    href: string;
  };

export function TransitionLink({
  href,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
  const {
    navigate,
    isTransitioning,
  } = usePageTransition();

  const handleClick = (
    event:
      MouseEvent<HTMLAnchorElement>,
  ) => {
    onClick?.(
      event,
    );

    if (
      event.defaultPrevented
    ) {
      return;
    }

    // Cmd/Ctrl click vb.
    // normal browser davranışını korusun.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    if (
      isTransitioning
    ) {
      return;
    }

    navigate(
      href,
    );
  };

  return (
    <Link
      {...props}
      href={href}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}