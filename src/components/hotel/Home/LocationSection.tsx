import { hotel } from "@/src/data/hotels";
import MapCard from "@/src/components/hotel/HotelDetails/MapCard";
import NearbySpots from "@/src/components/hotel/HotelDetails/NearbySpots";
import SectionHeading from "./SectionHeading";

export default function LocationSection() {
  return (
    <section id="location" className="container scroll-mt-24 py-10">
      <SectionHeading
        title="Location"
        subtitle={`On Marine Drive, ${hotel.nearby[0]?.distance ?? ""} from ${hotel.nearby[0]?.name ?? "the beach"}.`}
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <MapCard address={hotel.address} />
        <NearbySpots nearby={hotel.nearby} />
      </div>
    </section>
  );
}
