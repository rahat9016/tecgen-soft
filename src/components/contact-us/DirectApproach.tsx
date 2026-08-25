"use client";

import { useGet } from "@/src/hooks/useGet";
import { Clock, Mail, Phone } from "lucide-react";
import Text from "../shared/Text";
import { IContactInfo } from "./types";

export default function DirectApproach() {
  const { data, isLoading } = useGet<IContactInfo>("/contact-info", [
    "contact-info",
  ]);

  const contactInfo = data?.data;
  const hasPhones =
    Array.isArray(contactInfo?.phones) && contactInfo.phones.length > 0;
  const hasEmails =
    Array.isArray(contactInfo?.emails) && contactInfo.emails.length > 0;

  const phoneNumbers = hasPhones ? contactInfo.phones : [];
  const emailAddresses = hasEmails ? contactInfo.emails : [];
  const officeHour = contactInfo?.office_hour || "";

  return (
    <div className="bg-[#F7F7F7] p-4 lg:p-8 rounded-xl  h-full">
      <Text className="xl:text-[32px] font-medium  mb-6">
        Prefer a Direct Approach
      </Text>

      <div>
        <div className="space-y-2 md:space-y-1">
          <div className="flex items-start md:items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              {isLoading ? (
                <div className="h-5 w-52 bg-gray-200 rounded animate-pulse" />
              ) : (
                <div className="space-y-1 flex flex-col md:flex-row gap-1">
                  {phoneNumbers.length > 0 ? (
                    phoneNumbers.map((phone, index) => (
                      <a
                        key={index}
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="block text-secondary-foreground hover:text-secondary transition-colors"
                      >
                        {phone} {index < phoneNumbers.length - 1 && ","}
                      </a>
                    ))
                  ) : (
                    <p className="text-secondary-foreground">N/A</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start md:items-start gap-3">
            <Mail className="w-7 h-7 text-primary" />
            <div>
              {isLoading ? (
                <div className="h-5 w-60 bg-gray-200 rounded animate-pulse" />
              ) : (
                <div className="space-y-1 flex flex-col md:flex-row gap-1  flex-wrap">
                  {emailAddresses.length > 0 ? (
                    emailAddresses.map((email, index) => (
                      <a
                        key={index}
                        href={`mailto:${email}`}
                        className="block text-secondary-foreground hover:text-secondary transition-colors"
                      >
                        {email}
                        {index < emailAddresses.length - 1 && ","}
                      </a>
                    ))
                  ) : (
                    <p className="text-secondary-foreground">N/A</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start md:items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              {isLoading ? (
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-secondary-foreground">
                  {officeHour || "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden mt-11">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d442431.41877501836!2d89.34425321085136!3d23.587901733263056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fe3abc5408746f%3A0xe13ecbbc5c1a8e36!2sHappy%20Hospital%20%26%20Diagnostic%20Center!5e1!3m2!1sen!2sbd!4v1768887044282!5m2!1sen!2sbd"
            width="100%"
            height="347"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Hospital Location"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
