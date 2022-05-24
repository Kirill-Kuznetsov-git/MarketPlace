import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("Greeter", function () {
  beforeEach(async function() {
    const NFT721Factory = await ethers.getContractFactory("NFT721");
    const NFT721 = await NFT721Factory.deploy("TestToken", "TT");
  
    const NFT1155Factory = await ethers.getContractFactory("NFT1155");
    const NFT1155 = await NFT1155Factory.deploy("uri");
  
    const MarketPlaceFactory = await ethers.getContractFactory("NFT721");
    const MarketPlace = await MarketPlaceFactory.deploy("TestToken", "TT");

    await NFT721.deployed();
    await NFT1155.deployed();
    await MarketPlace.deployed();
  })

  it("test", async function () {

  });
});
