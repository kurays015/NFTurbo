import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import { RaffleSetup } from "@/components/RaffleSetup";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NFTurbo",
  description:
    "NFTurbo is a Web3 racing game built on the Monad blockchain, where NFTs are more than collectibles—they're the prize. Players compete in fast-paced, winner-takes-all races. One wallet crosses the finish line, and the winning address receives a rare NFT. No luck—just pure digital adrenaline. Connect. Race. Win.",
  creator: "Kurays",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-monad relative `}>
        <Providers>
          <main>
            <Header />
            {children}
            <div className="fixed -translate-x-1/2 -translate-y-1/2 bottom-4 left-1/2 z-50">
              <RaffleSetup />
            </div>
          </main>
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 8000,
            unstyled: true,
          }}
        />
      </body>
    </html>
  );
}
