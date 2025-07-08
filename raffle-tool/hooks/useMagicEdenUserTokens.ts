import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MagicEdenResponse } from "../types";

const fetchUserTokens = async (
  userAddress: `0x${string}`,
  collectionContractAddress: `0x${string}`
): Promise<MagicEdenResponse> => {
  const response = await axios.get<MagicEdenResponse>(
    `https://api-mainnet.magiceden.dev/v3/rtp/monad-testnet/users/${
      userAddress
    }/tokens/v7?collection=${collectionContractAddress}`
  );
  return response.data;
};

export const useMagicEdenUserTokens = (
  userAddress: `0x${string}` | undefined,
  collectionContractAddress: `0x${string}` | null
) => {
  return useQuery({
    queryKey: ["userTokens", userAddress, collectionContractAddress],
    queryFn: () => fetchUserTokens(userAddress!, collectionContractAddress!),
    enabled: !!userAddress && !!collectionContractAddress,
  });
};
