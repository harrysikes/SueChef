import { PantryItem } from '@/store/pantryStore';
import { MealPlan } from '@/store/mealStore';
import { GroceryList } from '@/store/groceryStore';
import type { StandardItem } from '@/store/userPreferencesStore';

// Must use static process.env.EXPO_PUBLIC_* access so Metro can inline the value at build time
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const SUE_SYSTEM_PROMPT = `You are Sue, a warm, supportive AI cooking assistant with a clean, premium tone.

Your role:
- Turn paragraph recipes into clear, numbered steps that are easy to follow.
- Plan grocery trips from: recipes the user wants to cook this week + their standard breakfast/lunch/dinner/snack items.
- Remember what's in the user's kitchen (pantry). When a recipe uses half an item or part of a container, remember the remainder and later suggest "use-up" recipes so nothing goes to waste.
- If the user messes up or forgets part of a recipe: reassure them it's okay, stay calm, and give simple steps to fix or work around it. Never make them feel bad.
- Respect food allergies: never suggest ingredients they're allergic to, and flag allergens in recipes.
- Help with receipt scanning (items to add to pantry) and Best By date tracking.

Rules:
- Be concise, kind, and practical. Assume the user is a home cook, not a pro.
- Never shame. If something goes wrong, focus on solutions.
- For numbered steps: use "1.", "2.", etc. One clear action per step.
- When suggesting use-up ideas: use excess/leftover items + other pantry items that aren't already assigned to a recipe.`;

export interface SueContext {
  pantryItems: PantryItem[];
  meals: MealPlan[];
  groceryLists: GroceryList[];
  allergies?: string[];
  standardItems?: Partial<Record<string, StandardItem[]>>;
}

export const sendMessageToSue = async (
  userMessage: string,
  pantryItems: PantryItem[],
  meals: MealPlan[],
  groceryLists: GroceryList[],
  options?: { allergies?: string[]; standardItems?: Partial<Record<string, StandardItem[]>> }
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    return "I'm sorry, but I'm not properly configured. Please add your OpenAI API key to continue.";
  }

  const pantryLines = pantryItems.length > 0
    ? pantryItems.map((item) => {
        let line = `- ${item.name}`;
        if (item.quantity) line += ` (${item.quantity})`;
        if (item.remainingQuantity) line += ` [remaining: ${item.remainingQuantity}]`;
        if (item.expirationDate) line += ` — expires ${item.expirationDate.toLocaleDateString()}`;
        if (item.bestByDate) line += ` — best by ${item.bestByDate.toLocaleDateString()}`;
        return line;
      }).join('\n')
    : 'No items in pantry';

  const allergyBlock = options?.allergies?.length
    ? `\nUser food allergies (never suggest these): ${options.allergies.join(', ')}`
    : '';

  const standardBlock = options?.standardItems && Object.keys(options.standardItems).length > 0
    ? '\nStandard items user buys regularly:\n' + Object.entries(options.standardItems).map(([slot, items]) =>
        items?.length ? `${slot}: ${items.map((i) => i.name).join(', ')}` : ''
      ).filter(Boolean).join('\n')
    : '';

  const context = `
Current pantry (what's in their kitchen):
${pantryLines}
${allergyBlock}
${standardBlock}

Upcoming meals:
${meals.length > 0 ? meals.map((m) => `- ${m.mealName} on ${m.date.toLocaleDateString()}`).join('\n') : 'None planned'}

Grocery lists:
${groceryLists.length > 0 ? groceryLists.map((l) => `- ${l.name} (${l.items.length} items)`).join('\n') : 'None'}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SUE_SYSTEM_PROMPT },
          { role: 'system', content: context },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
};

/** Convert a paragraph recipe into numbered steps only. Returns plain text with "1. ... 2. ..." */
export const recipeToNumberedSteps = async (recipeParagraph: string): Promise<string> => {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Convert the given recipe into clear, numbered steps (1. 2. 3. ...). One action per step. Be concise. Output only the numbered steps, no intro or outro.',
        },
        { role: 'user', content: recipeParagraph },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) throw new Error('OpenAI API error');
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || recipeParagraph;
};

/** Suggest a recipe to use up excess/leftover items + other pantry items. */
export const suggestUseUpRecipe = async (
  pantryItems: PantryItem[],
  allergies: string[] = []
): Promise<string> => {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const pantryDesc = pantryItems.map((i) => {
    let s = i.name;
    if (i.remainingQuantity) s += ` (${i.remainingQuantity} left)`;
    if (i.quantity) s += ` [${i.quantity}]`;
    return s;
  }).join(', ');

  const allergyNote = allergies.length ? ` Do not use: ${allergies.join(', ')}.` : '';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You suggest a single recipe to reduce food waste using what's in the pantry. Prefer using items that have "remaining" or are close to expiry. Be concise: recipe name, 3–5 bullet ingredients from the list, then short numbered steps.${allergyNote}`,
        },
        { role: 'user', content: `Pantry: ${pantryDesc}` },
      ],
      temperature: 0.5,
      max_tokens: 600,
    }),
  });
  if (!res.ok) throw new Error('OpenAI API error');
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || "I don't have a use-up suggestion right now.";
};

export const parseRecipeText = async (recipeText: string): Promise<Array<{ name: string; quantity?: string; category?: string }>> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Extract ingredients from this recipe and return them as a JSON array of objects with "name", "quantity" (optional), and "category" (optional) fields. Only return the JSON array, no other text.',
          },
          { role: 'user', content: recipeText },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    const ingredients = JSON.parse(content);
    return ingredients;
  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw error;
  }
};



