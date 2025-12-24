module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    
    if (!NEYNAR_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { action, q, fid, fids, limit } = req.query;

    try {
        let url;
        
        switch (action) {
            case 'search':
                // Search users
                url = `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(q)}&limit=${limit || 10}`;
                break;
            case 'user':
            case 'user_by_fid':
                // Get user by FID
                url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
                break;
            case 'users':
                // Get multiple users by FIDs
                url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids}`;
                break;
            case 'following':
                // Get user's following
                url = `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=${limit || 5}`;
                break;
            case 'best_friends':
                // Use Neynar's built-in best_friends API
                try {
                    const bestFriendsUrl = `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${fid}&limit=5`;
                    const bestFriendsRes = await fetch(bestFriendsUrl, {
                        headers: {
                            'accept': 'application/json',
                            'x-api-key': NEYNAR_API_KEY
                        }
                    });
                    
                    if (!bestFriendsRes.ok) {
                        throw new Error(`Neynar API returned ${bestFriendsRes.status}`);
                    }
                    
                    const bestFriendsData = await bestFriendsRes.json();
                    
                    if (!bestFriendsData.users || bestFriendsData.users.length === 0) {
                        return res.status(200).json({ 
                            success: false, 
                            users: [],
                            message: 'No best friends found'
                        });
                    }
                    
                    // Get full user details for the best friends
                    const fids = bestFriendsData.users.map(u => u.fid).join(',');
                    const userDetailsUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids}`;
                    const userDetailsRes = await fetch(userDetailsUrl, {
                        headers: {
                            'accept': 'application/json',
                            'x-api-key': NEYNAR_API_KEY
                        }
                    });
                    const userDetailsData = await userDetailsRes.json();
                    
                    // Combine best friends data with full user details
                    const enrichedFriends = bestFriendsData.users.map(bf => {
                        const userDetail = userDetailsData.users.find(u => u.fid === bf.fid);
                        return {
                            fid: bf.fid,
                            username: bf.username,
                            display_name: userDetail?.display_name || bf.username,
                            pfp_url: userDetail?.pfp_url || '',
                            mutual_affinity_score: bf.mutual_affinity_score,
                            friendship_score: bf.mutual_affinity_score,
                            is_mutual: true // Best friends are typically mutual
                        };
                    });
                    
                    return res.status(200).json({ 
                        success: true, 
                        users: enrichedFriends,
                        top_interaction_type: {
                            replies: 0,
                            likes: 0,
                            recasts: 0
                        }
                    });
                } catch (error) {
                    console.error('Best friends API error:', error);
                    return res.status(500).json({ 
                        success: false, 
                        users: [],
                        error: 'Failed to fetch best friends: ' + error.message
                    });
                }
                break;
            case 'check_stamps':
                // Check all three stamp eligibility conditions in one call
                // 1. Neynar Score > 0.6 → Free Neynar stamp
                // 2. Farcaster Power Badge → Free Farcaster stamp
                // 3. Warplet NFT holder → Free Warplet stamp
                
                // Step 1: Get user info from Neynar
                const userInfoUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
                const userRes = await fetch(userInfoUrl, {
                    headers: {
                        'accept': 'application/json',
                        'x-api-key': NEYNAR_API_KEY
                    }
                });
                const userData = await userRes.json();
                
                if (!userData.users || userData.users.length === 0) {
                    return res.status(200).json({ 
                        success: false, 
                        holdsWarplet: false,
                        message: 'User not found'
                    });
                }
                
                const user = userData.users[0];
                
                // Check 1: Get actual Neynar Score from user object
                // Neynar Score is available in user.experimental.neynar_user_score (range 0-1)
                const neynarScore = user.experimental?.neynar_user_score || user.neynar_user_score || 0;
                const hasNeynarScore = neynarScore > 0.6;
                
                // Check 2: Farcaster Power Badge (Pro member)
                const hasPowerBadge = user.power_badge || false;
                
                // Check 3: Warplet NFT holder
                const verifiedAddresses = user.verified_addresses?.eth_addresses || [];
                let holdsWarplet = false;
                
                if (verifiedAddresses.length > 0) {
                    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || 'demo';
                    const WARPLET_CONTRACT = '0x532Cd2d1db5901694eAF0ad86Ed81a6614925a42'; // Replace with actual address
                    
                    for (const address of verifiedAddresses) {
                        try {
                            const alchemyUrl = `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&contractAddresses[]=${WARPLET_CONTRACT}&withMetadata=false`;
                            const nftRes = await fetch(alchemyUrl);
                            const nftData = await nftRes.json();
                            
                            if (nftData.ownedNfts && nftData.ownedNfts.length > 0) {
                                holdsWarplet = true;
                                break;
                            }
                        } catch (error) {
                            console.error('Error checking NFTs for address:', address, error);
                        }
                    }
                }
                
                return res.status(200).json({ 
                    success: true, 
                    stamps: {
                        neynar: {
                            eligible: hasNeynarScore,
                            score: neynarScore,
                            reason: hasNeynarScore ? `Neynar Score: ${neynarScore.toFixed(2)} (>0.6)` : `Neynar Score: ${neynarScore.toFixed(2)} (<0.6)`
                        },
                        farcaster: {
                            eligible: hasPowerBadge,
                            reason: hasPowerBadge ? 'Farcaster Power Badge holder' : 'Requires Farcaster Power Badge'
                        },
                        warplet: {
                            eligible: holdsWarplet,
                            reason: holdsWarplet ? 'Warplet NFT holder' : 'Requires Warplet NFT'
                        }
                    },
                    user: {
                        username: user.username,
                        neynar_score: neynarScore,
                        power_badge: hasPowerBadge,
                        verified_addresses_count: verifiedAddresses.length
                    }
                });
                
            case 'top_casts':
                // Get user's top casts with images from this year
                url = `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=150&include_replies=false`;
                const castsRes = await fetch(url, {
                    headers: {
                        'accept': 'application/json',
                        'x-api-key': NEYNAR_API_KEY
                    }
                });
                const castsData = await castsRes.json();
                
                if (!castsData.casts) {
                    return res.status(200).json({ success: false, images: [] });
                }
                
                const currentYear = new Date().getFullYear();
                const postsWithImages = castsData.casts
                    .filter(cast => {
                        const castYear = new Date(cast.timestamp).getFullYear();
                        if (castYear !== currentYear) return false;
                        
                        // Check for image embeds
                        const hasImage = cast.embeds?.some(e => 
                            e.url && (
                                e.url.includes('.jpg') || 
                                e.url.includes('.png') || 
                                e.url.includes('.gif') ||
                                e.url.includes('.webp') ||
                                e.url.includes('imagedelivery') ||
                                e.url.includes('imgur')
                            )
                        );
                        return hasImage;
                    })
                    .sort((a, b) => {
                        const engageA = (a.reactions?.likes_count || 0) + (a.reactions?.recasts_count || 0);
                        const engageB = (b.reactions?.likes_count || 0) + (b.reactions?.recasts_count || 0);
                        return engageB - engageA;
                    })
                    .slice(0, 3)
                    .map(cast => {
                        const imageEmbed = cast.embeds?.find(e => 
                            e.url && (
                                e.url.includes('.jpg') || 
                                e.url.includes('.png') || 
                                e.url.includes('.gif') ||
                                e.url.includes('.webp') ||
                                e.url.includes('imagedelivery') ||
                                e.url.includes('imgur')
                            )
                        );
                        return {
                            image: imageEmbed?.url,
                            text: cast.text?.slice(0, 100),
                            likes: cast.reactions?.likes_count || 0,
                            recasts: cast.reactions?.recasts_count || 0,
                            hash: cast.hash
                        };
                    });
                
                return res.status(200).json({ success: true, images: postsWithImages });
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        const response = await fetch(url, {
            headers: {
                'accept': 'application/json',
                'x-api-key': NEYNAR_API_KEY
            }
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Neynar API error:', error);
        return res.status(500).json({ error: 'API request failed' });
    }
}
