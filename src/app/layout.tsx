import type { Metadata } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import "./globals.css";

import ToastProvider from "../components/shared/Toast/ToastProvider";
import QueryProvider from "../lib/react-query/QueryProvider";
import StoreProvider from "../lib/redux/provider/StoreProvider";
import { UserFetcher } from "./UserFetcher";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

// Bangla text (turf and hotel Bangla modes). Poppins has no Bengali glyphs, so the browser falls back to
// Hind Siliguri — made to pair with Poppins. Bengali subset only and not preloaded: it downloads only
// when a page actually shows Bangla.
const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Tecgen Soft - Web & Software Development Company in Bangladesh",
  description:
    "Tecgen Soft is a leading web and software development company in Bangladesh, providing innovative solutions for businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${bangla.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <StoreProvider>
          <QueryProvider>
            <ToastProvider>
              <UserFetcher />
              <main>{children}</main>
            </ToastProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
