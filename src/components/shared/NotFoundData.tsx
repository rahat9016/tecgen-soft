import NotFound from "@/public/no-data-found.png";
import Image from "next/image";
export default function NotFoundData() {
  return (
    <div className="col-span-full text-center text-secondary-foreground border h-60 flex flex-col items-center justify-center rounded-lg gap-2 bg-gray-50 ">
      <Image
        src={NotFound}
        alt="not found data"
        width={512}
        height={512}
        className="w-40"
      />
      <p className="-ml-10 text-lg font-semibold">No data found</p>
    </div>
  );
}
