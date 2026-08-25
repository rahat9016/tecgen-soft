import { cn } from "@/src/lib/utils";

const SpecialtyHtml = ({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) => {
  if (!html) return null;

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none prose-p:text-secondary-foreground prose-li:text-secondary-foreground prose-span:text-secondary-foreground prose-ul:text-secondary-foreground prose-ol:text-secondary-foreground prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-secondary-foreground prose-ul:pl-5 prose-ol:pl-5",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
export default SpecialtyHtml;
