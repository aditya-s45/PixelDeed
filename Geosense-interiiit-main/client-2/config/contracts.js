export const GEO_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const GEO_NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const LAND_ESCROW_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const GEO_DAO_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const GeoTokenABI = [
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)"
];

export const GeoNFTABI = [
  "function tokenizeLand(address to, string memory uri, string memory coordinates, uint256 areaSqMeters) public returns (uint256)",
  "function getLandDetails(uint256 tokenId) public view returns (tuple(string coordinates, uint256 areaSqMeters, address originalTokenizer, uint256 timestamp))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event LandTokenized(uint256 indexed tokenId, address owner, uint256 areaSqMeters)"
];

export const LandEscrowABI = [
  "function createEscrow(uint256 tokenId, uint256 price) external returns (uint256)",
  "function fundEscrow(uint256 escrowId) external",
  "function completeEscrow(uint256 escrowId) external"
];
