"use client";

import { isValidUrl } from "@/src/utils/isValidUrl";
import { normalizeImageSrc } from "@/src/utils/normalizeImageSrc";
import Image from "next/image";
import { useState } from "react";
import { IDoctor } from "../../types";

export const DoctorAvatar = ({ doctor }: { doctor: IDoctor }) => {
  const [imgError, setImgError] = useState(false);
  const imageSrc = normalizeImageSrc(doctor.image);
  const hasValidImage =
    !!imageSrc && (isValidUrl(imageSrc) || imageSrc.startsWith("/"));

  if (!hasValidImage || imgError) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <Image
          src="/icons/appointment.svg"
          alt="Default Avatar"
          width={18}
          height={18}
        />
      </div>
    );
  }

  return (
    <Image
      width={36}
      height={36}
      src={imageSrc}
      alt={doctor.fullName}
      className="w-9 h-9 rounded object-cover"
      onError={() => setImgError(true)}
    />
  );
};
