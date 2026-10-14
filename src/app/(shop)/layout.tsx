import type { ReactNode } from "react";
import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      {children}
      <Footer />
    </>
  );
}
