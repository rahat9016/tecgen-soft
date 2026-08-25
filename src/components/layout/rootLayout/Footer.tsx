import email from "@/public/icons/email.png";
import facebook from "@/public/icons/facebook.svg";
import linkedin from "@/public/icons/in.svg";
import ins from "@/public/icons/ins.svg";
import phone from "@/public/icons/phone.png";
import phone_2 from "@/public/icons/phone_2.png";
import Whatsapp from "@/public/icons/Whatsapp.svg";
import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import { navLinks } from "./Header/navLinks";

const Footer = () => {
  const sections = [
    {
      title: "Quick Links",
      links: navLinks,
    },
  ];

  return (
    <footer className="bg-[#F7F7F7] pt-8 md:pt-12.75">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 xl:gap-28">
          <div className="w-full lg:w-5/12 xl:w-4/12">
            <Link
              href="/"
              aria-label="Happy Hospital & 
Diagnostic Center "
              className="shrink-0 flex items-center"
            >
              <Image
                src={logo}
                alt="Happy Hospital & 
Diagnostic Center"
                width={216}
                height={216}
                className="w-24 h-24"
              />
              <h2 className="text-base text-secondary-dark font-semibold">
                Happy Hospital &<br />
                Diagnostic Center 
              </h2>
            </Link>
            <p
              className="text-sm text-secondary-foreground mb-5 lg:mb-8 leading-relaxed"
              tabIndex={0}
            >
              West Khabaspur, Faridpur Sadar, Faridpur District, Dhaka Division,
              Bangladesh
            </p>
            <div>
              <h2 className="text-xl text-secondary-dark font-semibold">
                Social Media
              </h2>
              <div className="flex gap-3 mt-6">
                <Link
                  href="https://www.facebook.com/share/1FEH5YThpV/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary"
                >
                  <Image
                    width={40}
                    height={40}
                    src={facebook}
                    alt="facebook"
                    className="w-3 group-hover:brightness-0 group-hover:invert duration-300"
                  />
                </Link>

                <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
                  <Image
                    width={40}
                    height={40}
                    src={ins}
                    alt="ins"
                    className="w-5 group-hover:brightness-0 group-hover:invert duration-300"
                  />
                </div>

                <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
                  <Image
                    width={40}
                    height={40}
                    src={linkedin}
                    alt="linkedin"
                    className="w-5 group-hover:brightness-0 group-hover:invert duration-300"
                  />
                </div>

                <Link
                  href="https://wa.me/8801717173311"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary"
                >
                  <Image
                    width={40}
                    height={40}
                    src={Whatsapp}
                    alt="Whatsapp"
                    className="w-6 group-hover:brightness-0 group-hover:invert duration-300"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-7/12 xl:w-8/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 lg:gap-8 xl:gap-10">
            {sections.map((section, idx) => (
              <div key={idx} className="mb-3">
                <h4
                  className="font-semibold mb-4 lg:mb-6 text-base text-secondary-dark"
                  tabIndex={0}
                >
                  {section.title}
                </h4>
                <ul className="space-y-2 lg:space-y-3 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-secondary-foreground font-normal text-base block group"
                      >
                        <span className="block pb-2">{link.label}</span>
                        <span className="block w-0 group-hover:w-full h-px bg-secondary transition-all duration-300 mt-1"></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="space-y-3 text-sm">
              <h4
                className="font-semibold mb-4 lg:mb-6 text-base text-secondary-dark"
                tabIndex={0}
              >
                Contact Info
              </h4>
              <div
                className="flex items-start gap-3 text-secondary-foreground"
                tabIndex={0}
                aria-label="Contact Number"
              >
                <Image
                  src={phone}
                  alt=""
                  width={48}
                  height={48}
                  className="w-6 h-6
                "
                />
                <span className="mt-0.5">+88 02 9849422</span>
              </div>
              <div
                className="flex items-center gap-3 text-secondary-foreground"
                tabIndex={0}
                aria-label="Contact Number"
              >
                <Image
                  src={phone_2}
                  alt=""
                  width={54}
                  height={45}
                  className="w-6 h-6
                "
                />
                <span className="mt-0.5">+88 02 9863360</span>
              </div>
              <div
                className="flex items-center gap-3 text-secondary-foreground"
                tabIndex={0}
                aria-label="Email"
              >
                <Image
                  src={email}
                  alt=""
                  width={60}
                  height={48}
                  className="w-6 
                "
                />
                <Link
                  href="mailto:happymodelpharmacy@gmail.com"
                  className="mt-0.5 transition-colors"
                >
                  happymodelpharmacy@gmail.com
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center w-full py-6 lg:py-11 gap-4 sm:gap-0 mt-4 lg:mt-6">
        <div className="grow border-t border-text-secondary-foreground hidden sm:block"></div>
        <span
          className="px-4 text-center font-normal text-xs sm:text-sm text-secondary-foreground whitespace-nowrap"
          tabIndex={0}
        >
          © {new Date().getFullYear()} Happy Hospital & Diagnostic Center 
        </span>
        <div className="grow border-t border-text-secondary-foreground hidden sm:block"></div>
      </div>

      {/* Developer Credit */}
      <div className="container px-4 sm:px-6 lg:px-8 text-xs text-[#B3B3B3] flex justify-center sm:justify-end pb-4 lg:pb-10">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span>|</span>
          <span>Developed by</span>
          <Link
            className="text-white"
            tabIndex={0}
            aria-label="Developed By A T I Limited"
            href={"https://atilimited.net/"}
            target="_blank"
          >
            <Image
              width={67}
              height={24}
              src="/ATI_Logo.png"
              alt="ATI_Logo"
              className="h-5 w-auto lg:h-6"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
