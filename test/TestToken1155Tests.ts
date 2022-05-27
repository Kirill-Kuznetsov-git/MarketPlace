import { expect } from "chai";
import { randomBytes } from "crypto";
import { ethers, network } from "hardhat";
import { TestToken1155 } from "../typechain";


describe("TestToken1155", function () {
    let testToken1155: TestToken1155;

    beforeEach(async function() {
        const TestToken1155Factory = await ethers.getContractFactory("TestToken1155");
        testToken1155 = await TestToken1155Factory.deploy();
        await testToken1155.deployed();
    })

    it("mint, removeMinterRole and setMinterRole", async function () {
        const accounts = await ethers.getSigners();

        await expect(testToken1155.connect(accounts[1])['mint(address,uint256,uint256,bytes,string)'](accounts[1].address, 1, 1, randomBytes(1), "qwe")).to.be.revertedWith("not minter");
    
        await expect(testToken1155.connect(accounts[1]).setMinterRole(accounts[1].address)).to.be.revertedWith("not owner");
    
        await testToken1155.setMinterRole(accounts[1].address);
        await testToken1155.connect(accounts[1])["mint(address,uint256,uint256,bytes,string)"](accounts[1].address, 1, 1, randomBytes(1), "qwe");
    
        expect(await testToken1155.balanceOf(accounts[1].address, 1)).to.eq(1);
    
        await expect(testToken1155.connect(accounts[1])["mint(address,uint256,uint256,bytes,string)"](accounts[1].address, 1, 1, randomBytes(1), "qwe")).to.be.revertedWith("ERC721: token already minted");
    
        await testToken1155.removeMinterRole(accounts[1].address);
        await expect(testToken1155.connect(accounts[1])["mint(address,uint256,uint256,bytes,string)"](accounts[1].address, 1, 1, randomBytes(1), "qwe")).to.be.revertedWith("not minter");
    
        await expect(testToken1155["mint(address,uint256,uint256,bytes)"](accounts[1].address, 2, 1, randomBytes(1))).to.be.revertedWith("ERC721: token does not exits");

        await testToken1155["mint(address,uint256,uint256,bytes)"](accounts[1].address, 1, 1, randomBytes(1));

        expect(await testToken1155.balanceOf(accounts[1].address, 1)).to.eq(2);
        
        await testToken1155.setURI("ipfs:///");
        expect(await testToken1155.uri(1)).to.eq("ipfs:///qwe");
    })

});
