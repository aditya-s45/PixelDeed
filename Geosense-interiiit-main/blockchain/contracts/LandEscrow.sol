// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LandEscrow is ReentrancyGuard {
    IERC721 public nftContract;
    IERC20 public tokenContract;

    struct Escrow {
        address seller;
        address buyer;
        uint256 tokenId;
        uint256 price;
        bool isFunded;
        bool isCompleted;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    event EscrowCreated(uint256 indexed escrowId, address indexed seller, uint256 indexed tokenId, uint256 price);
    event EscrowFunded(uint256 indexed escrowId, address indexed buyer);
    event EscrowCompleted(uint256 indexed escrowId);

    constructor(address _nftAddress, address _tokenAddress) {
        nftContract = IERC721(_nftAddress);
        tokenContract = IERC20(_tokenAddress);
    }

    function createEscrow(uint256 tokenId, uint256 price) external returns (uint256) {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nftContract.getApproved(tokenId) == address(this) || nftContract.isApprovedForAll(msg.sender, address(this)), "Contract not approved");

        // Transfer NFT to escrow contract
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            seller: msg.sender,
            buyer: address(0),
            tokenId: tokenId,
            price: price,
            isFunded: false,
            isCompleted: false
        });

        emit EscrowCreated(escrowId, msg.sender, tokenId, price);
        return escrowId;
    }

    function fundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.isFunded, "Already funded");
        require(!escrow.isCompleted, "Already completed");
        require(escrow.seller != msg.sender, "Seller cannot buy");

        // Transfer tokens from buyer to escrow
        require(tokenContract.transferFrom(msg.sender, address(this), escrow.price), "Token transfer failed");

        escrow.buyer = msg.sender;
        escrow.isFunded = true;

        emit EscrowFunded(escrowId, msg.sender);
    }

    function completeEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.isFunded, "Not funded yet");
        require(!escrow.isCompleted, "Already completed");
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Not party to escrow");

        escrow.isCompleted = true;

        // Transfer NFT to buyer
        nftContract.transferFrom(address(this), escrow.buyer, escrow.tokenId);
        
        // Transfer tokens to seller
        require(tokenContract.transfer(escrow.seller, escrow.price), "Token transfer failed");

        emit EscrowCompleted(escrowId);
    }
}
