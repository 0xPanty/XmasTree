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
            
            // Fetch both avatars and convert to base64
            const [senderImg, recipientImg] = await Promise.all([
                imageUrlToBase64(senderAvatar),
                imageUrlToBase64(recipientAvatar)
            ]);

            let imageData = null;
            let imageError = null;

            // Use Gemini 2.0 Flash with image generation capability
            // This model can take reference images and generate new images based on them
            const imagePrompt = `Based on the two profile photos provided, create a beautiful Japanese anime illustration.

REFERENCE PHOTOS: The first photo is Person 1 (${senderName}), the second photo is Person 2 (${recipientName}).

Create anime versions of these two people ${randomScene}.

CRITICAL STYLE REQUIREMENTS:
- Japanese shoujo manga / anime art style (NOT chibi, normal body proportions)
- Beautiful large expressive anime eyes with detailed highlights
- Elegant facial features, soft shading on skin
- MUST match their actual features from photos: hair color, hair length, hair style, face shape
- Warm, soft color palette with beautiful lighting
- Richly detailed background with depth
- Characters should look happy and natural together
- High quality illustration like a professional anime scene
- Similar style to slice-of-life anime artwork

The characters MUST clearly resemble the people in the reference photos while being drawn in anime style.`;

            // Build the request with reference images
            const parts = [{ text: imagePrompt }];
            
            if (senderImg) {
                parts.push({
                    inlineData: {
                        mimeType: senderImg.mimeType,
                        data: senderImg.base64
                    }
                });
            }
            
            if (recipientImg) {
                parts.push({
                    inlineData: {
                        mimeType: recipientImg.mimeType,
                        data: recipientImg.base64
                    }
                });
            }

            // Try Gemini 2.0 Flash for image generation with reference images
            const imageResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: {
                            responseModalities: ["TEXT", "IMAGE"]
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
                
                // Fallback to Imagen 3 without reference images
                const fallbackResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            instances: [{ 
                                prompt: `Create a beautiful Japanese anime illustration of two young women ${randomScene}. Style: Shoujo manga art style, normal body proportions (not chibi), large expressive anime eyes, elegant features, warm soft colors, detailed background, professional anime quality, slice-of-life aesthetic.`
                            }],
                            parameters: {
                                sampleCount: 1,
                                aspectRatio: '1:1',
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

            // Generate greeting based on scene using Gemini text
            const greetingPrompt = `You are creating a heartfelt Christmas greeting card message.
Scene: Two friends named ${senderName} and ${recipientName} are ${randomScene}.
User's original message: "${message || 'Merry Christmas!'}"

Write a short, warm, and creative Christmas greeting (2-3 sentences max) that:
1. References the festive scene naturally
2. Incorporates the spirit of the user's message
3. Feels personal and heartwarming
4. Uses festive but not overly cheesy language

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
