import Link from "next/link";

const footerColumns = [
  {
    title: "Shop",
    links: ["New Arrivals", "All Clothing"],
  },
  {
    title: "Help",
    links: ["Contact Us", "Shipping & Returns"],
  },
  {
    title: "Company",
    links: ["Our Story", "Careers"],
  },
];

const interactiveClasses =
  "transition-colors duration-250 ease-editorial hover:text-background-primary";

export default function Footer() {
  return (
    <footer className="bg-foreground-primary text-background-primary">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-16 md:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className={`font-serif text-3xl tracking-wide ${interactiveClasses}`}
            >
              Aurelia
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-background-secondary">
              Thoughtful pieces, made to be worn and treasured.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">
                {column.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((label) => (
                  <li key={label}>
                    <Link
                      href="#"
                      className={`text-sm text-background-secondary ${interactiveClasses}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-background-primary/15 pt-6 text-xs text-background-secondary">
          © {new Date().getFullYear()} Aurelia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
