import logo from "@/public/logo_.png";
import { appointmentURL } from "@/src/config/envConfig";
import Image from "next/image";
import Link from "next/link";
import Paragraph from "./Paragraph";

export default function BookAppointmentSection() {
  return (
    <div className="bg-primary py-10 lg:py-20">
      <div className="container flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center">
          <Image
            src={logo}
            alt="Happy Hospital & Diagnostic Center "
            width={300}
            height={300}
            className="w-25"
          />
          <Paragraph className="text-white lg:text-xl xl:text-2xl">
            Happy Hospital & Diagnostic Center 
          </Paragraph>
        </div>
        <Link
          href={appointmentURL}
          target="_blank"
          className="bg-white hover:bg-white text-secondary px-6 py-4 h-11 cursor-pointer flex items-center justify-center rounded-md transition-colors text-base font-medium mt-6 md:mt-0 group "
        >
          Book Appointment{" "}
          <Image
            src="/icons/right_arrow_blue.svg"
            alt="Arrow right"
            width={20}
            height={20}
          />
        </Link>
      </div>
    </div>
  );
}
