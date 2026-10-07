import { hotel } from "@/src/data/hotels";
import LocationCard from "@/src/components/hotel/shared/LocationCard";
import SectionHeading from "./SectionHeading";

export default function LocationSection() {
  return (
    <section id="location" className="container scroll-mt-24 py-10">
      <SectionHeading
        title="Location"
        subtitle={`On Marine Drive, ${hotel.nearby[0]?.distance ?? ""} from ${hotel.nearby[0]?.name ?? "the beach"}.`}
      />
      <div className="mt-6">
        <LocationCard hotel={hotel} />
      </div>
    </section>
  );
}
