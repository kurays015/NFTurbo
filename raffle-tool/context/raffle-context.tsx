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

// Define the type for the context value
interface RaffleContextType {
  // State
  selectedIdx: number;
  setSelectedIdx: Dispatch<SetStateAction<number>>;
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
  transferingTo: string | null;
  setTransferringTo: Dispatch<SetStateAction<string | null>>;
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
  tokenCount: string | undefined;
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
  canPickWinners: boolean;
  generateRaceCharacters: (numParticipants: number) => string[];
  calculateLanePositions: (numParticipants: number) => number[];
  refetchCollections: () => void;
  refetchTokens: () => void;
}

const RaffleContext = createContext<RaffleContextType | null>(null);

export default function RaffleContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // State
  const [selectedIdx, setSelectedIdx] = useState(0); // collection index
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0); // NFT index within tokens
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
  const [nftContractAddress, setNftContractAddress] = useState<
    `0x${string}` | null
  >(null);
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
  const tokenCount = collections?.collections.find(
    collection => collection.collection.id === nftContractAddress
  )?.ownership.tokenCount;

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
  const canPickWinners =
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
    if (!selectedNFT || !winner) return;
    setTransferringTo(winner);
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
    setWinners([]);
    setShowConfetti(false);
    setRaceWinnerIdx(null);
    setRaceParticipants([]);
    setRacePositions([]);
    setWinnerCount(1);

    if (!canPickWinners || !userAddress || !selectedNFT) return;
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
  // Utility
  const generateRaceCharacters = (numParticipants: number) => {
    const baseCharacters = [
      "/chog.png",
      "/fishnad.png",
      "/molandak.png",
      "/salmonad.png",
    ];
    const characters = [];
    for (let i = 0; i < numParticipants; i++) {
      characters.push(baseCharacters[i % baseCharacters.length]);
    }
    return characters;
  };
  const calculateLanePositions = (numParticipants: number) => {
    const trackCenterY = 150;
    let spacing = 45;
    if (numParticipants <= 4) {
      spacing = 45;
    } else if (numParticipants <= 20) {
      spacing = 15;
    } else if (numParticipants <= 100) {
      spacing = 2;
    } else if (numParticipants <= 1000) {
      spacing = 0;
    } else {
      spacing = -2;
    }
    const totalHeight = (numParticipants - 1) * spacing;
    const startY = trackCenterY - totalHeight / 2;
    return Array.from(
      { length: numParticipants },
      (_, i) => startY + i * spacing
    );
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
    transferingTo,
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
    tokenCount,
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
    canPickWinners,
    generateRaceCharacters,
    calculateLanePositions,
    refetchCollections,
    refetchTokens,
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
