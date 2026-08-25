import Paragraph from "../../shared/Paragraph";

export default function WhatYouGet({ serviceList }: { serviceList: string[] }) {
  return (
    <div>
      <Paragraph className="mb-4 text-secondary-foreground">
        What you Get:
      </Paragraph>
      <div className="bg-[#F7F7F7] border border-light-silver px-8 py-10 rounded-md">
        <ul className="grid grid-cols-1 md:grid-cols-2 list-disc list-inside">
          {serviceList.map((service) => (
            <li
              className="text-secondary-foreground text-base lg:text-lg"
              key={service}
            >
              {service}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
