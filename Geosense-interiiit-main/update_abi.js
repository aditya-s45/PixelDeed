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
content = content.replace(/export const GEO_NFT_ADDRESS = ".*";/, 'export const GEO_NFT_ADDRESS = "0xa09541C11897A5229e8f2D85CD95c129199Ef688";');
content = content.replace(/export const GEO_TOKEN_ADDRESS = ".*";/, 'export const GEO_TOKEN_ADDRESS = "0x10fFe5f723B0D9d8Bef3B833686630eA5B8ab5A5";');
content = content.replace(/export const LAND_ESCROW_ADDRESS = ".*";/, 'export const LAND_ESCROW_ADDRESS = "0xaf683a58BbfAD52BeA58e12E6D60Ee5f7f225bB9";');

fs.writeFileSync('client-2/config/contracts.js', content);
console.log("Updated contracts.js");
