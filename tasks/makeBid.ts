
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init, catchEvent, getTestToken } from "./init";

task("makebid", "Make bid on auction")
    .addParam("nft", "Number of NFT: 721 or 1155")
    .addParam("id", "Token ID which buy")
    .addParam("price", "Price to bid")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init(taskArgs.nft, hre)
        const moneyToken = await getTestToken(hre);
        moneyToken.approve(marketPlace.address, marketPlace.prices(+taskArgs.id));
        const tx = await marketPlace.makeBid(+taskArgs.id, +taskArgs.price);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Pretendent", "Token ID", "Old Price", "New Price"]);

    })