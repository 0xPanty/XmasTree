// NFT Integration for Christmas Postcard
// This file contains all NFT-related functions

// ============================================
// Configuration
// ============================================

// TODO: Update after deployment
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Will be updated after deployment

// Contract ABI - minimized for essential functions only
const CONTRACT_ABI = [
    "function mintPostcard(address recipient, string memory ipfsCID, string memory message) external returns (uint256)",
    "function postcards(uint256 tokenId) external view returns (tuple(string ipfsCID, address sender, address recipient, uint256 timestamp, string message))",
    "function getPostcardsBySender(address sender) external view returns (uint256[])",
    "function totalSupply() external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)"
];

// NFT.Storage API (free, unlimited storage)
const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDEyMzQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzMzQ2NzY1MiwibmFtZSI6ImNocmlzdG1hcy1wb3N0Y2FyZCJ9.example'; 
// TODO: Get your own token from https://nft.storage/

// ============================================
// IPFS Upload Functions
// ============================================

/**
 * Convert base64 image to Blob
 */
function base64ToBlob(base64) {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
}

/**
 * Upload postcard data to IPFS using NFT.Storage
 * @param {string} frontImage - Base64 encoded front image
 * @param {string} backImage - Base64 encoded back image  
 * @param {string} message - Greeting message
 * @param {object} sender - Sender info {fid, username, pfp}
 * @param {object} recipient - Recipient info {fid, username, pfp}
 * @returns {Promise<string>} IPFS CID
 */
