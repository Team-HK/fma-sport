"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export type HeroSlideContent = {
  imageUrl: string;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

const SLIDE_DURATION_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlideContent[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, paused]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.imageUrl + i}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
        >
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            priority={i === 0}
            loading={i === 0 ? undefined : "lazy"}
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/35 to-accent/20"
          />
          <div className="relative z-10 flex h-full items-center">
            <div className="mx-auto max-w-4xl px-4 py-24 text-center text-white sm:px-6">
              {slide.title ? (
                <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-6xl">
                  {slide.title}
                </h1>
              ) : (
                <>
                  <Logo size={88} className="mx-auto mb-4" />
                  <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-6xl">
                    FMA SPORT
                  </h1>
                </>
              )}
              <p className="mx-auto mt-4 max-w-2xl text-lg italic text-white/90 sm:text-xl">
                {slide.subtitle || "« L'information football & les talents de demain. »"}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {slide.ctaLabel && slide.ctaHref ? (
                  <Button
                    href={slide.ctaHref}
                    size="lg"
                    variant="ghost"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    {slide.ctaLabel}
                  </Button>
                ) : (
                  <>
                    <Button
                      href="/actualites"
                      size="lg"
                      variant="ghost"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Voir les actualités
                    </Button>
                    <Button
                      href="/devenir-joueur"
                      size="lg"
                      variant="ghost"
                      className="border-2 border-white text-white hover:bg-white/15"
                    >
                      Devenir joueur FMA SPORT
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div
          role="tablist"
          aria-label="Diapositives"
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2"
        >
          {slides.map((slide, i) => (
            <button
              key={slide.imageUrl + i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Image ${i + 1} sur ${slides.length}`}
              onClick={() => goTo(i)}
              className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
