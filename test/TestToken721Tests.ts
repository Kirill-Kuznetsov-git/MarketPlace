import { expect } from "chai";
import { ethers, network } from "hardhat";
import { TestToken721 } from "../typechain";

describe("TestToken721", function () {
    let testToken721: TestToken721;

    beforeEach(async function() {
        const TestToken721Factory = await ethers.getContractFactory("TestToken721");
        testToken721 = await TestToken721Factory.deploy();
        await testToken721.deployed();
    })

    it("mint, removeMinterRole and setMinterRole", async function () {
        const accounts = await ethers.getSigners();
        await expect(testToken721.connect(accounts[1]).mint(accounts[1].address, 1, "qwe")).to.be.revertedWith("not minter");

        await expect(testToken721.connect(accounts[1]).setMinterRole(accounts[1].address)).to.be.revertedWith("not owner");

        await testToken721.setMinterRole(accounts[1].address);
        await testToken721.connect(accounts[1]).mint(accounts[1].address, 1, "qwe");

        expect(await testToken721.balanceOf(accounts[1].address)).to.eq(1);
        expect(await testToken721.ownerOf(1)).to.eq(accounts[1].address);

        await expect(testToken721.connect(accounts[1]).mint(accounts[1].address, 1, "qwe")).to.be.revertedWith("ERC721: token already minted");

        await testToken721.removeMinterRole(accounts[1].address);
        await expect(testToken721.connect(accounts[1]).mint(accounts[1].address, 1, "qwe")).to.be.revertedWith("not minter");

        expect(await testToken721.tokenURI(1)).to.eq("ipfs://qwe");
    })

});
