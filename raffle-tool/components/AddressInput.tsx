import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import React from "react";

interface AddressInputProps {
  addressInput: string;
  setAddressInput: (val: string) => void;
  validAddresses: string[];
  uniqueAddresses: string[];
  disabled?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({
  addressInput,
  setAddressInput,
  validAddresses,
  uniqueAddresses,
  disabled,
}) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <Label
      htmlFor="addresses"
      className="block mb-3 font-semibold text-purple-300"
    >
      Participant Addresses (0x..., 0x..., 0x..., ...):
    </Label>
    <Textarea
      id="addresses"
      className="w-full bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
      rows={4}
      placeholder={`Enter wallet addresses separated by commas:\n0x1234..., 0x5678..., 0x9abc...`}
      value={addressInput}
      onChange={e => setAddressInput(e.target.value)}
      disabled={disabled}
    />
    <div className="flex justify-between items-center mt-3 text-sm">
      <span className="text-green-400">
        {validAddresses.length} valid addresses
      </span>
      <span className="text-gray-400">
        {uniqueAddresses.length} total entries
      </span>
    </div>
    {uniqueAddresses.length !== validAddresses.length && (
      <div className="text-amber-400 text-sm mt-2 flex items-center gap-2">
        <span>⚠️</span>
        Some addresses are invalid and will be ignored
      </div>
    )}
  </div>
);

export default AddressInput;
