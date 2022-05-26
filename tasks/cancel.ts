
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init, catchEvent } from "./init";

task("cancel", "Cancel sell request")
    .addParam("nft", "Number of NFT: 721 or 1155")
    .addParam("id", "Token ID sell for which will be cancel")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init(taskArgs.nft, hre)
        const tx = await marketPlace.cancel(+taskArgs.id);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Owner", "Token ID"]);
    })