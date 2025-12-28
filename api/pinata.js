// Pinata IPFS upload API
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, data } = req.body;

        if (action === 'upload') {
            // Upload gift data to Pinata IPFS
            const pinataJWT = process.env.PINATA_JWT;
            
            if (!pinataJWT) {
                throw new Error('Pinata JWT not configured');
            }

            // Upload JSON data to Pinata
            const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pinataJWT}`
                },
                body: JSON.stringify({
                    pinataContent: data,
                    pinataMetadata: {
                        name: `Gift-${data.id}`,
                        keyvalues: {
                            type: 'christmas-gift',
                            sender: data.sender?.username || 'anonymous'
                        }
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Pinata upload failed:', error);
                throw new Error('Failed to upload to IPFS');
            }

            const result = await response.json();
            
            return res.status(200).json({
                success: true,
                ipfsHash: result.IpfsHash,
                url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
            });
        }

        if (action === 'get') {
            // Get gift data from Pinata IPFS
            const { ipfsHash } = req.body;
            
            if (!ipfsHash) {
                throw new Error('IPFS hash required');
            }

            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch from IPFS');
            }

            const giftData = await response.json();
            
            return res.status(200).json({
                success: true,
                data: giftData
            });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error) {
        console.error('Pinata API error:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
}
