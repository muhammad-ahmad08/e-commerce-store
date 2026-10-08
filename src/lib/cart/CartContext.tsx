"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  stockAtTimeAdded: number;
};

type CartContextValue = {
  items: CartItem[];
  isReady: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CART_STORAGE_KEY = "aurelia-cart";
const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.variantId === "string" &&
    typeof item.productId === "string" &&
    typeof item.productSlug === "string" &&
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsed: unknown = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            setItems(parsed.filter(isCartItem));
          }
        }
      } catch {
        // Storage may be unavailable or contain malformed data; keep an empty cart.
      } finally {
        setHasLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart remains usable in memory when persistence is unavailable.
    }
  }, [hasLoaded, items]);

  const addItem = useCallback((item: CartItem) => {
    if (item.stockAtTimeAdded < 1 || item.quantity < 1) return;

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) => currentItem.variantId === item.variantId,
      );

      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.variantId === item.variantId
            ? {
                ...currentItem,
                quantity: Math.min(
                  currentItem.stockAtTimeAdded,
                  currentItem.quantity + item.quantity,
                ),
              }
            : currentItem,
        );
      }

      return [
        ...currentItems,
        { ...item, quantity: Math.min(item.quantity, item.stockAtTimeAdded) },
      ];
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.variantId !== variantId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity < 1) return;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.min(item.stockAtTimeAdded, Math.floor(quantity)) }
          : item,
      ),
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isReady: hasLoaded,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0,
      ),
    }),
    [items, hasLoaded, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
