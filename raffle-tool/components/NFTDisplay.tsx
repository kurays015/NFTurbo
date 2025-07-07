import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";

interface NFTDisplayProps {
  selectedNFT: {
    image?: string | null;
    name?: string | null;
    tokenId?: string;
    collection?: { name?: string | null };
    description?: string | null;
  } | null;
  isApprovalTxSuccess: boolean;
  isApprovePending: boolean;
  isApprovalTxLoading: boolean;
  approveError: Error | null;
  handleApprove: () => void;
  winners: string[];
  isTransferTxSuccess: boolean;
}

const NFTDisplay: React.FC<NFTDisplayProps> = ({
  selectedNFT,
  isApprovalTxSuccess,
  isApprovePending,
  isApprovalTxLoading,
  approveError,
  handleApprove,
  winners,
  isTransferTxSuccess,
}) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">
      Selected NFT
    </h3>
    <div className="flex flex-col items-center">
      {selectedNFT?.image && (
        <div className="relative mb-4">
          <Image
            width={200}
            height={200}
            src={selectedNFT.image}
            alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`}
            className="w-48 h-48 object-cover rounded-lg border-2 border-purple-500/50 shadow-lg"
          />
        </div>
      )}
      <div className="text-center space-y-2">
        <div className="text-xl font-bold text-white">
          {selectedNFT?.name || `NFT #${selectedNFT?.tokenId}`}
        </div>
        <div className="text-purple-300">
          {selectedNFT?.collection?.name || "Unknown Collection"}
        </div>
        <div className="text-gray-400 text-sm">
          Token ID: {selectedNFT?.tokenId}
        </div>
        {selectedNFT?.description && (
          <div className="text-gray-500 text-sm max-w-md mx-auto">
            {selectedNFT.description}
          </div>
        )}
      </div>
    </div>
    {/* Approval Section */}
    <div className="mt-6 pt-6 border-t border-slate-700">
      {winners.length > 0 && !isTransferTxSuccess && !isApprovalTxSuccess && (
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 font-medium"
          disabled={isApprovePending || isApprovalTxLoading || !selectedNFT}
          onClick={handleApprove}
        >
          {isApprovePending || isApprovalTxLoading
            ? "Approving..."
            : "Approve NFT Transfer"}
        </Button>
      )}
      {/* Status Messages */}
      <div className="mt-4 space-y-2">
        {approveError && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/50 rounded">
            Approval Error: {approveError.message}
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
        )}
      </div>
    </div>
  </div>
);

export default NFTDisplay;
