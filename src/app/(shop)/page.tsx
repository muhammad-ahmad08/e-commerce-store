import Link from "next/link";
import Image from "next/image";
import CategoryCard from "@/components/shop/CategoryCard";
import ProductCard from "@/components/shop/ProductCard";
import { getCategories, getFeaturedProducts } from "@/lib/supabase/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <main className="flex-1 bg-background-primary">
      <section className="overflow-hidden bg-background-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 md:grid-cols-2 md:px-16 md:py-28">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-terracotta sm:text-sm">
              Made for the moments that matter
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.05] tracking-tight text-foreground-primary sm:text-6xl lg:text-7xl">
              A quieter kind of statement.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-foreground-muted sm:text-lg sm:leading-8">
              Discover considered essentials, shaped by heritage and made to
              find their place in your everyday.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex min-h-12 items-center justify-center bg-brand-terracotta px-7 text-xs font-semibold uppercase tracking-[0.15em] text-background-primary transition-colors duration-250 ease-editorial hover:bg-brand-forest"
            >
              Explore the collection
            </Link>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden bg-background-primary">
            <Image
              src="/images/hero/hero-banner.jpg"
              alt="A model wearing a considered everyday outfit in a warm, sunlit interior"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="categories-heading"
        className="mx-auto max-w-7xl px-5 py-16 md:px-16 md:py-24"
      >
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
              Find your favorites
            </p>
            <h2
              id="categories-heading"
              className="mt-2 font-serif text-3xl text-foreground-primary sm:text-4xl"
            >
              Shop by category
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-foreground-muted">
            Thoughtful pieces for every day, and every way you make it your own.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <p className="border border-border-token px-5 py-8 text-center text-sm text-foreground-muted">
            Our collections are being prepared. Please check back soon.
          </p>
        )}
      </section>

      <section
        aria-labelledby="featured-heading"
        className="bg-background-secondary"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-16 md:py-24">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
                Chosen for you
              </p>
              <h2
                id="featured-heading"
                className="mt-2 font-serif text-3xl text-foreground-primary sm:text-4xl"
              >
                The considered edit
              </h2>
            </div>
            <Link
              href="/shop"
              className="w-fit text-xs font-semibold uppercase tracking-[0.15em] text-foreground-primary underline decoration-brand-terracotta underline-offset-4 transition-colors duration-250 ease-editorial hover:text-brand-terracotta"
            >
              View all pieces
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="border border-border-token px-5 py-8 text-center text-sm text-foreground-muted">
              New pieces are on their way. Please check back soon.
            </p>
          )}
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-brand-forest text-background-primary">
        <Image
          src="/images/story/story-section.jpg"
          alt="A craftsperson weaving fabric on a traditional loom"
          fill
          sizes="100vw"
          className="z-0 object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-brand-forest/75" />
        <div className="relative z-20 mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:py-20 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-16 md:px-16 md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background-secondary">
              Our point of view
            </p>
            <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
              Made to stay with you.
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-sm leading-7 text-background-secondary sm:text-base sm:leading-8">
            <p>
              We believe getting dressed can be a small, meaningful ritual. A
              favorite texture, a familiar silhouette, a detail that feels
              distinctly yours — these are the things that make a piece worth
              keeping.
            </p>
            <p>
              Aurelia brings a thoughtful eye to everyday dressing, drawing on
              enduring craft and a modern sense of ease. Less, chosen well, and
              worn often.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
