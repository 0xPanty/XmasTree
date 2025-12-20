export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAByvgerGSj-O33c4ptWc-ef0FowqZkWH4';
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, senderName, senderAvatar, recipientName, recipientAvatar, message } = req.body;

    // Helper: fetch image and convert to base64
    async function imageUrlToBase64(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            return { base64, mimeType: contentType };
        } catch (error) {
            console.error('Failed to fetch image:', url, error);
            return null;
        }
    }

    try {
        if (action === 'generateCard') {
            // Christmas scenes for variety
            const christmasScenes = [
                'building a cute snowman together in a snowy winter wonderland with falling snowflakes',
                'decorating a beautiful Christmas tree with golden ornaments and twinkling lights',
                'having a playful snowball fight in a magical snowy forest',
                'sitting together by a cozy fireplace with hot cocoa and Christmas stockings',
                'ice skating hand in hand on a frozen pond under gentle falling snowflakes',
                'excitedly opening Christmas presents under a sparkling decorated tree',
                'making snow angels together in fresh powdery white snow',
                'riding a magical sleigh through a winter forest with friendly reindeer',
                'singing Christmas carols together in a charming snowy village square',
                'baking delicious Christmas cookies together in a festive warm kitchen'
            ];
            
            const randomScene = christmasScenes[Math.floor(Math.random() * christmasScenes.length)];
            
            // Fetch sender avatar and convert to base64
            const senderImg = await imageUrlToBase64(senderAvatar);

            let imageData = null;
            let imageError = null;

            // Generate vintage Christmas postcard with sender's likeness
            const imagePrompt = `Create a vintage New Year or Christmas greeting card using the provided photo as a reference for the person's appearance (preserve facial features and likeness).
Inspired by classic illustrated New Year and Christmas postcards by Jenny Nyström, Anton Pieck, or Ellen Clapsaddle.

Festive winter scene, snowy fairy-tale forest, decorated Christmas tree with warm glowing lights.
Timeless vintage winter clothing, classic international postcard style.
Cozy, joyful, nostalgic holiday mood.
Hand-painted illustration look, muted colors, subtle vintage paper texture.
Vertical format 9:16.

REFERENCE PHOTO: Use this photo to preserve the person's facial features and likeness.`;

            // Build the request with sender's image only
            const parts = [{ text: imagePrompt }];
            
            if (senderImg) {
                parts.push({
                    inlineData: {
                        mimeType: senderImg.mimeType,
                        data: senderImg.base64
                    }
                });
            }

            // Use Gemini 2.5 Pro (most stable) for image generation with reference images
            const imageResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-002:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: {
                            responseModalities: ["IMAGE"],
                            aspectRatio: "9:16"
                        }
                    })
                }
            );

            if (imageResponse.ok) {
                const imageResult = await imageResponse.json();
                // Extract image from response
                if (imageResult.candidates && imageResult.candidates[0]?.content?.parts) {
                    for (const part of imageResult.candidates[0].content.parts) {
                        if (part.inlineData) {
                            imageData = part.inlineData.data;
                            break;
                        }
                    }
                }
            } else {
                imageError = await imageResponse.text();
                console.error('Image generation failed:', imageError);
                
                // Fallback to Imagen 3 with vintage postcard style
                const fallbackResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            instances: [{ 
                                prompt: `Create a vintage New Year or Christmas greeting card. Inspired by classic illustrated New Year and Christmas postcards by Jenny Nyström, Anton Pieck, or Ellen Clapsaddle. Festive winter scene, snowy fairy-tale forest, decorated Christmas tree with warm glowing lights. Timeless vintage winter clothing, classic international postcard style. Cozy, joyful, nostalgic holiday mood. Hand-painted illustration look, muted colors, subtle vintage paper texture.`
                            }],
                            parameters: {
                                sampleCount: 1,
                                aspectRatio: '9:16',
                                safetyFilterLevel: 'block_few',
                                personGeneration: 'allow_adult'
                            }
                        })
                    }
                );
                
                if (fallbackResponse.ok) {
                    const fallbackResult = await fallbackResponse.json();
                    if (fallbackResult.predictions && fallbackResult.predictions[0]) {
                        imageData = fallbackResult.predictions[0].bytesBase64Encoded;
                    }
                }
            }

            // Generate greeting based on sender's message
            const greetingPrompt = `You are writing a Christmas greeting card message from ${senderName} to ${recipientName}.
Original message: "${message || 'Merry Christmas!'}"

Write a short, warm Christmas greeting (2-3 sentences max) that:
1. Feels personal and heartwarming
2. Incorporates the sender's message
3. Adds a festive Christmas touch

Only respond with the greeting text, nothing else.`;

            const textResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: greetingPrompt }] }],
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 150
                        }
                    })
                }
            );

            let greeting = message || 'Merry Christmas!';
            
            if (textResponse.ok) {
                const textResult = await textResponse.json();
                if (textResult.candidates && textResult.candidates[0]?.content?.parts?.[0]?.text) {
                    greeting = textResult.candidates[0].content.parts[0].text.trim();
                }
            }

            return res.status(200).json({
                success: true,
                scene: randomScene,
                greeting: greeting,
                image: imageData,
                imageError: imageError
            });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Gemini API error:', error);
        return res.status(500).json({ error: 'API request failed', details: error.message });
    }
}
