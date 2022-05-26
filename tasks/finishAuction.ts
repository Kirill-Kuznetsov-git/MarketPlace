
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init , catchEvent } from "./init";

task("finishauction", "Finish auction")
    .addParam("nft", "Number of NFT: 721 or 1155")
    .addParam("id", "Token ID")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init(taskArgs.nft, hre)

        const tx = await marketPlace.finishAuction(+taskArgs.id);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Owner", "Token ID", "Price"]);
        
    })