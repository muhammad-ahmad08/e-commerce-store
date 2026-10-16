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
import {
  addCartItem,
  getCartTotals,
  isCartItem,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart/cart-logic";
export type { CartItem } from "@/lib/cart/cart-logic";

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
    setItems((currentItems) => addCartItem(currentItems, item));
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((currentItems) => removeCartItem(currentItems, variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((currentItems) => updateCartQuantity(currentItems, variantId, quantity));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isReady: hasLoaded,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      ...getCartTotals(items),
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
