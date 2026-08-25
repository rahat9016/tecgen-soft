import Image from "next/image";
import Paragraph from "../../shared/Paragraph";
import Text from "../../shared/Text";

export default function MRCPSection() {
  return (
    <div className="mb-10 lg:mb-14 xl:mb-25">
      <Text className="xl:text-[44px] mb-6 lg:mb-10">
        The first MRCP (UK) PACES examination Center in Bangladesh
      </Text>
      <Image
        src="/career/mrcp.jpg"
        alt="MRCP Section"
        width={1539}
        height={600}
        className="w-full h-auto"
      />
      <Paragraph className="mt-6 ">
        Evercare Hospital Dhaka has been chosen as the first MRCP (UK) PACES
        examination center in Bangladesh, marking a significant achievement in
        medical education. This recognition allows Evercare Hospital Dhaka to
        host the prestigious Membership of the Royal Colleges of Physicians
        (MRCP) Practical Assessment of Clinical Examination Skills (PACES)
        exams. As a result, local and regional doctors can now complete this
        vital qualification without traveling abroad, reducing costs and
        logistical challenges. The initiative reflects Evercare&apos;s
        commitment to enhancing medical training and improving healthcare
        standards. It also strengthens the hospital’s reputation as a center for
        excellence in clinical education. This development benefits both
        aspiring physicians and the healthcare system as a whole.
      </Paragraph>
    </div>
  );
}
