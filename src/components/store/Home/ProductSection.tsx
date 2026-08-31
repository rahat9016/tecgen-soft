import { products } from "@/src/data/products";
import ProductCarousel from "@/src/components/store/Home/ProductCarousel";

const bestSellers = products.filter(
  (p) => p.category !== "Women's Fashion" && p.category !== "Men's Fashion"
);
const womensFashion = products.filter((p) => p.category === "Women's Fashion");
const mensFashion = products.filter((p) => p.category === "Men's Fashion");

export default function ProductSection() {
  return (
    <section id="products" className="container py-10">
      <ProductCarousel title="Women's Fashion" items={womensFashion} />
      <ProductCarousel title="Men's Fashion" items={mensFashion} />
      <ProductCarousel title="Best Selling Products" items={bestSellers} />
    </section>
  );
}
