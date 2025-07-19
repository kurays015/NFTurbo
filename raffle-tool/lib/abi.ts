import { parseAbi } from "viem";

export const NFTTransferABI = parseAbi([
  // Event
  "event NFTTransferred(address indexed nftContract, uint256 indexed tokenId, address indexed from, address to)",
  // Functions
  "function transferNFT(address nftContract, uint256 tokenId, address to)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function transferERC721(address nftContract,uint256 tokenId,address to)",
  "function transferERC1155(address nftContract,uint256 tokenId,address to, uint256 amount)",
]);
