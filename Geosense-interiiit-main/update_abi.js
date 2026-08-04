const fs = require('fs');
const nft = JSON.parse(fs.readFileSync('blockchain/artifacts/contracts/GeoNFT.sol/GeoNFT.json'));
const token = JSON.parse(fs.readFileSync('blockchain/artifacts/contracts/GeoToken.sol/GeoToken.json'));
const escrow = JSON.parse(fs.readFileSync('blockchain/artifacts/contracts/LandEscrow.sol/LandEscrow.json'));
let content = fs.readFileSync('client-2/config/contracts.js', 'utf8');

// Replace ABIs
content = content.replace(/export const GeoNFTABI = \[\s*[\s\S]*?\s*\];/m, 'export const GeoNFTABI = ' + JSON.stringify(nft.abi) + ';');
content = content.replace(/export const GeoTokenABI = \[\s*[\s\S]*?\s*\];/m, 'export const GeoTokenABI = ' + JSON.stringify(token.abi) + ';');
content = content.replace(/export const LandEscrowABI = \[\s*[\s\S]*?\s*\];/m, 'export const LandEscrowABI = ' + JSON.stringify(escrow.abi) + ';');

// Replace Addresses
content = content.replace(/export const GEO_NFT_ADDRESS = ".*";/, 'export const GEO_NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";');
content = content.replace(/export const GEO_TOKEN_ADDRESS = ".*";/, 'export const GEO_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";');
content = content.replace(/export const LAND_ESCROW_ADDRESS = ".*";/, 'export const LAND_ESCROW_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";');

fs.writeFileSync('client-2/config/contracts.js', content);
console.log("Updated contracts.js");
