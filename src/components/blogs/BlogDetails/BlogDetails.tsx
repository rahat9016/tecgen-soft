import { baseURL } from "@/src/config/envConfig";
import SocialMedia from "../../shared/SocialMedia/SocialMedia";
import BlogContent from "./BlogContent";

import type { Metadata } from "next";
import BookAppointmentSection from "../../shared/BookAppointmentSection";
import HeroSection from "../../shared/HeroSection/HeroSection";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const res = await fetch(`${baseURL}/api/blogs/${params.id}`, {
    cache: "no-store",
  });

  const blog = await res.json();

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${params.id}`;

  return {
    title: blog.title,
    description: blog.description,

    openGraph: {
      title: blog.title,
      description: blog.description,
      url,
      siteName: "Happy Hospital & diagnostic center",
      images: [
        {
          url: blog.image,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.shortDescription,
      images: [blog.image],
    },
  };
}

export default function BlogDetailsPage() {
  return (
    <div>
      <HeroSection
        image="/blogs/blogImage.jpg"
        title="Blog Details"
        description="Read the full article and discover practical healthcare guidance."
      />
      <BlogContent />
      <SocialMedia />
      <BookAppointmentSection />
    </div>
  );
}
