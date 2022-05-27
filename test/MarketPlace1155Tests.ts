import { expect } from "chai";
import { Signer } from "ethers";
import { isBytesLike } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { MarketPlace1155, TestToken1155, IERC20 } from "../typechain";

describe("MarketPlace1155", function () {
  let marketPlace1155: MarketPlace1155;
  let testToken1155: TestToken1155;
  let token: IERC20;
  let signer: Signer;

  beforeEach(async function() {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, ethers.provider);

    const TestToken1155Factory = await ethers.getContractFactory("TestToken1155");
    testToken1155 = await TestToken1155Factory.deploy();
    await testToken1155.deployed();
  
    const MarketPlaceFactory1155 = await ethers.getContractFactory("MarketPlace1155");
    marketPlace1155 = await MarketPlaceFactory1155.deploy(process.env.TEST_TOKEN_ADDRESS as string, testToken1155.address);
    await marketPlace1155.deployed();

    token = await ethers.getContractAt("IERC20", process.env.TEST_TOKEN_ADDRESS as string);

    await testToken1155.setMinterRole(marketPlace1155.address);
  })

  it("create, add, list and buy item", async function () {
    const accounts = await ethers.getSigners();
    await marketPlace1155.createItem(accounts[1].address, "qwe");
    await expect(marketPlace1155.connect(accounts[0]).listItem(1, 100)).to.be.revertedWith("You are not owner of token");

    await testToken1155.connect(accounts[1]).setApprovalForAll(marketPlace1155.address, true);
    await marketPlace1155.connect(accounts[1]).listItem(1, 100);
    await testToken1155.connect(accounts[1]).setApprovalForAll(marketPlace1155.address, false);
    await expect(marketPlace1155.cancel(1)).to.be.revertedWith("You didn't sell this token");
    await marketPlace1155.connect(accounts[1]).cancel(1);

    await ethers.provider.send("hardhat_setBalance", [  
      await signer.getAddress(), 
      "0x100000000000000000000000000000000000000"
    ])
    await expect(marketPlace1155.connect(accounts[0]).buyItem(1)).to.be.revertedWith("No such token on MarketPlace");
    await testToken1155.connect(accounts[1]).setApprovalForAll(marketPlace1155.address, true);
    await marketPlace1155.connect(accounts[1]).listItem(1, 100);
    await testToken1155.connect(accounts[1]).setApprovalForAll(marketPlace1155.address, false);
    await expect(marketPlace1155.connect(accounts[0]).buyItem(1)).to.be.revertedWith("Don't have enough tokens");
    await token.connect(signer).mint(accounts[0].address, 1000);
    await expect(marketPlace1155.connect(accounts[0]).buyItem(1)).to.be.revertedWith("You are not approved tokens");
    await token.connect(accounts[0]).approve(marketPlace1155.address, 100);
    await marketPlace1155.connect(accounts[0]).buyItem(1);

    await testToken1155.setApprovalForAll(marketPlace1155.address, true);
    await marketPlace1155.listItemOnAuction(1, 100);
    await testToken1155.setApprovalForAll(marketPlace1155.address, false);
    await expect(marketPlace1155.cancel(1)).to.be.revertedWith("This token not for sale");
  });

  it ("add item", async function() {
    const accounts = await ethers.getSigners();
    await marketPlace1155.createItem(accounts[1].address, "qwe");
    await marketPlace1155.addItem(accounts[1].address, 1);

    await testToken1155.connect(accounts[1]).setApprovalForAll(marketPlace1155.address, true);
    await marketPlace1155.connect(accounts[1]).listItem(1, 100);
    await testToken1155.connect(accounts[1]).setApprovalForAll(marketPlace1155.address, false);

    await expect(marketPlace1155.connect(accounts[1]).listItem(1, 100)).to.be.revertedWith("token must be free");
  })

  it("listItemOnAuction, makeBid", async function() {
    const accounts = await ethers.getSigners();
    await marketPlace1155.createItem(accounts[0].address, "qwe");
    await expect(marketPlace1155.connect(accounts[2]).makeBid(1, 200)).to.be.revertedWith("No such token on MarketPlace");

    await testToken1155.setApprovalForAll(marketPlace1155.address, true);
    await expect(marketPlace1155.connect(accounts[1]).listItemOnAuction(1, 100)).to.be.revertedWith("You are not owner of token");
    await marketPlace1155.listItem(1, 100);
    await testToken1155.setApprovalForAll(marketPlace1155.address, false);
    await expect(marketPlace1155.connect(accounts[2]).makeBid(1, 200)).to.be.revertedWith("This token not for auction");
    await marketPlace1155.cancel(1);


    await testToken1155.setApprovalForAll(marketPlace1155.address, true);
    await marketPlace1155.listItemOnAuction(1, 100);
    await testToken1155.setApprovalForAll(marketPlace1155.address, false);

    await marketPlace1155.addItem(accounts[0].address, 1);
    await testToken1155.setApprovalForAll(marketPlace1155.address, true);
    await expect(marketPlace1155.listItemOnAuction(1, 100)).to.be.revertedWith("old auction did not ended");
    await testToken1155.setApprovalForAll(marketPlace1155.address, false);

    await ethers.provider.send("hardhat_setBalance", [  
      await signer.getAddress(), 
      "0x100000000000000000000000000000000000000"
    ])
    await token.connect(signer).mint(accounts[1].address, 10000);

    await expect(marketPlace1155.connect(accounts[2]).makeBid(1, 200)).to.be.revertedWith("not enough funds");
    await expect(marketPlace1155.connect(accounts[1]).makeBid(1, 50)).to.be.revertedWith("Too low price");

    token.connect(accounts[1]).approve(marketPlace1155.address, 200);
    await marketPlace1155.connect(accounts[1]).makeBid(1, 200);

    await token.connect(signer).mint(accounts[2].address, 10000);

    token.connect(accounts[2]).approve(marketPlace1155.address, 300);
    await marketPlace1155.connect(accounts[2]).makeBid(1, 300);

    const threeDays = 5 * 24 * 60 * 60;
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    await ethers.provider.send('evm_mine', [timestampBefore + threeDays]);
    
    await token.connect(accounts[1]).approve(marketPlace1155.address, 400);
    await expect(marketPlace1155.connect(accounts[1]).makeBid(1, 400)).to.be.revertedWith("Auction has already ended");
  })

  it("finishAuction", async function () {
    const accounts = await ethers.getSigners();
    await marketPlace1155.createItem(accounts[0].address, "qwe");
    await testToken1155.setApprovalForAll(marketPlace1155.address, true);
    await marketPlace1155.listItemOnAuction(1, 100);
    await testToken1155.setApprovalForAll(marketPlace1155.address, false);
    await expect(marketPlace1155.finishAuction(1)).to.be.revertedWith("Auction not ended yet");

    const threeDays = 5 * 24 * 60 * 60;
    await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp + threeDays]);

    await expect(marketPlace1155.connect(accounts[1]).finishAuction(1)).to.be.revertedWith("You are not an owner of auction");

    await marketPlace1155.finishAuction(1);
    await expect(marketPlace1155.finishAuction(1)).to.be.revertedWith("already ended");

    await testToken1155.setApprovalForAll(marketPlace1155.address, true);
    await marketPlace1155.listItemOnAuction(1, 100);
    await testToken1155.setApprovalForAll(marketPlace1155.address, false);
    await ethers.provider.send("hardhat_setBalance", [  
      await signer.getAddress(), 
      "0x100000000000000000000000000000000000000"
    ])
    await token.connect(signer).mint(accounts[1].address, 10000);
    await marketPlace1155.connect(accounts[1]).makeBid(1, 200);

    await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp + threeDays]);
    await marketPlace1155.finishAuction(1);
  })
});
