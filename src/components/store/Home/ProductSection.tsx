import Link from "next/link";
import { products } from "@/src/data/products";
import ProductCard from "@/src/components/store/ProductCard";

export default function ProductSection() {
  return (
    <section id="products" className="container py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">সর্বাধিক বিক্রিত পণ্য</h2>
        <Link href="/#products" className="text-sm font-medium text-emerald-800 hover:underline">
          সবগুলো দেখুন →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
