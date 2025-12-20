export default async function handler(req, res) {
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
