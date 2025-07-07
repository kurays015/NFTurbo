"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Confetti from "react-confetti";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useMagicEdenNFTData } from "../hooks/useMagicEdenNFTData";
import isValidAddress from "../lib/isValidAddress";
import { NEXT_PUBLIC_CONTRACT_ADDRESS } from "../lib/contractAddress";
import { NFTTransferABI } from "../lib/abi";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const baseCharacters = [
  "/chog.png",
  "/fishnad.png",
  "/molandak.png",
  "/salmonad.png",
];

export default function NFTRaffleRace() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [addressInput, setAddressInput] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [transferingTo, setTransferringTo] = useState<string | null>(null);
  const { address: userAddress } = useAccount();
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [racePositions, setRacePositions] = useState<number[]>([]);
  const [raceWinnerIdx, setRaceWinnerIdx] = useState<number | null>(null);
  const [raceParticipants, setRaceParticipants] = useState<
    {
      address: string;
      character: string;
    }[]
  >([]);
  const raceInterval = useRef<NodeJS.Timeout | null>(null);

  const {
    data: nfts,
    error,
    isLoading,
    refetch: refetchNFTs,
  } = useMagicEdenNFTData(userAddress as `0x${string}`);

  // Memoized filtered NFTs
  const filteredNFTs = useMemo(() => {
    return nfts?.tokens.filter(token => token.token.tokenId !== "0") || [];
  }, [nfts?.tokens]);

  const selectedNFT = filteredNFTs?.[selectedIdx]?.token;
  const tokenCount = Number(filteredNFTs?.[selectedIdx]?.ownership.tokenCount);

  // Approve contract to transfer all NFTs
  const {
    writeContract: writeApprove,
    data: approveData,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApprovalTxLoading, isSuccess: isApprovalTxSuccess } =
    useWaitForTransactionReceipt({
      hash: approveData,
      query: { enabled: !!approveData },
    });

  // Transfer NFT
  const {
    writeContract: writeTransfer,
    data: transferData,
    isPending: isTransferPending,
    error: transferError,
  } = useWriteContract();

  const { isLoading: isTransferTxLoading, isSuccess: isTransferTxSuccess } =
    useWaitForTransactionReceipt({
      hash: transferData,
      query: { enabled: !!transferData },
    });

  // Memoized address parsing/validation
  const parsedAddresses = useMemo(
    () =>
      addressInput
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0),
    [addressInput]
  );

  const uniqueAddresses = useMemo(
    () => Array.from(new Set(parsedAddresses)),
    [parsedAddresses]
  );

  const validAddresses = useMemo(
    () => uniqueAddresses.filter(isValidAddress),
    [uniqueAddresses]
  );

  const canPickWinners =
    validAddresses.length >= 2 &&
    winnerCount >= 1 &&
    winnerCount <= validAddresses.length;

  // Generate characters for participants
  const generateRaceCharacters = (numParticipants: number) => {
    const characters = [];
    for (let i = 0; i < numParticipants; i++) {
      characters.push(baseCharacters[i % baseCharacters.length]);
    }
    return characters;
  };

  // Calculate lane positions for centering
  const calculateLanePositions = (numParticipants: number) => {
    const trackCenterY = 150;
    let spacing = 45;

    if (numParticipants <= 4) {
      spacing = 45;
    } else if (numParticipants <= 20) {
      spacing = 15; // much closer
    } else if (numParticipants <= 100) {
      spacing = 2; // almost overlapping
    } else if (numParticipants <= 1000) {
      spacing = 0; // overlap
    } else {
      spacing = -2; // heavy overlap
    }

    const totalHeight = (numParticipants - 1) * spacing;
    const startY = trackCenterY - totalHeight / 2;

    return Array.from(
      { length: numParticipants },
      (_, i) => startY + i * spacing
    );
  };

  // Approve handler (setApprovalForAll)
  const handleApprove = () => {
    if (!selectedNFT || !NEXT_PUBLIC_CONTRACT_ADDRESS) return;
    writeApprove({
      address: selectedNFT.contract as `0x${string}`,
      abi: NFTTransferABI,
      functionName: "setApprovalForAll",
      args: [NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`, true],
    });
  };

  // Transfer handler
  const handleTransfer = (winner: string) => {
    if (!selectedNFT || !winner) return;
    setTransferringTo(winner);
    writeTransfer({
      address: NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: NFTTransferABI,
      functionName: "transferNFT",
      args: [
        selectedNFT.contract as `0x${string}`,
        BigInt(selectedNFT.tokenId),
        winner as `0x${string}`,
      ],
    });
  };

  // Start the race
  const handleStartRace = () => {
    if (!canPickWinners) return;
    setWinners([]);
    setShowConfetti(false);
    setRaceWinnerIdx(null);

    const numParticipants = validAddresses.length;
    const raceCharacters = generateRaceCharacters(numParticipants);

    // Shuffle addresses for random assignment
    const shuffledAddresses = [...validAddresses].sort(
      () => Math.random() - 0.5
    );

    // Create race participants
    const participants = shuffledAddresses.map((address, index) => ({
      address,
      character: raceCharacters[index],
    }));

    setRaceParticipants(participants);
    setRacePositions(new Array(participants.length).fill(0));
    setRaceInProgress(true);
  };

  // Race animation effect
  useEffect(() => {
    if (!raceInProgress || raceParticipants.length === 0) return;

    setShowConfetti(false);
    setRaceWinnerIdx(null);
    if (raceInterval.current) clearInterval(raceInterval.current);

    const finish = 900;
    const minStep = 3;
    const maxStep = 8;
    const tickMs = 80;

    raceInterval.current = setInterval(() => {
      setRacePositions(prev => {
        const newPositions = prev.map(pos => {
          if (pos >= finish) return finish;
          return Math.min(
            pos + Math.floor(Math.random() * (maxStep - minStep + 1) + minStep),
            finish
          );
        });

        // Find winner
        const winnerIdx = newPositions.findIndex(pos => pos >= finish);

        if (winnerIdx !== -1) {
          setRaceWinnerIdx(winnerIdx);
          setRaceInProgress(false);
          setShowConfetti(true);
          if (raceInterval.current) clearInterval(raceInterval.current);
          setWinners([raceParticipants[winnerIdx].address]);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        return newPositions;
      });
    }, tickMs);

    return () => clearInterval(raceInterval.current!);
  }, [raceInProgress, raceParticipants]);

  // After transfer, reset raffle state
  useEffect(() => {
    if (isTransferTxSuccess) {
      refetchNFTs();
      setTransferringTo(null);
      setWinners([]);
      setAddressInput("");
      setWinnerCount(1);
      setRaceParticipants([]);
      setRacePositions([]);
    }
  }, [isTransferTxSuccess, refetchNFTs]);

  // Early returns for loading, error, or no NFTs
  if (isLoading || !nfts?.tokens.length)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl text-white">Loading NFTs...</h1>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
          <h1 className="text-2xl text-red-400">
            Error loading NFTs: {error.message}
          </h1>
        </div>
      </div>
    );

  if (!nfts || !nfts.tokens.length || !filteredNFTs || !filteredNFTs.length)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center p-8 bg-slate-800/50 border border-slate-600/50 rounded-lg">
          <h1 className="text-2xl text-gray-400">No NFTs found...</h1>
        </div>
      </div>
    );

  // Calculate lane positions for current participants
  const lanePositions = calculateLanePositions(raceParticipants.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 text-gray-100 relative">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              NFT Raffle Race
            </h1>
            <p className="text-gray-400 mt-2">
              Race your NFTs to random winners!
            </p>
          </div>
          <ConnectButton />
        </div>

        <div className="">
          {/* Race Track */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">
              🏁 Race Track
            </h3>

            <div className="relative w-full">
              <div
                className="relative mx-auto"
                style={{
                  width: "100%",
                  maxWidth: "1000px",
                  height: "300px",
                  backgroundImage: "url(/racetrack.png)",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  borderRadius: "12px",
                  border: "3px solid #8b5cf6",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                }}
              >
                {/* Character Lanes */}
                {raceParticipants.map((participant, i) => {
                  const trackWidth = 900;
                  const startOffset = 40;
                  const endOffset = 60;
                  const availableWidth = trackWidth - startOffset - endOffset;

                  const progress = (racePositions[i] / 900) * availableWidth;
                  const isAtFinish = racePositions[i] >= 900;

                  // Dynamically scale avatar size based on participant count
                  const avatarSize =
                    raceParticipants.length >= 1000
                      ? 6
                      : raceParticipants.length >= 100
                        ? 9
                        : raceParticipants.length >= 20
                          ? 14
                          : raceParticipants.length >= 5
                            ? 75
                            : 60;

                  return (
                    <div
                      key={`${participant.address}-${i}`}
                      className="absolute flex items-center"
                      style={{
                        top: `${lanePositions[i]}px`,
                        left: `${startOffset + Math.min(progress, availableWidth)}px`,
                        transition: raceInProgress
                          ? "left 0.05s linear"
                          : "left 0.3s ease-out",
                        opacity: isAtFinish && raceWinnerIdx !== i ? 0.3 : 1,
                        zIndex: 10,
                      }}
                    >
                      <div className="relative">
                        <Image
                          src={participant.character}
                          alt={`Character ${i + 1}`}
                          width={avatarSize}
                          height={avatarSize}
                          className={`object-contain ${
                            raceWinnerIdx === i
                              ? "animate-bounce scale-110"
                              : ""
                          }`}
                          style={{
                            filter:
                              raceWinnerIdx === i
                                ? "drop-shadow(0 0 15px gold) brightness(1.2)"
                                : raceInProgress
                                  ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                          }}
                        />
                        {raceWinnerIdx === i && (
                          <div className="absolute -top-2 -right-2 text-yellow-400 text-lg animate-pulse">
                            👑
                          </div>
                        )}
                      </div>

                      {/* Address Label */}
                      <div
                        className={`ml-1 px-1 py-1 rounded-full text-xs font-mono border transition-all duration-300 ${
                          raceWinnerIdx === i
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-300 scale-105 shadow-lg"
                            : "bg-slate-900/80 text-purple-200 border-purple-600/50"
                        }`}
                        style={{
                          fontSize:
                            raceParticipants.length >= 5 ? "10px" : "12px",
                          padding:
                            raceParticipants.length >= 5
                              ? "2px 4px"
                              : "4px 8px",
                        }}
                      >
                        {participant.address.slice(0, 4)}...
                        {participant.address.slice(-3)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Race Button */}
            <Button
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-10 mb-4"
              disabled={!canPickWinners || raceInProgress}
              onClick={handleStartRace}
            >
              {raceInProgress ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Racing in Progress...
                </span>
              ) : (
                "🏁 Start Race!"
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {/* NFT Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <Label
                htmlFor="nft-select"
                className="block mb-3 font-semibold text-purple-300"
              >
                Select NFT to Raffle
              </Label>
              <Select
                value={String(selectedIdx)}
                onValueChange={(value: string) => setSelectedIdx(Number(value))}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choose NFT" />
                </SelectTrigger>
                <SelectContent>
                  {filteredNFTs.map((item, idx) => (
                    <SelectItem
                      key={item.token.tokenId + item.token.contract}
                      value={String(idx)}
                    >
                      {item.token.name || `#${item.token.tokenId}`}
                      {item.token.collection?.name &&
                        ` - ${item.token.collection.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Winner Count */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <Label
                htmlFor="winner-count"
                className="block mb-3 font-semibold text-purple-300"
              >
                Number of Winners
              </Label>
              <Select
                value={String(winnerCount)}
                onValueChange={(value: string) => setWinnerCount(Number(value))}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select winners count" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    {
                      length: Math.min(tokenCount, validAddresses.length) || 1,
                    },
                    (_, i) => i + 1
                  ).map(num => (
                    <SelectItem key={num} value={String(num)}>
                      {num} Winner{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6 my-10">
            {/* Address Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <Label
                htmlFor="addresses"
                className="block mb-3 font-semibold text-purple-300"
              >
                Participant Addresses
              </Label>
              <Textarea
                id="addresses"
                className="w-full bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                rows={4}
                placeholder="Enter wallet addresses separated by commas:
0x1234..., 0x5678..., 0x9abc..."
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
              />
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-green-400">
                  {validAddresses.length} valid addresses
                </span>
                <span className="text-gray-400">
                  {uniqueAddresses.length} total entries
                </span>
              </div>
              {uniqueAddresses.length !== validAddresses.length && (
                <div className="text-amber-400 text-sm mt-2 flex items-center gap-2">
                  <span>⚠️</span>
                  Some addresses are invalid and will be ignored
                </div>
              )}
            </div>

            {validAddresses.length < 2 && (
              <div className="text-amber-400 text-sm text-center">
                Need at least 2 valid addresses to start race
              </div>
            )}
          </div>

          {/* Right Panel - Race Track & NFT Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Winner Display */}
            {winners.length > 0 && (
              <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-xl border border-green-500/50 p-6">
                <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                  🎉 Winner{winners.length > 1 ? "s" : ""}
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
                        className="bg-green-600 hover:bg-green-700 text-white font-medium"
                        disabled={
                          !isApprovalTxSuccess ||
                          isTransferPending ||
                          isTransferTxLoading ||
                          transferingTo === winner
                        }
                        onClick={() => handleTransfer(winner)}
                      >
                        {transferingTo === winner &&
                        (isTransferPending || isTransferTxLoading)
                          ? "Transferring..."
                          : "Transfer NFT"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NFT Display */}
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
                {!isApprovalTxSuccess ||
                  (!winners.length && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 font-medium"
                      disabled={
                        isApprovePending ||
                        isApprovalTxLoading ||
                        !selectedNFT ||
                        !validAddresses.length
                      }
                      onClick={handleApprove}
                    >
                      {isApprovePending || isApprovalTxLoading
                        ? "Approving..."
                        : "Approve NFT Transfer"}
                    </Button>
                  ))}

                {/* Status Messages */}
                <div className="mt-4 space-y-2">
                  {approveError && (
                    <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/50 rounded">
                      Approval Error: {approveError.message}
                    </div>
                  )}
                  {transferError && (
                    <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/50 rounded">
                      Transfer Error: {transferError.message}
                    </div>
                  )}
                  {isApprovalTxSuccess && (
                    <div className="text-green-400 text-sm p-3 bg-green-900/20 border border-green-500/50 rounded">
                      ✅ Approval successful! You can now transfer NFTs to
                      winners.
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
          </div>
        </div>
      </div>
    </div>
  );
}
