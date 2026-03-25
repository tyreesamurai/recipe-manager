"use client";

import { useState } from "react";

export function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    // biome-ignore lint/performance/noImgElement: external URLs, no next/image domain config needed
    <img
      src={src}
      alt={alt}
      className="w-full aspect-video object-cover object-center rounded-xl mb-6"
      onError={() => setFailed(true)}
    />
  );
}
