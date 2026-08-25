"use client";

import { formatEmploymentType } from "@/src/utils/careerFormatters";
import { formatYearMonthDay } from "@/src/utils/formatDate";
import { sanitizeToPlainText } from "@/src/utils/sanitize";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ICareer } from "../../admin/Career/types";
import Paragraph from "../../shared/Paragraph";
import Text from "../../shared/Text";
import { Button } from "../../ui/button";

type CareerJobCardProps = Pick<
  ICareer,
  | "id"
  | "title"
  | "image"
  | "location"
  | "vacancy"
  | "deadline"
  | "description"
  | "jobType"
>;

export default function CareerJobCard({
  id,
  title,
  image,
  location,
  vacancy,
  deadline,
  description,
  jobType,
}: CareerJobCardProps) {
  const router = useRouter();

  return (
    <div className="group">
      <div className="border group-hover:border-primary duration-300 rounded-xl overflow-hidden h-full flex flex-col">
        <div className="h-60 object-contain">
          <Image
            width={369}
            height={240}
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="min-h-48">
            <div className="flex items-center flex-wrap justify-between mb-2">
              <Paragraph>
                Location:{" "}
                <span className="text-[#8A8A8A] font-normal text-sm  xl:text-base">
                  {location}
                </span>
              </Paragraph>
              <Paragraph>
                <span className="text-primary font-normal bg-[#E6F5F6] text-sm rounded-full px-2 py-1">
                  {formatEmploymentType(jobType)}
                </span>
              </Paragraph>
            </div>
            <Text
              as="h3"
              className="lg:text-base xl:text-xl line-clamp-2 mb-2 xl:mb-4"
            >
              {title}
            </Text>
            <Paragraph className="mb-2 line-clamp-2">
              {sanitizeToPlainText(description)}
            </Paragraph>
            <div className="flex flex-wrap items-center justify-between mb-2 xl:mb-4">
              <Paragraph className=" font-semibold text-xs xl:text-sm">
                Vacancy:{" "}
                <span className="text-[#8A8A8A] font-normal">{vacancy}</span>
              </Paragraph>
              <Paragraph className="font-semibold text-xs xl:text-sm">
                Deadline:{" "}
                <span className="text-[#8A8A8A] font-normal">
                  {formatYearMonthDay(deadline)}
                </span>
              </Paragraph>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/career/${id}`)}
            className="px-6 py-4 h-11 mt-auto bg-transparent border text-primary group-hover:text-white group-hover:bg-primary cursor-pointer duration-300"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
}
