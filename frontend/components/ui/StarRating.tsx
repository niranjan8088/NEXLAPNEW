"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function StarRating({
  rating,
  onChange,
  readOnly = false,
  size = "md",
}: Props) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const handleStarClick = (value: number) => {
    if (readOnly || !onChange) return;
    onChange(value);
  };

  const handleMouseEnter = (value: number) => {
    if (readOnly) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(null);
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={cn("flex items-center gap-1.5", !readOnly && "cursor-pointer")}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            className={cn(
              "transition-all duration-300 focus:outline-none",
              !readOnly && "hover:scale-125 active:scale-95",
              isFilled
                ? "text-nex-blueLight drop-shadow-[0_0_8px_rgba(74,140,255,0.7)]"
                : "text-white/20 hover:text-white/40"
            )}
            aria-label={readOnly ? undefined : `Rate ${starValue} stars out of 5`}
          >
            <Star
              className={cn(
                starSizes[size],
                isFilled && "fill-nex-blueLight"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
