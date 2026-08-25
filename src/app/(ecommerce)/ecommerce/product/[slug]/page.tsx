import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/src/data/products";
import Gallery from "@/src/components/store/ProductDetails/Gallery";
import ProductInfo from "@/src/components/store/ProductDetails/ProductInfo";
import RelatedProducts from "@/src/components/store/ProductDetails/RelatedProducts";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const related = getRelatedProducts(product);

  return (
    <div>
      <div className="container flex items-center gap-1.5 py-4 text-xs text-neutral-500">
        <Link href="/ecommerce" className="hover:text-emerald-800">
          হোম
        </Link>
        <ChevronRight className="size-3" />
        <span>{product.category}</span>
        <ChevronRight className="size-3" />
        <span className="text-neutral-800">{product.name}</span>
      </div>

      <div className="container grid grid-cols-1 gap-10 pb-12 lg:grid-cols-2">
        <Gallery product={product} />
        <ProductInfo product={product} />
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
