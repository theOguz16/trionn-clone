"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap/client";

import { FooterLineLogo } from "./FooterLineLogo";
import { FooterFog } from "./FooterFog";
import { footerContact, footerSocialLinks } from "./footerLinks";
import styles from "./HomeAudioFooter.module.css";

const CALENDLY_URL = "https://calendly.com/hello-trionn/30min";

function getIndiaTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function FooterArrow() {
  return <span aria-hidden="true">→</span>;
}

export function HomeAudioFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [indiaTime, setIndiaTime] = useState("--:--");

  useEffect(() => {
    const updateClock = () => setIndiaTime(getIndiaTime());
    updateClock();
    const timer = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let ownsTheme = false;
      const setDarkTheme = () => {
        document.documentElement.dataset.pageTheme = "dark";
        ownsTheme = true;
      };

      const themeTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        end: "bottom bottom",
        onEnter: setDarkTheme,
        onEnterBack: setDarkTheme,
        onLeaveBack: () => {
          document.documentElement.dataset.pageTheme = "light";
          ownsTheme = false;
        },
      });

      const reveals = Array.from(
        section.querySelectorAll<HTMLElement>("[data-footer-reveal]"),
      );
      const revealTrigger = reducedMotion
        ? null
        : ScrollTrigger.create({
            trigger: section,
            start: "top 72%",
            once: true,
            onEnter: () => {
              gsap.to(reveals, {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.9,
                stagger: 0.055,
                ease: "power3.out",
              });
            },
          });

      return () => {
        revealTrigger?.kill();
        themeTrigger.kill();
        if (ownsTheme) delete document.documentElement.dataset.pageTheme;
      };
    },
    { scope: sectionRef },
  );

  return (
    <footer
      ref={sectionRef}
      id="site-footer"
      data-home-audio-footer
      aria-labelledby="footer-heading"
      className={styles.section}
    >
      <FooterFog />

      <div className={styles.primaryContent}>
        <div className={styles.topCopy}>
          <p data-footer-reveal className={`${styles.eyebrow} ${styles.reveal}`}>
            LET&apos;S BUILD WORK THAT INSPIRES.
          </p>
          <h2
            id="footer-heading"
            data-footer-reveal
            className={`${styles.heading} ${styles.reveal}`}
          >
            Ready to build
            <br />
            something bold?
          </h2>
        </div>

        <p data-footer-reveal className={`${styles.clock} ${styles.reveal}`}>
          IST → {indiaTime}
        </p>

        <nav
          data-footer-reveal
          aria-label="Project actions"
          className={`${styles.actions} ${styles.reveal}`}
        >
          <a href="/contact" className={styles.actionLink}>
            <span>Discuss Your Project</span>
            <FooterArrow />
          </a>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionLink}
          >
            <span>Book a 30-minute Call</span>
            <FooterArrow />
          </a>
        </nav>

        <div data-footer-reveal className={`${styles.meta} ${styles.reveal}`}>
          <div className={styles.copyrightBlock}>
            <p className={styles.copyright}>©TRIONN® 2026</p>
            <p className={styles.soundHint}>
              SOUND ON{" "}
              <Image
                src="/images/footer-sound.svg"
                width={24}
                height={24}
                alt=""
                aria-hidden="true"
                className={styles.soundIcon}
              />{" "}
              HOVER THE LINES.
            </p>
          </div>

          <section className={styles.business} aria-labelledby="footer-enquiry-label">
            <h3 id="footer-enquiry-label" className={styles.detailLabel}>
              Business enquiry
            </h3>
            <p className={styles.contactRow}>
              <span>E.</span>
              <a href={`mailto:${footerContact.email}`}>{footerContact.email}</a>
            </p>
            <p className={styles.contactRow}>
              <span>P.</span>
              <a href={`tel:${footerContact.phoneHref}`}>{footerContact.phoneDisplay}</a>
            </p>
          </section>

          <nav className={styles.social} aria-labelledby="footer-social-label">
            <h3 id="footer-social-label" className={styles.detailLabel}>Social</h3>
            <ul className={styles.socialList}>
              {footerSocialLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div data-footer-reveal className={`${styles.logoWrap} ${styles.reveal}`}>
        <FooterLineLogo />
      </div>
    </footer>
  );
}
