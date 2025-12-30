// Pinata IPFS upload API
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, data, imageData, imageName, metadata } = req.body;

        // Upload image file (for NFT minting - bypasses AdBlock!)
        if (action === 'uploadImage') {
            const pinataJWT = process.env.PINATA_JWT;
            
            if (!pinataJWT) {
                throw new Error('Pinata JWT not configured');
            }

            if (!imageData || !imageName) {
                throw new Error('imageData and imageName required');
            }

            console.log('🖼️ Uploading image to Pinata:', {
                name: imageName,
                size: imageData.length
            });

            // Pinata v3 API expects FormData
            // We'll convert base64 to blob on server side
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Create form data
            const FormData = (await import('form-data')).default;
            const formData = new FormData();
            formData.append('file', buffer, {
                filename: imageName,
                contentType: 'image/png'
            });

            const uploadResponse = await fetch('https://uploads.pinata.cloud/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${pinataJWT}`,
                    ...formData.getHeaders()
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('❌ Pinata upload failed:', errorText);
                throw new Error(`Upload failed: ${uploadResponse.status}`);
            }

            const result = await uploadResponse.json();
            
            return res.status(200).json({
                success: true,
                cid: result.data.cid,
                url: `https://gateway.pinata.cloud/ipfs/${result.data.cid}`
            });
        }

        // Upload metadata JSON (for NFT metadata)
        if (action === 'uploadMetadata') {
            const pinataJWT = process.env.PINATA_JWT;
            
            if (!pinataJWT) {
                throw new Error('Pinata JWT not configured');
            }

            if (!metadata) {
                throw new Error('metadata required');
            }

            console.log('📋 Uploading metadata to Pinata');

            // Convert JSON to buffer for v3 API
            const jsonString = JSON.stringify(metadata);
            const buffer = Buffer.from(jsonString, 'utf-8');
            
            // Create form data
            const FormData = (await import('form-data')).default;
            const formData = new FormData();
            formData.append('file', buffer, {
                filename: 'metadata.json',
                contentType: 'application/json'
            });

            const uploadResponse = await fetch('https://uploads.pinata.cloud/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${pinataJWT}`,
                    ...formData.getHeaders()
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('❌ Metadata upload failed:', errorText);
                throw new Error(`Metadata upload failed: ${uploadResponse.status}`);
            }

            const result = await uploadResponse.json();
            
            return res.status(200).json({
                success: true,
                cid: result.data.cid,
                url: `https://gateway.pinata.cloud/ipfs/${result.data.cid}`
            });
        }

        if (action === 'upload') {
            // Upload gift data to Pinata IPFS
            const pinataJWT = process.env.PINATA_JWT;
            
            if (!pinataJWT) {
                throw new Error('Pinata JWT not configured');
            }

            // Log request details (without sensitive data)
            console.log('🔍 Pinata upload attempt:', {
                hasJWT: !!pinataJWT,
                jwtLength: pinataJWT?.length,
                dataSize: JSON.stringify(data).length
            });

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

            console.log('📡 Pinata response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('❌ Pinata upload failed:', {
                    status: response.status,
                    error: error
                });
                throw new Error(`Failed to upload to IPFS: ${response.status} ${error}`);
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
