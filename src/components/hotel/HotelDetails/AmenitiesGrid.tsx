import {
  Wifi,
  Waves,
  Utensils,
  Wind,
  ParkingCircle,
  Heart,
  Users,
  Mountain,
  Sunrise,
  Dumbbell,
  Car,
  Phone,
  Building2,
  Flame,
  Trees,
  Bath,
  CheckCircle2,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Free WiFi": Wifi,
  "Swimming Pool": Waves,
  "Free Breakfast": Utensils,
  "AC Rooms": Wind,
  "Free Parking": ParkingCircle,
  "Couple Friendly": Heart,
  "Family Friendly": Users,
  "Sea View": Waves,
  "Mountain View": Mountain,
  "Nature View": Trees,
  "24/7 Room Service": Phone,
  "Beach Access": Sunrise,
  Gym: Dumbbell,
  "Airport Shuttle": Car,
  "Conference Room": Building2,
  "Bonfire Area": Flame,
  "Eco Friendly": Trees,
  Garden: Trees,
  Balcony: Building2,
  "Trekking Guide": Mountain,
  Jacuzzi: Bath,
};

export default function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {amenities.map((amenity) => {
        const Icon = iconMap[amenity] ?? CheckCircle2;
        return (
          <div key={amenity} className="flex items-center gap-2 text-sm text-neutral-700">
            <Icon className="size-4 shrink-0 text-sky-600" />
            {amenity}
          </div>
        );
      })}
    </div>
  );
}
