"use client";

import { useRaffleContext } from "@/context/raffle-context";
import calculateLanePositions from "@/lib/calculateLanePositions";
import Image from "next/image";
import React, { useEffect, useState } from "react";

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

  const [trackDimensions, setTrackDimensions] = useState({
    width: 1000,
    height: 300,
  });

  const [animationFrame, setAnimationFrame] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showStartAnimation, setShowStartAnimation] = useState(false);

  const lanePositions = calculateLanePositions(raceParticipants.length);

  // Handle responsive track dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isLandscape = screenWidth > screenHeight;

      if (screenWidth < 640) {
        // Mobile
        if (isLandscape) {
          // Mobile landscape - optimize for width
          setTrackDimensions({
            width: Math.min(screenWidth - 32, 800),
            height: Math.min(screenHeight - 200, 220),
          });
        } else {
          // Mobile portrait
          setTrackDimensions({
            width: screenWidth - 32,
            height: 200,
          });
        }
      } else if (screenWidth < 1024) {
        // Tablet
        setTrackDimensions({
          width: Math.min(screenWidth - 48, 900),
          height: isLandscape ? 250 : 280,
        });
      } else {
        // Desktop
        setTrackDimensions({
          width: Math.min(screenWidth - 64, 1200),
          height: screenWidth > 1440 ? 350 : 300,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", () => {
      setTimeout(updateDimensions, 100);
    });

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, []);

  // Animation frame counter for visual effects
  useEffect(() => {
    if (!raceInProgress) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [raceInProgress]);

  // Race start countdown effect
  useEffect(() => {
    if (!raceInProgress || raceParticipants.length === 0) return;

    setShowStartAnimation(true);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setShowStartAnimation(false);
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [raceInProgress, raceParticipants.length]);

  // Race animation effect
  useEffect(() => {
    if (!raceInProgress || raceParticipants.length === 0) return;

    setShowConfetti(false);
    setRaceWinnerIdx(null);
    if (raceInterval.current) clearInterval(raceInterval.current);

    // Wait for countdown to finish before starting race
    const startDelay = setTimeout(() => {
      // Calculate responsive finish line based on actual track dimensions
      const getFinishPosition = () => {
        const screenWidth = window.innerWidth;
        const isLandscape = screenWidth > window.innerHeight;

        if (screenWidth <= 768) {
          // Mobile
          return isLandscape ? 770 : 770;
        } else if (screenWidth > 769 && screenWidth < 1200) {
          return 780;
        } else if (screenWidth >= 1201 && screenWidth < 1400) {
          return 720;
        } else {
          return 700;
        }
      };

      const finish = getFinishPosition();
      const minStep = 3;
      const maxStep = 10;
      const tickMs = 200;

      raceInterval.current = setInterval(() => {
        setRacePositions(prev => {
          const newPositions = [...prev];
          let raceFinished = false;
          let winnerIdx = -1;

          // Update positions and check for winner in same loop
          for (let i = 0; i < newPositions.length; i++) {
            if (newPositions[i] >= finish) {
              // Already finished, don't move
              continue;
            }

            // Move character forward with slight variation for realism
            const baseStep = Math.floor(
              Math.random() * (maxStep - minStep + 1) + minStep
            );

            // Add slight momentum effect - characters maintain some consistency
            const momentum = Math.sin(Date.now() * 0.01 + i) * 0.5;
            const step = Math.max(1, baseStep + momentum);

            newPositions[i] = Math.min(newPositions[i] + step, finish);

            // Check if this character just reached the finish line
            if (newPositions[i] >= finish && winnerIdx === -1) {
              winnerIdx = i;
              raceFinished = true;
            }
          }

          // If we have a winner, immediately stop the race
          if (raceFinished && winnerIdx !== -1) {
            setRaceWinnerIdx(winnerIdx);
            setRaceInProgress(false);
            setShowConfetti(true);
            if (raceInterval.current) clearInterval(raceInterval.current);
            setWinners([raceParticipants[winnerIdx].address]);
            setTimeout(() => setShowConfetti(false), 8000);
          }

          return newPositions;
        });
      }, tickMs);
    }, 3000); // Wait for countdown

    return () => {
      clearTimeout(startDelay);
      if (raceInterval.current) clearInterval(raceInterval.current);
    };
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

  // Calculate responsive values
  const getResponsiveValues = () => {
    const screenWidth = window.innerWidth;
    const participantCount = raceParticipants.length;

    // Avatar size based on screen size and participant count
    let avatarSize;
    if (screenWidth < 640) {
      // Mobile
      avatarSize =
        participantCount >= 20
          ? 16
          : participantCount >= 10
            ? 20
            : participantCount >= 5
              ? 24
              : 32;
    } else if (screenWidth < 1024) {
      // Tablet
      avatarSize =
        participantCount >= 20
          ? 20
          : participantCount >= 10
            ? 28
            : participantCount >= 5
              ? 36
              : 48;
    } else {
      // Desktop
      avatarSize =
        participantCount >= 100
          ? 24
          : participantCount >= 20
            ? 32
            : participantCount >= 5
              ? 48
              : 64;
    }

    // Font size for address labels
    const fontSize =
      screenWidth < 640
        ? participantCount >= 10
          ? 8
          : 10
        : participantCount >= 20
          ? 9
          : 11;

    // Padding for address labels
    const labelPadding = screenWidth < 640 ? "1px 3px" : "2px 6px";

    return { avatarSize, fontSize, labelPadding };
  };

  const { avatarSize, fontSize, labelPadding } = getResponsiveValues();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 sm:p-6 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse rounded-xl" />

      {/* Racing Stripes Animation */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
      </div>

      <div className="relative z-10">
        <h3 className="text-lg sm:text-xl font-bold text-purple-300 mb-2 sm:mb-4 text-center relative">
          <span className="inline-block animate-bounce">🏁</span>
          <span className="mx-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Race Track
          </span>
          <span className="inline-block animate-bounce delay-200">🏁</span>
        </h3>

        {/* Countdown Overlay */}
        {showStartAnimation && countdown > 0 && (
          <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-8xl font-bold text-yellow-400 animate-pulse mb-4">
                {countdown}
              </div>
              <div className="text-xl text-white animate-bounce">
                Get Ready to Race!
              </div>
            </div>
          </div>
        )}

        {/* GO! Animation */}
        {showStartAnimation && countdown === 0 && (
          <div className="absolute inset-0 bg-green-500/80 rounded-xl flex items-center justify-center z-50 animate-ping">
            <div className="text-6xl font-bold text-white">GO! 🚀</div>
          </div>
        )}

        <div className="relative w-full overflow-hidden">
          <div
            className="relative mx-auto transition-all duration-500"
            style={{
              width: "100%",
              maxWidth: `${trackDimensions.width}px`,
              height: `${trackDimensions.height}px`,
              backgroundImage: "url(/racetrack.png)",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              borderRadius: "8px",
              border: "2px solid #8b5cf6",
              boxShadow: raceInProgress
                ? "0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)"
                : "0 0 15px rgba(139, 92, 246, 0.3)",
            }}
          >
            {/* Track Speed Lines Animation */}
            {raceInProgress && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                    style={{
                      top: `${20 + i * 35}px`,
                      left: `${-64 + ((animationFrame * 8 + i * 100) % (trackDimensions.width + 128))}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Character Lanes */}
            {raceParticipants.map((participant, i) => {
              // Calculate responsive finish position and track dimensions
              const getFinishPosition = () => {
                const screenWidth = window.innerWidth;
                const isLandscape = screenWidth > window.innerHeight;

                if (screenWidth < 640) {
                  return isLandscape ? 850 : 800;
                } else if (screenWidth < 1024) {
                  return 880;
                } else {
                  return 850;
                }
              };

              const trackWidth = getFinishPosition();
              const startOffset = Math.max(20, trackDimensions.width * 0.04);
              const endOffset = Math.max(40, trackDimensions.width * 0.06);
              const availableWidth =
                trackDimensions.width - startOffset - endOffset;

              const progress = (racePositions[i] / trackWidth) * availableWidth;
              const isWinner = raceWinnerIdx === i;
              const raceEnded = raceWinnerIdx !== null && !raceInProgress;

              // Scale lane position based on track height
              const scaledLanePosition =
                (lanePositions[i] / 300) * trackDimensions.height;

              // Character positioning - stay exactly where they finished
              const finalPosition =
                startOffset + Math.min(progress, availableWidth - 20);

              // Add subtle bobbing motion while racing
              const bobbingOffset = raceInProgress
                ? Math.sin(Date.now() * 0.01 + i) * 2
                : 0;

              return (
                <div
                  key={`${participant.address}-${i}`}
                  className="absolute flex items-center"
                  style={{
                    top: `${scaledLanePosition + bobbingOffset}px`,
                    left: `${finalPosition}px`,
                    transition: raceInProgress
                      ? "left 0.12s cubic-bezier(0.4, 0, 0.2, 1)"
                      : "left 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: raceEnded && !isWinner ? 0.5 : 1,
                    zIndex: isWinner ? 30 : 15,
                    transform: `scale(${isWinner ? 1.15 : 1}) ${raceInProgress ? `rotateY(${Math.sin(Date.now() * 0.02 + i) * 5}deg)` : ""}`,
                  }}
                >
                  <div className="relative flex items-center">
                    {/* Character with enhanced animations */}
                    <div className="relative">
                      <Image
                        src={participant.character}
                        alt={`Character ${i + 1}`}
                        width={avatarSize}
                        height={avatarSize}
                        className={`object-contain transition-all duration-800 ${
                          isWinner ? "animate-bounce" : ""
                        } `}
                        style={{
                          filter: isWinner
                            ? "drop-shadow(0 0 20px gold) brightness(1.4) saturate(1.3) contrast(1.1)"
                            : raceInProgress
                              ? "drop-shadow(0 2px 8px rgba(139, 92, 246, 0.4)) brightness(1.1)"
                              : "drop-shadow(0 1px 3px rgba(0,0,0,0.3))",
                        }}
                      />

                      {/* Motion trails for racing characters */}
                      {raceInProgress && (
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent rounded-full blur-sm animate-ping" />
                        </div>
                      )}
                    </div>

                    {/* Winner Effects */}
                    {isWinner && (
                      <>
                        {/* Animated Crown - Adjusted position */}
                        <div
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 animate-bounce"
                          style={{
                            fontSize: `${Math.max(avatarSize * 0.4, 16)}px`,
                            animationDelay: "0.2s",
                            zIndex: 45,
                          }}
                        >
                          👑
                        </div>

                        {/* Enhanced Winner Glow */}
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-lg animate-pulse"
                          style={{
                            width: `${avatarSize + 20}px`,
                            height: `${avatarSize + 20}px`,
                            left: "-10px",
                            top: "-10px",
                          }}
                        />

                        {/* Rotating Victory Sparkles */}
                        <div className="absolute -top-1 -left-1 text-yellow-300 animate-spin text-xs">
                          ⭐
                        </div>
                        <div className="absolute -bottom-1 -right-1 text-yellow-300 animate-spin text-xs delay-500">
                          ⭐
                        </div>
                        <div className="absolute -top-1 -right-1 text-yellow-300 animate-ping text-xs delay-300">
                          ✨
                        </div>
                        <div className="absolute -bottom-1 -left-1 text-yellow-300 animate-ping text-xs delay-700">
                          ✨
                        </div>
                      </>
                    )}

                    {/* Enhanced Address Label - Above Head */}
                    <div
                      className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-1 py-1 rounded-full font-mono border transition-all duration-500 whitespace-nowrap ${
                        isWinner
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-300 shadow-xl animate-pulse"
                          : raceInProgress
                            ? "bg-slate-900/90 text-purple-200 border-purple-400/60 shadow-lg"
                            : "bg-slate-900/80 text-purple-200 border-purple-600/50"
                      }`}
                      style={{
                        fontSize: `${fontSize}px`,
                        padding: labelPadding,
                        minWidth: "fit-content",
                        fontWeight: isWinner ? "bold" : "normal",
                        boxShadow: isWinner
                          ? "0 0 20px rgba(255, 215, 0, 0.5)"
                          : raceInProgress
                            ? "0 0 10px rgba(139, 92, 246, 0.3)"
                            : "none",
                        zIndex: 40,
                      }}
                    >
                      {isWinner && "🏆 "}
                      {participant.address.slice(0, 4)}...
                      {participant.address.slice(-3)}
                      {isWinner && " 🏆"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Race Statistics and Winner Announcement */}
        {raceParticipants.length > 0 && (
          <div className="mt-3 text-center">
            {raceWinnerIdx !== null && !raceInProgress && (
              <div className="mb-2 p-3 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-lg border border-yellow-400/40 animate-pulse">
                <div className="text-yellow-400 font-bold text-sm sm:text-base">
                  <span className="inline-block animate-bounce">🏆</span>
                  <span className="mx-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    WINNER:{" "}
                    {raceParticipants[raceWinnerIdx].address.slice(0, 6)}
                    ...{raceParticipants[raceWinnerIdx].address.slice(-4)}
                  </span>
                  <span className="inline-block animate-bounce delay-200">
                    🏆
                  </span>
                </div>
                <div className="text-xs text-orange-300 mt-1 animate-pulse">
                  🎉 Victory! 🎉
                </div>
              </div>
            )}

            <div className="text-xs sm:text-sm text-purple-300/80">
              <div className="hidden sm:block">
                <span className="inline-block animate-pulse">🏁</span>
                <span className="mx-2">
                  Racing: {raceParticipants.length} participants
                  {raceInProgress && " - Race in progress..."}
                </span>
                <span className="inline-block animate-pulse delay-500">🏁</span>
              </div>
              <div className="sm:hidden">
                <span className="inline-block animate-pulse">🏁</span>
                <span className="mx-2">
                  {raceParticipants.length} racers
                  {raceInProgress && " - Racing..."}
                </span>
                <span className="inline-block animate-pulse delay-500">🏁</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
