import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const body = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Mazad | Real auctions in Egypt",
  description: "Bid, buy and sell on auction in Egypt. Every bidder puts 1% down, so every bid is real.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} min-h-dvh pb-24 md:pb-0`}>
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">{children}</main>
      </body>
    </html>
  );
}
