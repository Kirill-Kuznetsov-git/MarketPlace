import "@nomiclabs/hardhat-waffle";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import { IERC20 } from "../typechain";


export async function getTestToken(hre: HardhatRuntimeEnvironment) {
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    return <IERC20>(await hre.ethers.getContractAt("IERC20", process.env.TEST_TOKEN_ADDRESS as string));
}

export async function getTestToken721(hre: HardhatRuntimeEnvironment) {
    let CONTRACT_ADDRESS: string
    if (`${process.env.NETWORK}` == 'LOCALHOST'){
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_TESTTOKEN721_LOCALHOST}`;
    } else {
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_TESTTOKEN721_GOERLI}`;
    }
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    const Factory = await hre.ethers.getContractFactory("TestToken721", signer);
    return new hre.ethers.Contract(
        CONTRACT_ADDRESS,
        Factory.interface,
        signer
    )
}

export async function getTestToken1155(hre: HardhatRuntimeEnvironment) {
    let CONTRACT_ADDRESS: string
    if (`${process.env.NETWORK}` == 'LOCALHOST'){
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_TESTTOKEN1155_LOCALHOST}`;
    } else {
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_TESTTOKEN1155_GOERLI}`;
    }
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    const Factory = await hre.ethers.getContractFactory("TestToken1155", signer);
    return new hre.ethers.Contract(
        CONTRACT_ADDRESS,
        Factory.interface,
        signer
    )
}

export async function getMarketPlace721(hre: HardhatRuntimeEnvironment) {
    let CONTRACT_ADDRESS: string
    if (`${process.env.NETWORK}` == 'LOCALHOST'){
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_MARKETPLACE721_LOCALHOST}`;
    } else {
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_MARKETPLACE721_GOERLI}`;
    }
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    const Factory = await hre.ethers.getContractFactory("MarketPlace721", signer);
    return new hre.ethers.Contract(
        CONTRACT_ADDRESS,
        Factory.interface,
        signer
    )
}

export async function getMarketPlace1155(hre: HardhatRuntimeEnvironment) {
    let CONTRACT_ADDRESS: string
    if (`${process.env.NETWORK}` == 'LOCALHOST'){
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_MARKETPLACE1155_LOCALHOST}`;
    } else {
        CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS_CONTRACT_ADDRESS_MARKETPLACE1155_GOERLIGOERLI}`;
    }
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    const Factory = await hre.ethers.getContractFactory("MarketPlace1155", signer);
    return new hre.ethers.Contract(
        CONTRACT_ADDRESS,
        Factory.interface,
        signer
    )
}

export async function init(nft: string, hre: HardhatRuntimeEnvironment) {
    let token: any;
    let marketPlace: any;
    if (nft === "721") {
        token = await getTestToken721(hre);
        marketPlace = await getMarketPlace721(hre);
    }
    else if (nft === "1155") {
        token = await getTestToken1155(hre);
        marketPlace = await getMarketPlace1155(hre);
    }
    return [token, marketPlace];
}

export async function catchEvent(txWait: any, args: string[]) {
    let n: number = 0;
    while (txWait.events[n].args == undefined) {
        n++;
    }
    for (let i = 0; i < args.length; i++){
        console.log(args[i] + ": " + txWait.events[n].args[i])
    }
}