async function uploadPostcardToIPFS(frontImage, backImage, message, sender, recipient) {
    console.log('📤 Uploading postcard to IPFS via NFT.Storage...');
    
    try {
        // Convert images to blobs
        const frontBlob = base64ToBlob(frontImage);
        const backBlob = base64ToBlob(backImage);
        
        console.log('📊 Front image size:', (frontBlob.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('📊 Back image size:', (backBlob.size / 1024 / 1024).toFixed(2), 'MB');
        
        // Create metadata object
        const metadata = {
            name: "Christmas Postcard",
            description: message,
            image: frontImage,  // Main image (front)
            attributes: [
                { trait_type: "Type", value: "Christmas Postcard" },
                { trait_type: "Sender", value: sender.username },
                { trait_type: "Recipient", value: recipient.username },
                { trait_type: "Year", value: new Date().getFullYear().toString() }
            ],
            properties: {
                frontImage: frontImage,
                backImage: backImage,
                message: message,
                sender: {
                    fid: sender.fid,
                    username: sender.username,
                    pfp: sender.pfp
                },
                recipient: {
                    fid: recipient.fid,
                    username: recipient.username,
                    pfp: recipient.pfp
                },
                timestamp: Date.now()
            }
        };
        
        // Upload using NFT.Storage API
        const response = await fetch('https://api.nft.storage/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NFT_STORAGE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });
        
        if (!response.ok) {
            throw new Error(`NFT.Storage upload failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        const cid = result.value.cid;
        
        console.log('✅ Uploaded to IPFS:', cid);
        console.log('🔗 IPFS URL:', `https://nftstorage.link/ipfs/${cid}`);
        
        return cid;
        
    } catch (error) {
        console.error('❌ IPFS upload failed:', error);
        throw error;
    }
}

// ============================================
// Smart Contract Functions
// ============================================

/**
 * Get contract instance
 */
async function getContract() {
    if (!window.ethereum) {
        throw new Error('No Web3 provider found. Please install MetaMask or use Farcaster wallet.');
    }
    
    // Import ethers
    const { ethers } = await import('https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm');
    
    // Get provider from Farcaster SDK
    const sdk = await import('https://esm.sh/@farcaster/miniapp-sdk');
    const provider = await sdk.sdk.wallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return contract;
}

/**
 * Mint postcard NFT
 * @param {string} recipientAddress - Ethereum address of recipient
 * @param {string} ipfsCID - IPFS CID of postcard data
 * @param {string} message - Short greeting message
 * @returns {Promise<object>} Transaction result with tokenId
 */
async function mintPostcardNFT(recipientAddress, ipfsCID, message) {
    console.log('🎨 Minting postcard NFT...');
    console.log('  Recipient:', recipientAddress);
    console.log('  IPFS CID:', ipfsCID);
    
    try {
        const contract = await getContract();
        
        // Call mint function
        const tx = await contract.mintPostcard(
            recipientAddress,
            ipfsCID,
            message.substring(0, 200) // Limit message length for on-chain storage
        );
        
        console.log('⏳ Transaction sent:', tx.hash);
        console.log('🔗 View on Basescan:', `https://sepolia.basescan.org/tx/${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        
        // Extract token ID from event logs
        const event = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === 'PostcardMinted';
            } catch {
                return false;
            }
        });
        
        let tokenId = null;
        if (event) {
            const parsed = contract.interface.parseLog(event);
            tokenId = parsed.args[0].toString();
        }
        
        console.log('✅ NFT minted successfully!');
        console.log('  Token ID:', tokenId);
        console.log('  Transaction:', receipt.hash);
        
        return {
            success: true,
            tokenId: tokenId,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
        
    } catch (error) {
        console.error('❌ Minting failed:', error);
        
        // User rejected transaction
        if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
            throw new Error('Transaction rejected by user');
        }
        
        // Insufficient funds
        if (error.code === 'INSUFFICIENT_FUNDS') {
            throw new Error('Insufficient ETH for gas fees');
        }
        
        throw error;
    }
}

/**
 * Get all postcards sent by a user
 */
async function getPostcardsBySender(senderAddress) {
    try {
        const contract = await getContract();
        const tokenIds = await contract.getPostcardsBySender(senderAddress);
        
        // Fetch metadata for each postcard
        const postcards = await Promise.all(
            tokenIds.map(async (tokenId) => {
                const metadata = await contract.postcards(tokenId);
                return {
                    tokenId: tokenId.toString(),
                    ipfsCID: metadata.ipfsCID,
                    sender: metadata.sender,
                    recipient: metadata.recipient,
                    timestamp: Number(metadata.timestamp),
                    message: metadata.message
                };
            })
        );
        
        return postcards;
        
    } catch (error) {
        console.error('❌ Failed to fetch postcards:', error);
        return [];
    }
}

/**
 * Get postcard metadata by token ID
 */
async function getPostcardMetadata(tokenId) {
    try {
        const contract = await getContract();
        const metadata = await contract.postcards(tokenId);
        
        return {
            tokenId: tokenId,
            ipfsCID: metadata.ipfsCID,
            sender: metadata.sender,
            recipient: metadata.recipient,
            timestamp: Number(metadata.timestamp),
            message: metadata.message
        };
        
    } catch (error) {
        console.error('❌ Failed to fetch postcard metadata:', error);
        return null;
    }
}

// ============================================
// Farcaster Integration
// ============================================

/**
 * Get recipient's Ethereum address from Farcaster FID
 * Uses Neynar API
 */
async function getAddressFromFid(fid) {
    try {
        const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
            headers: {
                'api_key': 'NEYNAR-API-KEY' // Use your existing Neynar API key
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        const user = data.users[0];
        
        // Get verified Ethereum address
        if (user.verified_addresses && user.verified_addresses.eth_addresses.length > 0) {
            return user.verified_addresses.eth_addresses[0];
        }
        
        // Fallback: use custody address
        if (user.custody_address) {
            return user.custody_address;
        }
        
        throw new Error('No Ethereum address found for this user');
        
    } catch (error) {
        console.error('❌ Failed to get address from FID:', error);
        throw error;
    }
}

// ============================================
// Export functions
// ============================================

window.NFTPostcard = {
    uploadPostcardToIPFS,
    mintPostcardNFT,
    getPostcardsBySender,
    getPostcardMetadata,
    getAddressFromFid,
    CONTRACT_ADDRESS,
    CONTRACT_ABI
};

console.log('✅ NFT Postcard integration loaded');
