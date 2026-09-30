import CatalogPage from "@/components/shop/CatalogPage";

export const revalidate = 60;

type ShopPageProps = {
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export default function ShopPage({ searchParams }: ShopPageProps) {
  return <CatalogPage searchParams={searchParams} />;
}
