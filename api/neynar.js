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
                // Get user's best friends based on real interactions
                try {
                    // Step 1: Get user's recent interactions (likes, recasts, replies)
                    const interactionsUrl = `https://api.neynar.com/v2/farcaster/feed/user/${fid}/notifications?limit=150`;
                    const interactionsRes = await fetch(interactionsUrl, {
                        headers: {
                            'accept': 'application/json',
                            'x-api-key': NEYNAR_API_KEY
                        }
                    });
                    const interactionsData = await interactionsRes.json();
                    
                    // Step 2: Count interactions per user
                    const interactionCounts = {};
                    
                    if (interactionsData.notifications) {
                        interactionsData.notifications.forEach(notification => {
                            const actors = notification.actors || [];
                            actors.forEach(actor => {
                                if (actor.fid && actor.fid !== parseInt(fid)) {
                                    if (!interactionCounts[actor.fid]) {
                                        interactionCounts[actor.fid] = {
                                            user: actor,
                                            likes: 0,
                                            recasts: 0,
                                            replies: 0,
                                            mentions: 0,
                                            total: 0
                                        };
                                    }
                                    
                                    // Count interaction types
                                    const type = notification.type;
                                    if (type === 'likes') {
                                        interactionCounts[actor.fid].likes++;
                                    } else if (type === 'recasts') {
                                        interactionCounts[actor.fid].recasts++;
                                    } else if (type === 'reply') {
                                        interactionCounts[actor.fid].replies++;
                                    } else if (type === 'mention') {
                                        interactionCounts[actor.fid].mentions++;
                                    }
                                    
                                    interactionCounts[actor.fid].total++;
                                }
                            });
                        });
                    }
                    
                    // Step 3: Get user's following list to verify relationships
                    const followingUrl = `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=150`;
                    const followingRes = await fetch(followingUrl, {
                        headers: {
                            'accept': 'application/json',
                            'x-api-key': NEYNAR_API_KEY
                        }
                    });
                    const followingData = await followingRes.json();
                    const followingFids = new Set((followingData.users || []).map(u => u.fid));
                    
                    // Step 4: Get followers for mutual follow check
                    const followersUrl = `https://api.neynar.com/v2/farcaster/followers?fid=${fid}&limit=150`;
                    const followersRes = await fetch(followersUrl, {
                        headers: {
                            'accept': 'application/json',
                            'x-api-key': NEYNAR_API_KEY
                        }
                    });
                    const followersData = await followersRes.json();
                    const followerFids = new Set((followersData.users || []).map(u => u.fid));
                    
                    // Step 5: Score users based on interactions
                    const scoredUsers = Object.values(interactionCounts).map(item => {
                        let score = 0;
                        
                        // Interaction-based scoring (most important!)
                        score += item.likes * 1;        // +1 per like
                        score += item.recasts * 3;      // +3 per recast (more valuable)
                        score += item.replies * 5;      // +5 per reply (conversation!)
                        score += item.mentions * 4;     // +4 per mention
                        
                        // +50 bonus for mutual follows
                        const isMutual = followingFids.has(item.user.fid) && followerFids.has(item.user.fid);
                        if (isMutual) {
                            score += 50;
                        }
                        
                        // +20 bonus for following (even if not mutual)
                        if (followingFids.has(item.user.fid)) {
                            score += 20;
                        }
                        
                        return {
                            ...item.user,
                            interaction_stats: {
                                likes: item.likes,
                                recasts: item.recasts,
                                replies: item.replies,
                                mentions: item.mentions,
                                total: item.total
                            },
                            friendship_score: score,
                            is_mutual: isMutual,
                            is_following: followingFids.has(item.user.fid)
                        };
                    });
                    
                    // Step 6: Sort by interaction score and return top 5
                    const topFriends = scoredUsers
                        .sort((a, b) => b.friendship_score - a.friendship_score)
                        .slice(0, 5);
                    
                    if (topFriends.length === 0) {
                        return res.status(200).json({ 
                            success: false, 
                            users: [],
                            message: 'No interaction history found'
                        });
                    }
                    
                    return res.status(200).json({ 
                        success: true, 
                        users: topFriends,
                        total_interactions: Object.keys(interactionCounts).length,
                        top_interaction_type: topFriends[0]?.interaction_stats || {}
                    });
                } catch (error) {
                    console.error('Best friends API error:', error);
                    return res.status(500).json({ 
                        success: false, 
                        users: [],
                        error: 'Failed to fetch best friends'
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
