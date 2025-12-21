import * as ImagePicker from 'expo-image-picker';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access media library is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri || null;
};

export const parseRecipeImage = async (imageUri: string): Promise<Array<{ name: string; quantity?: string; category?: string }>> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all ingredients from this recipe image. Return them as a JSON array of objects with "name", "quantity" (optional), and "category" (optional) fields. Only return the JSON array, no other text.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content || '[]';
    const ingredients = JSON.parse(content);
    return ingredients;
  } catch (error) {
    console.error('Error parsing recipe image:', error);
    throw error;
  }
};

