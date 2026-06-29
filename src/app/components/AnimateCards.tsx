"use client";

import { useEffect, useRef } from "react";

export default function AnimateCards({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrappers = ref.current?.querySelectorAll(".show-card-wrapper");
    if (!wrappers?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        visible.forEach((entry, i) => {
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${i * 0.11}s`;
          el.classList.add("card-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -48px 0px" }
    );

    wrappers.forEach((w) => observer.observe(w));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
