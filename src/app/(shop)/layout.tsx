import type { ReactNode } from "react";
import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
