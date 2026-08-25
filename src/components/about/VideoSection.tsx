"use client";
import { useGet } from "@/src/hooks/useGet";
import Image from "next/image";
import Link from "next/link";
import NotFoundData from "../shared/NotFoundData";
import Text from "../shared/Text";
import { IVideo } from "./types";

export default function VideoSection() {
  const { data, isLoading } = useGet<IVideo[]>("/video-media/list", [
    "video-media",
  ]);

  const videoData = data?.data;

  return (
    <div>
      <div className="container py-10 lg:py-16 xl:py-25">
        {videoData && (
          <Text className="mb-6 lg:mb-10 xl:text-[44px]">Video Gallery</Text>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-105 rounded-3xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && videoData && videoData.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {videoData.map((video, index) => (
              <Link
                key={`${video.title}-${index}`}
                href={video.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="relative w-full h-92.25 rounded-2xl border border-light-silver hover:border-primary overflow-hidden group">
                  <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                    style={{
                      background: `
      linear-gradient(#F1F1F100, #f1f1f179),
      url(${video.thumbnail || "/icons/media.svg"})
    `,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <Image
                    width={120}
                    height={120}
                    src="/icons/play.png"
                    alt="Video Thumbnail"
                    className="w-18 h-18 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:animate-ping
"
                  />
                  <Image
                    width={120}
                    height={120}
                    src="/icons/play.png"
                    alt="Video Thumbnail"
                    className="w-18 h-18 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
"
                  />
                  <div className="absolute bottom-0 left-0 right-0  p-4">
                    <h3 className="text-xl font-semibold text-secondary line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-secondary-foreground line-clamp-2 text-base font-normal">
                      {video.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && videoData && videoData.length === 0 && <NotFoundData />}
      </div>
    </div>
  );
}
