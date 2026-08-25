"use client";
import icon2 from "@/public/icons/Integrity.svg";
import icon3 from "@/public/icons/Passionate.svg";
import icon1 from "@/public/icons/Quality.svg";
import icon4 from "@/public/icons/Respect.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Paragraph from "../shared/Paragraph";
import Text from "../shared/Text";
import { Button } from "../ui/button";
import { AboutCard } from "./AboutCard";
import { IAboutItem } from "./types";

const valuesData: IAboutItem[] = [
  {
    id: 1,
    icon: icon1,
    title: "Quality",
    text: "We are committed to providing quality healthcare for every patient",
    active: true,
  },
  {
    id: 2,
    icon: icon2,
    title: "Integrity",
    text: "We are committed to providing quality healthcare for every patient",
  },
  {
    id: 3,
    icon: icon3,
    title: "Passionate",
    text: "We are passionate about healthcare and this shows in the care we provide",
  },
  {
    id: 4,
    icon: icon4,
    title: "Respect",
    text: "We are respectful of everyone regardless of our differences and diversity",
    active: true,
  },
];

export default function AboutSection() {
  const pathname = usePathname();
  const isAboutPage = pathname === "/about-us";

  return (
    <section className="container ">
      <div className="pt-8 lg:pt-8 xl:pt-10 grid lg:grid-cols-2 gap-6 xl:gap-12">
        <div>
          <Text className="mb-4">About Us</Text>
          <Paragraph className=" mb-10">
            Happy Care Hospital is dedicated to providing trusted,
            patient-centered healthcare with compassion and excellence. Since
            our founding, we have remained committed to improving lives through
            advanced medical care, modern technology, and a team of skilled
            professionals. Our goal is to make quality healthcare accessible,
            affordable, and reliable for every individual and family. Over the
            years, we have built a reputation for integrity, innovation, and
            continuous improvement in medical services. At Happy Care, we
            believe in healing with heart, ensuring comfort, care, and
            confidence for every patient we serve.
          </Paragraph>

          {!isAboutPage && (
            <Button
              asChild
              className="bg-primary h-11 text-white px-6! py-4! rounded-md cursor-pointer"
            >
              <Link href="/about-us">
                Read More{" "}
                <Image
                  src="/icons/right_arrow_white.svg"
                  alt="Arrow right"
                  width={20}
                  height={20}
                />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 shadow-sm rounded-md overflow-hidden bg-primary">
          {valuesData.map((item, index) => (
            <AboutCard key={item.id} {...item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
