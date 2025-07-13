import { CollectionResponse } from "@/types/collection";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchUserCollections = async (userAddress: `0x${string}`): Promise<CollectionResponse> => {
  const response = await axios.get<CollectionResponse>(
    `https://api-mainnet.magiceden.dev/v3/rtp/monad-testnet/users/${userAddress}/collections/v3?includeTopBid=false&includeLiquidCount=false&offset=0&limit=100`
  );
  return response.data;
};

export const useMagicEdenNFTsData = (userAddress: `0x${string}` | undefined) => {
  return useQuery({
    queryKey: ["userCollections"],
    queryFn: () => fetchUserCollections(),
  });
};
