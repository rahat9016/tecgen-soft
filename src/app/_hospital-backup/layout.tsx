import InternetStatus from "@/src/components/InternetStatus";
import Footer from "@/src/components/layout/rootLayout/Footer";
import Header from "@/src/components/layout/rootLayout/Header/Header";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <InternetStatus />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
