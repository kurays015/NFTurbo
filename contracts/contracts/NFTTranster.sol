// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";


contract NFTTranster {


        // Events for ERC721 transfers
    event NFTTransferred(
        address indexed nftContract, 
        uint256 indexed tokenId, 
        address indexed from, 
        address to
    );
    
    // Events for ERC1155 transfers
    event TokenTransferred(
        address indexed tokenContract, 
        uint256 indexed tokenId, 
        address indexed from, 
        address to, 
        uint256 amount
    );


    function transferERC721(
        address nftContract,
        uint256 tokenId,
        address to
    ) public {
        require(to != address(0), "Invalid recipient");

        IERC721 nft = IERC721(nftContract);
        address owner = nft.ownerOf(tokenId);
        require(owner == msg.sender, "Caller is not the owner");

        bool approved = nft.isApprovedForAll(owner, address(this)) || 
                       nft.getApproved(tokenId) == address(this);
        require(approved, "Contract not approved");

        nft.safeTransferFrom(owner, to, tokenId);

        emit NFTTransferred(nftContract, tokenId, owner, to);
    }

     function transferERC1155(
        address tokenContract,
        uint256 tokenId,
        address to,
        uint256 amount
    ) public {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");

        IERC1155 token = IERC1155(tokenContract);
        
        // Check if sender has sufficient balance
        uint256 senderBalance = token.balanceOf(msg.sender, tokenId);
        require(senderBalance >= amount, "Insufficient balance");

        // Check if contract is approved
        require(
            token.isApprovedForAll(msg.sender, address(this)), 
            "Contract not approved for all tokens"
        );

        // Transfer tokens
        token.safeTransferFrom(msg.sender, to, tokenId, amount, "");

        emit TokenTransferred(tokenContract, tokenId, msg.sender, to, amount);
    }
}



