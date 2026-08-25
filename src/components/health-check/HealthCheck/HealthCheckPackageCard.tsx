import Link from "next/link";
import { IHealthCheckPackage } from "../types";

export default function HealthCheckPackageCard({
  id,
  title,
  image,
  description,
}: IHealthCheckPackage) {
  return (
    <div
      style={{
        backgroundImage: `url(${image})`,
      }}
      className="w-full min-h-104 bg-no-repeat bg-cover bg-center group rounded-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#F1F1F100] to-[#F1F1F1CC] group-hover:from-[#0F0E4000] group-hover:via-[#8583DF67] group-hover:to-[#0F0E40] transition-all duration-300"></div>
      <div
        id="circle"
        className="absolute w-48 h-48 group-hover:w-56 group-hover:h-56 rounded-full border-40 border-[#ffffff3f]  blur-md
-left-[30%] -top-20
                   transition-all duration-1000 ease-in-out
                   group-hover:-top-[20%] group-hover:left-[65%] group-hover:translate-x-0 group-hover:translate-y-4 group-hover:blur-none"
      ></div>

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
        <div className="absolute bottom-6 group-hover:bottom-40 duration-300">
          <h2 className="text-secondary-dark font-semibold text-xl w-full group-hover:text-white transition-colors duration-300 line-clamp-2">
            {title}
          </h2>
        </div>
        <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col">
          <p className="text-white text-sm font-normal mb-4 line-clamp-3">
            {description}
          </p>
          <Link
            href={`/health-check/${id}`}
            className="bg-primary shadow-none text-white font-medium font-poppins text-sm transition-all duration-300 flex items-center justify-center w-7/12 text-center py-4 rounded-lg"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
