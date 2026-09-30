"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/supabase/queries";

type VariantSelectorProps = {
  variants: ProductVariant[];
  basePrice: number;
};

const priceFormatter = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 });

export default function VariantSelector({ variants, basePrice }: VariantSelectorProps) {
  const colors = useMemo(() => [...new Set(variants.map((variant) => variant.color))], [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((variant) => variant.size))], [variants]);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(() =>
    variants.find((variant) => variant.color === colors[0])?.size ?? "",
  );
  const activeVariant = variants.find(
    (variant) => variant.color === selectedColor && variant.size === selectedSize,
  );
  const stock = activeVariant?.stock ?? 0;
  const [quantity, setQuantity] = useState(1);

  function selectColor(color: string) {
    setSelectedColor(color);
    setSelectedSize(variants.find((variant) => variant.color === color)?.size ?? "");
    setQuantity(1);
  }

  function selectSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
  }

  if (variants.length === 0) {
    return (
      <div className="mt-8 space-y-3">
        <p className="font-serif text-2xl">Rs. {priceFormatter.format(basePrice)}</p>
        <p className="text-sm text-foreground-muted">Currently unavailable</p>
        <button disabled className="min-h-12 w-full bg-brand-terracotta px-6 text-xs font-semibold uppercase tracking-[0.15em] text-white opacity-50">
          Add to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-7">
      <p aria-live="polite" className="font-serif text-3xl">Rs. {priceFormatter.format(activeVariant?.price ?? basePrice)}</p>

      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.15em]">Color <span className="font-normal normal-case tracking-normal text-foreground-muted">— {selectedColor}</span></legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button key={color} type="button" aria-pressed={selectedColor === color} onClick={() => selectColor(color)}
              className={`min-h-10 border px-4 text-sm transition-colors duration-250 ease-editorial ${selectedColor === color ? "border-brand-forest bg-brand-forest text-background-primary" : "border-border-token hover:border-brand-forest"}`}>
              {color}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.15em]">Size</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const available = variants.some((variant) => variant.color === selectedColor && variant.size === size);
            return (
              <button key={size} type="button" aria-pressed={selectedSize === size} disabled={!available}
                onClick={() => selectSize(size)}
                className={`min-h-10 min-w-12 border px-3 text-sm transition-colors duration-250 ease-editorial ${!available ? "cursor-not-allowed border-border-token/50 text-foreground-muted/40 line-through" : selectedSize === size ? "border-brand-forest bg-brand-forest text-background-primary" : "border-border-token hover:border-brand-forest"}`}>
                {size}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p aria-live="polite" className={`text-sm ${stock === 0 ? "text-brand-terracotta" : stock <= 2 ? "text-brand-terracotta" : "text-foreground-muted"}`}>
        {!activeVariant || stock === 0 ? "Out of stock" : stock <= 2 ? `Only ${stock} left` : `${stock} in stock`}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-12 items-center border border-border-token">
          <button type="button" aria-label="Decrease quantity" disabled={stock === 0 || quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="h-full w-12 text-lg disabled:opacity-40">−</button>
          <span aria-live="polite" className="min-w-8 text-center text-sm">{quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={stock === 0 || quantity >= stock} onClick={() => setQuantity((current) => Math.min(stock, current + 1))} className="h-full w-12 text-lg disabled:opacity-40">+</button>
        </div>
        <button type="button" disabled={stock === 0} className="min-h-12 flex-1 bg-brand-terracotta px-6 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity duration-250 ease-editorial disabled:cursor-not-allowed disabled:opacity-50">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
