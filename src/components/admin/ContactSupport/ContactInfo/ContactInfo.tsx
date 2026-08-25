"use client";
import TableTopBarHeader from "@/src/components/shared/TableTopBarHeader";
import { Button } from "@/src/components/ui/button";
import { clearFilters } from "@/src/lib/redux/features/filter/filterSlice";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import CreateUpdateContactInfo from "../Form/CreateUpdateContactInfo";

export default function ContactInfo() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  return (
    <div>
      <TableTopBarHeader title={"Contact & Support List"} />
      <div
        id="table-tab"
        className="bg-white p-5 rounded-lg border border-light-dark my-6"
      >
        <div className="overflow-hidden rounded-sm border border-light-dark h-11 w-fit ">
          {[
            {
              name: "Contact & Support List",
              route: "/admin/contact-support-list",
            },
            { name: "Contact info", route: "/admin/contact-info" },
          ].map((tab) => (
            <Button
              key={tab.name}
              className={`h-full text-secondary-dark rounded-none cursor-pointer text-sm font-medium  ${
                pathname === tab.route
                  ? "bg-primary text-white"
                  : "bg-transparent hover:bg-transparent"
              }`}
              onClick={() => {
                router.push(tab.route as string);
                dispatch(clearFilters());
              }}
            >
              {tab.name}
            </Button>
          ))}
        </div>
      </div>
      <CreateUpdateContactInfo />
    </div>
  );
}
