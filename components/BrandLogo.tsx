"use client";

import { useState } from "react";
import Image from "next/image";

const SVG_LOGO_PATH = "/assets/nexlaptech-logo.svg";

interface BrandLogoProps {
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function BrandLogo({
  width = 160,
  height = 160,
  sizes,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const showWordmark = width >= 96;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label="Nex LapTech"
    >
      {!failed ? (
        <Image
          src={SVG_LOGO_PATH}
          alt="Nex LapTech"
          width={width}
          height={height}
          sizes={sizes || `${width}px`}
          priority={priority}
          unoptimized
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center gap-2 rounded-full border-2 border-cyan-400 bg-[#020b1f] p-2 text-center text-white shadow-[0_0_20px_rgba(25,211,255,0.35)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500 text-sm font-black text-cyan-300">
            NL
          </span>
          {showWordmark && (
            <span className="min-w-0 text-left">
              <span className="block truncate font-display text-sm font-extrabold">Nex LapTech</span>
              <span className="block truncate text-[8px] font-semibold uppercase text-cyan-200">
                Laptops | PC Components | Accessories | More
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}
