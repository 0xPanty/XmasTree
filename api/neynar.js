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
