import Text from "../../shared/Text";
import { IPurpose } from "../types";
import { purposeData } from "./purpose.data";
import PurposeCard from "./PurposeCard";

export default function PurposeCommitment() {
  return (
    <section className="container pt-10 lg:pt-16 xl:pt-25">
      <Text className="mb-6 lg:mb-10 xl:text-[44px]">
        Our Purpose & Commitment
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {purposeData.map((item: IPurpose, index: number) => (
          <PurposeCard key={item.title} {...item} reverse={index % 2 !== 0} />
        ))}
      </div>
    </section>
  );
}
