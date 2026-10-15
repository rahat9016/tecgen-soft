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
  Tv,
  Refrigerator,
  Coffee,
  ShowerHead,
  Shirt,
  Lock,
  Sofa,
  BellRing,
  CigaretteOff,
  Accessibility,
  PawPrint,
  Baby,
  Microwave,
  Sparkles,
  Laptop,
  Zap,
  Droplets,
  BedDouble,
  KeyRound,
  Flower2,
  WashingMachine,
  Fan,
  Wine,
  Sun,
  AlarmClock,
  Briefcase,
} from "lucide-react";

export const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Free WiFi": Wifi,
  "Swimming Pool": Waves,
  "Free Breakfast": Utensils,
  "AC Rooms": Wind,
  AC: Wind,
  "Breakfast Included": Utensils,
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
  Bathtub: Bath,
  "Garden View": Trees,
  "Smart TV": Tv,
  "Mini Fridge": Refrigerator,
  "Tea & Coffee Maker": Coffee,
  "Hot Water": Droplets,
  "Rain Shower": ShowerHead,
  "Hair Dryer": Wind,
  "Free Toiletries": Sparkles,
  Bathrobe: Shirt,
  "In-room Safe": Lock,
  "Sofa / Sitting Area": Sofa,
  "Work Desk": Laptop,
  "Extra Bed on Request": BedDouble,
  "Baby Cot": Baby,
  Microwave: Microwave,
  "Ceiling Fan": Fan,
  "Mini Bar": Wine,
  "Power Backup": Zap,
  "Wake-up Call": AlarmClock,
  "Daily Housekeeping": Sparkles,
  "Laundry Service": WashingMachine,
  "Ironing Service": Shirt,
  "Key Card Access": KeyRound,
  "Room Service Bell": BellRing,
  "Non-smoking": CigaretteOff,
  "Wheelchair Accessible": Accessibility,
  "Pet Friendly": PawPrint,
  "Pool View": Waves,
  "City View": Building2,
  "Sunrise View": Sun,
  "Private Terrace": Flower2,
  "Business Centre": Briefcase,
};

export default function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {amenities.map((amenity) => {
        const Icon = amenityIcons[amenity] ?? CheckCircle2;
        return (
          <div
            key={amenity}
            className="flex items-center gap-3 rounded-md border border-neutral-200/70 bg-white p-3 text-sm font-medium text-neutral-700"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <Icon className="size-4" />
            </span>
            {amenity}
          </div>
        );
      })}
    </div>
  );
}
