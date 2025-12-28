import { kv } from '@vercel/kv';

/**
 * Mailbox API - Manage user postcards inbox
 * 
 * Actions:
 * - send: Record that a postcard was sent to a user
 * - list: Get all postcards for a user
 * - markRead: Mark postcards as read
 */

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, recipientFid, ipfsHash, userFid, ipfsHashes } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Missing action' });
        }

        // === SEND: Record a postcard sent to recipient ===
        if (action === 'send') {
            if (!recipientFid || !ipfsHash) {
                return res.status(400).json({ error: 'Missing recipientFid or ipfsHash' });
            }

            const key = `mailbox:${recipientFid}`;
            
            // Add postcard to recipient's mailbox (prepend to list)
            await kv.lpush(key, {
                ipfsHash,
                sentAt: Date.now(),
                read: false
            });

            // Keep only last 100 postcards (optional, to prevent unlimited growth)
            await kv.ltrim(key, 0, 99);

            console.log(`📬 Postcard sent to user ${recipientFid}: ${ipfsHash}`);

            return res.status(200).json({ 
                success: true,
                message: 'Postcard delivered to mailbox'
            });
        }

        // === LIST: Get all postcards for user ===
        if (action === 'list') {
            if (!userFid) {
                return res.status(400).json({ error: 'Missing userFid' });
            }

            const key = `mailbox:${userFid}`;
            
            // Get all postcards from user's mailbox
            const postcards = await kv.lrange(key, 0, -1) || [];

            console.log(`📬 Retrieved ${postcards.length} postcards for user ${userFid}`);

            return res.status(200).json({ 
                success: true,
                postcards: postcards
            });
        }

        // === MARK_READ: Mark postcards as read ===
        if (action === 'markRead') {
            if (!userFid || !ipfsHashes || !Array.isArray(ipfsHashes)) {
                return res.status(400).json({ error: 'Missing userFid or ipfsHashes array' });
            }

            const key = `mailbox:${userFid}`;
            
            // Get all postcards
            const postcards = await kv.lrange(key, 0, -1) || [];
            
            // Mark specified postcards as read
            const updatedPostcards = postcards.map(card => {
                if (ipfsHashes.includes(card.ipfsHash)) {
                    return { ...card, read: true };
                }
                return card;
            });

            // Replace entire list (Redis doesn't support updating list items)
            await kv.del(key);
            if (updatedPostcards.length > 0) {
                await kv.rpush(key, ...updatedPostcards);
            }

            console.log(`✅ Marked ${ipfsHashes.length} postcards as read for user ${userFid}`);

            return res.status(200).json({ 
                success: true,
                message: 'Postcards marked as read'
            });
        }

        // Unknown action
        return res.status(400).json({ error: `Unknown action: ${action}` });

    } catch (error) {
        console.error('❌ Mailbox API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
