module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY; // Optional: get from https://simplehash.com
    
    if (!NEYNAR_API_KEY) {
        return res.status(500).json({ error: 'Neynar API key not configured' });
    }

    const { fid } = req.query;

    if (!fid) {
        return res.status(400).json({ error: 'FID required' });
    }

    try {
        console.log(`[warplet] Fetching Warplet NFT for FID ${fid}`);
        
        // Step 1: Get user's verified Ethereum addresses from Neynar
        const userUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
        const userRes = await fetch(userUrl, {
            headers: {
                'accept': 'application/json',
                'x-api-key': NEYNAR_API_KEY
            }
        });

        if (!userRes.ok) {
            console.error('[warplet] Neynar API error:', userRes.status);
            return res.status(userRes.status).json({ error: 'Failed to fetch user data' });
        }

        const userData = await userRes.json();
        const user = userData.users?.[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all verified Ethereum addresses
        const ethAddresses = user.verified_addresses?.eth_addresses || [];
        const custodyAddress = user.custody_address;
        
        // Combine all addresses (verified + custody)
        const allAddresses = [...new Set([...ethAddresses, custodyAddress])];

        console.log(`[warplet] User addresses:`, allAddresses);

        if (allAddresses.length === 0) {
            return res.status(404).json({ 
                error: 'No Ethereum addresses found',
                hasWarplet: false 
            });
        }

        // Step 2: Query Warplet NFTs for these addresses
        // Warplet collection: https://opensea.io/collection/the-warplets-farcaster
        // Contract address from OpenSea (Base chain)
        const WARPLET_CONTRACT = '0x699727f9e01a822efdcf7333073f0461e5914b4e';
        const CHAIN = 'base';

        // Try Simplehash API if available (free tier: 1 req/sec)
        if (SIMPLEHASH_API_KEY) {
            try {
                // Query NFTs by wallet address on Base chain
                const nftUrl = `https://api.simplehash.com/api/v0/nfts/owners?chains=${CHAIN}&wallet_addresses=${allAddresses[0]}&contract_addresses=${WARPLET_CONTRACT}&limit=1`;
                
                const nftRes = await fetch(nftUrl, {
                    headers: {
                        'accept': 'application/json',
                        'X-API-KEY': SIMPLEHASH_API_KEY
                    }
                });

                if (nftRes.ok) {
                    const nftData = await nftRes.json();
                    const warplets = nftData.nfts || [];

                    if (warplets.length > 0) {
                        const warplet = warplets[0];
                        return res.status(200).json({
                            hasWarplet: true,
                            imageUrl: warplet.image_url || warplet.previews?.image_medium_url,
                            tokenId: warplet.token_id,
                            name: warplet.name || `Warplet #${warplet.token_id}`,
                            contractAddress: WARPLET_CONTRACT
                        });
                    }
                }
            } catch (error) {
                console.warn('[warplet] Simplehash API error:', error.message);
                // Fall through to fallback
            }
        }

        // Use Basescan-like API to query NFTs (simple approach)
        // OpenSea API v2 often has rate limits, let's try a simpler approach
        try {
            // Try each address until we find Warplets
            for (const address of allAddresses) {
                console.log(`[warplet] Checking address: ${address}`);
                
                // Method 1: Try OpenSea API v2 with contract address filter
                const openseaUrl = `https://api.opensea.io/api/v2/chain/base/account/${address}/nfts?contract_addresses=${WARPLET_CONTRACT}&limit=1`;
                console.log(`[warplet] OpenSea URL:`, openseaUrl);
                
                const openseaRes = await fetch(openseaUrl, {
                    headers: {
                        'accept': 'application/json',
                        'User-Agent': 'XmasTree-App'
                    }
                });

                console.log(`[warplet] OpenSea response status:`, openseaRes.status);

                if (openseaRes.ok) {
                    const openseaData = await openseaRes.json();
                    console.log(`[warplet] OpenSea response:`, JSON.stringify(openseaData).substring(0, 500));
                    
                    const warplets = openseaData.nfts || [];

                    if (warplets.length > 0) {
                        const warplet = warplets[0];
                        console.log(`[warplet] ✅ Found Warplet:`, warplet.name || warplet.identifier);
                        
                        // Get best quality image
                        const imageUrl = warplet.image_url || 
                                        warplet.display_image_url || 
                                        warplet.display_animation_url ||
                                        warplet.metadata?.image;
                        
                        return res.status(200).json({
                            hasWarplet: true,
                            imageUrl: imageUrl,
                            tokenId: warplet.identifier,
                            name: warplet.name || `Warplet #${warplet.identifier}`,
                            contractAddress: WARPLET_CONTRACT,
                            address: address
                        });
                    } else {
                        console.log(`[warplet] No NFTs found for ${address}`);
                    }
                } else {
                    const errorText = await openseaRes.text();
                    console.warn(`[warplet] OpenSea API error for ${address}:`, openseaRes.status, errorText.substring(0, 200));
                }
            }
        } catch (error) {
            console.error('[warplet] API error:', error.message, error.stack);
        }

        // No Warplet found - return debug info
        console.log('[warplet] No Warplet NFT found');
        return res.status(200).json({
            hasWarplet: false,
            message: 'No Warplet NFT found for this user',
            debug: {
                fid: fid,
                addresses: allAddresses,
                checkedContract: '0x699727f9e01a822efdcf7333073f0461e5914b4e',
                chain: 'base'
            }
        });

    } catch (error) {
        console.error('[warplet] Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};
