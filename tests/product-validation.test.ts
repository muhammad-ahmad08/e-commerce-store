import { describe, expect, it } from "vitest";
import {
  normalizeSku,
  validateProduct,
  validateVariant,
  type ProductValidationInput,
  type VariantValidationInput,
} from "@/lib/admin/product-validation";

const product = (overrides: Partial<ProductValidationInput> = {}): ProductValidationInput => ({
  name: "Linen Shirt",
  slug: "linen-shirt",
  categoryId: "123e4567-e89b-42d3-a456-426614174000",
  description: "A synthetic product fixture.",
  basePrice: 1250.5,
  isActive: true,
  ...overrides,
});

const variant = (overrides: Partial<VariantValidationInput> = {}): VariantValidationInput => ({
  size: "M",
  color: "Natural",
  stock: 4,
  price: 1250.5,
  sku: "LINEN-M-NAT",
  ...overrides,
});

describe("product and variant validation", () => {
  it("accepts valid product and variant values at their allowed boundaries", () => {
    expect(validateProduct(product({ name: ` ${"x".repeat(120)} `, slug: "a".repeat(80), description: "x".repeat(5000), basePrice: 0 }))).toBeNull();
    expect(validateVariant(variant({ size: "x".repeat(30), color: "x".repeat(30), stock: 0, price: 0, sku: "x".repeat(50) }))).toBeNull();
  });

  it.each([
    { name: " " },
    { name: "x".repeat(121) },
    { slug: "Upper-case" },
    { slug: "double--hyphen" },
    { slug: "x".repeat(81) },
    { description: "x".repeat(5001) },
    { basePrice: -0.01 },
    { basePrice: 1.001 },
  ])("rejects invalid product field %j", (overrides) => {
    expect(validateProduct(product(overrides))).not.toBeNull();
  });

  it.each([
    { size: " " },
    { size: "x".repeat(31) },
    { color: " " },
    { color: "x".repeat(31) },
    { stock: -1 },
    { stock: 1.5 },
    { price: -1 },
    { price: 1.001 },
    { sku: "x".repeat(51) },
  ])("rejects invalid variant field %j", (overrides) => {
    expect(validateVariant(variant(overrides))).not.toBeNull();
  });

  it("normalizes blank SKU to null and trims populated SKU", () => {
    expect(normalizeSku("   ")).toBeNull();
    expect(normalizeSku(" SKU-1 ")).toBe("SKU-1");
  });
});
