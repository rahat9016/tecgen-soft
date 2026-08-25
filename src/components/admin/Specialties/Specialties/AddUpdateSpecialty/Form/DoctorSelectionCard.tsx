import { IDoctor } from "@/src/components/admin/Doctors/types";
import Image from "next/image";

interface DoctorSelectionCardProps {
  doctor: IDoctor;
  isSelected: boolean;
  onToggle: (doctor: IDoctor) => void;
}

export default function DoctorSelectionCard({
  doctor,
  isSelected,
  onToggle,
}: DoctorSelectionCardProps) {
  return (
    <button
      key={doctor.id}
      type="button"
      onClick={() => onToggle(doctor)}
      className={`relative rounded-lg border p-3 text-left transition-colors bg-light flex items-center flex-col cursor-pointer`}
    >
      <span
        className={`absolute right-3 top-3 h-4 w-4 rounded-full border z-40 p-0.5 ${
          isSelected ? "border-light-silver" : "border-light-silver bg-white"
        }`}
      >
        {isSelected && (
          <span className="w-full h-full block bg-primary rounded-full"></span>
        )}
      </span>

      <div className="mx-auto mb-2 relative h-15 w-15 overflow-hidden rounded-md">
        <Image
          src={doctor.image || "/icons/doctor-placeholder.png"}
          alt={doctor.fullName}
          fill
          className="object-cover rounded-[16px]"
        />
      </div>

      <p className="text-center text-secondary-dark font-medium text-base leading-5">
        {doctor.fullName}
      </p>
      <p className="text-xs text-secondary-foreground mt-2 line-clamp-1">
        ID: {doctor.doctorId}
      </p>
      <p className="text-xs text-secondary-foreground mt-1 line-clamp-1">
        Dept: {doctor.department?.name || "-"}
      </p>
    </button>
  );
}
