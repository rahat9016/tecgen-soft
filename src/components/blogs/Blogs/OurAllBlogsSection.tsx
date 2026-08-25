"use client";
import { useGet } from "@/src/hooks/useGet";
import NotFoundData from "../../shared/NotFoundData";
import Text from "../../shared/Text";
import { IBlog } from "../types";
import BlogCard from "./BlogCard";
import BlogCardSkeleton from "./BlogCardSkeleton";

export default function OurAllBlogsSection() {
  const { data, isLoading } = useGet<IBlog[]>("/blog", ["blogs"], {
    status: "ACTIVE",
  });
  const blogData = data?.data;

  return (
    <div>
      <div className="container">
        <Text className="text-[#565656] py-5 lg:my-10">Our All Blogs</Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 pb-10 lg:mb-25">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          {!isLoading &&
            blogData &&
            blogData.length > 0 &&
            blogData.map((blog) => <BlogCard key={blog.id} {...blog} />)}
          {!isLoading && (!blogData || blogData.length === 0) && (
            <NotFoundData />
          )}
        </div>
      </div>
    </div>
  );
}
