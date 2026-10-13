"use client";

import Image from "next/image";
import { useState } from "react";
import { getProductImageUrl } from "@/lib/images";

type Props = {
  slug: string;
  imagePath?: string | null;
  name: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export default function ProductImage({ slug, imagePath, name, sizes, className = "object-cover", priority = false }: Props) {
  return <ResolvedProductImage key={`${slug}:${imagePath ?? ""}`} slug={slug} imagePath={imagePath} name={name} sizes={sizes} className={className} priority={priority} />;
}

function ResolvedProductImage({ slug, imagePath, name, sizes, className, priority }: Props) {
  const [failed, setFailed] = useState(false);
  const [usingSlugFallback, setUsingSlugFallback] = useState(false);
  if (failed) {
    return <div role="img" aria-label={name} className="absolute inset-0 flex items-center justify-center bg-background-secondary px-5 text-center">
      <span className="font-serif text-xl text-foreground-muted sm:text-2xl">{name}</span>
    </div>;
  }
  return <Image
    src={usingSlugFallback ? getProductImageUrl(slug) : getProductImageUrl(slug, imagePath)}
    alt={name}
    fill
    sizes={sizes}
    priority={priority}
    onError={() => {
      if (imagePath && !usingSlugFallback) setUsingSlugFallback(true);
      else setFailed(true);
    }}
    className={className}
  />;
}
