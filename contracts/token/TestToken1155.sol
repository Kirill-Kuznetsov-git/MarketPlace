
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestToken1155 is ERC1155 {
    address private owner;
    mapping(address => bool) private isMinter;
    mapping(uint256 => string) private uris;
    string internal uriBase;

    modifier OnlyOwner(){
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier OnlyMinter(){
        require(isMinter[msg.sender] == true, "not minter");
        _;
    }

    constructor() ERC1155("ipfs://") {
        uriBase = "ipfs://";
        owner = msg.sender;
        isMinter[msg.sender] = true;
    }

    function setMinterRole(address account) public OnlyOwner {
        isMinter[account] = true;
    }

    function removeMinterRole(address account) public OnlyOwner {
        isMinter[account] = false;
    }

    function uri(uint256 tokenId) override public view returns (string memory) {
        return(
            string(
                abi.encodePacked(
                uriBase, 
                uris[tokenId]
                )
            )
        );
    }

    function setURI(string memory newuri) public OnlyOwner {
        uriBase = newuri;
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data, string memory _tokenURI) public OnlyMinter {
        require(bytes(uris[id]).length == 0, "ERC721: token already minted");
        uris[id] = _tokenURI;
        _mint(account, id, amount, data);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public OnlyMinter {
        require(bytes(uris[id]).length != 0, "ERC721: token does not exits");
        _mint(account, id, amount, data);
    }
}