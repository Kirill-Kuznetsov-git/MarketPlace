
import { ethers } from "hardhat";

async function main() {

  const TestToken721Factory = await ethers.getContractFactory("TestToken721");
  const TestToken721 = await TestToken721Factory.deploy();

  const TestToken1155Factory = await ethers.getContractFactory("TestToken1155");
  const TestToken1155 = await TestToken1155Factory.deploy();

  await TestToken721.deployed();
  console.log("TestToken721 deployed to:", TestToken721.address);
  await TestToken1155.deployed();
  console.log("TestToken1155 deployed to:", TestToken1155.address);

  const MarketPlaceFactory721 = await ethers.getContractFactory("MarketPlace721");
  const MarketPlace721 = await MarketPlaceFactory721.deploy(process.env.TEST_TOKEN_ADDRESS as string, TestToken721.address);

  await MarketPlace721.deployed();
  console.log("MarketPlace721 deployed to:", MarketPlace721.address);

  const MarketPlaceFactory1155 = await ethers.getContractFactory("MarketPlace1155");
  const MarketPlace1155 = await MarketPlaceFactory1155.deploy(process.env.TEST_TOKEN_ADDRESS as string, TestToken1155.address);

  await MarketPlace1155.deployed();
  await TestToken721.setMinterRole(MarketPlace721.address);
  await TestToken1155.setMinterRole(MarketPlace1155.address);
  console.log("MarketPlace1155 deployed to:", MarketPlace1155.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
