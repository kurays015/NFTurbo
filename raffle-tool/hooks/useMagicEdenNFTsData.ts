import { CollectionResponse } from "@/types/collection";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchUserCollections = async (): Promise<CollectionResponse> => {
  const response = await axios.get<CollectionResponse>(
    `https://api-mainnet.magiceden.dev/v3/rtp/monad-testnet/users/0x5686ac82D1BB3f1b3BCBa10DBB3170a11dc87236/collections/v3?includeTopBid=false&includeLiquidCount=false&offset=0&limit=100`
  );
  return response.data;
};

export const useMagicEdenNFTsData = () => {
  return useQuery({
    queryKey: ["userCollections"],
    queryFn: () => fetchUserCollections(),
  });
};
