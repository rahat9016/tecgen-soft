import Image from "next/image";

import { appointmentURL } from "@/src/config/envConfig";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { BookingType } from "@/src/types/common/common";
import { useRouter } from "next/navigation";
import Paragraph from "../shared/Paragraph";
import Text from "../shared/Text";
import { Button } from "../ui/button";
import { IDoctorCard } from "./types";

export default function DoctorCard({
  id,
  fullName,
  image,
  department,
  designation,
  doctorId,
}: IDoctorCard) {
  const router = useRouter();
  const { bookingType } = useAppSelector((state) => state.filter);

  const bookingUrl = (() => {
    const typeParam =
      bookingType === BookingType.TELE_ONLINE ? "teleonline" : "onsite";

    return `${appointmentURL}?doctor=${doctorId}&type=${typeParam}`;
  })();

  return (
    <div className="group">
      <div className="border group-hover:border-primary duration-300 rounded-xl overflow-hidden ">
        <div className="h-60 object-contain">
          <Image
            width={369}
            height={240}
            src={image}
            alt={fullName}
            className="w-full h-full"
          />
        </div>
        <div className="p-6 ">
          <Paragraph className="mb-4 text-[#BDBDBD]">
            {department?.name}
          </Paragraph>
          <Text
            as="h3"
            className="text-secondary-dark md:text-base lg:text-base xl:text-xl truncate"
          >
            {fullName}
          </Text>
          <Paragraph className="mb-6 text-[#BDBDBD]">{designation}</Paragraph>
          <div className="flex items-center justify-center">
            <Button
              onClick={() => router.push(`/request-an-appointment/${id}`)}
              className="px-6 py-4 h-11  bg-transparent border text-primary-light hover:text-primary-light hover:bg-transparent cursor-pointer duration-300 mx-auto border-none shadow-none"
            >
              View Profile
            </Button>
          </div>
          <Button
            asChild
            className="px-6 py-4 h-11! bg-primary-light border text-white hover:text-white hover:bg-primary-light cursor-pointer duration-500 w-full"
          >
            <a href={bookingUrl} target="_blank" rel="noreferrer">
              Book Appointment
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
