// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasedStamp is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Free mint, only gas cost
    bool public mintingEnabled = true;
    
    // Max supply (optional)
    uint256 public constant MAX_SUPPLY = 10000;
    
    constructor() ERC721("Based Stamp", "BASED") Ownable(msg.sender) {}
    
    // Free mint function
    function mint() public {
        require(mintingEnabled, "Minting is disabled");
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
    }
    
    // Batch mint (for multiple NFTs at once)
    function mintBatch(uint256 quantity) public {
        require(mintingEnabled, "Minting is disabled");
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter++;
            _safeMint(msg.sender, tokenId);
        }
    }
    
    // Owner functions
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Token URI (you can set this to IPFS or your server)
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://YOUR_IPFS_CID/";
    }
}
