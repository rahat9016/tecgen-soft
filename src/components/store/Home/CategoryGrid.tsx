import Link from "next/link";
import { categories } from "@/src/data/categories";
import { categoryIllustrations } from "./categoryIllustrationMap";

export default function CategoryGrid() {
  return (
    <section id="categories" className="container py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Categories</h2>
        <Link href="/ecommerce#products" className="text-sm font-medium text-emerald-800 hover:underline">
          View All →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-10">
        {categories.map((cat) => {
          const Illustration = categoryIllustrations[cat.icon];
          return (
            <Link
              key={cat.name}
              href="/ecommerce#products"
              className="group flex flex-col items-center gap-2 text-center"
            >
              <span className="flex size-24 items-center justify-center rounded-full border border-neutral-100 bg-neutral-50 shadow-sm transition-all group-hover:shadow-md group-hover:ring-2 group-hover:ring-emerald-700 group-hover:-translate-y-0.5">
                <Illustration className="size-20" />
              </span>
              <span className="text-xs font-medium text-neutral-700">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
