import {GoogleGenAI, ThinkingLevel} from '@google/genai';
import PROMPT from '../prompts/meal-intake.js';

const RESPONSE_SCHEMA = {
  type: 'array',
  description: '検出された各品目の摂取率',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '品目名（例: ご飯、魚、煮物）',
      },
      intakePercent: {
        type: 'number',
        description: '摂取率（0, 20, 40, 60, 80, 100 のいずれか）',
      },
    },
    required: ['name', 'intakePercent'],
  },
};

// AI Studio APIキー認証（Workers ではシークレットが実行時のみ利用可能なため遅延初期化）
let ai;
function getClient() {
  if (!ai) ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  return ai;
}

/**
 * 食事画像をGemini 3 Flashで解析し、品目ごとの摂取率を返す
 * @param {string} imageDataUrl Data URL形式の画像
 * @returns {Promise<Array<{name: string, intakePercent: number}>>}
 */
export default async function analyzeMealIntake(imageDataUrl) {

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
        temperature: 0,       // ランダム性を排除（deterministic）
        topP: 0,              // 最も確率の高いトークンのみ選択
        topK: 1,              // 候補トークンを1つに限定
        candidateCount: 1,    // 生成する応答を1つに限定
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
