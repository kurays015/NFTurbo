export type CollectionData = {
  id: string;
  name: string;
  image: string;
  description: string;
  tokenCount: string;
  primaryContract: string;
  floorAskPrice: {
    currency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    amount: {
      decimal: number;
      native: number;
    };
  };
  rank: {
    "7day": number | null;
    "30day": number | null;
    allTime: number | null;
  };
  volume: {
    "1day": number;
    "7day": number;
    "30day": number;
    allTime: number;
  };
  volumeChange: {
    "7day": number;
    "30day": number;
  };
  floorSale: {
    "7day": number | null;
    "30day": number | null;
  };
  sampleImages: string[];
  ownership: {
    tokenCount: string;
    onSaleCount: string;
  };
};

export type Ownership = {
  tokenCount: string;
  onSaleCount: string;
};

export type Collection = {
  collection: CollectionData;
  ownership: Ownership;
};

export type CollectionResponse = {
  collections: Collection[];
};
