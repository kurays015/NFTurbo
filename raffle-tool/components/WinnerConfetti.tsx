"use client";

import { useRaffleContext } from "@/context/raffle-context";
import Confetti from "react-confetti";

export default function WinnerConfetti() {
  const { showConfetti } = useRaffleContext();
  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
    </>
  );
}
