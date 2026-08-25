"use client";

import { useState } from "react";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid h-[300px] grid-cols-4 grid-rows-3 gap-2 overflow-hidden rounded-xl sm:h-[420px] sm:grid-rows-2">
      <button
        type="button"
        onClick={() => setActive(0)}
        className="col-span-4 row-span-2 sm:col-span-2 sm:row-span-2"
      >
        <img
          src={images[active]}
          alt={name}
          className="size-full object-cover"
        />
      </button>
      {images.slice(1, 5).map((img, i) => (
        <button
          key={img}
          type="button"
          onClick={() => setActive(i + 1)}
          className="col-span-1 row-span-1"
        >
          <img src={img} alt={`${name} ${i + 2}`} className="size-full object-cover" />
        </button>
      ))}
    </div>
  );
}
