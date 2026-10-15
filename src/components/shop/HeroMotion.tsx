"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

export function HeroReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    element.classList.add("hero-reveal-ready");

    if (!("IntersectionObserver" in window)) {
      element.classList.add("hero-reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("hero-reveal-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="hero-copy-reveal relative z-10">
      {children}
    </div>
  );
}

export function MagneticHeroLink() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const link = linkRef.current;
    if (
      !link ||
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = link.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(dx, dy);
    const movement = Math.min(6, distance * 0.12);
    const divisor = distance || 1;

    link.style.setProperty("--magnetic-x", `${(dx / divisor) * movement}px`);
    link.style.setProperty("--magnetic-y", `${(dy / divisor) * movement}px`);
  }

  function resetPosition() {
    linkRef.current?.style.setProperty("--magnetic-x", "0px");
    linkRef.current?.style.setProperty("--magnetic-y", "0px");
  }

  return (
    <div
      ref={zoneRef}
      className="hero-magnetic-zone hero-reveal-item hero-reveal-cta"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
    >
      <Link
        ref={linkRef}
        href="/shop"
        className="hero-magnetic-link inline-flex min-h-12 items-center justify-center bg-brand-terracotta px-7 text-xs font-semibold uppercase tracking-[0.15em] text-background-primary transition-colors duration-250 ease-editorial hover:bg-brand-forest"
      >
        <span className="hero-magnetic-label">Explore the collection</span>
        <span aria-hidden="true" className="hero-magnetic-arrow">→</span>
      </Link>
    </div>
  );
}

export function HeroParallaxImage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    if (
      !wrapper ||
      !image ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    const updatePosition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = wrapper.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)),
        );
        image.style.setProperty("--hero-parallax-y", `${(progress - 0.5) * 16}px`);
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="hero-enter relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden bg-background-primary"
    >
      <Image
        ref={imageRef}
        src="/images/hero/hero-banner.jpg"
        alt="A model wearing a considered everyday outfit in a warm, sunlit interior"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="hero-parallax-image object-cover"
      />
    </div>
  );
}
