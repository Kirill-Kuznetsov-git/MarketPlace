
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init, catchEvent } from "./init";

task("createitem", "Create new item")
    .addParam("nft", "Number of NFT: 721 or 1155")
    .addParam("uri", "URI of new item")
    .addOptionalParam("owner", "Address of the owner")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init(taskArgs.nft, hre)
        const owner = taskArgs.owner == null ? (await hre.ethers.getSigners())[0].address : taskArgs.owner;
        const tx = await marketPlace.createItem(owner, taskArgs.uri);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Owner", "Token ID"])
    })