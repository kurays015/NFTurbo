"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useRaffleContext } from "@/context/raffle-context";
import NFTSelector from "./NFTSelector";
import NFTDisplay from "./NFTDisplay";
import AddressInput from "./AddressInput";
import WinnerCountSelector from "./WinnerCountSelector";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function RaffleSetup() {
  const { openConnectModal } = useConnectModal();
  const {
    handleStartRace,
    userAddress,
    validAddresses,
    raceInProgress,
    open,
    setOpen,
  } = useRaffleContext();

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="text-black shadow-lg font-bold px-6 py-3 rounded-xl bg-white/80 hover:bg-white"
        >
          {raceInProgress ? "Show Current Race" : "Start a raffle"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-none">
        {/* Close button top-right */}
        <div className="absolute top-4 right-4 z-10">
          <DrawerClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-slate-700/60 text-white border-slate-600 hover:bg-slate-700/80 w-9 h-9 p-0"
            >
              <span className="sr-only">Close</span>×
            </Button>
          </DrawerClose>
        </div>
        {userAddress ? (
          <section className="max-w-7xl mx-auto max-h-[70vh] p-0 flex flex-col md:flex-row gap-3 md:gap-6 overflow-auto">
            {/* Left: Form Section */}
            <div className="pt-2 pb-4 px-2 w-full  flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-purple-300 mb-1 flex items-center gap-2">
                  Start a Raffle!
                </h2>
                <p className="text-gray-400 text-sm mb-2">
                  Select your NFT collection, set the number of winners, and
                  enter participant addresses.
                </p>
              </div>
              <div className="space-y-3">
                {/* NFT config/details */}
                <div className="bg-slate-800/40 rounded-lg border border-slate-700/40 p-3">
                  <NFTSelector />
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 bg-slate-800/40 rounded-lg border border-slate-700/40 p-3">
                    <WinnerCountSelector />
                  </div>
                  <div className="flex-1 bg-slate-800/40 rounded-lg border border-slate-700/40 p-3">
                    <AddressInput />
                  </div>
                </div>
                {/* Warning if less than 2 valid addresses */}
                {validAddresses.length < 2 && (
                  <div className="text-amber-400 text-xs text-center bg-amber-900/20 border border-amber-500/30 rounded p-2 flex items-center justify-center gap-2">
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>
                    At least 2 valid addresses are needed to start the race
                  </div>
                )}
                {/* Start Race Button */}
                <Button
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-1"
                  disabled={raceInProgress || validAddresses.length < 2}
                  onClick={userAddress ? handleStartRace : openConnectModal}
                >
                  {raceInProgress ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Racing in Progress...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-yellow-300">
                      Ready set go!
                    </span>
                  )}
                </Button>
              </div>
            </div>
            {/* Divider for md+ screens */}
            <div className="hidden md:block w-px bg-slate-700/40 my-4 mx-2" />
            {/* Right: NFT Grid Section */}
            <div className=" rounded-lg border border-slate-700/40 overflow-y-auto w-full md:w-1/3 customSm:max-h-[250px] lg:max-h-[500px] overflow-auto flex-shrink-0 self-center">
              <NFTDisplay />
            </div>
          </section>
        ) : (
          <div className="text-center">
            <Button
              className=" h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-base shadow-lg mt-4 mb-4"
              onClick={openConnectModal}
            >
              Connect Wallet
            </Button>
            <span className="block text-center text-pink-300 text-sm">
              Connect a wallet to choose an NFT for the raffle
            </span>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
