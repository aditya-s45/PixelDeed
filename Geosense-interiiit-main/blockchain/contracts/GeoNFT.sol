// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GeoNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Struct to store land parcel metadata on-chain
    struct LandParcel {
        string coordinates; // JSON string of bounding box coordinates
        uint256 areaSqMeters;
        uint256 estimatedValue; // AI Valuation in GeoTokens
        address originalTokenizer;
        uint256 timestamp;
    }

    mapping(uint256 => LandParcel) public landParcels;

    event LandTokenized(uint256 indexed tokenId, address owner, uint256 areaSqMeters, uint256 estimatedValue);

    constructor() ERC721("GeoSense Land Parcel", "GEONFT") Ownable(msg.sender) {}

    function tokenizeLand(
        address to, 
        string memory uri, 
        string memory coordinates, 
        uint256 areaSqMeters,
        uint256 estimatedValue
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        landParcels[tokenId] = LandParcel({
            coordinates: coordinates,
            areaSqMeters: areaSqMeters,
            estimatedValue: estimatedValue,
            originalTokenizer: to,
            timestamp: block.timestamp
        });

        emit LandTokenized(tokenId, to, areaSqMeters, estimatedValue);
        
        return tokenId;
    }

    function getLandDetails(uint256 tokenId) public view returns (LandParcel memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return landParcels[tokenId];
    }
}
