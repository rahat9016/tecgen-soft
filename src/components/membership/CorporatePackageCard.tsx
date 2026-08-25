import Image from "next/image";

type CorporatePackageCardProps = {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  notices: string[];
  onApply?: () => void;
};

export default function CorporatePackageCard({
  id,
  title,
  description,
  benefits,
  notices,
  onApply,
}: CorporatePackageCardProps) {
  const packageName = title || "Package";

  return (
    <div
      data-package-id={id}
      className="group relative overflow-hidden rounded-2xl border border-light-silver bg-white p-6 shadow-sm min-h-105 "
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#F1F1F100] to-[#F1F1F1CC] group-hover:from-primary group-hover:via-primary group-hover:to-primary transition-all duration-300" />
      <div
        id="circle"
        className="absolute w-48 h-48 group-hover:w-56 group-hover:h-56 rounded-full border-40 border-[#ffffff3f] blur-md -left-[30%] -top-20 transition-all duration-1000 ease-in-out group-hover:-top-[20%] group-hover:left-[65%] group-hover:translate-y-4 group-hover:blur-none"
      />

      <div className="relative z-10">
        <h3 className="text-2xl font-medium text-secondary-dark group-hover:text-white transition-colors duration-300 ease-in-out flex items-center gap-2 origin-left will-change-transform group-hover:scale-[1.03]">
          {packageName}{" "}
          <Image
            src={"/icons/crown.svg"}
            alt="Crown"
            width={50}
            height={50}
            className="transition-all duration-300 ease-in-out group-hover:brightness-0 group-hover:invert w-4 h-4"
          />
        </h3>
        <p className="mt-2 text-base font-regular text-secondary-foreground group-hover:text-white transition-colors duration-300 ease-in-out line-clamp-2 origin-left will-change-transform group-hover:scale-[1.03]">
          {description}
        </p>

        <div className="mt-5 border-t border-light-silver group-hover:border-white/30" />

        <div className="mt-5">
          <h4 className="text-xl font-semibold text-secondary-foreground group-hover:text-white transition-colors duration-300 ease-in-out origin-left will-change-transform group-hover:scale-[1.03]">
            Benefits:
          </h4>
          <ul className="mt-3 space-y-2">
            {benefits.map((item) => (
              <li
                key={`${packageName}-benefit-${item}`}
                className="flex items-center gap-2 text-sm text-secondary-foreground group-hover:text-white transition-colors duration-300 ease-in-out"
              >
                <div className="relative w-4.5 h-4.5 bg-primary group-hover:bg-white rounded-full p-1">
                  <Image
                    src="/icons/check.svg"
                    alt="check"
                    width={16}
                    height={16}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inset-0 group-hover:opacity-0 transition-opacity w-2 h-2"
                  />
                  <Image
                    src="/icons/checkBlue.svg"
                    alt="check white"
                    width={16}
                    height={16}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inset-0 opacity-0 group-hover:opacity-100 transition-opacity w-2 h-2"
                  />
                </div>
                <span className="line-clamp-1 origin-left will-change-transform group-hover:scale-[1.03] transition-transform duration-300 ease-in-out">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <h4 className="text-xl font-semibold text-secondary-foreground group-hover:text-white transition-colors duration-300 ease-in-out origin-left will-change-transform group-hover:scale-[1.05]">
            Notice:
          </h4>
          <ul className="mt-3 space-y-2">
            {notices.map((item) => (
              <li
                key={`${packageName}-notice-${item}`}
                className="flex items-center gap-2 text-sm text-secondary-foreground group-hover:text-white transition-colors duration-300 ease-in-out"
              >
                <div className="relative w-4.5 h-4.5 bg-primary group-hover:bg-white rounded-full p-1">
                  <Image
                    src="/icons/check.svg"
                    alt="check"
                    width={16}
                    height={16}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inset-0 group-hover:opacity-0 transition-opacity w-2 h-2"
                  />
                  <Image
                    src="/icons/checkBlue.svg"
                    alt="check white"
                    width={16}
                    height={16}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inset-0 opacity-0 group-hover:opacity-100 transition-opacity w-2 h-2"
                  />
                </div>
                <span className="line-clamp-1 origin-left will-change-transform group-hover:scale-[1.03] transition-transform duration-300 ease-in-out">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 border-t border-light-silver group-hover:border-white/30" />

        <button
          type="button"
          onClick={onApply}
          className="mt-5 bg-primary group-hover:bg-white text-white group-hover:text-[#0F0E40] shadow-none text-sm font-medium transition-all duration-300 ease-in-out flex items-center justify-center w-full text-center py-3 rounded-lg origin-left will-change-transform group-hover:scale-[1.03]"
        >
          Apply for {packageName}{" "}
          <Image
            src="/icons/right_arrow_white.svg"
            alt="Arrow right"
            width={20}
            height={20}
          />
        </button>
      </div>
    </div>
  );
}
