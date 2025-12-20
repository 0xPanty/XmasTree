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

    try {
        if (action === 'generateCard') {
            // Christmas scenes for variety
            const christmasScenes = [
                'building a snowman together in a snowy winter wonderland',
                'decorating a beautiful Christmas tree with ornaments and lights',
                'having a snowball fight in a magical snowy forest',
                'sitting by a cozy fireplace with hot cocoa and Christmas stockings',
                'ice skating on a frozen pond under falling snowflakes',
                'opening Christmas presents under a sparkling tree',
                'making snow angels in fresh powdery snow',
                'riding a sleigh through a winter forest with reindeer',
                'singing Christmas carols in a snowy village square',
                'baking Christmas cookies together in a festive kitchen'
            ];
            
            const randomScene = christmasScenes[Math.floor(Math.random() * christmasScenes.length)];
            
            // Generate image using Imagen 3
            const imagePrompt = `Create a cute anime/cartoon style illustration of two friends ${randomScene}. 
The first person looks like: ${senderName} (use warm, friendly features).
The second person looks like: ${recipientName} (use warm, friendly features).
Style: Adorable chibi anime art, soft pastel colors, warm Christmas atmosphere, sparkling snow effects, festive decorations.
The image should feel heartwarming, magical and full of Christmas joy.`;

            // Call Gemini Imagen API
            const imageResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: imagePrompt }],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: '1:1',
                            safetyFilterLevel: 'block_few',
                            personGeneration: 'allow_adult'
                        }
                    })
                }
            );

            let imageData = null;
            let imageError = null;
            
            if (imageResponse.ok) {
                const imageResult = await imageResponse.json();
                if (imageResult.predictions && imageResult.predictions[0]) {
                    imageData = imageResult.predictions[0].bytesBase64Encoded;
                }
            } else {
                imageError = await imageResponse.text();
                console.error('Image generation failed:', imageError);
            }

            // Generate greeting based on scene using Gemini text
            const greetingPrompt = `You are creating a heartfelt Christmas greeting card message.
Scene: Two friends named ${senderName} and ${recipientName} are ${randomScene}.
User's original message: "${message || 'Merry Christmas!'}"

Write a short, warm, and creative Christmas greeting (2-3 sentences max) that:
1. References the festive scene
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
