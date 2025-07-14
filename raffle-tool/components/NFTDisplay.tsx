import React from "react";
import Image from "next/image";
import { useRaffleContext } from "@/context/raffle-context";

export default function NFTDisplay() {
  const {
    userTokenNFTs,
    isTokensLoading,
    isTokensError,
    tokensError,
    selectedNFT,
    selectedTokenIdx,
    setSelectedTokenIdx,
    raceInProgress,
  } = useRaffleContext();

  if (isTokensLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  if (isTokensError) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="text-center p-4 bg-red-900/20 border border-red-500/50 rounded">
          <p className="text-red-400 break-words overflow-hidden">
            Error loading NFTs: {tokensError?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedNFT) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="text-center">
          <p className="text-gray-400">Select an NFT Collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 ">
      {/* NFT Selection Grid Only: Image + Token ID */}
      {userTokenNFTs.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {userTokenNFTs.map((token, idx) => (
            <button
              type="button"
              key={token.token.tokenId}
              className={`disabled:cursor-not-allowed rounded-lg border-2 p-1 md:p-2 transition-all duration-150 hover:scale-[1.04] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
                selectedTokenIdx === idx
                  ? "border-pink-500 bg-slate-700/80"
                  : "border-slate-700 bg-slate-800/50"
              }`}
              onClick={() => setSelectedTokenIdx(idx)}
              disabled={raceInProgress}
            >
              <Image
                width={72}
                height={72}
                src={
                  token.token.image ||
                  token.token.imageSmall ||
                  token.token.imageLarge ||
                  "/placeholder.png"
                }
                alt={`NFT #${token.token.tokenId}`}
                className="w-full h-20 md:h-24 object-contain rounded mb-1 md:mb-2 text-white"
              />
              <div className="text-center text-[10px] md:text-xs text-purple-300 truncate">
                #{token.token.tokenId}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
