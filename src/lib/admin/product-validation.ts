export type ProductValidationInput = {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  basePrice: number;
  isActive: boolean;
};

export type VariantValidationInput = {
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validMoney(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && Math.abs(Math.round(value * 100) - value * 100) < 1e-8;
}

export function validateProduct(input: ProductValidationInput): string | null {
  if (!input || typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 120) return "Enter a product name up to 120 characters.";
  if (typeof input.slug !== "string" || input.slug.length > 80 || !SLUG_PATTERN.test(input.slug)) return "Enter a valid URL name using lowercase letters, numbers, and single hyphens.";
  if (typeof input.categoryId !== "string" || !UUID_PATTERN.test(input.categoryId)) return "Choose a valid category.";
  if (typeof input.description !== "string" || input.description.length > 5000) return "Description is too long.";
  if (!validMoney(input.basePrice)) return "Enter a valid non-negative price with at most two decimal places.";
  if (typeof input.isActive !== "boolean") return "Choose a valid visibility setting.";
  return null;
}

export function validateVariant(input: VariantValidationInput): string | null {
  if (!input || typeof input.size !== "string" || !input.size.trim() || input.size.trim().length > 30) return "Size is required and must be 30 characters or fewer.";
  if (typeof input.color !== "string" || !input.color.trim() || input.color.trim().length > 30) return "Color is required and must be 30 characters or fewer.";
  if (!Number.isInteger(input.stock) || input.stock < 0) return "Stock must be a whole number of 0 or more.";
  if (!validMoney(input.price)) return "Enter a valid non-negative variant price with at most two decimal places.";
  if (typeof input.sku !== "string" || input.sku.length > 50) return "SKU must be 50 characters or fewer.";
  return null;
}

export function normalizeSku(sku: string): string | null {
  return sku.trim() || null;
}
