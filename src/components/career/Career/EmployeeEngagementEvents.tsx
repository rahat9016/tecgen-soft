"use client";

import { useGet } from "@/src/hooks/useGet";
import BlogCard from "../../blogs/Blogs/BlogCard";
import BlogCardSkeleton from "../../blogs/Blogs/BlogCardSkeleton";
import { IBlog } from "../../blogs/types";
import NotFoundData from "../../shared/NotFoundData";
import Text from "../../shared/Text";

export default function EmployeeEngagementEvents() {
  const { data, isLoading } = useGet<IBlog[]>("/blog", ["career-events-blogs"]);
  const events = data?.data || [];

  return (
    <section className="pb-10 lg:pb-25">
      <Text as="h2" className="text-3xl mb-6 lg:mb-10 text-secondary-dark">
        Employee Engagement & Events
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => <BlogCardSkeleton key={i} />)}

        {!isLoading &&
          events.length > 0 &&
          events
            .slice(0, 8)
            .map((blog) => <BlogCard key={blog.id} {...blog} />)}

        {!isLoading && events.length === 0 && <NotFoundData />}
      </div>
    </section>
  );
}
