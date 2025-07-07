import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MagicEdenResponse } from "../types";

const fetchUserTokens = async (
  userAddress: string
): Promise<MagicEdenResponse> => {
  const response = await axios.get<MagicEdenResponse>(
    `https://api-mainnet.magiceden.dev/v3/rtp/monad-testnet/users/${
      userAddress || "0x5686ac82D1BB3f1b3BCBa10DBB3170a11dc87236"
    }/tokens/v7`
  );
  return response.data;
};

export const useMagicEdenNFTData = (userAddress: `0x${string}`) => {
  return useQuery({
    queryKey: ["userTokens", userAddress],
    queryFn: () => fetchUserTokens(userAddress),
    enabled: !!userAddress,
  });
};
