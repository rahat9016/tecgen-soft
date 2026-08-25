"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import Paragraph from "../Paragraph";
import Text from "../Text";

export default function AdminBackButton({
  routeURL,
  title,
  desc,
}: {
  routeURL: string;
  title: string;
  desc: string;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        onClick={() => router.push(routeURL)}
        className="bg-white hover:bg-white w-13 min-h-13 border border-light-silver flex items-center justify-center p-3"
      >
        <Image
          src="/icons/left_arrow.svg"
          alt="left arrow"
          width={32}
          height={32}
        />
      </Button>
      <div>
        <Text className="md:text-xl lg:text-2xl xl:text-2xl">{title}</Text>
        <Paragraph className="xl:text-sm">{desc}</Paragraph>
      </div>
    </div>
  );
}
