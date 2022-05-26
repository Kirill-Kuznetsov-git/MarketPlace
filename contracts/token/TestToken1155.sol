
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TestToken1155 is ERC1155, AccessControl {
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    mapping(uint256 => string) private uris;
    string internal uriBase;

    constructor() ERC1155("ipfs://QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/") {
        uriBase = "ipfs://QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/";
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
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

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data, string memory _tokenURI) public onlyRole(MINTER_ROLE) {
        require(bytes(uris[id]).length == 0, "ERC721: token already minted");
        uris[id] = _tokenURI;
        _mint(account, id, amount, data);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyRole(MINTER_ROLE) {
        require(bytes(uris[id]).length != 0, "ERC721: token does not exits");
        _mint(account, id, amount, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}