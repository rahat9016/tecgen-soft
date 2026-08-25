import Image from "next/image";
import Text from "../shared/Text";
import { IAboutItem } from "./types";
import Paragraph from "../shared/Paragraph";

interface AboutCardProps extends IAboutItem {
  index: number;
}
export function AboutCard({
  icon,
  title,
  text,
  active,
  index,
}: AboutCardProps) {
  const isSecond = index === 1;
  const isThird = index === 2;
  return (
    <div
      className={`
        px-4 xl:px-6 py-8 xl:py-12 transition-colors duration-300
        ${isSecond ? "bg-white rounded-bl-[40px]" : ""}
        ${isThird ? "bg-white rounded-tr-[40px]" : ""}
      `}
    >
      <div className="mb-2">
        <Image src={icon} alt={title} />
      </div>

      <Text
        className={`mb-2 text-base lg:text-lg xl:text-xl ${
          active ? "text-white" : "text-[#353535]"
        }`}
        as="h4"
      >
        {title}
      </Text>
      <Paragraph
        className={`text-sm ${
          active ? "text-white/90" : "text-muted-foreground"
        }`}
      >
        {text}
      </Paragraph>
    </div>
  );
}
