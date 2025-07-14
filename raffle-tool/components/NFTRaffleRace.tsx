"use client";

import { useRaffleContext } from "@/context/raffle-context";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Confetti from "react-confetti";
import { Button } from "./ui/button";
import RaceTrack from "./RaceTrack";
import NFTSelector from "./NFTSelector";
import WinnerCountSelector from "./WinnerCountSelector";
import AddressInput from "./AddressInput";
import WinnerDisplay from "./WinnerDisplay";
import NFTDisplay from "./NFTDisplay";
import { useEffect } from "react";
import calculateLanePositions from "@/lib/calculateLanePositions";

export default function NFTRaffleRace() {
  const {
    setAddressInput,
    setWinnerCount,
    winners,
    setWinners,
    showConfetti,
    setShowConfetti,
    setTransferringTo,
    userAddress,
    raceInProgress,
    setRaceInProgress,
    racePositions,
    setRacePositions,
    raceWinnerIdx,
    setRaceWinnerIdx,
    raceParticipants,
    setRaceParticipants,
    raceInterval,
    audioRef,
    validAddresses,
    selectedNFT,
    tokenCount,
    isCollectionsLoading,
    isCollectionsError,
    collectionsError,
    isTransferTxSuccess,
    handleStartRace,
    canPickWinners,
    refetchCollections,
    refetchTokens,
  } = useRaffleContext();

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
  }, [
    raceInProgress,
    raceParticipants,
    setRacePositions,
    setRaceWinnerIdx,
    setShowConfetti,
    setWinners,
    raceInterval,
    setRaceInProgress,
  ]);

  // Stop music when race ends
  useEffect(() => {
    if (!raceInProgress && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [raceInProgress, audioRef]);

  // After transfer, reset raffle state
  useEffect(() => {
    if (isTransferTxSuccess) {
      refetchTokens();
      refetchCollections();
      setTransferringTo(null);
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
    setTransferringTo,
    setWinners,
    setAddressInput,
    setWinnerCount,
    setRaceParticipants,
    setRacePositions,
  ]);

  // Calculate lane positions for current participants
  const lanePositions = calculateLanePositions(raceParticipants.length);

  // Early returns for loading, error, or no collections
  if (isCollectionsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl text-white">Loading Collections...</h1>
        </div>
      </div>
    );

  if (isCollectionsError)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg max-w-2xl mx-4">
          <h1 className="text-2xl text-red-400 break-words overflow-hidden">
            Error loading collections: {collectionsError?.message}
          </h1>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 text-gray-100 relative">
      {/* Background music for race */}
      <audio ref={audioRef} src="/mingle.mp3" preload="auto" />
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
            disabled={
              !userAddress || !canPickWinners || raceInProgress || !selectedNFT
            }
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
          {!selectedNFT && (
            <div className="text-amber-400 text-sm text-center mt-2">
              Please select an NFT to raffle.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-10">
            {/* NFT Selection */}
            <NFTSelector />
            {/* Winner Count */}
            <WinnerCountSelector tokenCount={Number(tokenCount)} />
          </div>

          <div className="lg:col-span-1 space-y-6 my-10">
            {/* Address Input */}
            <AddressInput />
            {validAddresses.length < 2 && (
              <div className="text-amber-400 text-sm text-center">
                Need at least 2 valid addresses to start race
              </div>
            )}
          </div>

          {/* Right Panel - Race Track & NFT Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Winner Display */}
            {winners.length > 0 && <WinnerDisplay />}
            {/* NFT Display */}
            {userAddress && <NFTDisplay />}
          </div>
        </div>
      </div>
    </div>
  );
}
