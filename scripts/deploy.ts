
import { ethers } from "hardhat";

async function main() {

  const TestToken721Factory = await ethers.getContractFactory("TestToken721");
  const TestToken721 = await TestToken721Factory.deploy();

  const TestToken1155Factory = await ethers.getContractFactory("TestToken1155");
  const TestToken1155 = await TestToken1155Factory.deploy();

  const MarketPlaceFactory = await ethers.getContractFactory("NFT721");
  const MarketPlace = await MarketPlaceFactory.deploy("TestToken", "TT");

  await TestToken721.deployed();
  console.log("TestToken721 deployed to:", TestToken721.address);
  await TestToken1155.deployed();
  console.log("TestToken1155 deployed to:", TestToken1155.address);
  await MarketPlace.deployed();
  console.log("MarketPlace deployed to:", MarketPlace.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
