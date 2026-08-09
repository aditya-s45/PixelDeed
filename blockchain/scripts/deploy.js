const hre = require("hardhat");

async function main() {
  console.log("Deploying GeoToken...");
  const GeoToken = await hre.ethers.getContractFactory("GeoToken");
  const geoToken = await GeoToken.deploy();
  await geoToken.waitForDeployment();
  const tokenAddress = await geoToken.getAddress();
  console.log(`GeoToken deployed to: ${tokenAddress}`);

  console.log("Deploying GeoNFT...");
  const GeoNFT = await hre.ethers.getContractFactory("GeoNFT");
  const geoNFT = await GeoNFT.deploy();
  await geoNFT.waitForDeployment();
  const nftAddress = await geoNFT.getAddress();
  console.log(`GeoNFT deployed to: ${nftAddress}`);

  console.log("Deploying LandEscrow...");
  const LandEscrow = await hre.ethers.getContractFactory("LandEscrow");
  const landEscrow = await LandEscrow.deploy(nftAddress, tokenAddress);
  await landEscrow.waitForDeployment();
  const escrowAddress = await landEscrow.getAddress();
  console.log(`LandEscrow deployed to: ${escrowAddress}`);

  console.log("Deploying GeoDAO...");
  const GeoDAO = await hre.ethers.getContractFactory("GeoDAO");
  const geoDAO = await GeoDAO.deploy(tokenAddress);
  await geoDAO.waitForDeployment();
  const daoAddress = await geoDAO.getAddress();
  console.log(`GeoDAO deployed to: ${daoAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
