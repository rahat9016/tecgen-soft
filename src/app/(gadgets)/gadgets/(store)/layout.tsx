import GadgetHeader from "@/src/components/gadgets/GadgetHeader";
import GadgetFooter from "@/src/components/gadgets/GadgetFooter";
import ChatWidget from "@/src/components/gadgets/ChatWidget";

export default function GadgetStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GadgetHeader />
      {children}
      <GadgetFooter />
      <ChatWidget />
    </>
  );
}
