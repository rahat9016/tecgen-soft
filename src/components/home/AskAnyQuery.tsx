import Image from "next/image";
import Link from "next/link";
import Paragraph from "../shared/Paragraph";
import Text from "../shared/Text";
import { Button } from "../ui/button";

export default function AskAnyQuery() {
  return (
    <div
      className="py-10 lg:py-20 bg-primary bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url('/shape/shape.svg')",
      }}
    >
      <div className="container">
        <div className="flex flex-col items-center justify-center">
          <Text className="text-white">Ask Happy Hospital</Text>
          <Paragraph className="text-center text-[#E8E8E8] mt-4 w-full lg:max-w-9/12">
            Have questions about our services or need more information? Send us
            your queries, and our dedicated support team will respond quickly
            with the guidance you need to book appointments, understand
            treatments, or learn more about our facilities.
          </Paragraph>
          <Button
            asChild
            className="bg-white hover:bg-white text-secondary px-6 py-4 h-11 mt-5 lg:mt-10 cursor-pointer"
          >
            <Link href="/contact-us">
              Send Query{" "}
              <Image
                src="/icons/right_arrow_blue.svg"
                alt="Arrow right"
                width={20}
                height={20}
                className="group-hover:brightness-0 group-hover:invert"
              />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
