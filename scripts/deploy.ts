
import { ethers } from "hardhat";

async function main() {

  const NFT721Factory = await ethers.getContractFactory("NFT721");
  const NFT721 = await NFT721Factory.deploy("TestToken", "TT");

  const NFT1155Factory = await ethers.getContractFactory("NFT1155");
  const NFT1155 = await NFT1155Factory.deploy("uri");

  const MarketPlaceFactory = await ethers.getContractFactory("NFT721");
  const MarketPlace = await MarketPlaceFactory.deploy("TestToken", "TT");

  await NFT721.deployed();
  console.log("NFT721 deployed to:", NFT721.address);
  await NFT1155.deployed();
  console.log("NFT1155 deployed to:", NFT1155.address);
  await MarketPlace.deployed();
  console.log("MarketPlace deployed to:", MarketPlace.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
