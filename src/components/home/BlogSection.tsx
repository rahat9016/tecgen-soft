"use client";
import { useGet } from "@/src/hooks/useGet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BlogCard from "../blogs/Blogs/BlogCard";
import BlogCardSkeleton from "../blogs/Blogs/BlogCardSkeleton";
import { IBlog } from "../blogs/types";
import NotFoundData from "../shared/NotFoundData";
import Text from "../shared/Text";
import { Button } from "../ui/button";

export default function BlogSection() {
  const router = useRouter();
  const { data, isLoading } = useGet<IBlog[]>("/blog", ["blogs"], {
    ...{
      page: 1,
      limit: 6,
      status: "ACTIVE",
    },
  });

  const blogData = data?.data;

  return (
    <div className="my-10 lg:my-16 xl:my-25">
      <div className="container">
        <Text className="mb-10">Blogs</Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 pb-10 ">
          {/* 🔄 Loading State */}
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}

          {/* ✅ Data Loaded */}
          {!isLoading &&
            blogData &&
            blogData.length > 0 &&
            blogData.map((blog) => <BlogCard key={blog.id} {...blog} />)}

          {/* ❌ Empty State */}
          {!isLoading && (!blogData || blogData.length === 0) && (
            <NotFoundData />
          )}
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => router.push(`/blogs`)}
            className="px-6 py-4 h-11 cursor-pointer"
          >
            Read More Blogs{" "}
            <Image
              src="/icons/right_arrow_white.svg"
              alt="Arrow right"
              width={20}
              height={20}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
