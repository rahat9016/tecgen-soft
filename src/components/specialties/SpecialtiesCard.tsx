import Image from "next/image";
import { useRouter } from "next/navigation";
import Paragraph from "../shared/Paragraph";
import Text from "../shared/Text";
import { Button } from "../ui/button";
import { ISpecialtyListItem } from "./types";

export default function SpecialtiesCard({
  title,
  description,
  id,
}: ISpecialtyListItem) {
  const router = useRouter();
  return (
    <div className="group transition-colors duration-300 ease-in-out">
      <div className="bg-white group-hover:bg-primary flex flex-col items-center justify-center border border-light-silver rounded-2xl p-6 transition-colors duration-300 ease-in-out">
        <Text
          as="h4"
          className="lg:text-base xl:text-xl mb-2 group-hover:text-white line-clamp-1"
        >
          {title}
        </Text>
        <Paragraph className="group-hover:text-white leading-5.5 line-clamp-1">
          {description}
        </Paragraph>
        <Button
          onClick={() => router.push(`/specialties/${id}`)}
          className="bg-transparent text-primary mt-5 shadow-none hover:bg-white group-hover:bg-white group-hover:text-primary cursor-pointer transition-colors duration-300 ease-in-out flex items-center"
        >
          View Details{" "}
          <Image
            src="/icons/right_arrow.svg"
            alt="Arrow right"
            width={20}
            height={20}
          />
        </Button>
      </div>
    </div>
  );
}
