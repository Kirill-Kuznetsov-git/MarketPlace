import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("MarketPlace721", function () {
  beforeEach(async function() {
    const TestToken721Factory = await ethers.getContractFactory("TestToken721");
    const TestToken721 = await TestToken721Factory.deploy();
    await TestToken721.deployed();
  
    const MarketPlaceFactory721 = await ethers.getContractFactory("MarketPlace721");
    const MarketPlace721 = await MarketPlaceFactory721.deploy(process.env.TEST_TOKEN_ADDRESS as string, TestToken721.address);
    await MarketPlace721.deployed();
  })

  it("test", async function () {

  });
});
