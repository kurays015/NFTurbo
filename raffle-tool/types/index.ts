// NFT Token Types for Magic Eden API
export interface Currency {
  contract: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface Amount {
  raw: string;
  decimal: number;
  usd: number | null;
  native: number;
}

export interface FloorAskPrice {
  currency: Currency;
  amount: Amount;
}

export interface Royalty {
  bps: number;
  recipient: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string | null;
  symbol: string;
  imageUrl: string | null;
  isSpam: boolean;
  metadataDisabled: boolean;
  openseaVerificationStatus: string | null;
  floorAskPrice: FloorAskPrice;
  royaltiesBps: number;
  royalties: Royalty[];
}

export interface Token {
  chainId: number;
  contract: string;
  tokenId: string;
  kind: string;
  name: string | null;
  image: string | null;
  imageSmall: string | null;
  imageLarge: string | null;
  description: string | null;
  rarityScore: number | null;
  rarityRank: number | null;
  supply: string;
  remainingSupply: string;
  media: string | null;
  isFlagged: boolean;
  isSpam: boolean;
  metadataDisabled: boolean;
  lastFlagUpdate: string | null;
  lastFlagChange: string | null;
  collection: Collection;
  lastAppraisalValue: number | null;
}

export interface FloorAsk {
  id: string | null;
  price: FloorAskPrice | null;
  maker: string | null;
  kind: string | null;
  validFrom: string | null;
  validUntil: string | null;
  source: string | null;
}

export interface Ownership {
  tokenCount: string;
  onSaleCount: string;
  floorAsk: FloorAsk;
  acquiredAt: string;
}

export interface TokenWithOwnership {
  token: Token;
  ownership: Ownership;
}

export interface MagicEdenResponse {
  tokens: TokenWithOwnership[];
  continuation: string;
}
