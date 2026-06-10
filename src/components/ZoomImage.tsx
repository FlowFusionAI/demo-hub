"use client";

import { useState } from "react";
import Image from "next/image";

type Props = { src: string; alt: string; width: number; height: number };

export function ZoomImage({ src, alt, width, height }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-line transition-opacity hover:opacity-90"
      >
        <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="max-h-[88vh] w-auto max-w-[88vw] rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
