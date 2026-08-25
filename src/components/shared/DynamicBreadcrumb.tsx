"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const uuidLikeSegment =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !uuidLikeSegment.test(segment));

  const isAdminRoute = segments[0] === "admin";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {!isAdminRoute && (
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          const showSeparator = !isAdminRoute || index !== 0;
          const isAdminSegment = segment === "admin";

          const label = decodeURIComponent(segment);
          const className = `capitalize ${
            isAdminSegment ? "text-primary font-semibold" : ""
          }`;

          return (
            <BreadcrumbItem key={href}>
              {showSeparator && <BreadcrumbSeparator />}

              {isLast ? (
                <BreadcrumbPage className={className}>
                  {label?.replace("-", " ")}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={href} className={className}>
                    {label?.replace("-", " ")}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
