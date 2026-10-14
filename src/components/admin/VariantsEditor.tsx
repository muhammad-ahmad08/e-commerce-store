"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addVariant, deleteProduct, deleteVariant, updateVariant } from "@/app/(admin)/admin/products/actions";
import type { AdminProduct, AdminProductVariant } from "@/lib/supabase/admin-queries";

type Draft = { size: string; color: string; stock: string; price: string; sku: string };
const fromVariant = (variant: AdminProductVariant): Draft => ({ size: variant.size, color: variant.color, stock: String(variant.stock), price: String(variant.price), sku: variant.sku ?? "" });

export default function VariantsEditor({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(product.variants.map((variant) => [variant.id, fromVariant(variant)])));
  const [newVariant, setNewVariant] = useState<Draft>({ size: "", color: "", stock: "0", price: String(product.basePrice), sku: "" });
  const [error, setError] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [confirmVariant, setConfirmVariant] = useState<string | null>(null);
  const [confirmProduct, setConfirmProduct] = useState(false);
  const [isPending, startTransition] = useTransition();

  function change(id: string, field: keyof Draft, value: string) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
  }

  function saveVariant(variant: AdminProductVariant) {
    const draft = drafts[variant.id];
    const stock = Number(draft.stock);
    const price = Number(draft.price);
    if (!draft.size.trim() || draft.size.length > 30 || !draft.color.trim() || draft.color.length > 30 || !Number.isInteger(stock) || stock < 0 || !Number.isFinite(price) || price < 0 || Math.round(price * 100) !== price * 100 || draft.sku.length > 50) {
      setRowErrors((current) => ({ ...current, [variant.id]: "Check required size/color, non-negative whole stock, price and SKU limits." }));
      return;
    }
    setRowErrors((current) => ({ ...current, [variant.id]: "" }));
    startTransition(async () => {
      const result = await updateVariant(product.id, { id: variant.id, ...draft, stock, price, originalStock: variant.stock });
      if (result.error) setRowErrors((current) => ({ ...current, [variant.id]: result.error! }));
      else router.refresh();
    });
  }

  function addNewVariant() {
    const stock = Number(newVariant.stock);
    const price = Number(newVariant.price);
    if (!newVariant.size.trim() || newVariant.size.length > 30 || !newVariant.color.trim() || newVariant.color.length > 30 || !Number.isInteger(stock) || stock < 0 || !Number.isFinite(price) || price < 0 || Math.round(price * 100) !== price * 100 || newVariant.sku.length > 50) {
      setError("Check required size/color, non-negative whole stock, price and SKU limits.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await addVariant(product.id, { ...newVariant, stock, price });
      if (result.error) setError(result.error);
      else {
        setNewVariant({ size: "", color: "", stock: "0", price: String(product.basePrice), sku: "" });
        router.refresh();
      }
    });
  }

  function removeVariant(variantId: string) {
    startTransition(async () => {
      const result = await deleteVariant(product.id, variantId);
      if (result.error) setRowErrors((current) => ({ ...current, [variantId]: result.error! }));
      else { setConfirmVariant(null); router.refresh(); }
    });
  }

  function removeProduct() {
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.error) { setError(result.error); setConfirmProduct(false); }
      else router.push("/admin/products");
    });
  }

  return (
    <section className="mt-12 border-t border-border-token pt-8">
      <h2 className="font-serif text-3xl text-foreground-primary">Variants</h2>
      <p className="mt-2 text-sm text-foreground-muted">Stock is only saved when you change its value, so purchases made while this page is open are preserved.</p>
      {product.variants.length ? <div className="mt-6 space-y-5">{product.variants.map((variant) => {
        const draft = drafts[variant.id] ?? fromVariant(variant);
        return <div key={variant.id} className="border border-border-token p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-5">
            <input aria-label="Size" maxLength={30} value={draft.size} onChange={(event) => change(variant.id, "size", event.target.value)} className="min-h-11 border border-border-token px-3 text-sm" />
            <input aria-label="Color" maxLength={30} value={draft.color} onChange={(event) => change(variant.id, "color", event.target.value)} className="min-h-11 border border-border-token px-3 text-sm" />
            <input aria-label="Stock" type="number" min="0" step="1" value={draft.stock} onChange={(event) => change(variant.id, "stock", event.target.value)} className="min-h-11 border border-border-token px-3 text-sm" />
            <input aria-label="Variant price" type="number" min="0" step="0.01" value={draft.price} onChange={(event) => change(variant.id, "price", event.target.value)} className="min-h-11 border border-border-token px-3 text-sm" />
            <input aria-label="SKU" maxLength={50} placeholder="SKU (optional)" value={draft.sku} onChange={(event) => change(variant.id, "sku", event.target.value)} className="min-h-11 border border-border-token px-3 text-sm" />
          </div>
          {rowErrors[variant.id] ? <p role="alert" className="mt-3 text-sm text-red-900">{rowErrors[variant.id]}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button type="button" disabled={isPending} onClick={() => saveVariant(variant)} className="text-xs font-semibold uppercase tracking-wider text-brand-forest underline underline-offset-4">Save variant</button>
            {confirmVariant === variant.id ? <span className="flex items-center gap-3 text-sm" role="group" aria-label={`Confirm deletion of ${variant.color} ${variant.size} variant`}><span>Delete this variant?</span><button type="button" disabled={isPending} onClick={() => removeVariant(variant.id)} className="font-semibold text-red-900 underline">Confirm delete</button><button type="button" onClick={() => setConfirmVariant(null)} className="underline">Keep</button></span> : <button type="button" aria-expanded={confirmVariant === variant.id} onClick={() => setConfirmVariant(variant.id)} className="text-xs font-semibold uppercase tracking-wider text-red-900 underline underline-offset-4">Delete variant</button>}
          </div>
        </div>;
      })}</div> : <p className="mt-5 text-sm text-foreground-muted">No variants have been added.</p>}

      <div className="mt-8 border border-border-token bg-background-secondary p-4 sm:p-5">
        <h3 className="font-serif text-xl text-foreground-primary">Add a variant</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          <input aria-label="New variant size" placeholder="Size" maxLength={30} value={newVariant.size} onChange={(event) => setNewVariant({ ...newVariant, size: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
          <input aria-label="New variant color" placeholder="Color" maxLength={30} value={newVariant.color} onChange={(event) => setNewVariant({ ...newVariant, color: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
          <input aria-label="New variant stock" type="number" min="0" step="1" value={newVariant.stock} onChange={(event) => setNewVariant({ ...newVariant, stock: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
          <input aria-label="New variant price" type="number" min="0" step="0.01" value={newVariant.price} onChange={(event) => setNewVariant({ ...newVariant, price: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
          <input aria-label="New variant SKU" placeholder="SKU (optional)" maxLength={50} value={newVariant.sku} onChange={(event) => setNewVariant({ ...newVariant, sku: event.target.value })} className="min-h-11 border border-border-token bg-background-primary px-3 text-sm" />
        </div>
        <button type="button" disabled={isPending} onClick={addNewVariant} className="mt-4 min-h-11 bg-brand-forest px-5 text-xs font-semibold uppercase tracking-[0.15em] text-background-primary">Add variant</button>
      </div>

      {error ? <p role="alert" className="mt-5 border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
      <div className="mt-12 border-t border-border-token pt-7">
        <h2 className="font-serif text-2xl text-foreground-primary">Delete product</h2>
        <p className="mt-2 text-sm text-foreground-muted">Hiding this product is usually the right choice. Products with order history cannot be deleted.</p>
        {confirmProduct ? <div id="product-deletion-confirmation" className="mt-4 flex flex-wrap items-center gap-4 text-sm" role="group" aria-label="Confirm product deletion"><span>Delete “{product.name}” and all its variants?</span><button type="button" disabled={isPending} onClick={removeProduct} className="font-semibold text-red-900 underline">Confirm delete</button><button type="button" onClick={() => setConfirmProduct(false)} className="underline">Keep product</button></div> : <button type="button" aria-expanded={confirmProduct} onClick={() => setConfirmProduct(true)} className="mt-4 text-xs font-semibold uppercase tracking-wider text-red-900 underline underline-offset-4">Delete product</button>}
      </div>
    </section>
  );
}
