import Image from "next/image";

export default function MembershipSuccessContent({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="w-full flex items-center justify-center px-4 py-10 animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="w-101.5 rounded-2xl bg-white px-6 py-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-white text-6xl font-semibold">
          <Image
            src="/icons/roundTick.svg"
            alt="Success"
            width={100}
            height={100}
          />
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-[#0EA5A8]">{title}</h3>
        <p className="mt-3 text-base text-secondary-gary">{description}</p>
      </div>
    </div>
  );
}
