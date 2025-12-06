import { GoogleGenAI, Type } from "@google/genai";
import { NarrativeResponse, Stats, MicroPet } from "../types";

// Guideline: API key must be obtained exclusively from process.env.API_KEY.
// We assume process.env.API_KEY is pre-configured by the build system (vite.config.ts).
// The fallback "" string prevents TypeScript strict null checks from blocking the build.
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: apiKey });

const MODEL_NAME = "gemini-2.5-flash";

const GAME_SYSTEM_INSTRUCTION = `
You are the narrative and logic engine for "Food Leveling".

GAME ROLE:
1. Identify foods from text or images.
2. Estimate nutrition macros (Protein, Carbs, Fiber, Fats).
3. Convert macros to Game Stats using the "Ghibli Scale".
4. Summon/Buff Micro-Pets based on those macros.

------------------------------------------------------------
THE GHIBLI SCALE (Nutrition -> Game Stats)
------------------------------------------------------------
We normalize real food data into small, fun numbers. 
Rule: ~10g of a macro = +1 Stat Point (capped at +5 per scan to prevent game breaking).

- Protein (Proteon): 10g = +1 Attack & +1 HP
- Carbs (Carbi): 15g = +1 Speed
- Fiber (Fiberling): 5g = +1 Defense (High value!)
- Fats (Fatling): 10g = +1 Special (Volatile energy)

Example: "Salmon (20g Protein, 10g Fat)"
-> Protein 20g / 10 = +2 Attack, +2 HP
-> Fat 10g / 10 = +1 Special
-> Summon: Proteon, Fatling.

------------------------------------------------------------
MICRO-PET ROLES (For Context)
------------------------------------------------------------
- Proteon: Warrior (Attack)
- Fiberling: Tank (Defense)
- Carbi: Healer (Speed/Recovery)
- Fatling: Berserker (Special/Risk)

------------------------------------------------------------
RESPONSE FORMAT (Strict JSON)
------------------------------------------------------------
For 'foodScan':
{
  "type": "foodScan",
  "storyEvent": "You absorbs the power of the Ocean!",
  "mainPetMessage": "I feel strong!",
  "stats": { "hp": 2, "attack": 2, "special": 1 },
  "microPets": [
    { "name": "Proteon", "attackMessage": "Proteon glows with strength!", "effectTag": "pulse_wave" },
    { "name": "Fatling", "attackMessage": "Fatling crackles with energy!", "effectTag": "spark" }
  ]
}

For 'bossIntro':
{
  "type": "bossIntro",
  "storyEvent": "The Evil Cheese laugh!",
  "bossMessage": "Salty...",
  "battleStatus": "ongoing"
}

For 'battleRound' (Unused in current logic, but kept for legacy fallback):
Return standard JSON.
`;

// Schema definition to ensure type safety from the model
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING },
    stats: {
      type: Type.OBJECT,
      properties: {
        hp: { type: Type.NUMBER },
        attack: { type: Type.NUMBER },
        defense: { type: Type.NUMBER },
        speed: { type: Type.NUMBER },
        special: { type: Type.NUMBER },
      }
    },
    petEvolution: { type: Type.STRING, nullable: true },
    mainPetMessage: { type: Type.STRING },
    bossMessage: { type: Type.STRING, nullable: true },
    microPets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          attackMessage: { type: Type.STRING },
          effectTag: { type: Type.STRING }
        }
      }
    },
    storyEvent: { type: Type.STRING },
    damageDealtToBoss: { type: Type.NUMBER },
    damageDealtToPlayer: { type: Type.NUMBER },
    battleStatus: { type: Type.STRING, enum: ['ongoing', 'victory', 'defeat'] }
  },
  required: ['type', 'storyEvent']
};

export const generateGameContent = async (
  requestType: 'foodScan' | 'battleRound' | 'bossIntro' | 'victory',
  petName: string,
  currentStats: Stats,
  currentMicroPets: MicroPet[], 
  bossName: string | null,
  foodInfo: string | null, 
  imageBase64: string | null, 
  action: string | null
): Promise<NarrativeResponse> => {
  
  // OPTIMIZATION: One-Shot Prompt Logic
  const runtimePrompt = `
    Request: ${requestType}
    Context: Pet=${petName}, Boss=${bossName || "None"}
    Input: ${foodInfo || (imageBase64 ? "Image Analysis" : "None")}
    
    If 'foodScan':
    1. Identify the food.
    2. Estimate Macros (Protein, Carbs, Fiber, Fat).
    3. Apply Ghibli Scale (Protein/10 -> Atk/HP, Carbs/15 -> Spd, Fiber/5 -> Def, Fat/10 -> Spl).
    4. Return "stats" object with the GAINED amounts.
    5. Return "microPets" list containing ONLY the spirits corresponding to the detected macros (Proteon=Protein, Carbi=Carbs, Fiberling=Fiber, Fatling=Fats).
    
    If 'bossIntro':
    Generate intro for ${bossName}.
  `;

  try {
    // Race condition: Timeout after 45 seconds
    const timeoutPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 45000)
    );

    let parts: any[] = [{ text: runtimePrompt }];
    
    // Add image if provided
    if (imageBase64) {
        // Strip prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        parts.unshift({
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
            }
        });
    }

    const apiPromise = ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: parts },
      config: {
        systemInstruction: GAME_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      }
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    const text = response.text;

    if (text) {
      // sanitize the text to remove any markdown code blocks that might sneak in
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText) as NarrativeResponse;
    }
    throw new Error("No response text from Gemini");
  } catch (error: any) {
    console.warn("Gemini API Error or Timeout - Switching to Offline Simulation:", error);
    
    const isRateLimit = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota');
    const suffix = isRateLimit ? " (Offline Mode - Quota Reached)" : " (Offline Mode)";

    // --- FALLBACK / SIMULATION LOGIC ---

    if (requestType === 'battleRound') {
       // Battle round simulation logic is handled in App.tsx now, but we keep this for type safety
        return {
            type: 'battleRound',
            storyEvent: "Offline Battle Simulation",
            battleStatus: 'ongoing',
            damageDealtToBoss: 0,
            damageDealtToPlayer: 0,
            microPets: []
        };
    } 
    
    else if (requestType === 'bossIntro') {
        return {
            type: 'bossIntro',
            storyEvent: `The ${bossName} blocks your path!${suffix}`,
            bossMessage: "You cannot pass!",
            battleStatus: 'ongoing',
            damageDealtToBoss: 0,
            damageDealtToPlayer: 0,
            microPets: []
        };
    } 
    
    else if (requestType === 'foodScan') {
        // Pseudo-random stats based on string length to make it feel deterministic for the same input
        const inputLen = (foodInfo || "").length;
        const stats: Partial<Stats> = {
            hp: 2,
            attack: 2,
            speed: 1,
        };

        return {
            type: 'foodScan',
            storyEvent: `Nutrients absorbed!${suffix}`,
            mainPetMessage: "Delicious!",
            stats: stats,
            microPets: [
                { name: "Proteon", attackMessage: "...", effectTag: "pulse" },
                { name: "Carbi", attackMessage: "...", effectTag: "dash" }
            ]
        };
    }

    return {
      type: "error", 
      storyEvent: "The spirits are silent... (Network Error)",
      battleStatus: "ongoing"
    };
  }
};