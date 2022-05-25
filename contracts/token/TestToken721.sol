//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TestToken721 is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    mapping(uint256 => string) private uris;

    constructor() ERC721("TestToken721", "TT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function setMinterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
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

    function mint(address to, uint256 tokenId, string memory _tokenURI) public onlyRole(MINTER_ROLE) {
         require(!_exists(tokenId), "ERC721: token already minted");
         uris[tokenId] = _tokenURI;
        _safeMint(to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}