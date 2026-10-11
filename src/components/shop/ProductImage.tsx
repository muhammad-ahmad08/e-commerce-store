"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  slug: string;
  name: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export default function ProductImage({ slug, name, sizes, className = "object-cover", priority = false }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div role="img" aria-label={name} className="absolute inset-0 flex items-center justify-center bg-background-secondary px-5 text-center">
      <span className="font-serif text-xl text-foreground-muted sm:text-2xl">{name}</span>
    </div>;
  }
  return <Image
    src={`/images/products/${slug}.jpg`}
    alt={name}
    fill
    sizes={sizes}
    priority={priority}
    onError={() => setFailed(true)}
    className={className}
  />;
}
