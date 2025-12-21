module.exports = async function handler(req, res) {
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
    const displayRecipient = recipientName || 'dear friend';

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
            // Fetch sender avatar and convert to base64
            const senderImg = await imageUrlToBase64(senderAvatar);

            let imageData = null;
            let imageError = null;

            // Generate diverse vintage Christmas postcard scenes - 100+ variations!
            const diverseScenes = [
                // OUTDOOR WINTER SPORTS & ACTIVITIES (25)
                '⛷️ skiing down snowy mountain slope with pine trees and festive village below',
                '⛸️ ice skating on frozen pond surrounded by snow-covered trees with string lights',
                '🛷 sledding down steep hill with scarves flying in wind',
                '🎿 snowboarding off jump with powder spray and mountain backdrop',
                '🏂 cross-country skiing through silent snowy forest at sunset',
                '⛷️ teaching child to ski on gentle bunny slope',
                '🏔️ snowshoeing through deep powder with mountain peaks behind',
                '⛸️ figure skating performance on outdoor ice rink with crowd watching',
                '🛷 riding toboggan down winding track with friends',
                '🏂 snowmobile adventure through winter wonderland',
                '⛷️ ski lift ride up mountain with view of snowy valley',
                '🏔️ building snow fort and having epic snowball fight',
                '⛄ creating entire snowman family with accessories',
                '❄️ making snow angels in fresh powder field',
                '🏔️ ice climbing frozen waterfall with gear and ropes',
                '⛷️ nighttime skiing under floodlights and stars',
                '🏂 dogsledding through arctic landscape with husky team',
                '⛸️ hockey game on outdoor frozen lake',
                '🏔️ winter camping with tent in snowy wilderness',
                '⛷️ backcountry skiing adventure through untouched powder',
                '🏂 tubing park racing down lanes',
                '⛸️ ice fishing on frozen lake with warming hut',
                '🏔️ building elaborate ice sculptures',
                '⛷️ learning to ski behind instructor',
                '🏂 snow biking on fat-tire bike through winter trails',
                
                // COZY INDOOR SCENES (20)
                '🔥 roasting chestnuts by crackling fireplace with stockings hung',
                '☕ sipping hot cocoa with marshmallows by frost-covered window',
                '📚 reading Christmas classics in armchair with blanket',
                '🎸 playing acoustic guitar by glowing Christmas tree',
                '🧶 knitting cozy sweaters with yarn basket and cat nearby',
                '🎹 playing piano with sheet music of Christmas carols',
                '🕯️ writing in journal by candlelight at antique desk',
                '📖 reading bedtime stories to children in pajamas',
                '🎮 playing board games with family around coffee table',
                '🧩 working on Christmas jigsaw puzzle together',
                '🎨 painting winter landscape on canvas by easel',
                '📝 hand-writing Christmas cards with calligraphy pen',
                '🧸 arranging toy train set under Christmas tree',
                '📺 watching classic holiday movies with popcorn',
                '☕ tea time with grandmother\'s china and Christmas cookies',
                '🎼 listening to vinyl records of Christmas music',
                '🪡 sewing handmade ornaments and decorations',
                '📷 organizing and framing family Christmas photos',
                '🎨 decorating Christmas stockings with glitter and sequins',
                '🕯️ lighting advent candles in peaceful meditation',
                
                // FESTIVE BAKING & COOKING (15)
                '🍪 baking Christmas cookies with cookie cutters shaped like trees and stars',
                '🎂 decorating elaborate gingerbread house with icing and candy',
                '🥧 pulling fresh-baked pies from oven - apple, pumpkin, pecan',
                '🍗 carving golden turkey at dining table with family gathered',
                '🥘 preparing traditional holiday feast with multiple generations cooking',
                '🎄 making candy canes and Christmas treats',
                '🍰 decorating Yule log cake with chocolate and holly',
                '🥖 baking fresh bread and dinner rolls for feast',
                '🍫 making homemade chocolates and truffles as gifts',
                '🥧 crimping pie crust edges with grandmother teaching',
                '🍪 using grandmother\'s secret recipe from handwritten cards',
                '🎂 frosting layer cake with festive red and green',
                '🥘 stirring large pot of mulled cider with spices',
                '🍗 preparing roasted chestnuts and winter vegetables',
                '🍰 assembling trifle dessert in glass bowl with layers',
                
                // CHRISTMAS SHOPPING & MARKETS (12)
                '🏪 browsing outdoor Christmas market with wooden stalls and lights',
                '🎁 carrying armfuls of wrapped presents down snowy street',
                '🛍️ window shopping on decorated Fifth Avenue style boulevard',
                '🎄 choosing perfect Christmas tree at tree farm',
                '🏬 shopping in vintage department store with elaborate displays',
                '🎅 visiting Santa at elaborate North Pole mall setup',
                '🏪 browsing handmade crafts at artisan holiday fair',
                '🎁 gift shopping in quaint village with carolers outside',
                '🏬 picking out ornaments at Christmas specialty shop',
                '🛍️ holiday shopping with packages and bags galore',
                '🎄 wreaths and garland shopping at garden center',
                '🏪 buying fresh cookies and treats from bakery window',
                
                // DECORATING & PREPARATIONS (15)
                '🎄 decorating tall Christmas tree with family passing ornaments',
                '🏡 hanging outdoor Christmas lights on house roofline',
                '🎀 wrapping gifts at table covered in ribbons and bows',
                '🎄 stringing popcorn and cranberries for tree garland',
                '🏠 decorating mantle with garland, candles and stockings',
                '🎨 making handmade ornaments from salt dough',
                '🎄 placing star or angel on top of tree with ladder',
                '🏡 setting up outdoor nativity scene in front yard',
                '🎀 tying bows on wreaths for every door',
                '🕯️ arranging advent wreath with candles',
                '🎄 fluffing artificial tree branches to perfection',
                '🏠 hanging Christmas cards on ribbon display',
                '🎨 spray-painting pine cones gold and silver',
                '🏡 inflating lawn decorations - Santa, snowman, reindeer',
                '🎄 untangling last year\'s Christmas lights with patience',
                
                // CITY & URBAN SCENES (12)
                '🌃 walking through city decorated with giant ornaments and window displays',
                '🗽 ice skating at famous city plaza with tall Christmas tree',
                '🏙️ viewing holiday lights from rooftop with city skyline',
                '🚕 taxi ride through city streets with festive decorations',
                '🎭 attending Christmas ballet performance at grand theater',
                '🏛️ visiting museum decorated for holidays with giant tree in atrium',
                '🌉 strolling across bridge with holiday lights reflecting in water',
                '🏬 window shopping at luxury stores with elaborate displays',
                '🎪 visiting Christmas village setup in city park',
                '🚇 subway platform decorated with garland and lights',
                '🏙️ viewing light show projected on historic buildings',
                '🌃 horse-drawn carriage ride through decorated downtown',
                
                // CHURCH & COMMUNITY (8)
                '⛪ attending candlelight Christmas Eve service',
                '🎵 singing in church choir with robes and candles',
                '⛪ children\'s nativity pageant performance',
                '🎄 helping decorate church sanctuary with poinsettias',
                '🎵 caroling door-to-door in neighborhood with songbooks',
                '🏘️ caroling at nursing home spreading joy to seniors',
                '⛪ bell choir performance during Christmas service',
                '🎵 community tree lighting ceremony with crowd singing',
                
                // GIVING BACK & CHARITY (6)
                '🎁 volunteering at toy drive wrapping gifts for children',
                '🥘 serving meals at community dinner on Christmas',
                '🎅 delivering presents to families in need',
                '🏠 adopting family for holidays and shopping for them',
                '🎄 collecting donations at charity kettle with bell',
                '📦 packing care packages for troops overseas',
                
                // SPECIAL & UNIQUE SCENES (8)
                '🚂 riding vintage Christmas train through snowy countryside',
                '🎪 visiting Christmas fair with Ferris wheel and carnival rides',
                '🌴 tropical Christmas on beach with decorated palm tree',
                '✈️ airport departure for holiday travel with luggage',
                '⛵ Christmas on boat decorated with lights',
                '🏕️ RV camping Christmas adventure in national park',
                '🎆 watching fireworks display over snowy town',
                '🌠 viewing northern lights on Christmas Eve'
            ];
            
            // Randomly select a diverse scene to ensure variety
            const randomScene = diverseScenes[Math.floor(Math.random() * diverseScenes.length)];
            console.log('🎲 Selected scene:', randomScene);
            
            const imagePrompt = `Create a vintage New Year or Christmas greeting card illustration using the provided photo as reference for the person's appearance.

SCENE: ${randomScene}

STYLE - CRITICAL (This is a POSTCARD ILLUSTRATION, NOT a painting or photo):
- Inspired by classic illustrated postcards by Jenny Nyström, Anton Pieck, and Ellen Clapsaddle
- FLAT illustration style with simplified forms and shapes
- Hand-drawn look with visible pen/ink linework
- Watercolor-like soft color washes, NOT oil painting texture
- Muted vintage colors: dusty red, sage green, mustard yellow, cream, soft brown
- Simple shading with limited color palette (4-6 main colors)
- Vintage paper texture with subtle grain
- Slight sepia tone or aged paper effect

CHARACTER from reference photo:
- Preserve general facial features and hair style
- Simplify to illustration form (not photorealistic)
- Classic timeless winter clothing appropriate for the scene
- International/universal style (not overly American)

SCENE COMPOSITION:
- Festive winter atmosphere: snow, decorated trees, warm lights
- Cozy, joyful, nostalgic holiday mood
- Clear focal point with simple background elements
- Vertical 9:16 format like traditional postcards

AVOID:
- Oil painting texture or realistic brush strokes
- Photorealistic rendering
- Modern digital art look
- Overly detailed or busy composition
- Dark or dramatic lighting

Think: Classic vintage greeting card from 1920s-1950s European tradition.

REFERENCE IMAGE:`;

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

            // Use Gemini 2.5 Flash for image generation (official supported model)
            console.log('🎨 Attempting image generation with Gemini 2.5 Flash...');
            console.log('Parts:', JSON.stringify(parts, null, 2));
            
            const imageResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: {
                            responseModalities: ["IMAGE"]
                        }
                    })
                }
            );

            console.log('Image response status:', imageResponse.status);
            
            if (imageResponse.ok) {
                const imageResult = await imageResponse.json();
                console.log('✅ Image API Response:', JSON.stringify(imageResult, null, 2));
                
                // Extract image from response
                if (imageResult.candidates && imageResult.candidates[0]?.content?.parts) {
                    for (const part of imageResult.candidates[0].content.parts) {
                        console.log('Checking part:', part);
                        if (part.inlineData) {
                            imageData = part.inlineData.data;
                            console.log('✅ Found image data! Length:', imageData?.length);
                            break;
                        }
                    }
                    if (!imageData) {
                        console.error('❌ No inlineData found in parts');
                    }
                } else {
                    console.error('❌ No candidates or parts in response');
                }
            } else {
                imageError = await imageResponse.text();
                console.error('❌ Image generation failed:', imageError);
                
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
            const greetingPrompt = `You are writing a heartfelt Christmas greeting card from ${senderName} to ${displayRecipient}. Based on the profile image, write a warm, personal message (80-150 words):

Structure:
- Opening: Address the recipient directly - "Dear ${displayRecipient}," or "Hey ${displayRecipient}!" followed by a warm holiday greeting
- Main body (3-4 sentences): Share what you've been up to based on the detected scene:
  * Snow/winter → "The mountains have been incredible this season! I've been skiing every weekend and building the most epic snowmen you've ever seen. The crisp air and sparkling snow make everything feel magical."
  * Travel → "I'm currently exploring [destination] and it's absolutely breathtaking! The festive markets, twinkling lights, and local traditions have made this holiday season unforgettable. I wish you could be here to experience it with me."
  * Family → "This holiday season has been all about family for me. We've been baking grandmother's secret recipes, decorating the entire house, and creating memories that will last forever. The house smells like cinnamon and joy."
  * Pets → "My furry companion and I have been having the coziest winter! We spend our days by the fireplace, taking snowy walks, and he's been 'helping' me wrap presents (by which I mean sitting on the wrapping paper)."
  * Indoor/cozy → "I've turned into a complete homebody this winter! Curled up with endless hot cocoa, good books, and the fireplace crackling away. It's been the perfect season for reflection and gratitude."
  * Urban → "The city is absolutely magical right now! Every street corner has twinkling lights, holiday music fills the air, and there's this incredible energy that only happens this time of year. I love walking through it all."
  * Nature → "I've been spending every free moment hiking through snow-covered forests and frozen lakes. Nature in winter is so peaceful and beautiful - it reminds me what's truly important in life."
- Connection (1-2 sentences): Make it personal to the recipient - "I can't wait to catch up with you soon!" or "Hope you're staying warm and cozy!" or "Miss our adventures together!" or "Would love to share this experience with you!"
- Closing: "Warmest wishes, ${senderName}" or "With love, ${senderName}" or "Cheers, ${senderName}"

Tone: Warm, genuine, storytelling (like a letter from a close friend sharing their life)
Length: 80-150 words
Style: Natural, heartfelt, with vivid details

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

            // Log final result
            if (!imageData) {
                console.error('❌ FINAL RESULT: No image data generated');
            } else {
                console.log('✅ FINAL RESULT: Image data ready, length:', imageData.length);
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
