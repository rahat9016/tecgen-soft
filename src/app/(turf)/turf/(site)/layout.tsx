import TurfFooter from "@/src/components/turf/TurfFooter";
import TurfHeader from "@/src/components/turf/TurfHeader";

export default function TurfSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <TurfHeader />
      {children}
      <TurfFooter />
    </div>
  );
}
