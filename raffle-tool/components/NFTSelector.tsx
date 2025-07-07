import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import React from "react";

interface NFTToken {
  token: {
    tokenId: string;
    contract: string;
    name?: string | null;
    collection?: { name?: string | null };
  };
}

interface NFTSelectorProps {
  filteredNFTs: NFTToken[];
  selectedIdx: number;
  setSelectedIdx: (idx: number) => void;
}

const NFTSelector: React.FC<NFTSelectorProps> = ({
  filteredNFTs,
  selectedIdx,
  setSelectedIdx,
}) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <Label
      htmlFor="nft-select"
      className="block mb-3 font-semibold text-purple-300"
    >
      Select NFT to Raffle
    </Label>
    <Select
      value={String(selectedIdx)}
      onValueChange={(value: string) => setSelectedIdx(Number(value))}
    >
      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
        <SelectValue placeholder="Choose NFT" />
      </SelectTrigger>
      <SelectContent>
        {filteredNFTs.map((item, idx) => (
          <SelectItem
            key={item.token.tokenId + item.token.contract}
            value={String(idx)}
          >
            {item.token.name || `#${item.token.tokenId}`}
            {item.token.collection?.name && ` - ${item.token.collection.name}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default NFTSelector;
