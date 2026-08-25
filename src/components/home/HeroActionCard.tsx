import Image from "next/image";
import Link from "next/link";
import { IHeroActionItem } from "./types";

interface HeroActionCardProps extends IHeroActionItem {
  index: number;
  total: number;
}

export default function HeroActionCard({
  title,
  subTitle,
  icon,
  index,
  total,
  target,
  link,
}: HeroActionCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const href = target ? link : "/contact-us";

  const content = (
    <div
      className={`
          flex items-center gap-4 p-4 lg:p-8 bg-white cursor-pointer
          transition-colors duration-300 ease-in-out
          group-hover:bg-primary
          rounded
          lg:rounded-none
          md:min-h-27
          ${isFirst ? "lg:rounded-l-[16px]" : ""}
          ${isLast ? "lg:rounded-r-[16px]" : ""}
          ${!isLast ? "lg:border-r lg:border-primary/10" : ""}
        `}
    >
      <div
        className="
            h-8 lg:h-13.5 w-8 lg:w-13.5 rounded-full
            bg-primary/20 flex items-center justify-center
            text-primary text-xl
            transition-colors duration-300 ease-in-out
            group-hover:bg-white
             shrink-0
          "
      >
        <Image
          src={icon}
          alt={title}
          width={52}
          height={62}
          className="h-5 w-auto lg:h-7 lg:w-auto"
        />
      </div>

      <div className="text-left">
        <h3
          className="
            text-sm
            lg:text-base
              font-semibold text-secondary-dark
              transition-colors duration-300 ease-in-out
              group-hover:text-white
            "
        >
          {title}
        </h3>

        <p
          className="
            text-xs
              lg:text-sm text-muted-foreground
              transition-colors duration-300 ease-in-out
              group-hover:text-[#E8E8E8]
            "
        >
          {subTitle}
        </p>
      </div>
    </div>
  );

  return (
    <div className="group">
      {target ? (
        <a href={href} target={target} rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <Link href={link}>{content}</Link>
      )}
    </div>
  );
}
