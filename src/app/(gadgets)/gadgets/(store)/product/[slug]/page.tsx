import type { Metadata } from "next";
import { getGadget } from "@/src/data/gadgets";
import ProductDetails from "@/src/components/gadgets/ProductDetails";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getGadget(slug);
  return { title: item ? `${item.name} Price in Bangladesh | gadgethub` : "Product | gadgethub" };
}

// Rendered client-side from the shared store so products added in the admin panel work too.
export default async function GadgetProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetails slug={slug} />;
}
