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
  } = useRaffleContext();
  if (isTokensLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (isTokensError) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="text-center p-4 bg-red-900/20 border border-red-500/50 rounded">
          <p className="text-red-400 break-words overflow-hidden">
            Error loading tokens: {tokensError?.message}
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

  console.log(selectedNFT.token.image, "image");

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">
        Selected NFT
      </h3>
      {/* NFT Selection Grid */}
      {userTokenNFTs.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {userTokenNFTs.map((token, idx) => (
              <div
                key={token.token.tokenId}
                className={`cursor-pointer rounded-lg border-2 p-2 transition-all ${
                  selectedTokenIdx === idx
                    ? "border-pink-500 bg-slate-700/80"
                    : "border-slate-700 bg-slate-800/50"
                }`}
                onClick={() => setSelectedTokenIdx(idx)}
              >
                <Image
                  width={100}
                  height={100}
                  src={
                    token.token.image ||
                    token.token.imageSmall ||
                    token.token.imageLarge ||
                    "/placeholder.png"
                  }
                  alt={token.token.name || `NFT #${token.token.tokenId}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="text-center text-sm text-white font-semibold">
                  {token.token.name || `NFT #${token.token.tokenId}`}
                </div>
                <div className="text-center text-xs text-purple-300 truncate">
                  Token ID: {token.token.tokenId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Section */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {/* {approveError && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/50 rounded">
              <p className="break-words overflow-hidden">
                Approval Error: {approveError.message}
              </p>
            </div>
          )}
          {isApprovalTxSuccess && (
            <div className="text-green-400 text-sm p-3 bg-green-900/20 border border-green-500/50 rounded">
              ✅ Approval successful! You can now transfer NFTs to winners.
            </div>
          )}
          {isTransferTxSuccess && (
            <div className="text-green-400 text-sm p-3 bg-green-900/20 border border-green-500/50 rounded">
              ✅ Transfer successful! NFT has been sent to the winner.
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
