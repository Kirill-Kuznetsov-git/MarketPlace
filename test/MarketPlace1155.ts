import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("MarketPlace1155", function () {
  beforeEach(async function() {
    const TestToken1155Factory = await ethers.getContractFactory("TestToken1155");
    const TestToken1155 = await TestToken1155Factory.deploy();
    await TestToken1155.deployed();
  
    const MarketPlaceFactory1155 = await ethers.getContractFactory("MarketPlace1155");
    const MarketPlace1155 = await MarketPlaceFactory1155.deploy(process.env.TEST_TOKEN_ADDRESS as string, TestToken1155.address);
    await MarketPlace1155.deployed();
  })

  it("test", async function () {

  });
});
