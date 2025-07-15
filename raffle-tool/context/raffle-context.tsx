"use client";

import { useMagicEdenNFTsData } from "@/hooks/useMagicEdenNFTsData";
import { useMagicEdenUserTokens } from "@/hooks/useMagicEdenUserTokens";
import { NFTTransferABI } from "@/lib/abi";
import { NEXT_PUBLIC_CONTRACT_ADDRESS } from "@/lib/contractAddress";
import isValidAddress from "@/lib/isValidAddress";
import {
  createContext,
  useContext,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  RefObject,
  useMemo,
  useEffect,
} from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MagicEdenResponse, TokenWithOwnership } from "@/types";
import { CollectionResponse } from "@/types/collection";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import generateRaceCharacters from "@/lib/generateRaceCharacters";

// Define the type for the context valuea
interface RaffleContextType {
  // State
  selectedIdx: number | null;
  setSelectedIdx: Dispatch<SetStateAction<number | null>>;
  selectedTokenIdx: number;
  setSelectedTokenIdx: Dispatch<SetStateAction<number>>;
  addressInput: string;
  setAddressInput: Dispatch<SetStateAction<string>>;
  winnerCount: number;
  setWinnerCount: Dispatch<SetStateAction<number>>;
  winners: string[];
  setWinners: Dispatch<SetStateAction<string[]>>;
  showConfetti: boolean;
  setShowConfetti: Dispatch<SetStateAction<boolean>>;
  raceInProgress: boolean;
  setRaceInProgress: Dispatch<SetStateAction<boolean>>;
  racePositions: number[];
  setRacePositions: Dispatch<SetStateAction<number[]>>;
  raceWinnerIdx: number | null;
  setRaceWinnerIdx: Dispatch<SetStateAction<number | null>>;
  raceParticipants: { address: string; character: string }[];
  setRaceParticipants: Dispatch<
    SetStateAction<{ address: string; character: string }[]>
  >;
  nftContractAddress: `0x${string}` | null;
  setNftContractAddress: Dispatch<SetStateAction<`0x${string}` | null>>;
  raceInterval: RefObject<NodeJS.Timeout | null>;
  audioRef: RefObject<HTMLAudioElement | null>;
  userAddress: `0x${string}` | undefined;
  parsedAddresses: string[];
  uniqueAddresses: string[];
  validAddresses: string[];
  // Data
  collections: CollectionResponse | undefined;
  tokens: MagicEdenResponse | undefined;
  userTokenNFTs: TokenWithOwnership[];
  selectedNFT: TokenWithOwnership | undefined;
  // Loading/Error
  isCollectionsLoading: boolean;
  isCollectionsError: boolean;
  collectionsError: Error | null;
  isTokensLoading: boolean;
  isTokensError: boolean;
  tokensError: Error | null;
  // Approval/Transfer
  approveError: Error | null;
  isApprovePending: boolean;
  isApprovalTxLoading: boolean;
  isApprovalTxSuccess: boolean;
  transferError: Error | null;
  isTransferPending: boolean;
  isTransferTxLoading: boolean;
  isTransferTxSuccess: boolean;
  // Handlers
  handleApprove: () => void;
  handleTransfer: (winner: string) => void;
  handleStartRace: () => void;
  validParticipants: boolean;
  refetchCollections: () => void;
  refetchTokens: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const RaffleContext = createContext<RaffleContextType | null>(null);

export default function RaffleContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // State
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null); // collection index
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0); // NFT index within tokens
  const [addressInput, setAddressInput] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
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
  const [nftContractAddress, setNftContractAddress] = useState<
    `0x${string}` | null
  >(null);
  const [open, setOpen] = useState(false);
  const raceInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Data
  const {
    data: collections,
    isError: isCollectionsError,
    error: collectionsError,
    isLoading: isCollectionsLoading,
    refetch: refetchCollections,
  } = useMagicEdenNFTsData(userAddress);

  const {
    data: tokens,
    isError: isTokensError,
    error: tokensError,
    isLoading: isTokensLoading,
    refetch: refetchTokens,
  } = useMagicEdenUserTokens(userAddress, nftContractAddress);

  const userTokenNFTs = tokens?.tokens || [];
  const selectedNFT = userTokenNFTs[selectedTokenIdx];

  // Approval/Transfer
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

  // Sonner toast for approval
  useEffect(() => {
    if (approveData) {
      toast(
        <div className="z-50 flex items-center gap-4 p-4 rounded-md bg-[#1a1333]! bg-gradient-to-r from-[#2a174a]/90 via-[#6E54FF]/80 to-[#836EF9]/80 shadow-lg border border-[#6E54FF] font-semibold text-white text-base drop-shadow-sm">
          <span className="text-slate-500">Approval Successful!</span>
          <Link
            href={`https://testnet.monadexplorer.com/tx/${approveData}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[#C3B6FF] hover:text-white underline ml-2"
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            <span className="ml-1 text-xs">View</span>
          </Link>
        </div>,
        { duration: 8000 }
      );
    }
  }, [approveData]);

  // Sonner toast for transfer
  useEffect(() => {
    if (transferData) {
      toast(
        <div className="z-50 flex items-center gap-4 p-4 rounded-md bg-[#1a1333]! bg-gradient-to-r from-[#2a174a]/90 via-[#6E54FF]/80 to-[#836EF9]/80 shadow-lg border border-[#6E54FF] font-semibold text-white text-base drop-shadow-sm">
          <span className="text-white">Transfer Successful!</span>
          <Link
            href={`https://testnet.monadexplorer.com/tx/${transferData}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[#C3B6FF] hover:text-white underline ml-2"
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            <span className="ml-1 text-xs">View</span>
          </Link>
        </div>,
        { duration: 8000 }
      );
    }
  }, [transferData]);

  // Derived
  const validParticipants =
    validAddresses.length >= 2 &&
    winnerCount >= 1 &&
    winnerCount <= validAddresses.length;

  // Handlers
  const handleApprove = () => {
    if (!selectedNFT || !NEXT_PUBLIC_CONTRACT_ADDRESS) return;
    writeApprove({
      address: selectedNFT.token.contract as `0x${string}`,
      abi: NFTTransferABI,
      functionName: "setApprovalForAll",
      args: [NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`, true],
    });
  };

  const handleTransfer = (winner: string) => {
    writeTransfer({
      address: NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: NFTTransferABI,
      functionName: "transferNFT",
      args: [
        selectedNFT.token.contract as `0x${string}`,
        BigInt(selectedNFT.token.tokenId),
        winner as `0x${string}`,
      ],
    });
  };

  const handleStartRace = () => {
    setOpen(false);
    setWinners([]);
    setShowConfetti(false);
    setRaceWinnerIdx(null);
    setRaceParticipants([]);
    setRacePositions([]);
    setWinnerCount(1);

    if (!validParticipants) {
      alert("Please enter at least 2 valid addresses");
      return;
    }

    if (!selectedNFT) {
      alert("Please select an NFT to raffle");
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    const numParticipants = validAddresses.length;
    const raceCharacters = generateRaceCharacters(numParticipants);
    const shuffledAddresses = [...validAddresses].sort(
      () => Math.random() - 0.5
    );

    const participants = shuffledAddresses.map((address, index) => ({
      address,
      character: raceCharacters[index],
    }));

    setRaceParticipants(participants);
    setRacePositions(new Array(participants.length).fill(0));
    setRaceInProgress(true);
  };

  const value: RaffleContextType = {
    selectedIdx,
    setSelectedIdx,
    selectedTokenIdx,
    setSelectedTokenIdx,
    addressInput,
    setAddressInput,
    winnerCount,
    setWinnerCount,
    winners,
    setWinners,
    showConfetti,
    setShowConfetti,
    userAddress,
    raceInProgress,
    setRaceInProgress,
    racePositions,
    setRacePositions,
    raceWinnerIdx,
    setRaceWinnerIdx,
    raceParticipants,
    setRaceParticipants,
    nftContractAddress,
    setNftContractAddress,
    raceInterval,
    audioRef,
    parsedAddresses,
    uniqueAddresses,
    validAddresses,
    collections,
    tokens,
    userTokenNFTs,
    selectedNFT,
    isCollectionsLoading,
    isCollectionsError,
    collectionsError,
    isTokensLoading,
    isTokensError,
    tokensError,
    approveError,
    isApprovePending,
    isApprovalTxLoading,
    isApprovalTxSuccess,
    transferError,
    isTransferPending,
    isTransferTxLoading,
    isTransferTxSuccess,
    handleApprove,
    handleTransfer,
    handleStartRace,
    validParticipants,
    refetchCollections,
    refetchTokens,
    open,
    setOpen,
  };

  return (
    <RaffleContext.Provider value={value}>{children}</RaffleContext.Provider>
  );
}

export const useRaffleContext = () => {
  const ctx = useContext(RaffleContext);
  if (!ctx) {
    throw new Error(
      "useRaffleContext must be used within a RaffleContextProvider"
    );
  }
  return ctx;
};
