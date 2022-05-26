//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketPlace {
    function createItem(address owner, string memory tokenURI) external;

    function listItem(uint256 tokenId, uint256 price) external;

    function cancel(uint256 tokenId) external;

    function buyItem(uint256 tokenId) external;

    function listItemOnAuction(uint256 tokenId, uint256 minPrice) external;

    function makeBid(uint256 tokenId, uint256 price) external;

    function finishAuction(uint256 tokenId) external;

    event ItemCreated(address owner, uint256 tokenId);

    event ItemListed(address seller, uint256 tokenId, uint256 price);

    event ItemCanceled(address owner, uint256 tokenId);

    event ItemBuyed(address buyer, uint256 tokenId, uint256 price);

    event ItemListedOnAuction(address owner, uint256 tokenId, uint256 minPrice);

    event BidMaked(address pretendent, uint256 tokenId, uint256 oldPrice, uint256 newPrice);

    event AuctionFinished(address owner, uint256 tokenId, uint256 price);
}