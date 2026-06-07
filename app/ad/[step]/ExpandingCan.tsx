"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Click the hero can → it zooms up into the screen, a white veil fades in,
// then we route to the next slide. Animation classes (.hero-can-zoom,
// .expand-veil) live in the StageStyles block in page.tsx.
export default function ExpandingCan({ src, alt, to }: { src: string; alt: string; to: string }) {
  const router = useRouter();
  const [launching, setLaunching] = useState(false);

  // Prefetch the next slide up front so the hand-off is instant and the
  // white veil doesn't linger waiting for it to load.
  useEffect(() => {
    router.prefetch(to);
  }, [router, to]);

  function launch() {
    if (launching) return;
    setLaunching(true);
    // The veil is fully white by ~80% of the 560ms animation; push just after
    // so the swap happens hidden under the veil with no visible pause.
    window.setTimeout(() => router.push(to), 470);
  }

  return (
    <>
      <img
        className={launching ? "hero-can-zoom" : "hero-can-main"}
        src={src}
        alt={alt}
        onClick={launch}
        role="button"
        tabIndex={0}
        aria-label="Expand and continue"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            launch();
          }
        }}
        style={{
          position: "relative",
          zIndex: 2,
          height: "min(80vh, 830px)",
          width: "auto",
          maxWidth: "74vw",
          objectFit: "contain",
          cursor: "pointer",
          filter: "drop-shadow(0 34px 70px rgba(33,28,23,0.22))",
        }}
      />
      {launching && <div className="expand-veil" aria-hidden="true" />}
    </>
  );
}
