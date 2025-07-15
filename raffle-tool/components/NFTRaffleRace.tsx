// import RaceTrack from "./RaceTrack";
import WinnerDisplay from "./WinnerDisplay";
import Audio from "./Audio";
import WinnerConfetti from "./WinnerConfetti";
import dynamic from "next/dynamic";

const RaceTrack = dynamic(() => import("./RaceTrack"), {
  ssr: false,
});

export default function NFTRaffleRace() {
  return (
    <div className="py-4 h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900 text-gray-100 relative">
      {/* Background music for race */}
      <Audio />
      <WinnerConfetti />

      <div className="flex">
        {/* Race Track Full Width */}
        <section className="w-full flex flex-col items-center">
          <div className="w-full max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-pink-300 mb-2 flex items-center gap-2">
                Race Track
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Watch your NFTs race to the finish line. Winner(s) will be
                displayed below!
              </p>
            </div>

            {/* <div className="w-full"> */}
            <RaceTrack />
            {/* </div> */}

            <WinnerDisplay />
          </div>
        </section>
      </div>
    </div>
  );
}
