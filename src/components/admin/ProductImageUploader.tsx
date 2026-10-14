"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { removeProductImage, setProductImage } from "@/app/(admin)/admin/products/actions";
import ProductImage from "@/components/shop/ProductImage";
import { createClient } from "@/lib/supabase/client";

type Props = { productId: string; slug: string; name: string; imagePath: string | null };
type CompressedImage = { blob: Blob; previewUrl: string; size: number; extension: "webp" | "jpg" };
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("This image could not be read.")); };
    image.src = url;
  });
}

function encodeCanvas(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The image could not be compressed.")), type, quality);
  });
}

async function compressImage(file: File): Promise<CompressedImage> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  const image = await loadImage(file);
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this image.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let blob = await encodeCanvas(canvas, "image/webp", 0.85);
  let extension: CompressedImage["extension"] = "webp";
  if (blob.type !== "image/webp") {
    blob = await encodeCanvas(canvas, "image/jpeg", 0.85);
    extension = "jpg";
  }
  if (blob.size > MAX_IMAGE_SIZE) throw new Error("The compressed image is still over 2 MB. Choose a smaller image.");
  return { blob, previewUrl: URL.createObjectURL(blob), size: blob.size, extension };
}

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProductImageUploader({ productId, slug, name, imagePath }: Props) {
  const router = useRouter();
  const [compressed, setCompressed] = useState<CompressedImage | null>(null);
  const [working, setWorking] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (compressed) URL.revokeObjectURL(compressed.previewUrl); }, [compressed]);

  async function chooseFile(file?: File) {
    setError("");
    if (!file) return;
    setCompressed((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    try {
      setCompressed(await compressImage(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The image could not be prepared.");
    }
  }

  async function uploadAndSave() {
    if (!compressed) return;
    setWorking(true);
    setError("");
    let uploadedPath: string | null = null;
    try {
      const extension = compressed.extension;
      const path = `products/${productId}/${crypto.randomUUID()}.${extension}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, compressed.blob, {
        contentType: extension === "webp" ? "image/webp" : "image/jpeg",
        upsert: false,
      });
      if (uploadError) {
        if (uploadError.message.toLowerCase().includes("row-level security") || uploadError.message.toLowerCase().includes("permission")) {
          throw new Error("Upload permission was denied. Confirm supabase/storage-images.sql has been applied; no privileged upload fallback is available.");
        }
        throw new Error(uploadError.message || "The image upload failed.");
      }
      uploadedPath = path;
      const result = await setProductImage(productId, path);
      if (result.error) throw new Error(result.error);
      uploadedPath = null;
      setCompressed(null);
      router.refresh();
    } catch (cause) {
      if (uploadedPath) {
        try {
          const { error: cleanupError } = await createClient().storage.from("product-images").remove([uploadedPath]);
          if (cleanupError) console.error("Failed to clean up an unsaved product image:", cleanupError.message);
        } catch (cleanupError) {
          console.error("Failed to clean up an unsaved product image:", cleanupError);
        }
      }
      setError(cause instanceof Error ? cause.message : "The image could not be saved.");
    } finally {
      setWorking(false);
    }
  }

  async function removeImage() {
    setWorking(true);
    setError("");
    try {
      const result = await removeProductImage(productId);
      if (result.error) throw new Error(result.error);
      setConfirmRemove(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The image could not be removed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="mt-8 border-t border-border-token pt-7" aria-labelledby="product-image-heading">
      <h2 id="product-image-heading" className="font-serif text-2xl text-foreground-primary">Product photo</h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-[12rem_1fr]">
        <div className="relative aspect-square overflow-hidden bg-background-secondary">
          {compressed ? <Image src={compressed.previewUrl} alt={`Preview of ${name}`} fill unoptimized className="object-cover" /> :
            <ProductImage slug={slug} imagePath={imagePath} name={name} sizes="192px" />}
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground-primary" htmlFor="product-image-file">Choose JPEG, PNG, or WebP</label>
          <input id="product-image-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={working} onChange={(event) => void chooseFile(event.target.files?.[0])} className="block w-full text-sm text-foreground-muted file:mr-4 file:min-h-11 file:border-0 file:bg-background-secondary file:px-4 file:text-xs file:font-semibold file:uppercase file:tracking-wider" />
          {compressed ? <p className="text-sm text-foreground-muted">Compressed preview · {formatSize(compressed.size)}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={working || !compressed} onClick={() => void uploadAndSave()} className="min-h-11 bg-brand-terracotta px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50">{working ? "Working…" : "Upload and save"}</button>
            {imagePath ? <button type="button" aria-expanded={confirmRemove} aria-controls={confirmRemove ? "image-removal-confirmation" : undefined} disabled={working} onClick={() => { setError(""); setConfirmRemove(true); }} className="min-h-11 border border-border-token px-5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground-primary disabled:opacity-50">Remove image</button> : null}
          </div>
          {confirmRemove ? <div id="image-removal-confirmation" className="border border-border-token bg-background-secondary p-4" role="group" aria-label="Confirm image removal">
            <p className="text-sm text-foreground-primary">Remove the uploaded photo? The slug-based photo will be used if available.</p>
            <div className="mt-3 flex gap-3">
              <button type="button" disabled={working} onClick={() => void removeImage()} className="min-h-10 bg-brand-terracotta px-4 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">Yes, remove</button>
              <button type="button" disabled={working} onClick={() => setConfirmRemove(false)} className="min-h-10 border border-border-token px-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-50">Keep image</button>
            </div>
          </div> : null}
          {error ? <p role="alert" className="text-sm text-red-900">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
