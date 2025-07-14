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
  title: "NFT's Raffle Race Royale!",
  description: "NFT Raaffle Race on Monad Testnet",
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
