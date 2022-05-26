
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init, catchEvent } from "./init";

task("listitem", "List item on the selling")
    .addParam("nft", "Number of NFT: 721 or 1155")
    .addParam("id", "Token ID which list")
    .addParam("price", "Price of token")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init(taskArgs.nft, hre);
        await token.approve(marketPlace.address, +taskArgs.id);
        const tx = await marketPlace.listItem(+taskArgs.id, +taskArgs.price);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Seller", "Token ID", "Price"])
    })