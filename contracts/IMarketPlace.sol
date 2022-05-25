//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketPlace {
    function createItem(address owner, uint256 tokenId, string memory tokenURI) external;

    function listItem(uint256 tokenId, uint256 price) external;

    function cancel(uint256 tokenId) external;

    function buyItem(uint256 tokenId) external;

    function listItemOnAction(uint256 tokenId, uint256 minPrice) external;

    function makeBid(uint256 tokenId, uint256 price) external;

    function finishAuction(uint256 tokenId) external;
}