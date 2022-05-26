//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestToken721 is ERC721 {
    address private owner;
    mapping(address => bool) private isMinter;
    mapping(uint256 => string) private uris;

    modifier OnlyOwner(){
        require(msg.sender == owner, "now owner");
        _;
    }

    modifier OnlyMinter(){
        require(isMinter[msg.sender] == true, "not minter");
        _;
    }

    constructor() ERC721("TestToken721", "TT721") {
        owner = msg.sender;
        isMinter[msg.sender] = true;
    }

    function setMinterRole(address account) public OnlyOwner {
        isMinter[account] = true;
    }

    function removeMinterRole(address account) public OnlyOwner {
        isMinter[account] = false;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function tokenURI(uint256 _tokenId) override public view returns (string memory) {
        return(
            string(
                abi.encodePacked(
                _baseURI(), 
                uris[_tokenId]
                )
            )
        );
    }

    function mint(address to, uint256 tokenId, string memory _tokenURI) public OnlyMinter {
         require(!_exists(tokenId), "ERC721: token already minted");
         uris[tokenId] = _tokenURI;
        _safeMint(to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}