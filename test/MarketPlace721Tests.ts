import { expect } from "chai";
import { randomBytes } from "crypto";
import { Signer } from "ethers";
import { isBytesLike } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { IERC20, MarketPlace721, TestToken721 } from "../typechain";

describe("MarketPlace721", function () {
    let marketPlace721: MarketPlace721;
    let testToken721: TestToken721;
    let token: IERC20;
    let signer: Signer;

    beforeEach(async function() {
      signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, ethers.provider);

      const TestToken721Factory = await ethers.getContractFactory("TestToken721");
      testToken721 = await TestToken721Factory.deploy();
      await testToken721.deployed();
    
      const MarketPlaceFactory721 = await ethers.getContractFactory("MarketPlace721");
      marketPlace721 = await MarketPlaceFactory721.deploy(process.env.TEST_TOKEN_ADDRESS as string, testToken721.address);
      await marketPlace721.deployed();

      token = await ethers.getContractAt("IERC20", process.env.TEST_TOKEN_ADDRESS as string);

      await testToken721.setMinterRole(marketPlace721.address);
    })

    it("create, list and buy item", async function () {
      const accounts = await ethers.getSigners();
      await marketPlace721.createItem(accounts[1].address, "qwe");
      await expect(marketPlace721.connect(accounts[0]).listItem(1, 100)).to.be.revertedWith("You are not owner of token");

      await testToken721.connect(accounts[1]).approve(marketPlace721.address, 1);
      await marketPlace721.connect(accounts[1]).listItem(1, 100);
      await expect(marketPlace721.cancel(1)).to.be.revertedWith("You didn't sell this token");
      await marketPlace721.connect(accounts[1]).cancel(1);

      await ethers.provider.send("hardhat_setBalance", [  
        await signer.getAddress(), 
        "0x100000000000000000000000000000000000000"
      ])
      await expect(marketPlace721.connect(accounts[0]).buyItem(1)).to.be.revertedWith("No such token on MarketPlace");
      await testToken721.connect(accounts[1]).approve(marketPlace721.address, 1);
      await marketPlace721.connect(accounts[1]).listItem(1, 100);
      await token.connect(signer).burn(accounts[0].address, await token.balanceOf(accounts[0].address));
      await expect(marketPlace721.connect(accounts[0]).buyItem(1)).to.be.revertedWith("Don't have enough tokens");
      await token.connect(signer).mint(accounts[0].address, 1000);
      await expect(marketPlace721.connect(accounts[0]).buyItem(1)).to.be.revertedWith("You are not approved tokens");
      await token.connect(accounts[0]).approve(marketPlace721.address, 100);
      await marketPlace721.connect(accounts[0]).buyItem(1);

      await testToken721.approve(marketPlace721.address, 1);
      await marketPlace721.listItemOnAuction(1, 100);
      await expect(marketPlace721.cancel(1)).to.be.revertedWith("This token not for sale");
    });

    it("listItemOnAuction, makeBid", async function() {
      const accounts = await ethers.getSigners();
      await marketPlace721.createItem(accounts[0].address, "qwe");
      await expect(marketPlace721.connect(accounts[2]).makeBid(1, 200)).to.be.revertedWith("No such token on MarketPlace");

      await testToken721.approve(marketPlace721.address, 1);
      await expect(marketPlace721.connect(accounts[1]).listItemOnAuction(1, 100)).to.be.revertedWith("You are not owner of token");
      await marketPlace721.listItem(1, 100);
      await expect(marketPlace721.connect(accounts[2]).makeBid(1, 200)).to.be.revertedWith("This token not for auction");
      await marketPlace721.cancel(1);


      await testToken721.approve(marketPlace721.address, 1);
      await marketPlace721.listItemOnAuction(1, 100);

      await ethers.provider.send("hardhat_setBalance", [  
        await signer.getAddress(), 
        "0x100000000000000000000000000000000000000"
      ])
      await token.connect(signer).mint(accounts[1].address, 10000);
      await token.connect(signer).burn(accounts[2].address, await token.balanceOf(accounts[2].address));
      await expect(marketPlace721.connect(accounts[2]).makeBid(1, 200)).to.be.revertedWith("not enough funds");
      await expect(marketPlace721.connect(accounts[1]).makeBid(1, 50)).to.be.revertedWith("Too low price");

      await marketPlace721.connect(accounts[1]).makeBid(1, 200);

      await token.connect(signer).mint(accounts[2].address, 10000);

      await marketPlace721.connect(accounts[2]).makeBid(1, 300);

      const threeDays = 5 * 24 * 60 * 60;
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;
      await ethers.provider.send('evm_mine', [timestampBefore + threeDays]);

      await expect(marketPlace721.connect(accounts[1]).makeBid(1, 400)).to.be.revertedWith("Auction has already ended");
    })

    it("finishAuction", async function () {
      const accounts = await ethers.getSigners();
      await marketPlace721.createItem(accounts[0].address, "qwe");
      await testToken721.approve(marketPlace721.address, 1);
      await marketPlace721.listItemOnAuction(1, 100);
      await expect(marketPlace721.finishAuction(1)).to.be.revertedWith("Auction not ended yet");

      const threeDays = 5 * 24 * 60 * 60;
      await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp + threeDays]);

      await expect(marketPlace721.connect(accounts[1]).finishAuction(1)).to.be.revertedWith("You are not an owner of auction");

      await marketPlace721.finishAuction(1);
      await expect(marketPlace721.finishAuction(1)).to.be.revertedWith("already ended");

      await testToken721.approve(marketPlace721.address, 1);
      await marketPlace721.listItemOnAuction(1, 100);
      await ethers.provider.send("hardhat_setBalance", [  
        await signer.getAddress(), 
        "0x100000000000000000000000000000000000000"
      ])
      await token.connect(signer).mint(accounts[1].address, 10000);
      await marketPlace721.connect(accounts[1]).makeBid(1, 200);

      await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp + threeDays]);
      await marketPlace721.finishAuction(1);
    })

    it("onERC721Received", async function () {
      expect(isBytesLike(await marketPlace721.onERC721Received(await signer.getAddress(), await signer.getAddress(), 1, randomBytes(1)))).to.eq(true);
    })
});
