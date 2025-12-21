import { PantryItem } from '@/store/pantryStore';
import { MealPlan } from '@/store/mealStore';
import { GroceryList } from '@/store/groceryStore';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const SUE_SYSTEM_PROMPT = `You are Sue, a friendly, practical, non-judgmental AI sous-chef.

Your responsibilities:
- Help users decide what to cook
- Convert recipes into clear grocery lists
- Track pantry inventory and expiration dates
- Assume ingredients are consumed after planned meals
- Warn users when food is about to expire
- Suggest recipes using excess or expiring ingredients
- Convert long recipes into short step-by-step instructions
- Help salvage cooking mistakes calmly and clearly

Rules:
- Always be concise and supportive
- Assume the user is a novice cook
- Never shame the user
- Prefer simple cooking techniques
- Ask clarifying questions only when necessary

When a user schedules a meal:
- Deduct ingredients from pantry the day after the meal
- Schedule defrost reminders for frozen meats

When food is expiring:
- Notify user and suggest recipes to use it`;

export const sendMessageToSue = async (
  userMessage: string,
  pantryItems: PantryItem[],
  meals: MealPlan[],
  groceryLists: GroceryList[]
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    return "I'm sorry, but I'm not properly configured. Please add your OpenAI API key to continue.";
  }

  const context = `
Current Pantry Items:
${pantryItems.length > 0 ? pantryItems.map((item) => `- ${item.name}${item.quantity ? ` (${item.quantity})` : ''}${item.expirationDate ? ` - expires ${item.expirationDate.toLocaleDateString()}` : ''}`).join('\n') : 'No items in pantry'}

Upcoming Meals:
${meals.length > 0 ? meals.map((meal) => `- ${meal.mealName} on ${meal.date.toLocaleDateString()}`).join('\n') : 'No meals planned'}

Grocery Lists:
${groceryLists.length > 0 ? groceryLists.map((list) => `- ${list.name} (${list.items.length} items)`).join('\n') : 'No grocery lists'}
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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
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



