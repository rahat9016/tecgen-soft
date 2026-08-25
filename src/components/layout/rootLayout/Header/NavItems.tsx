import { reportURL } from "@/src/config/envConfig";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./navLinks";
import SpecialtiesMegaMenu from "./SpecialtiesMegaMenu";
import { Specialty } from "./types";

export default function NavItems({
  specialty,
}: {
  specialty: Specialty[] | undefined;
}) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|bn)(?=\/|$)/, "") || "/";
  return (
    <nav className="hidden lg:flex items-center">
      {navLinks.map(({ label, href, hasChildren }) => {
        const isActive =
          href === "/"
            ? normalizedPath === "/"
            : normalizedPath.startsWith(href);

        if (hasChildren) {
          return <SpecialtiesMegaMenu key={label} specialty={specialty} />;
        }
        return (
          <Link
            key={label}
            href={href}
            className="group relative shrink-0 whitespace-nowrap px-1 xl:px-2 font-medium 2xl:font-normal text-sm 2xl:text-base"
          >
            <span
              className={`relative z-10 px-1 xl:px-3 2xl:px-4 ${
                isActive ? "text-primary" : "text-secondary-foreground"
              }`}
            >
              {label}
            </span>

            <span
              className={`
                absolute left-1/2 -bottom-1
                h-0.75 bg-primary
                transition-all duration-300 ease-out
                -translate-x-1/2
                ${isActive ? "w-9/12" : "w-0 group-hover:w-9/12"}
              `}
            />
          </Link>
        );
      })}
      <Link
        href={reportURL}
        target="_blank"
        className="ml-2 shrink-0 whitespace-nowrap bg-primary hover:bg-primary/80 text-white text-sm 2xl:text-base font-medium rounded-sm px-3 xl:px-4 2xl:px-6 py-2.5 xl:py-3 2xl:py-4"
      >
        Online Report
      </Link>
    </nav>
  );
}
