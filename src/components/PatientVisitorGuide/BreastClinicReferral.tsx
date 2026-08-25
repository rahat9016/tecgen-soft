"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, X } from "lucide-react";
import Paragraph from "../shared/Paragraph";
import Text from "../shared/Text";

const accordionItems = [
  {
    title: "Your Rights as a Patient",
    content:
      "The center is also equipped with an ultramodern HDR Brachytherapy (treatment of cancer by the insertion of radioactive source directly into the body cavity and tissues) unit “FLEXITRON” which houses Cobalt 60 as a radiation source thus ensuring uninterrupted treatment due to the long half-life of the source. To provide the best possible treatment, our experts in the related fields debate, deliberate and discuss regarding the patient diagnosed with cancer in MDT ‘tumor board’. Our experts then decide the best form of treatment for each, and every patient based on solid scientific evidence. To add on to its already existing armamentarium, Evercare Hospital Dhaka proudly announces that our most advanced PET-CT machine has recently been installed, which provides cutting-edge technology to stage, plan, manage and monitor the treatment of the tumor or tumors in question. The symptom management team of ours are the best in Bangladesh and always stand ready to make our patient’s life free of pain and suffering from the uncontrollable yet unwanted symptoms of cancer, thus “adding life to years”.",
  },
  {
    title: "Your Responsibilities as a Patient",
    content:
      "The center is also equipped with an ultramodern HDR Brachytherapy (treatment of cancer by the insertion of radioactive source directly into the body cavity and tissues) unit “FLEXITRON” which houses Cobalt 60 as a radiation source thus ensuring uninterrupted treatment due to the long half-life of the source. To provide the best possible treatment, our experts in the related fields debate, deliberate and discuss regarding the patient diagnosed with cancer in MDT ‘tumor board’. Our experts then decide the best form of treatment for each, and every patient based on solid scientific evidence. To add on to its already existing armamentarium, Evercare Hospital Dhaka proudly announces that our most advanced PET-CT machine has recently been installed, which provides cutting-edge technology to stage, plan, manage and monitor the treatment of the tumor or tumors in question. The symptom management team of ours are the best in Bangladesh and always stand ready to make our patient’s life free of pain and suffering from the uncontrollable yet unwanted symptoms of cancer, thus “adding life to years”.",
  },
  {
    title: "Checklist to Follow When Leaving",
    content:
      "The center is also equipped with an ultramodern HDR Brachytherapy (treatment of cancer by the insertion of radioactive source directly into the body cavity and tissues) unit “FLEXITRON” which houses Cobalt 60 as a radiation source thus ensuring uninterrupted treatment due to the long half-life of the source. To provide the best possible treatment, our experts in the related fields debate, deliberate and discuss regarding the patient diagnosed with cancer in MDT ‘tumor board’. Our experts then decide the best form of treatment for each, and every patient based on solid scientific evidence. To add on to its already existing armamentarium, Evercare Hospital Dhaka proudly announces that our most advanced PET-CT machine has recently been installed, which provides cutting-edge technology to stage, plan, manage and monitor the treatment of the tumor or tumors in question. The symptom management team of ours are the best in Bangladesh and always stand ready to make our patient’s life free of pain and suffering from the uncontrollable yet unwanted symptoms of cancer, thus “adding life to years”.",
  },
];

export default function BreastClinicReferral() {
  return (
    <section className="py-10 lg:py-16">
      <Text
        as="h2"
        className="mb-4 text-2xl lg:text-4xl xl:text-[44px] font-semibold text-secondary-dark"
      >
        Understanding Your Rights & Responsibilities
      </Text>

      <Paragraph className="mb-5 lg:mb-10">
        Healthcare is a two-way process between you (the patient) and the staff
        who care for you. You have the right to expect high-quality care, but
        there are also things you can do to help ensure that you receive this.
        Evercare Hospital Dhaka believes it is important for patients to
        understand both their rights and their responsibilities in this process.
      </Paragraph>

      <AccordionPrimitive.Root
        type="single"
        collapsible
        className="w-full space-y-3"
      >
        {accordionItems.map((item) => (
          <AccordionPrimitive.Item
            key={item.title}
            value={item.title}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="group flex flex-1 items-center justify-between gap-4 px-5 py-5 text-left text-base font-medium transition-all duration-200 cursor-pointer outline-none text-secondary-dark data-[state=open]:bg-primary data-[state=open]:text-white data-[state=open]:rounded-t-lg">
                {item.title}
                <ChevronDown className="size-5 shrink-0 text-gray-400 group-data-[state=open]:hidden" />
                <span className="hidden size-8 shrink-0 items-center justify-center rounded-full border-2 border-white/60 group-data-[state=open]:flex">
                  <X className="size-4" />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="bg-gray-50 px-5 py-5 leading-relaxed text-secondary-foreground">
                <Paragraph>{item.content}</Paragraph>
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </section>
  );
}
