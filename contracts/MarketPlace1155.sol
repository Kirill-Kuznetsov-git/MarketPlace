//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IMarketPlace.sol";
import "./token/TestToken1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./token/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract MarketPlace1155 is IMarketPlace, ERC1155Holder {
    enum SellType{ FREE, SELL, AUCTION }
    IERC20 private valueToken;
    TestToken1155 private token;
    uint256 private DURATION = 3 days;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Auction {
        uint256 startAt;
        bool ended;
        address pretendent;
    }

    // mapping tokenId to auction
    mapping(uint256 => Auction) public auctions;

    // mapping tokenId to price
    mapping(uint256 => uint256) public prices;

    // mapping tokenId and seller
    mapping(uint256 => address) public sellers;

    // mapping tokenId to sell type
    mapping(uint256 => SellType) public sellTypes;

    modifier TokenForAuction(uint256 tokenId) {
        require(token.balanceOf(address(this), tokenId) >= 1, "No such token on MarketPlace");
        require(sellTypes[tokenId] == SellType.AUCTION, "This token not for auction");
        _;
    }

    modifier TokenForSale(uint256 tokenId) {
        require(token.balanceOf(address(this), tokenId) >= 1, "No such token on MarketPlace");
        require(sellTypes[tokenId] == SellType.SELL, "This token not for sale");
        _;
    }

    constructor(IERC20 _valueToken, TestToken1155 _token) {
        valueToken = _valueToken;
        token = _token;
    }

    event ItemAdded(address owner, uint256 tokenId);
    
    function createItem(address owner, string memory tokenURI) override external {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        token.mint(owner, newItemId, 1, "", tokenURI);
        emit ItemCreated(owner, newItemId);
    }

    function addItem(address owner, uint256 tokenId) external {
        token.mint(owner, tokenId, 1, "");
        emit ItemAdded(owner, tokenId);
    }

    function listItem(uint256 tokenId, uint256 price) override external {
        require(token.balanceOf(msg.sender, tokenId) >= 1, "You are not owner of token");
        require(sellTypes[tokenId] == SellType.FREE, "token must be free");
        token.safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        sellers[tokenId] = msg.sender;
        prices[tokenId] = price;
        sellTypes[tokenId] = SellType.SELL;
        emit ItemListed(msg.sender, tokenId, price);
    }

    function cancel(uint256 tokenId) override external TokenForSale(tokenId) {
        require(sellers[tokenId] == msg.sender, "You didn't sell this token");
        token.setApprovalForAll(msg.sender, true);
        token.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        token.setApprovalForAll(msg.sender, false);
        sellTypes[tokenId] = SellType.FREE;
        emit ItemCanceled(sellers[tokenId], tokenId);
    }

    function buyItem(uint256 tokenId) override external TokenForSale(tokenId) {
        require(valueToken.balanceOf(msg.sender) >= prices[tokenId], "Don't have enough tokens");
        require(valueToken.allowance(msg.sender, address(this)) >= prices[tokenId], "You are not approved tokens");
        valueToken.transferFrom(msg.sender, address(this), prices[tokenId]);
        sellTypes[tokenId] = SellType.FREE;
        valueToken.transfer(sellers[tokenId], prices[tokenId]);
        token.setApprovalForAll(msg.sender, true);
        token.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        token.setApprovalForAll(msg.sender, false);
        emit ItemBuyed(msg.sender, tokenId, prices[tokenId]);
    }

    function listItemOnAuction(uint256 tokenId, uint256 minPrice) override external {
        require(token.balanceOf(msg.sender, tokenId) >= 1, "You are not owner of token");
        require(auctions[tokenId].ended == false, "old auction did not ended");
        require(sellTypes[tokenId] == SellType.FREE, "token must be free");
        token.safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        sellers[tokenId] = msg.sender;
        prices[tokenId] = minPrice;
        sellTypes[tokenId] = SellType.AUCTION;
        Auction memory newAuction = Auction(block.timestamp, false, address(0));
        auctions[tokenId] = newAuction;
        emit ItemListedOnAuction(msg.sender, tokenId, minPrice);
    }

    function makeBid(uint256 tokenId, uint256 price) override external TokenForAuction(tokenId) {
        require(valueToken.balanceOf(msg.sender) >= price, "not enough funds");
        require(auctions[tokenId].pretendent == address(0) || (auctions[tokenId].pretendent != address(0) && valueToken.allowance(msg.sender, address(this)) >= price), "You are not approved tokens");
        require(prices[tokenId] < price, "Too low price");
        require(auctions[tokenId].startAt + DURATION >= block.timestamp, "Auction has already ended");
        if (auctions[tokenId].pretendent != address(0)) {
            valueToken.transfer(auctions[tokenId].pretendent, prices[tokenId]);
        }
        valueToken.transferFrom(msg.sender, address(this), price);
        uint256 oldPrice = prices[tokenId];
        prices[tokenId] = price;
        auctions[tokenId].pretendent = msg.sender;
        emit BidMaked(msg.sender, tokenId, oldPrice, price);
    }

    function finishAuction(uint256 tokenId) override external {
        require(auctions[tokenId].startAt + DURATION < block.timestamp, "Auction not ended yet");
        require(auctions[tokenId].ended == false, "already ended");
        if (auctions[tokenId].pretendent == address(0)){
            token.setApprovalForAll(sellers[tokenId], true);
            token.safeTransferFrom(address(this), sellers[tokenId], tokenId, 1, "");
            token.setApprovalForAll(sellers[tokenId], false);
        }
        else{
            token.setApprovalForAll(auctions[tokenId].pretendent, true);
            token.safeTransferFrom(address(this), auctions[tokenId].pretendent, tokenId, 1, "");
            token.setApprovalForAll(auctions[tokenId].pretendent, false);

            valueToken.transfer(sellers[tokenId], prices[tokenId]);
        }

        sellTypes[tokenId] = SellType.FREE;
        auctions[tokenId].ended = true;
        emit AuctionFinished(msg.sender, tokenId, auctions[tokenId].pretendent == address(0) ? 0 : prices[tokenId]);
    }
}