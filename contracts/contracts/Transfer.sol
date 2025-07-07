// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Transfer {
    event NFTTransferred(address indexed nftContract, uint256 indexed tokenId, address indexed from, address to);

    function transferNFT(address nftContract, uint256 tokenId, address to) external {
        require(to != address(0), "Invalid recipient");
        require(tokenId != 0, "Token ID cannot be 0"); // Explicitly prevent tokenId 0

        IERC721 nft = IERC721(nftContract);
        address owner = nft.ownerOf(tokenId);
        require(owner == msg.sender, "Caller is not the owner");

        bool approved = nft.isApprovedForAll(owner, address(this)) || nft.getApproved(tokenId) == address(this);
        require(approved, "Contract not approved");

        nft.safeTransferFrom(owner, to, tokenId);

        emit NFTTransferred(nftContract, tokenId, owner, to);
    }
}