import Link from "next/link";
import { categories } from "@/src/data/categories";

export default function CategoryGrid() {
  return (
    <section id="categories" className="container py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">ক্যাটেগরি সমূহ</h2>
        <Link href="/#products" className="text-sm font-medium text-emerald-800 hover:underline">
          সবগুলো দেখুন →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href="/#products"
            className="group flex flex-col items-center gap-2 text-center"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <cat.icon className="size-6" />
            </span>
            <span className="text-xs font-medium text-neutral-700">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
