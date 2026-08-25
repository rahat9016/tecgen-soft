"use client";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IBlog } from "../types";

import { useGet } from "@/src/hooks/useGet";
import { formatDate } from "@/src/utils/formatDate";
import { useParams } from "next/navigation";
import DynamicBreadcrumb from "../../shared/DynamicBreadcrumb";
import NotFoundData from "../../shared/NotFoundData";
import BlogContentSkeleton from "./BlogContentSkeleton";
import BlogShare from "./BlogShare";

export default function BlogContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGet<IBlog>(`/blog/${id}`, ["blog", id]);
  const blog = data?.data as IBlog | undefined;

  const shareUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
  }/blog/${id}`;

  return isLoading ? (
    <BlogContentSkeleton />
  ) : blog ? (
    <div className="mt-6 container">
      <div className="mb-4">
        <DynamicBreadcrumb />
      </div>
      <div className="flex items-center justify-between gap-1">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1 lg:gap-2 text-sm text-muted-foreground hover:text-primary border h-11 px-1 lg:px-6 rounded-md"
        >
          <ArrowLeft size={16} />
          Back to all Blogs
        </Link>
        <div>{blog && <BlogShare title={blog.title} url={shareUrl} />}</div>
      </div>

      <div className="flex justify-between items-start gap-4 mt-6 lg:mt-10">
        <div>
          <h1 className="text-secondary text-lg xl:text-2xl font-bold lg:mb-2">
            {blog.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            <span className="font-semibold">Published</span>:{" "}
            {formatDate(blog.createdAt)}
          </p>
        </div>
      </div>

      <div className="relative w-full h-56 lg:h-105 xl:h-120 rounded-lg overflow-hidden mt-5 lg:mt-10 mb-3 lg:mb-6">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="prose prose-neutral max-w-none mb-8 lg:mb-16 xl:mb-25">
        <div dangerouslySetInnerHTML={{ __html: blog.description }} />
      </div>
    </div>
  ) : (
    <NotFoundData />
  );
}
