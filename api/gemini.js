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

            // Use Gemini 2.5 Flash Image (proven stable model)
            console.log('🎨 Attempting image generation with Gemini 2.5 Flash Image...');
            
            const visualPrompt = `Create a vintage New Year or Christmas greeting card using the provided photo as a reference for the person's appearance (preserve facial features and likeness).

Inspired by classic illustrated New Year and Christmas postcards by Jenny Nyström, Anton Pieck, or Ellen Clapsaddle.

Scene: ${randomScene}

Festive winter scene, snowy fairy-tale forest, decorated Christmas tree with warm glowing lights.
Timeless vintage winter clothing, classic international postcard style.
Cozy, joyful, nostalgic holiday mood.
Hand-painted illustration look, muted colors, subtle vintage paper texture.
Vertical format 9:16.

CRITICAL COMPOSITION REQUIREMENTS:
- Watercolor-style natural edge transition
- The scene should fade gently into the cream/beige background like watercolor bleeding into paper
- NO defined oval or arched border shape - just natural, organic fading
- Edges should have soft, irregular watercolor wash effect
- Think: watercolor painting on cream paper where the colors naturally fade and blend at the edges
- The transition should be so smooth and natural that there's no visible "frame" or "border line"
- Vary the fade distance - some areas can fade sooner, some later (organic, not uniform)
- NO text, NO words, NO captions in the image

Think: Watercolor illustration that naturally bleeds into the paper background, NOT a framed picture with defined edges.

IMPORTANT: Natural watercolor fade effect - NO hard edges, NO defined oval/arch shapes, just gentle color blending.`;


            // Build parts array: IMAGE FIRST, then prompt (following farstand3 pattern)
            const imageParts = [];
            
            // Add user avatar as reference image FIRST
            if (senderImg) {
                imageParts.push({
                    inlineData: {
                        mimeType: senderImg.mimeType,
                        data: senderImg.base64
                    }
                });
                console.log('✅ Added user avatar as reference image (first)');
            }
            
            // Then add text prompt that refers to "this person"
            const finalPrompt = senderImg 
                ? `Create a vintage New Year or Christmas greeting card featuring this person in the photo.

Inspired by classic illustrated New Year and Christmas postcards by Jenny Nyström, Anton Pieck, or Ellen Clapsaddle.

Preserve the person's facial features and likeness in an illustrated vintage style.

Scene: ${randomScene}

Festive winter scene, snowy fairy-tale forest, decorated Christmas tree with warm glowing lights.
Timeless vintage winter clothing, classic international postcard style.
Cozy, joyful, nostalgic holiday mood.
Hand-painted illustration look, muted colors, subtle vintage paper texture.
Vertical format 9:16.

CRITICAL COMPOSITION REQUIREMENTS:
- Watercolor-style natural edge transition
- The scene should fade gently into the cream/beige background like watercolor bleeding into paper
- NO defined oval or arched border shape - just natural, organic fading
- Edges should have soft, irregular watercolor wash effect
- Think: watercolor painting on cream paper where the colors naturally fade and blend at the edges
- The transition should be so smooth and natural that there's no visible "frame" or "border line"
- Vary the fade distance - some areas can fade sooner, some later (organic, not uniform)
- NO text, NO words, NO captions in the image

Think: Watercolor illustration that naturally bleeds into the paper background, NOT a framed picture with defined edges.

IMPORTANT: Natural watercolor fade effect - NO hard edges, NO defined oval/arch shapes, just gentle color blending.`
                : visualPrompt; // Fallback if no image
            
            imageParts.push({ text: finalPrompt });

            const imageResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: imageParts
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topP: 0.95,
                            topK: 40,
                            responseModalities: ["IMAGE"]
                        }
                    })
                }
            );

            console.log('Image response status:', imageResponse.status);
            
            if (imageResponse.ok) {
                const imageResult = await imageResponse.json();
                console.log('✅ Image API Response received');
                
                // Extract image from Gemini 2.5 Flash Image response
                const parts = imageResult.candidates?.[0]?.content?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData && part.inlineData.data) {
                            imageData = part.inlineData.data;
                            console.log('✅ Found image data! Length:', imageData?.length);
                            break;
                        }
                    }
                }
                
                if (!imageData) {
                    console.error('❌ No inlineData found in response:', imageResult);
                    imageError = 'No image in response';
                }
            } else {
                imageError = await imageResponse.text();
                console.error('❌ Image generation failed:', imageError);
            }

            // Generate personalized greeting based on scene analysis
            const greetingPrompt = `You are writing a heartfelt Christmas greeting card from ${senderName} to ${displayRecipient}.

MANDATORY LENGTH RULE: Your response MUST be at least 400-500 words. This is a long, very detailed letter with rich, extensive content.

The card illustration shows: "${randomScene}"

Your task:
1. Write an extensive, detailed story about this exact scene - describe what you're doing, how it feels, what you see, your thoughts and reflections
2. Include vivid sensory details (sights, sounds, smells, feelings, textures)
3. Share your activities, experiences, and inner thoughts in this scene
4. Make it personal, warm, storytelling, and reflective
5. MUST be at least 400-500 words - this should be 5-6 substantial paragraphs with rich details!
6. Add reflections on the meaning of the season, memories, gratitude, hopes for the future
7. Tell stories, share anecdotes, describe multiple experiences and moments

Required structure:
- Opening: "Dear ${displayRecipient}," or "Hey ${displayRecipient}!"
- Body (5-6 substantial paragraphs with rich details):
  Paragraph 1: Set the scene with vivid description - what you're doing, the environment, the atmosphere
  Paragraph 2: Deep sensory immersion - what you see, hear, smell, feel, taste in detail
  Paragraph 3: Your activities and experiences throughout the day/season - tell stories and share moments
  Paragraph 4: More experiences - describe other activities, interactions, special moments you've had
  Paragraph 5: Personal reflections - what this season means to you, memories, gratitude, growth
  Paragraph 6: Hopes and wishes for the recipient, connection to your friendship/relationship
- Examples for inspiration:
  * Snow/winter → "The mountains have been incredible this season! I've been skiing every weekend and building the most epic snowmen you've ever seen. The crisp air and sparkling snow make everything feel magical."
  * Travel → "I'm currently exploring [destination] and it's absolutely breathtaking! The festive markets, twinkling lights, and local traditions have made this holiday season unforgettable. I wish you could be here to experience it with me."
  * Family → "This holiday season has been all about family for me. We've been baking grandmother's secret recipes, decorating the entire house, and creating memories that will last forever. The house smells like cinnamon and joy."
  * Pets → "My furry companion and I have been having the coziest winter! We spend our days by the fireplace, taking snowy walks, and he's been 'helping' me wrap presents (by which I mean sitting on the wrapping paper)."
  * Indoor/cozy → "I've turned into a complete homebody this winter! Curled up with endless hot cocoa, good books, and the fireplace crackling away. It's been the perfect season for reflection and gratitude."
  * Urban → "The city is absolutely magical right now! Every street corner has twinkling lights, holiday music fills the air, and there's this incredible energy that only happens this time of year. I love walking through it all."
  * Nature → "I've been spending every free moment hiking through snow-covered forests and frozen lakes. Nature in winter is so peaceful and beautiful - it reminds me what's truly important in life."
- Connection (1-2 sentences): Make it personal to the recipient - "I can't wait to catch up with you soon!" or "Hope you're staying warm and cozy!" or "Miss our adventures together!" or "Would love to share this experience with you!"
- Closing: "Warmest wishes, ${senderName}" or "With love, ${senderName}" or "Cheers, ${senderName}"

VERIFICATION:
- Count your words before responding
- Minimum 400-500 words required (aim for 450+ words)
- No maximum - write as much as needed to tell a full, rich story
- Write 5-6 substantial paragraphs with detailed descriptions
- If your draft is less than 400 words, add more stories, sensory details, activities, reflections, anecdotes, and personal thoughts

Example length (approximately 450+ words):
"Dear Sarah, Merry Christmas! I hope this card finds you well and fills your heart with the same joy that's been filling mine this holiday season.

I wanted to share what I've been up to lately. Every evening as the sun sets, I've been making my way to the town square where the most magnificent Christmas tree stands tall against the twilight sky. It's adorned with hundreds upon hundreds of twinkling golden lights that seem to dance and sparkle in the winter breeze, creating this magical, almost dreamlike atmosphere. The air is crisp and refreshing, filled with the joyful sounds of carol singers whose voices echo through the cobblestone streets, and there's always the warm, comforting aroma of hot cocoa and roasted chestnuts wafting from the festive market stalls that line the square.

I've been ice skating on the outdoor rink with friends almost every weekend, laughing as we slip and slide across the frozen surface like clumsy penguins. The whole scene feels like something straight out of a storybook, with snow gently falling like tiny diamonds, children building snowmen with bright red scarves and carrot noses, and couples sharing warm drinks while holding hands under the glowing streetlamps. It's these simple, magical moments that make this season so incredibly special.

This time of year always makes me reflective. Being surrounded by all this beauty and joy reminds me of what truly matters in life - the connections we have with the people we care about, the memories we create together, and the warmth we share even when we're apart. I find myself feeling deeply grateful for our friendship and all the wonderful times we've shared over the years.

I find myself thinking of you often during these celebrations and wishing you could be here to experience this festive atmosphere with me. I truly hope your holidays are filled with equal warmth, joy, and all the magic that this season brings!

Warmest wishes and lots of love, John"

Now write your greeting (at least 400-500 words, aim for 450+ words):`;

            const textResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: greetingPrompt }] }],
                        generationConfig: {
                            temperature: 0.9,
                            maxOutputTokens: 1000,
                            candidateCount: 1
                        }
                    })
                }
            );

            let greeting = message || 'Merry Christmas!';
            let sceneType = 'general';
            let sceneDescription = 'holiday celebration';
            
            console.log('📝 Text generation response status:', textResponse.status);
            if (textResponse.ok) {
                const textResult = await textResponse.json();
                console.log('📝 Text result:', textResult);
                if (textResult.candidates && textResult.candidates[0]?.content?.parts?.[0]?.text) {
                    greeting = textResult.candidates[0].content.parts[0].text.trim();
                    console.log('✅ Greeting generated:', greeting.substring(0, 100) + '...');
                } else {
                    console.error('❌ No text in candidates:', textResult);
                }
            } else {
                const errorText = await textResponse.text();
                console.error('❌ Text generation failed:', textResponse.status, errorText);
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
