import { cn } from "@/src/lib/utils";
import React from "react";

type ParagraphProps = {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
};

export default function Paragraph({
  children,
  className,
  as: Tag = "p",
}: ParagraphProps) {
  return (
    <Tag
      className={cn(
        "text-sm xl:text-base text-secondary-foreground leading-relaxed",
        className
      )}
    >
      {children}
    </Tag>
  );
}
