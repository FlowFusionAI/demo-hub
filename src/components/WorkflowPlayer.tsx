"use client";

import { useState } from "react";

type Props = {
  gif: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Click-to-play wrapper for the walkthrough GIF.
 * Animated GIFs ignore prefers-reduced-motion (they always autoplay and loop),
 * so we never autoplay: a static placeholder reserves the frame and the GIF is
 * only fetched and shown on an explicit click. Clicking again stops it. This
 * also keeps the 1.2 MB GIF off the initial page load.
 */
export function WorkflowPlayer({ gif, alt, width, height }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setPlaying((p) => !p)}
      aria-label={playing ? "Stop the walkthrough" : "Play the walkthrough"}
      className="group relative block w-full overflow-hidden rounded-lg border border-line bg-paper"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {playing ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gif}
            alt={alt}
            width={width}
            height={height}
            className="h-full w-full object-contain"
          />
          <span className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest text-paper">
            ◼ stop
          </span>
        </>
      ) : (
        <span className="dot-grid absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-card text-accent transition-transform group-hover:scale-110">
            {/* play triangle */}
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <path d="M6 4 L16 10 L6 16 Z" fill="currentColor" />
            </svg>
          </span>
          <span className="text-center">
            <span className="block font-mono text-[0.62rem] uppercase tracking-widest text-ink/80">
              play the workflow walkthrough
            </span>
            <span className="mt-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-muted">
              animated · click to load
            </span>
          </span>
        </span>
      )}
    </button>
  );
}
