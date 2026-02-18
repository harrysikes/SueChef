import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// Must use static process.env.EXPO_PUBLIC_* access so Metro can inline the value at build time
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access media library is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri || null;
};

/** Open the camera to take a new photo. Returns the image URI or null if cancelled. */
export const takePhoto = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to use the camera is required');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1,
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
    const dataUrl = await uriToDataUrl(imageUri);

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
                image_url: { url: dataUrl, detail: 'high' as const },
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

export interface ReceiptItem {
  name: string;
  quantity?: string;
  price?: string;
}

export const scanReceipt = async (imageUri: string): Promise<ReceiptItem[]> => {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const dataUrl = await uriToDataUrl(imageUri);
  const prompt = `This image is a grocery receipt. Extract every item purchased as a JSON array of objects with "name", "quantity" (optional), and "price" (optional). Read carefully even if the image is slightly blurry or the receipt has unusual formatting. Return only the JSON array, no other text.`;

  const content = await visionRequest(dataUrl, prompt);
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
};

export interface BestByResult {
  itemName?: string;
  bestByDate: string; // YYYY-MM-DD
  rawText?: string;
}

export const scanBestByDate = async (imageUri: string): Promise<BestByResult[]> => {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const dataUrl = await uriToDataUrl(imageUri);
  const prompt = `This image shows food packaging or a label. Find any "Best By", "Use By", or "Sell By" dates. Return a JSON array of objects: [{ "itemName": "product name if visible", "bestByDate": "YYYY-MM-DD", "rawText": "exact text found" }]. If multiple dates, include each. Read carefully even if text is small or partially obscured. Return only the JSON array.`;

  const content = await visionRequest(dataUrl, prompt);
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
};

/** Extract full recipe text (ingredients + instructions) from a photo of a recipe. */
export const scanRecipeImage = async (imageUri: string): Promise<string> => {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const dataUrl = await uriToDataUrl(imageUri);
  if (!dataUrl || dataUrl.length < 100) throw new Error('Could not load image. Try taking a new photo.');

  const prompt = `Look at this image and transcribe ALL the recipe text you can see. Include:
- Recipe title
- Ingredients (with amounts)
- Instructions/steps (numbered or as paragraphs)

Copy the text exactly as it appears. Do not summarize or paraphrase. If text is handwritten or partially visible, do your best to read it. Return ONLY the recipe text, nothing else.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'high' as const } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    let msg = 'Could not read recipe from image';
    try {
      const errJson = JSON.parse(errBody);
      if (errJson.error?.message) msg = errJson.error.message;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  let content = data.choices[0]?.message?.content?.trim() || '';
  if (!content) throw new Error('No recipe text was found in the image.');

  // Strip markdown code blocks if the model wrapped the output
  const codeBlock = content.match(/^```(?:\w*)\n?([\s\S]*?)```$/);
  if (codeBlock) content = codeBlock[1].trim();

  return content;
};

/** Returns full data URL. Uses FileSystem for file:// URIs (reliable on RN); falls back to fetch for other schemes. */
async function uriToDataUrl(uri: string): Promise<string> {
  const isFileUri = uri.startsWith('file://') || uri.startsWith('file:');
  if (isFileUri && FileSystem.readAsStringAsync) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!base64) throw new Error('Empty image data');
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      return `data:${mime};base64,${base64}`;
    } catch (e) {
      console.warn('FileSystem read failed, trying fetch:', e);
    }
  }
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const s = reader.result as string;
      if (s && s.startsWith('data:image/')) resolve(s);
      else if (s) resolve(`data:image/jpeg;base64,${s.split(',')[1] || s}`);
      else resolve('');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function visionRequest(dataUrl: string, textPrompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
            { type: 'text', text: textPrompt },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'high' as const } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });
  if (!res.ok) throw new Error('Vision API error');
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || '[]';
}
