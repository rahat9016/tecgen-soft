import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <Link
        href="/"
        aria-label="Happy Hospital & 
Diagnostic Center "
        className="shrink-0 flex items-center cursor-pointer"
      >
        <Image
          src={logo}
          alt="Happy Hospital &
Diagnostic Center"
          width={216}
          height={144}
          priority
          loading="eager"
          className="w-24 lg:w-20 xl:w-24 h-auto object-contain"
        />
        <h2 className="text-sm 2xl:text-base text-secondary font-semibold">
          Happy Hospital &<br />
          Diagnostic Center 
        </h2>
      </Link>
    </div>
  );
}
