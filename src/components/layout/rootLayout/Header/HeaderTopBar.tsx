import Link from "next/link";
import Image from "next/image";
import hotlineIcon from "@/public/icons/hotline.png";

export default function HeaderTopBar({ show }: { show: boolean }) {
  return (
    <div
      className={`hidden lg:flex flex-col w-full bg-secondary overflow-hidden transition-[max-height] duration-300 ${
        show ? "max-h-12" : "max-h-0"
      }`}
    >
      <div
        className="container flex items-center justify-between h-12"
        aria-label="Nav bar"
        tabIndex={0}
      >
        <h3 className="font-medium text-sm text-white">
          Welcome to happy hospital & diagnostic center
        </h3>
        <div className="flex items-center gap-6 text-white text-base font-normal">
          <Link href={"/career"}>Career</Link>
          <Link href={"/blogs"}>Blogs</Link>
          <Link href={""} className="flex items-center gap-2">
            <Image
              src={hotlineIcon}
              width={52}
              height={62}
              alt="hotline:16254"
              className="w-6 h-6"
            />
            Hotline: 16254
          </Link>
        </div>
      </div>
    </div>
  );
}
