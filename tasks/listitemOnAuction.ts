
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init, catchEvent } from "./init";

task("listitemonauction", "List item on auction")
    .addParam("nft", "Number of NFT: 721 or 1155")
    .addParam("id", "Token ID")
    .addParam("price", "Start price of token")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init(taskArgs.nft, hre)
        await token.approve(marketPlace.address, +taskArgs.id);
        const tx = await marketPlace.listitemOnAuction(+taskArgs.id, +taskArgs.price);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Seller", "Token ID", "Min Price"])
    })