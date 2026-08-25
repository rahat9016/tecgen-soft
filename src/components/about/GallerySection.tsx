"use client";
import { useGet } from "@/src/hooks/useGet";
import Image from "next/image";
import NotFoundData from "../shared/NotFoundData";
import Text from "../shared/Text";
import { IGalleryImage } from "./types";

export default function GallerySection() {
  const { data, isLoading } = useGet<IGalleryImage[]>("/image-gallery/list", [
    "image-gallery",
  ]);

  const galleryData = data?.data;

  return (
    <div className="overflow-hidden pt-10 lg:pt-16 xl:pt-25">
      <div className="container ">
        <Text className=" pb-5 lg:pb-10">Image Gallery</Text>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        )}

        {!isLoading && galleryData && galleryData.length > 0 && (
          <div className="relative overflow-hidden">
            <div className="flex items-center gap-6 w-max animate-slide-left">
              {[...galleryData, ...galleryData].map((img, index) => {
                const baseHeight = 450;
                const height = index % 2 !== 0 ? baseHeight - 80 : baseHeight;
                return (
                  <div key={index} className="w-80 ">
                    <Image
                      src={img.imageUrl}
                      alt=""
                      width={400}
                      height={height}
                      className={`rounded-lg object-cover ${!height ? "h-56 lg-[360px] xl:h-112.5" : ""}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isLoading && galleryData?.length === 0 && <NotFoundData />}
      </div>
    </div>
  );
}
