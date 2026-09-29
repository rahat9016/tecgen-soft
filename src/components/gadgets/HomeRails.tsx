"use client";

import { useMemo } from "react";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import ExchangeBanner from "./ExchangeBanner";
import ProductRail from "./ProductRail";

export default function HomeRails() {
  const { products: all } = useGadgetDB();

  const r = useMemo(() => {
    const products = all.filter((p) => p.active);
    const tag = (t: string) => products.filter((p) => p.tags?.includes(t as never));
    const cat = (...c: string[]) => products.filter((p) => c.includes(p.category));
    const brand = (b: string) => products.filter((p) => p.brand === b);
    return {
      preorder: products.filter((p) => p.preOrder),
      apple: tag("apple"),
      deals: tag("deal"),
      best: tag("best"),
      top: tag("top"),
      newest: products.filter((p) => p.isNew && !p.preOrder),
      gaming: cat("Gaming", "VR"),
      consoles: cat("Gaming").filter((p) => /console|switch/i.test(p.name)),
      vr: cat("VR"),
      input: products.filter((p) => ["Logitech", "Corsair", "Microsoft"].includes(p.brand)),
      audio: cat("Earbuds", "Headphones", "Speakers"),
      earbuds: cat("Earbuds"),
      headphones: cat("Headphones"),
      speakers: cat("Speakers", "Smart Home"),
      cameras: cat("Cameras", "Drones"),
      power: cat("Power", "Smart Watch", "E-Readers"),
      brands: ["Apple", "Samsung", "Sony", "DJI", "Amazon", "Xiaomi"].map((b) => ({ label: b, items: brand(b) })),
    };
  }, [all]);

  return (
    <>
      {r.preorder.length > 0 && (
        <ProductRail id="pre-order" title="Pre-order" highlight="Now" items={r.preorder} viewAll="/gadgets/pre-order" />
      )}
      <ProductRail title="Apple" highlight="Exclusive" items={r.apple} viewAll="/gadgets/shop?brand=Apple" />
      <ProductRail id="deals" title="Exclusive" highlight="Deals" items={r.deals} viewAll="/gadgets/shop?sort=discount" />

      <ExchangeBanner />

      <ProductRail
        title="Gaming"
        highlight="Zone"
        viewAll="/gadgets/shop?category=Gaming,VR"
        tabs={[
          { label: "All Gaming", items: [...new Set([...r.gaming, ...r.input])] },
          { label: "Consoles", items: r.consoles },
          { label: "VR Headsets", items: r.vr },
          { label: "Keyboard & Mouse", items: r.input },
        ]}
      />
      <ProductRail
        id="featured"
        title="Featured"
        highlight="Products"
        tabs={[
          { label: "Best Deals", items: r.best },
          { label: "Top Selling", items: r.top },
        ]}
      />
      <ProductRail title="New" highlight="Arrival" items={r.newest} />
      <ProductRail
        title="Audio"
        highlight="Collection"
        viewAll="/gadgets/shop?category=Earbuds,Headphones,Speakers"
        tabs={[
          { label: "All Audio", items: r.audio },
          { label: "Earbuds", items: r.earbuds },
          { label: "Headphones", items: r.headphones },
          { label: "Speakers", items: r.speakers },
        ]}
      />
      <ProductRail title="Cameras &" highlight="Drones" items={r.cameras} viewAll="/gadgets/shop?category=Cameras,Drones" />
      <ProductRail title="Power &" highlight="Wearables" items={r.power} />
      <ProductRail title="Top Brand" highlight="Products" tabs={r.brands} />
    </>
  );
}
