
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract NFT721 is ERC1155 {
    constructor(string memory uri_) ERC1155(uri_) public {}
}