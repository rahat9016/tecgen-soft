import { formatDate } from "@/src/utils/formatDate";
import { sanitizeToPlainText } from "@/src/utils/sanitize";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Paragraph from "../../shared/Paragraph";
import Text from "../../shared/Text";
import { Button } from "../../ui/button";
import { IBlog } from "../types";

export default function BlogCard({
  id,
  title,
  image,
  description,
  createdAt,
}: IBlog) {
  const router = useRouter();
  return (
    <div className="group">
      <div className="border group-hover:border-primary duration-300 rounded-xl overflow-hidden ">
        <div className="h-60 object-contain">
          {image && (
            <Image
              width={369}
              height={240}
              src={image}
              alt={title}
              className="w-full h-full"
            />
          )}
        </div>
        <div className="p-6 h-56">
          <Paragraph className="mb-4 text-[#BDBDBD]">
            Published: {formatDate(createdAt)}
          </Paragraph>
          <Text
            as="h3"
            className="text-secondary-dark md:text-base lg:text-base xl:text-xl truncate"
          >
            {title}
          </Text>
          <div className="font-normal! text-[#5C5C5C] h-12 line-clamp-2 w-full">
            {sanitizeToPlainText(description)}
          </div>
          <Button
            onClick={() => router.push(`/blogs/${id}`)}
            className="px-6 py-4 h-11 mt-5 lg:mt-5 mb-10 lg:mb-20 bg-transparent border text-primary group-hover:text-white group-hover:bg-primary cursor-pointer duration-300 group"
          >
            Read Full Blog{" "}
            <Image
              src="/icons/right_arrow.svg"
              alt="Arrow right"
              width={20}
              height={20}
              className="group-hover:brightness-0 group-hover:invert"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
