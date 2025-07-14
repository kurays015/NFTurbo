"use client";

import { useEffect } from "react";
import { Button } from "./ui/button";
import { useRaffleContext } from "@/context/raffle-context";

export default function WinnerDisplay() {
  const {
    isApprovalTxSuccess,
    isApprovePending,
    isApprovalTxLoading,
    isTransferTxLoading,
    handleApprove,
    handleTransfer,
    selectedNFT,
    transferError,
    winners,
    isTransferPending,
    refetchTokens,
    refetchCollections,
    setWinners,
    setWinnerCount,
    setRaceParticipants,
    setRacePositions,
    setAddressInput,
    isTransferTxSuccess,
  } = useRaffleContext();

  useEffect(() => {
    if (isTransferTxSuccess) {
      refetchTokens();
      refetchCollections();
      setWinners([]);
      setAddressInput("");
      setWinnerCount(1);
      setRaceParticipants([]);
      setRacePositions([]);
      setAddressInput("");
    }
  }, [
    isTransferTxSuccess,
    refetchTokens,
    refetchCollections,
    setWinners,
    setAddressInput,
    setWinnerCount,
    setRaceParticipants,
    setRacePositions,
  ]);

  // Button label logic
  let buttonLabel = "Approve NFT Transfer";
  if (isTransferPending || isTransferTxLoading) {
    buttonLabel = "Transferring...";
  } else if (isApprovePending || isApprovalTxLoading) {
    buttonLabel = "Approving...";
  } else if (isApprovalTxSuccess) {
    buttonLabel = "Transfer NFT";
  }

  return (
    <>
      {winners.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-xl border border-green-500/50 p-6">
          <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
            🎉 Winner{winners.length > 1 ? "s" : ""} of{" "}
            {selectedNFT?.token.name}
          </h3>
          <div className="space-y-3">
            {winners.map((winner, index) => (
              <div
                key={winner}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 border border-green-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-black">
                    {index + 1}
                  </div>
                  <span className="font-mono text-green-300 text-sm">
                    {winner}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium disabled:cursor-not-allowed"
                  disabled={
                    isApprovePending ||
                    isApprovalTxLoading ||
                    (isApprovalTxSuccess
                      ? isTransferPending || isTransferTxLoading
                      : !selectedNFT)
                  }
                  onClick={() =>
                    isApprovalTxSuccess
                      ? handleTransfer(winner)
                      : handleApprove()
                  }
                >
                  {buttonLabel}
                </Button>
              </div>
            ))}

            {transferError && (
              <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/50 rounded">
                <p className="break-words overflow-hidden">
                  <span className="font-semibold">Transfer Error:</span> The NFT
                  is not transferable (soulbound NFT).
                </p>
                {transferError.message && (
                  <p className="break-words overflow-hidden mt-2 text-xs opacity-80">
                    {transferError.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
