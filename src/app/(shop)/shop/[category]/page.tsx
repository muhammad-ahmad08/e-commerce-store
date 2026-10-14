import type { Metadata } from "next";
import CatalogPage from "@/components/shop/CatalogPage";
import { getCategories } from "@/lib/supabase/queries";
import { getCanonicalUrl } from "@/lib/site-url";
import { notFound } from "next/navigation";

export const revalidate = 60;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) notFound();

  return {
    title: `${category.name} Collection`,
    description: `Explore the ${category.name} collection from Aurelia.`,
    alternates: { canonical: getCanonicalUrl(`/shop/${slug}`) },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  return <CatalogPage categorySlug={category} searchParams={searchParams} />;
}
