
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init, catchEvent, getTestToken } from "./init";

task("buyitem", "Buy item")
    .addParam("nft", "Number of NFT: 721 or 1155")
    .addParam("id", "Token ID which buy")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init(taskArgs.nft, hre)
        const moneyToken = await getTestToken(hre);
        moneyToken.approve(marketPlace.address, marketPlace.prices(+taskArgs.id));
        const tx = await marketPlace.buyItem(+taskArgs.id);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Buyer", "Token ID", "Price"]);
    })