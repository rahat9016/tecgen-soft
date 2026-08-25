import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import NavBar from "./NavBar";

export default function StoreHeader() {
  return (
    <header className="sticky top-0 z-40">
      <TopBar />
      <MainHeader />
      <NavBar />
    </header>
  );
}
