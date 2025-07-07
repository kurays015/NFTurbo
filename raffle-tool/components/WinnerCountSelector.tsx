import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import React from "react";

interface WinnerCountSelectorProps {
  winnerCount: number;
  setWinnerCount: (count: number) => void;
  tokenCount: number;
  validAddresses: string[];
}

const WinnerCountSelector: React.FC<WinnerCountSelectorProps> = ({
  winnerCount,
  setWinnerCount,
  tokenCount,
  validAddresses,
}) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <Label
      htmlFor="winner-count"
      className="block mb-3 font-semibold text-purple-300"
    >
      Number of Winners
    </Label>
    <Select
      value={String(winnerCount)}
      onValueChange={(value: string) => setWinnerCount(Number(value))}
    >
      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
        <SelectValue placeholder="Select winners count" />
      </SelectTrigger>
      <SelectContent>
        {Array.from(
          { length: Math.min(tokenCount, validAddresses.length) || 1 },
          (_, i) => i + 1
        ).map(num => (
          <SelectItem key={num} value={String(num)}>
            {num} Winner{num > 1 ? "s" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default WinnerCountSelector;
