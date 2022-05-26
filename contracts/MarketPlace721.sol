//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IMarketPlace.sol";
import "./token/TestToken721.sol";
import "./token/TestToken1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./token/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract MarketPlace721 is IMarketPlace, IERC721Receiver {
    enum SellType{ FREE, SELL, AUCTION }
    IERC20 private valueToken;
    TestToken721 private token;
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

    modifier TokenForSale(uint256 tokenId) {
        require(token.ownerOf(tokenId) == address(this), "No such token on MarketPlace");
        require(sellTypes[tokenId] == SellType.SELL, "This token not for sale");
        _;
    }

    modifier TokenForAuction(uint256 tokenId) {
        require(token.ownerOf(tokenId) == address(this), "No such token on MarketPlace");
        require(sellTypes[tokenId] == SellType.AUCTION, "This token not for auction");
        _;
    }

    constructor(IERC20 _valueToken, TestToken721 _token) {
        valueToken = _valueToken;
        token = _token;
    }

    function createItem(address owner, string memory tokenURI) override external {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        token.mint(owner, newItemId, tokenURI);
    }

    function listItem(uint256 tokenId, uint256 price) override external {
        require(token.ownerOf(tokenId) == msg.sender, "You are not owner of token");
        require(sellTypes[tokenId] == SellType.FREE, "token must be free");
        token.transferFrom(msg.sender, address(this), tokenId);
        sellers[tokenId] = msg.sender;
        prices[tokenId] = price;
        sellTypes[tokenId] = SellType.SELL;
    }

    function cancel(uint256 tokenId) override external TokenForSale(tokenId) {
        require(sellers[tokenId] == msg.sender, "You didn't sell this token");
        token.approve(msg.sender, tokenId);
        token.transferFrom(address(this), msg.sender, tokenId);
        sellTypes[tokenId] = SellType.FREE;
    }

    function buyItem(uint256 tokenId) override external TokenForSale(tokenId) {
        require(valueToken.balanceOf(msg.sender) >= prices[tokenId], "Don't have enough tokens");
        require(valueToken.allowance(msg.sender, address(this)) >= prices[tokenId], "You are not approved tokens");
        valueToken.transferFrom(msg.sender, address(this), prices[tokenId]);
        sellTypes[tokenId] = SellType.FREE;
        valueToken.transfer(sellers[tokenId], prices[tokenId]);
        token.approve(msg.sender, tokenId);
        token.transferFrom(address(this), msg.sender, tokenId);
    }

    function listItemOnAction(uint256 tokenId, uint256 minPrice) override external {
        require(token.ownerOf(tokenId) == msg.sender, "You are not owner of token");
        require(auctions[tokenId].ended == false, "old auction did not ended");
        require(sellTypes[tokenId] == SellType.FREE, "token must be free");
        token.transferFrom(msg.sender, address(this), tokenId);
        sellers[tokenId] = msg.sender;
        prices[tokenId] = minPrice;
        sellTypes[tokenId] = SellType.AUCTION;
        Auction memory newAuction = Auction(block.timestamp, false, address(0));
        auctions[tokenId] = newAuction;
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
        prices[tokenId] = price;
        auctions[tokenId].pretendent = msg.sender;
    }

    function finishAuction(uint256 tokenId) override external {
        require(auctions[tokenId].startAt + DURATION < block.timestamp, "Auction not ended yet");
        require(auctions[tokenId].ended == false, "already ended");
        if (auctions[tokenId].pretendent == address(0)){
            token.approve(sellers[tokenId], tokenId);
            token.transferFrom(address(this), sellers[tokenId], tokenId);
        }
        else{
            token.approve(auctions[tokenId].pretendent, tokenId);
            token.transferFrom(address(this), auctions[tokenId].pretendent, tokenId);

            valueToken.transfer(sellers[tokenId], prices[tokenId]);
        }

        sellTypes[tokenId] = SellType.FREE;
        auctions[tokenId].ended = true;
    }



    function onERC721Received(address, address, uint256, bytes calldata) public override pure returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256)"));
    }
}