import Image from "next/image";

export default function AdmissionPaymentGuide() {
  return (
    <div className="pt-10 lg:pt-25 pb-10 lg:pb-32">
      <Image
        src="/patient/admission.png"
        alt="Admission & Payment Guide"
        width={6160}
        height={4332}
      />
    </div>
  );
}
