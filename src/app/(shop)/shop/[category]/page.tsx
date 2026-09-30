import CatalogPage from "@/components/shop/CatalogPage";

export const revalidate = 60;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  return <CatalogPage categorySlug={category} searchParams={searchParams} />;
}
