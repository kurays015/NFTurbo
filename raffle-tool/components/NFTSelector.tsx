import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRaffleContext } from "@/context/raffle-context";

export default function NFTSelector() {
  const {
    selectedIdx,
    setSelectedIdx,
    setNftContractAddress,
    raceInProgress,
    userAddress,
    collections,
    isCollectionsLoading,
    isCollectionsError,
    collectionsError,
  } = useRaffleContext();

  const handleCollectionChange = (value: string) => {
    const idx = Number(value);
    setSelectedIdx(idx);
    const selectedCollection = collections?.collections[idx];
    if (selectedCollection) {
      setNftContractAddress(
        selectedCollection.collection.primaryContract as `0x${string}`
      );
    } else {
      setNftContractAddress(null);
    }
  };

  // Early returns for loading, error, or no collections
  if (isCollectionsLoading)
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center min-h-[180px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
        <div className="text-slate-300 text-lg font-semibold">
          Loading collections...
        </div>
      </div>
    );

  if (isCollectionsError)
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center min-h-[180px]">
        <div className="text-center p-4 bg-red-900/20 border border-red-500/50 rounded w-full">
          <h1 className="text-xl text-red-400 font-bold break-words overflow-hidden mb-2">
            Error loading collections
          </h1>
          <p className="text-red-300 text-sm break-words overflow-hidden">
            {collectionsError?.message}
          </p>
        </div>
      </div>
    );

  if (!collections || collections.collections.length === 0)
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center min-h-[120px]">
        <div className="text-slate-400 text-lg">No collection found...</div>
      </div>
    );

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <Label
        htmlFor="nft-select"
        className="block mb-3 font-semibold text-purple-300"
      >
        Select Collection to Raffle
      </Label>
      <Select
        value={selectedIdx == null ? "" : String(selectedIdx)}
        onValueChange={handleCollectionChange}
        disabled={raceInProgress || !userAddress}
      >
        <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="Choose Collection" />
        </SelectTrigger>
        <SelectContent className="customSm:max-h-[200px] lg:max-h-[400px]">
          {collections?.collections.map((collection, idx) => (
            <SelectItem key={collection.collection.id} value={String(idx)}>
              {collection.collection.name}
              {collection.ownership.tokenCount &&
                ` (${collection.ownership.tokenCount} owned)`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
