import CatalogPage from "@/components/shop/CatalogPage";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/site-url";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop the Collection",
  description: "Explore the Aurelia collection of considered apparel and everyday essentials.",
  alternates: { canonical: getCanonicalUrl("/shop") },
};

type ShopPageProps = {
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export default function ShopPage({ searchParams }: ShopPageProps) {
  return <CatalogPage searchParams={searchParams} />;
}
