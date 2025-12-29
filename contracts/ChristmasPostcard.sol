// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChristmasPostcard
 * @dev NFT contract for Christmas postcards with AI-generated images
 * Each postcard is a unique NFT minted to the recipient
 */
contract ChristmasPostcard is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Collection metadata URI (for OpenSea)
    string private _collectionURI;
    
    struct PostcardMetadata {
        string ipfsCID;           // IPFS CID for postcard data (images + message)
        address sender;           // Who sent this postcard
        address recipient;        // Who received this postcard
        uint256 timestamp;        // When it was sent
        string message;           // Short greeting message
    }
    
    // Mapping from token ID to postcard metadata
    mapping(uint256 => PostcardMetadata) public postcards;
    
    // Events
    event PostcardMinted(
        uint256 indexed tokenId,
        address indexed sender,
        address indexed recipient,
        string ipfsCID
    );
    
    event CollectionURIUpdated(string newURI);
    
    constructor() ERC721("Christmas Postcard", "XMAS") Ownable(msg.sender) {
        // Default collection metadata
        _collectionURI = "ipfs://QmYOUR_COLLECTION_METADATA";
    }
    
    /**
     * @dev Returns the collection-level metadata URI (OpenSea standard)
     */
    function contractURI() public view returns (string memory) {
        return _collectionURI;
    }
    
    /**
     * @dev Update collection metadata URI (only owner)
     * @param newURI New IPFS URI for collection metadata
     */
    function setCollectionURI(string memory newURI) external onlyOwner {
        _collectionURI = newURI;
        emit CollectionURIUpdated(newURI);
    }
    
    /**
     * @dev Mint a new postcard NFT
     * @param recipient Address to receive the NFT
     * @param ipfsCID IPFS CID containing the postcard data
     * @param message Greeting message
     * @return tokenId The ID of the minted NFT
     */
    function mintPostcard(
        address recipient,
        string memory ipfsCID,
        string memory message
    ) external returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(ipfsCID).length > 0, "Invalid IPFS CID");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint NFT to recipient
        _safeMint(recipient, tokenId);
        
        // Set token URI (IPFS link)
        string memory uri = string(abi.encodePacked("ipfs://", ipfsCID));
        _setTokenURI(tokenId, uri);
        
        // Store postcard metadata
        postcards[tokenId] = PostcardMetadata({
            ipfsCID: ipfsCID,
            sender: msg.sender,
            recipient: recipient,
            timestamp: block.timestamp,
            message: message
        });
        
        emit PostcardMinted(tokenId, msg.sender, recipient, ipfsCID);
        
        return tokenId;
    }
    
    /**
     * @dev Get all postcards sent by an address
     * @param sender The sender address
     * @return tokenIds Array of token IDs sent by this address
     */
    function getPostcardsBySender(address sender) external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter;
        uint256 count = 0;
        
        // Count postcards from this sender
        for (uint256 i = 0; i < totalSupply; i++) {
            if (postcards[i].sender == sender) {
                count++;
            }
        }
        
        // Collect token IDs
        uint256[] memory tokenIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < totalSupply; i++) {
            if (postcards[i].sender == sender) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get total number of postcards minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
