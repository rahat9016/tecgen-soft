import facebook from "@/public/icons/facebook.svg";
import linkedin from "@/public/icons/in.svg";
import ins from "@/public/icons/ins.svg";
import leftArrow from "@/public/icons/leftArrow.svg";
import Whatsapp from "@/public/icons/Whatsapp.svg";
import { appointmentURL } from "@/src/config/envConfig";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IDoctor } from "../admin/Doctors/types";
import Text from "../shared/Text";

export default function DoctorContent({ doctor }: { doctor: IDoctor }) {
  return (
    <div>
      <div className="bg-light p-5 lg:p-10 border border-light rounded-2xl flex flex-col lg:flex-row  gap-6  min-h-100">
        <div className="lg:w-142 lg:h-100 rounded-xl overflow-hidden shrink-0">
          {doctor?.image ? (
            <Image
              src={doctor.image}
              alt={doctor.fullName}
              width={568}
              height={400}
              className="w-full h-full object-cover "
            />
          ) : (
            <User className="w-full h-full p-5 text-gray-400" />
          )}
        </div>

        <div className="w-full lg:min-h-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl lg:text-[32px] font-semibold text-secondary ">
              {doctor?.fullName}{" "}
              <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full ml-3 capitalize">
                {doctor?.bookingType?.toLocaleLowerCase().replace("_", " ")}
              </span>
            </h2>
            <p className="text-base lg:text-xl text-secondary-foreground font-medium">
              {doctor?.designation}
            </p>
            <p className="text-base lg:text-xl text-secondary-foreground font-medium">
              {doctor?.specialization}
            </p>
            <span
              className={
                "bg-[#5E5E7F] px-3 py-2.5 rounded-sm font-medium text-white flex items-center mt-3 max-w-fit"
              }
            >
              04:00 PM - 09:00 PM
            </span>
          </div>
          <div className="flex justify-end mt-6 lg:mt-0">
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
                <Image
                  width={40}
                  height={40}
                  src={facebook}
                  alt="facebook"
                  className="w-3 group-hover:brightness-0 group-hover:invert duration-300"
                />
              </div>

              <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
                <Image
                  width={40}
                  height={40}
                  src={ins}
                  alt="ins"
                  className="w-5 group-hover:brightness-0 group-hover:invert duration-300"
                />
              </div>

              <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
                <Image
                  width={40}
                  height={40}
                  src={linkedin}
                  alt="linkedin"
                  className="w-5 group-hover:brightness-0 group-hover:invert duration-300"
                />
              </div>

              <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
                <Image
                  width={40}
                  height={40}
                  src={Whatsapp}
                  alt="Whatsapp"
                  className="w-6 group-hover:brightness-0 group-hover:invert duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-25">
        <Text className=" lg:text-2xl xl:text-[32px] text-secondary-dark">
          Areas of Expertise
        </Text>
        <ul className="space-y-6 mt-6">
          {doctor?.areaOfExpertise?.map((item, index) => (
            <li key={index} className="text-sm text-secondary-gary font-normal">
              <Image
                alt="leftArrow"
                src={leftArrow}
                width={16}
                height={16}
                className="inline-block mr-2"
              />
              {item}
            </li>
          ))}
        </ul>
        <Link
          href={appointmentURL}
          className="mt-10 h-11 px-6 py-4 bg-primary text-white rounded-md inline-flex items-center justify-center hover:bg-primary/90 transition-colors text-base font-medium"
          target="_blank"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}
