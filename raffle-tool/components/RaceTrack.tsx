"use client";

import { useRaffleContext } from "@/context/raffle-context";
import calculateLanePositions from "@/lib/calculateLanePositions";
import Image from "next/image";
import React, { useEffect } from "react";

export interface RaceParticipant {
  address: string;
  character: string;
}

export default function RaceTrack() {
  const {
    raceInProgress,
    raceParticipants,
    racePositions,
    raceWinnerIdx,
    setShowConfetti,
    setRaceWinnerIdx,
    raceInterval,
    setRaceInProgress,
    setWinners,
    setRacePositions,
  } = useRaffleContext();

  const lanePositions = calculateLanePositions(raceParticipants.length);

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

  return (
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
                      raceWinnerIdx === i ? "animate-bounce scale-110" : ""
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
                    fontSize: raceParticipants.length >= 5 ? "10px" : "12px",
                    padding:
                      raceParticipants.length >= 5 ? "2px 4px" : "4px 8px",
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
    </div>
  );
}
