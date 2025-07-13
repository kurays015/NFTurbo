import { CollectionResponse } from "@/types/collection";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchUserCollections = async (userAddress: `0x${string}` | undefined): Promise<CollectionResponse> => {
  const response = await axios.get<CollectionResponse>(
    `https://api-mainnet.magiceden.dev/v3/rtp/monad-testnet/users/${userAddress || "0x336C425C766Ae1A5aD607edD33572B4F625D7B41"}/collections/v3?includeTopBid=false&includeLiquidCount=false&offset=0&limit=100`
  );
  return response.data;
};

export const useMagicEdenNFTsData = (userAddress: `0x${string}` | undefined) => {
  return useQuery({
    queryKey: ["userCollections"],
    queryFn: () => fetchUserCollections(userAddress),
  });
};
