import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-950/80 to-purple-950/80 backdrop-blur-md shadow-lg border-b border-purple-800/30">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 max-w-6xl">
        <div className="flex items-center gap-3">
          <Image src="/monad-logo.svg" alt="Logo" height={50} width={50} />
          <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent tracking-tight">
            NFT&apos;s Raffle Race Royale
          </span>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
