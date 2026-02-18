import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '../data/daily-limit.json');

// 1日あたりのAPIリクエスト上限
const DAILY_LIMIT = 50;
let requestCount = 0;
let resetDate = new Date().toDateString();

// ファイルから復元
try {
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  if (data.resetDate === new Date().toDateString()) {
    requestCount = data.requestCount;
    resetDate = data.resetDate;
  }
} catch {
  // ファイルが存在しない場合は初期値のまま
}

function save() {
  try {
    mkdirSync(dirname(DATA_FILE), {recursive: true});
    writeFileSync(DATA_FILE, JSON.stringify({requestCount, resetDate}));
  } catch (err) {
    console.error('Failed to save daily limit data:', err.message);
  }
}

export function getStatus() {
  const today = new Date().toDateString();
  if (today !== resetDate) {
    requestCount = 0;
    resetDate = today;
    save();
  }
  return {requestCount, dailyLimit: DAILY_LIMIT};
}

export default function dailyLimit(req, res, next) {
  const today = new Date().toDateString();
  if (today !== resetDate) {
    requestCount = 0;
    resetDate = today;
  }
  if (requestCount >= DAILY_LIMIT)
    return res.status(429).json({errors: [{msg: `1日のリクエスト上限（${DAILY_LIMIT}回）に達しました`}]});
  requestCount++;
  save();
  console.log(`API request count: ${requestCount}/${DAILY_LIMIT}`);
  next();
}
