// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GeoToken is ERC20, Ownable {
    constructor() ERC20("GeoToken", "GEO") Ownable(msg.sender) {
        // Mint initial supply of 10 million tokens to the deployer
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
