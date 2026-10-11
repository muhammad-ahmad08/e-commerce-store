"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { createProduct, updateProduct } from "@/app/(admin)/admin/products/actions";
import type { AdminCategory, AdminProduct } from "@/lib/supabase/admin-queries";

type Props = { categories: AdminCategory[]; product?: AdminProduct };
type DraftVariant = { size: string; color: string; stock: string; price: string; sku: string };
const emptyVariant = (price = "") => ({ size: "", color: "", stock: "0", price, sku: "" });
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product?.basePrice ?? ""));
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [variants, setVariants] = useState<DraftVariant[]>(product ? [] : [emptyVariant(), emptyVariant()]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function changeName(value: string) {
    setName(value);
    if (!product && !slugEdited) setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80));
  }

  function changeBasePrice(value: string) {
    setBasePrice(value);
    if (!product) setVariants((current) => current.map((variant) => ({ ...variant, price: variant.price || value })));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const price = Number(basePrice);
    if (!name.trim() || name.trim().length > 120 || !categoryId || !Number.isFinite(price) || price < 0 || Math.round(price * 100) !== price * 100) {
      setError("Check the product name, category, and non-negative price (up to two decimal places).");
      return;
    }
    if (!slugPattern.test(slug) || slug.length > 80) {
      setError("URL name must use lowercase letters, numbers, and single hyphens (up to 80 characters).");
      return;
    }
    const payload = { name, categoryId, description, basePrice: price, isActive };
    startTransition(async () => {
      if (product) {
        const result = await updateProduct(product.id, payload);
        if (result.error) setError(result.error);
        else router.refresh();
        return;
      }
      const variantPayload = variants.filter((variant) => variant.size.trim() || variant.color.trim() || variant.sku.trim())
        .map((variant) => ({ size: variant.size, color: variant.color, stock: Number(variant.stock), price: Number(variant.price || basePrice), sku: variant.sku }));
      for (const variant of variantPayload) {
        if (!variant.size.trim() || variant.size.length > 30 || !variant.color.trim() || variant.color.length > 30 || !Number.isInteger(variant.stock) || variant.stock < 0 || !Number.isFinite(variant.price) || variant.price < 0 || Math.round(variant.price * 100) !== variant.price * 100 || variant.sku.length > 50) {
          setError("Check each variant: size and color are required; stock must be a whole non-negative number; price allows up to two decimals.");
          return;
        }
      }
      const result = await createProduct({ ...payload, slug }, variantPayload);
      if (result.error) setError(result.error);
      else if (result.productId) router.push(`/admin/products/${result.productId}`);
    });
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Product name" required maxLength={120} value={name} onChange={changeName} />
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground-primary" htmlFor="product-slug">URL name</label>
          <input id="product-slug" required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" readOnly={Boolean(product)} value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} className="min-h-12 w-full border border-border-token bg-background-primary px-4 text-sm outline-none focus:border-brand-terracotta read-only:bg-background-secondary" />
          <p className="mt-2 text-xs leading-5 text-foreground-muted">{product ? "This URL name is fixed because product photos are currently matched by URL name." : "Used in the product URL and to locate its photo."}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground-primary" htmlFor="product-category">Category</label>
          <select id="product-category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="min-h-12 w-full border border-border-token bg-background-primary px-4 text-sm outline-none focus:border-brand-terracotta">
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div>
          <Field label="Default price (Rs.)" type="number" min="0" step="0.01" required value={basePrice} onChange={changeBasePrice} />
          <p className="mt-2 text-xs leading-5 text-foreground-muted">Used for new variants and when a product has no variants. The storefront shows the lowest variant price.</p>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-foreground-primary sm:col-span-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-[var(--color-accent-terracotta)]" />
          Visible in the store
        </label>
        <div className="sm:col-span-2">
          <label htmlFor="product-description" className="mb-2 block text-sm font-medium text-foreground-primary">Description (optional)</label>
          <textarea id="product-description" maxLength={5000} rows={5} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full border border-border-token bg-background-primary px-4 py-3 text-sm outline-none focus:border-brand-terracotta" />
        </div>
      </div>

      {!product ? (
        <section className="border-t border-border-token pt-6">
          <h2 className="font-serif text-2xl text-foreground-primary">Initial variants</h2>
          <p className="mt-2 text-sm text-foreground-muted">Variant prices default to the base price. Leave rows blank to skip them.</p>
          <div className="mt-4 space-y-4">
            {variants.map((variant, index) => <VariantDraft key={index} variant={variant} onChange={(next) => setVariants((current) => current.map((item, i) => i === index ? next : item))} />)}
          </div>
          <button type="button" onClick={() => setVariants((current) => [...current, emptyVariant(basePrice)])} className="mt-4 text-sm font-semibold text-brand-forest underline underline-offset-4">Add another variant</button>
        </section>
      ) : null}

      {error ? <p role="alert" className="border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
      <div className="flex flex-wrap gap-4">
        <button type="submit" disabled={isPending} className="min-h-12 bg-brand-terracotta px-7 text-xs font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-60">{isPending ? "Saving…" : product ? "Save product" : "Create product"}</button>
        <Link href={product ? `/admin/products/${product.id}` : "/admin/products"} className="inline-flex min-h-12 items-center border border-border-token px-6 text-xs font-semibold uppercase tracking-[0.15em] text-foreground-primary">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", ...props }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; maxLength?: number; min?: string; step?: string }) {
  const id = `field-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return <div><label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground-primary">{label}</label><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} className="min-h-12 w-full border border-border-token bg-background-primary px-4 text-sm outline-none focus:border-brand-terracotta" /></div>;
}

function VariantDraft({ variant, onChange }: { variant: DraftVariant; onChange: (variant: DraftVariant) => void }) {
  return <div className="grid gap-3 border border-border-token bg-background-secondary p-4 sm:grid-cols-5">
    <input aria-label="Size" placeholder="Size" maxLength={30} value={variant.size} onChange={(event) => onChange({ ...variant, size: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
    <input aria-label="Color" placeholder="Color" maxLength={30} value={variant.color} onChange={(event) => onChange({ ...variant, color: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
    <input aria-label="Stock" placeholder="Stock" type="number" min="0" step="1" value={variant.stock} onChange={(event) => onChange({ ...variant, stock: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
    <input aria-label="Variant price" placeholder="Price" type="number" min="0" step="0.01" value={variant.price || ""} onChange={(event) => onChange({ ...variant, price: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
    <input aria-label="SKU" placeholder="SKU (optional)" maxLength={50} value={variant.sku} onChange={(event) => onChange({ ...variant, sku: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
  </div>;
}
