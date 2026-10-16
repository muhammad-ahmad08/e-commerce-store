import { describe, expect, it } from "vitest";
import {
  addCartItem,
  getCartTotals,
  isCartItem,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart/cart-logic";

const item = (variantId: string, overrides: Partial<CartItem> = {}): CartItem => ({
  variantId,
  productId: "product-1",
  productSlug: "linen-shirt",
  productName: "Linen Shirt",
  size: "M",
  color: "Natural",
  unitPrice: 1250,
  quantity: 1,
  stockAtTimeAdded: 5,
  ...overrides,
});

describe("cart logic", () => {
  it("accepts valid persisted items with absent or nullable legacy imagePath", () => {
    expect(isCartItem(item("variant-1"))).toBe(true);
    expect(isCartItem(item("variant-1", { imagePath: null }))).toBe(true);
    expect(isCartItem(item("variant-1", { imagePath: "products/picture.webp" }))).toBe(true);
  });

  it.each([
    null,
    [],
    { ...item("variant-1"), imagePath: 123 },
    { ...item("variant-1"), unitPrice: Number.NaN },
    { ...item("variant-1"), quantity: 0 },
    { ...item("variant-1"), quantity: 1.5 },
    { ...item("variant-1"), stockAtTimeAdded: 0 },
  ])("rejects invalid persisted cart item %j", (value) => {
    expect(isCartItem(value)).toBe(false);
  });

  it("calculates total quantity and subtotal", () => {
    expect(getCartTotals([item("a", { quantity: 2 }), item("b", { unitPrice: 500, quantity: 3 })]))
      .toEqual({ totalItems: 5, totalPrice: 4000 });
  });

  it("merges the same variant up to stock and keeps other variants separate", () => {
    const first = item("variant-1", { quantity: 3 });
    const merged = addCartItem([first], item("variant-1", { quantity: 4 }));
    expect(merged).toEqual([{ ...first, quantity: 5 }]);
    expect(addCartItem(merged, item("variant-2"))).toHaveLength(2);
  });

  it("caps new items and quantity updates at stock, ignores quantities below one, and floors fractions", () => {
    expect(addCartItem([], item("variant-1", { quantity: 8 }))[0]?.quantity).toBe(5);
    const current = item("variant-1", { quantity: 2 });
    expect(updateCartQuantity([current], "variant-1", 99)[0]?.quantity).toBe(5);
    expect(updateCartQuantity([current], "variant-1", 2.8)[0]?.quantity).toBe(2);
    expect(updateCartQuantity([current], "variant-1", 0)).toEqual([current]);
  });

  it("removes only the requested variant", () => {
    const first = item("variant-1");
    const second = item("variant-2");
    expect(removeCartItem([first, second], "variant-1")).toEqual([second]);
  });
});
