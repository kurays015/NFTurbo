"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Confetti from "react-confetti";

import { Button } from "./ui/button";
import { useMagicEdenNFTData } from "../hooks/useMagicEdenNFTData";
import isValidAddress from "../lib/isValidAddress";
import { NEXT_PUBLIC_CONTRACT_ADDRESS } from "../lib/contractAddress";
import { NFTTransferABI } from "../lib/abi";
import RaceTrack from "./RaceTrack";
import NFTSelector from "./NFTSelector";
import WinnerCountSelector from "./WinnerCountSelector";
import AddressInput from "./AddressInput";
import WinnerDisplay from "./WinnerDisplay";
import NFTDisplay from "./NFTDisplay";

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
    isError,
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
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl text-white">Loading NFTs...</h1>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
          <h1 className="text-2xl text-red-400">
            Error loading NFTs: {error.message}
          </h1>
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
          <RaceTrack
            raceParticipants={raceParticipants}
            racePositions={racePositions}
            lanePositions={lanePositions}
            raceInProgress={raceInProgress}
            raceWinnerIdx={raceWinnerIdx}
          />
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

          <div className="grid grid-cols-2 gap-4 mt-10">
            {/* NFT Selection */}
            <NFTSelector
              filteredNFTs={filteredNFTs}
              selectedIdx={selectedIdx}
              setSelectedIdx={setSelectedIdx}
            />
            {/* Winner Count */}
            <WinnerCountSelector
              winnerCount={winnerCount}
              setWinnerCount={setWinnerCount}
              tokenCount={tokenCount}
              validAddresses={validAddresses}
            />
          </div>

          <div className="lg:col-span-1 space-y-6 my-10">
            {/* Address Input */}
            <AddressInput
              addressInput={addressInput}
              setAddressInput={setAddressInput}
              validAddresses={validAddresses}
              uniqueAddresses={uniqueAddresses}
            />
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
              <WinnerDisplay
                winners={winners}
                transferingTo={transferingTo}
                isApprovalTxSuccess={isApprovalTxSuccess}
                isTransferPending={isTransferPending}
                isTransferTxLoading={isTransferTxLoading}
                handleTransfer={handleTransfer}
                transferError={transferError}
              />
            )}
            {/* NFT Display */}
            <NFTDisplay
              selectedNFT={selectedNFT}
              isApprovalTxSuccess={isApprovalTxSuccess}
              isApprovePending={isApprovePending}
              isApprovalTxLoading={isApprovalTxLoading}
              approveError={approveError}
              handleApprove={handleApprove}
              winners={winners}
              isTransferTxSuccess={isTransferTxSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
