"use client";

import LoginImg from "@/public/auth/login.jpg";
import Image from "next/image";
import { useState } from "react";

export default function LoginBanner() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative hidden md:block h-screen w-full overflow-hidden">
      <Image
        src={LoginImg}
        alt="login"
        fill
        priority
        className={`
          object-cover transition-opacity duration-700 ease-in-out
          ${loaded ? "opacity-100" : "opacity-0"}
        `}
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-black/5" />
    </div>
  );
}
