
import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { init, catchEvent } from "./init";

task("additem", "Add new item to already exist")
    .addParam("id", "Token ID")
    .addOptionalParam("owner", "Address of the owner")
    .setAction(async(taskArgs, hre) => {
        const [token, marketPlace] = await init("1155",  hre)
        const owner = taskArgs.owner == null ? (await hre.ethers.getSigners())[0].address : taskArgs.owner;
        const tx = await marketPlace.addItem(owner, taskArgs.id);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Owner", "Token ID"])
    })