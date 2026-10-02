"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const SLIDE_DURATION_MS = 6000;

export function HeroCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (images.length <= 1 || paused) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length);
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, paused]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            loading={i === 0 ? undefined : "lazy"}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Diapositives"
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Image ${i + 1} sur ${images.length}`}
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
