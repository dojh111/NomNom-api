// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract Booster is ERC721URIStorage, ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIDTracker;

    constructor() ERC721('Booster', 'Booster') {
    }

    function buy(address owner, string memory tier) public returns (uint256) {
        uint256 tokenID = tokenIDTracker.current();
        tokenIDTracker.increment();
        _mint(owner, tokenID);
        _setTokenURI(tokenID, tier);
        return tokenID;
    }

    function redeem(address owner, uint256 tokenID) public {
        require( _isApprovedOrOwner(owner, tokenID), 'Caller is not owner of this Booster token');
        _burn(tokenID);
    }


    // overriding functions

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}