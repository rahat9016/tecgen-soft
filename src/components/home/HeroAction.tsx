import icon1 from "@/public/icons/DoctorBooking.svg";
import icon3 from "@/public/icons/Guide.svg";
import icon2 from "@/public/icons/Report.svg";
import { reportURL } from "@/src/config/envConfig";
import HeroActionCard from "./HeroActionCard";
import { IHeroActionItem } from "./types";

export default function HeroAction() {
  const data: IHeroActionItem[] = [
    {
      id: 1,
      title: "Book an Appointment",
      subTitle: "Book your appointment online",
      icon: icon1,
      link: "/doctor-appointment",
    },
    {
      id: 2,
      title: "Online Report",
      subTitle: "Access your reports anytime",
      icon: icon2,
      link: reportURL,
      target: "_blank",
    },
    {
      id: 3,
      title: "Patient & Visitor Guide",
      subTitle: "Find everything you need to know",
      icon: icon3,
      link: "/patient-visitor-guide",
    },
  ];
  return (
    <div className="grid gap-2 lg:gap-0 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
      {data.map((item, index) => (
        <HeroActionCard
          key={item.id}
          {...item}
          index={index}
          total={data.length}
        />
      ))}
    </div>
  );
}
