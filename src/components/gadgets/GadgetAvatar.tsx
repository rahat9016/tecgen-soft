"use client";

import { useState } from "react";
import type { Customer } from "@/src/lib/gadget-store/types";
import { cn } from "@/src/lib/utils";

// Profile photo with the name's initial as fallback when there is no photo or it fails to load.
export default function GadgetAvatar({
  user,
  className,
}: {
  user: Pick<Customer, "name" | "avatar">;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (user.avatar && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={user.name}
        onError={() => setFailed(true)}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span className={cn("flex items-center justify-center rounded-full font-semibold", className)}>
      {user.name[0]}
    </span>
  );
}
