import Image from "next/image";
import { IPurpose } from "../types";

interface IPurposeCard extends IPurpose {
  reverse?: boolean;
}
export default function PurposeCard({
  title,
  description,
  image,
  reverse = false,
}: IPurposeCard) {
  return (
    <div
      className={`bg-white rounded overflow-hidden justify-between shadow-sm flex flex-col border ${reverse ? "flex-col-reverse" : "flex-col"}`}
    >
      <Image
        width={499}
        height={320}
        src={image}
        alt={title}
        className="w-full h-[200px] lg:h-[280px] xl:h-[320px] object-cover"
      />

      <div className="p-5 lg:p-10">
        <h3 className="text-base lg:text-lg font-semibold text-secondary mb-2">
          {title}
        </h3>

        <p className="text-sm lg:text-base text-secondary-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
