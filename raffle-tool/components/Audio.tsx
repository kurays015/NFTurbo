"use client";

import { useRaffleContext } from "@/context/raffle-context";
import { useEffect } from "react";

{
  /* Background music for race */
}

export default function Audio() {
  const { raceInProgress, audioRef } = useRaffleContext();

  // Stop music when race ends
  useEffect(() => {
    if (!raceInProgress && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [raceInProgress, audioRef]);

  return <audio ref={audioRef} src="/mingle.mp3" preload="auto" />;
}
