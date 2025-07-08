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

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <Label
        htmlFor="nft-select"
        className="block mb-3 font-semibold text-purple-300"
      >
        Select Collection to Raffle
      </Label>
      <Select
        value={String(selectedIdx)}
        onValueChange={handleCollectionChange}
        disabled={raceInProgress || !userAddress}
      >
        <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="Choose Collection" />
        </SelectTrigger>
        <SelectContent>
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
