import {GoogleGenAI, ThinkingLevel} from '@google/genai';
import PROMPT from '../prompts/shelf-stock.js';

const RESPONSE_SCHEMA = {
  type: 'array',
  description: '検出された各商品の在庫状況',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '商品名（例: 緑茶 500ml、カップ麺）',
      },
      stock: {
        type: 'string',
        description: '在庫状況（full, low, empty のいずれか）',
        enum: ['full', 'low', 'empty'],
      },
      location: {
        type: 'string',
        description: '棚上の位置（例: 上段、中段、下段）',
      },
    },
    required: ['name', 'stock', 'location'],
  },
};

// AI Studio APIキー認証（Workers ではシークレットが実行時のみ利用可能なため遅延初期化）
let ai;
function getClient() {
  if (!ai) ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  return ai;
}

/**
 * 商品棚画像をGemini 3 Flashで解析し、各商品の在庫状況を返す
 * @param {string} imageDataUrl Data URL形式の画像
 * @returns {Promise<Array<{name: string, stock: string, location: string}>>}
 */
export default async function analyzeShelfStock(imageDataUrl) {

  // Data URLからbase64とMIMEタイプを抽出
  const matches = imageDataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!matches)
    throw new Error('Invalid image data URL');
  const [, mimeType, base64Data] = matches;

  console.log('Gemini API request started. Model: gemini-3-flash-preview');
  const startTime = performance.now();

  try {
    const response = await getClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {inlineData: {mimeType, data: base64Data}},
            {text: PROMPT},
          ],
        },
      ],
      config: {
        temperature: 0,
        topP: 0,
        topK: 1,
        candidateCount: 1,
        thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Gemini API request succeeded in ${timeTaken} s.`);
    console.log('Gemini API response:', response.text);

    return JSON.parse(response.text);
  } catch (err) {
    const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
    console.error(`Gemini API request failed in ${timeTaken} s:`, err.message);
    throw err;
  }
}
