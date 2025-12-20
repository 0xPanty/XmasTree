export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured. Please set GEMINI_API_KEY in Vercel environment variables.' });
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

            // Generate vintage Christmas postcard with intelligent scene analysis
            const imagePrompt = `Analyze the provided profile image and create a vintage Christmas postcard:

STEP 1 - SCENE DETECTION:
Identify the scene/context in the photo:
- Human portrait → Preserve facial features, hairstyle, clothing style
- Non-human (logo/animal/object) → Extract color palette, visual style, mood
- Winter/snow scene → Skiing, snowman building, snow play
- Travel photo → Traveling in [location], exploring cities
- Family gathering → Family reunion, decorating Christmas tree
- Pet photo → Spending holidays with pet
- Indoor/cozy → By the fireplace, hot chocolate, reading
- Beach/summer → Winter vacation in warm place
- Urban/city → City lights, holiday shopping
- Nature/outdoor → Hiking in winter forest

STEP 2 - GENERATE IMAGE:
Style: Vintage Christmas postcard inspired by Jenny Nyström, Anton Pieck, Ellen Clapsaddle
Scene: Match the detected scene with festive winter atmosphere
Character: Based on the photo analysis (preserve likeness or embody extracted elements)
Format: Vertical 9:16, hand-painted illustration, muted colors, vintage paper texture
Mood: Warm, nostalgic, cozy holiday feeling

REFERENCE IMAGE: Analyze this image to create the postcard.`;

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

            // Generate personalized greeting based on scene analysis
            const greetingPrompt = `You are writing a personalized Christmas greeting card from ${senderName}. Based on the profile image you analyzed earlier, write a warm, heartfelt message (50-100 words):

Structure:
- Opening: "Merry Christmas, dear friend!" or "Happy Holidays!" (warm greeting)
- Middle: Share what you've been up to based on the scene you detected:
  * Snow/winter scene → "I've been skiing/building snowmen in the mountains..."
  * Travel photo → "Exploring [destination], discovering festive markets..."
  * Family gathering → "Spending precious time with family, baking holiday treats..."
  * Pet photo → "My furry companion and I are enjoying cozy winter days..."
  * Indoor/cozy → "Curled up with hot cocoa by the fireplace..."
  * Urban scene → "The city lights are magical this time of year..."
  * Nature → "Hiking through snow-covered forests..."
- Closing: "Warmest wishes, ${senderName}" or "With love, ${senderName}"

Tone: Warm, genuine, conversational (like a handwritten note from a friend)
Length: 50-100 words
Style: Natural and heartfelt, not overly formal

Write only the greeting text, nothing else:`;

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
            let sceneType = 'general';
            let sceneDescription = 'holiday celebration';
            
            if (textResponse.ok) {
                const textResult = await textResponse.json();
                if (textResult.candidates && textResult.candidates[0]?.content?.parts?.[0]?.text) {
                    greeting = textResult.candidates[0].content.parts[0].text.trim();
                }
            }
            
            // Extract scene info from greeting for reply context
            const greetingLower = greeting.toLowerCase();
            if (greetingLower.includes('ski') || greetingLower.includes('snow') || greetingLower.includes('mountain')) {
                sceneType = 'skiing';
                sceneDescription = 'skiing in snowy mountains';
            } else if (greetingLower.includes('travel') || greetingLower.includes('exploring') || greetingLower.includes('city')) {
                sceneType = 'travel';
                sceneDescription = 'traveling and exploring new places';
            } else if (greetingLower.includes('family') || greetingLower.includes('gathering') || greetingLower.includes('together')) {
                sceneType = 'family';
                sceneDescription = 'spending time with family';
            } else if (greetingLower.includes('pet') || greetingLower.includes('dog') || greetingLower.includes('cat')) {
                sceneType = 'pet';
                sceneDescription = 'enjoying cozy moments with pet';
            } else if (greetingLower.includes('fireplace') || greetingLower.includes('cocoa') || greetingLower.includes('cozy')) {
                sceneType = 'indoor';
                sceneDescription = 'relaxing by the fireplace';
            } else if (greetingLower.includes('beach') || greetingLower.includes('warm') || greetingLower.includes('vacation')) {
                sceneType = 'beach';
                sceneDescription = 'enjoying warm holiday vacation';
            }

            // Fallback: If no image generated, use Unsplash vintage Christmas image
            if (!imageData) {
                console.log('⚠️ No image generated by Gemini, using Unsplash fallback');
                try {
                    // Fetch a vintage Christmas image from Unsplash
                    const unsplashUrl = 'https://source.unsplash.com/280x500/?vintage,christmas,postcard';
                    const imgResponse = await fetch(unsplashUrl);
                    if (imgResponse.ok) {
                        const arrayBuffer = await imgResponse.arrayBuffer();
                        imageData = Buffer.from(arrayBuffer).toString('base64');
                        console.log('✅ Using Unsplash fallback image');
                    } else {
                        // Ultimate fallback: 1x1 transparent pixel
                        imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                    }
                } catch (error) {
                    console.error('Unsplash fallback failed:', error);
                    imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                }
            }
            
            return res.status(200).json({
                success: true,
                scene: randomScene,
                greeting: greeting,
                image: imageData,
                imageError: imageError,
                sceneType: sceneType,
                sceneDescription: sceneDescription
            });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Gemini API error:', error);
        return res.status(500).json({ error: 'API request failed', details: error.message });
    }
}
