export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  imagePath?: string | null;
  productName: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  stockAtTimeAdded: number;
};

export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.variantId === "string" &&
    typeof item.productId === "string" &&
    typeof item.productSlug === "string" &&
    (item.imagePath === undefined || item.imagePath === null || typeof item.imagePath === "string") &&
    typeof item.productName === "string" &&
    typeof item.size === "string" &&
    typeof item.color === "string" &&
    typeof item.unitPrice === "number" &&
    Number.isFinite(item.unitPrice) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1 &&
    typeof item.stockAtTimeAdded === "number" &&
    Number.isInteger(item.stockAtTimeAdded) &&
    item.stockAtTimeAdded >= 1
  );
}

export function addCartItem(items: CartItem[], item: CartItem): CartItem[] {
  if (item.stockAtTimeAdded < 1 || item.quantity < 1) return items;

  const existingItem = items.find((currentItem) => currentItem.variantId === item.variantId);
  if (existingItem) {
    return items.map((currentItem) =>
      currentItem.variantId === item.variantId
        ? {
            ...currentItem,
            quantity: Math.min(currentItem.stockAtTimeAdded, currentItem.quantity + item.quantity),
          }
        : currentItem,
    );
  }

  return [...items, { ...item, quantity: Math.min(item.quantity, item.stockAtTimeAdded) }];
}

export function removeCartItem(items: CartItem[], variantId: string): CartItem[] {
  return items.filter((item) => item.variantId !== variantId);
}

export function updateCartQuantity(items: CartItem[], variantId: string, quantity: number): CartItem[] {
  if (quantity < 1) return items;

  return items.map((item) =>
    item.variantId === variantId
      ? { ...item, quantity: Math.min(item.stockAtTimeAdded, Math.floor(quantity)) }
      : item,
  );
}

export function getCartTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
  };
}
