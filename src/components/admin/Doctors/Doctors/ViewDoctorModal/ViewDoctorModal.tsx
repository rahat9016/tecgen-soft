import DoctorScheduleBadge from "@/src/components/shared/DoctorScheduleBadge";
import Text from "@/src/components/shared/Text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { User } from "lucide-react";
import Image from "next/image";
import { IDoctor } from "../../types";

export default function ViewDoctorModal({
  isOpen,
  onClose,
  doctor,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctor?: IDoctor;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-h-[50vh] min-w-[50vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-secondary text-2xl font-semibold">
            Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="bg-light p-6 border border-light rounded-2xl flex items-center gap-6">
          <div className="w-55 h-35.5 rounded-xl overflow-hidden">
            {doctor?.image ? (
              <Image
                src={doctor.image}
                alt={doctor.fullName}
                width={220}
                height={142}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-full h-full p-5 text-gray-400" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-secondary">
              {doctor?.fullName}
              <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full ml-3 capitalize">
                {doctor?.bookingType?.toLocaleLowerCase().replace("_", " ")}
              </span>
            </h2>

            <p className="text-sm text-secondary-foreground font-medium">
              {doctor?.designation}
            </p>

            <p className="text-sm text-secondary-foreground font-medium">
              {doctor?.specialization}
            </p>

            <div>
              <DoctorScheduleBadge
                schedules={doctor?.doctorSchedules}
                className="h-8 text-sm justify-center"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Text className="lg:text-lg xl:text-xl text-[#565656]">
            Areas of Expertise
          </Text>

          <ul className="list-disc pl-5 space-y-1 mt-4">
            {doctor?.areaOfExpertise?.map((item, index) => (
              <li
                key={index}
                className="text-sm text-secondary-foreground font-normal"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
