import { useRaffleContext } from "@/context/raffle-context";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function WinnerCountSelector() {
  const { winnerCount, setWinnerCount, raceInProgress, userAddress } =
    useRaffleContext();

  return (
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
        disabled={raceInProgress || !userAddress}
      >
        <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="Select winners count" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 1 }, (_, i) => i + 1).map(num => (
            <SelectItem key={num} value={String(num)}>
              {num} Winner{num > 1 ? "s" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
