// 1日あたりのAPIリクエスト上限
const DAILY_LIMIT = 50;

// ローカル開発用インメモリフォールバック
let memCount = 0;
let memResetDate = new Date().toDateString();

// Workers 環境の KV バインディングを取得（ローカルでは null）
async function getKV() {
  try {
    const {getRequestContext} = await import('cloudflare:workers');
    return getRequestContext().env.DAILY_COUNTER;
  } catch {
    return null;
  }
}

function todayKey() {
  return `count:${new Date().toDateString()}`;
}

export async function getStatus() {
  const kv = await getKV();
  if (kv) {
    const count = parseInt(await kv.get(todayKey()) || '0', 10);
    return {requestCount: count, dailyLimit: DAILY_LIMIT};
  }
  // ローカル: インメモリ
  const today = new Date().toDateString();
  if (today !== memResetDate) {
    memCount = 0;
    memResetDate = today;
  }
  return {requestCount: memCount, dailyLimit: DAILY_LIMIT};
}

export default async function dailyLimit(req, res, next) {
  const kv = await getKV();
  if (kv) {
    const key = todayKey();
    let count = parseInt(await kv.get(key) || '0', 10);
    if (count >= DAILY_LIMIT)
      return res.status(429).json({errors: [{msg: `1日のリクエスト上限（${DAILY_LIMIT}回）に達しました`}]});
    count++;
    await kv.put(key, String(count));
    console.log(`API request count: ${count}/${DAILY_LIMIT}`);
    return next();
  }
  // ローカル: インメモリ
  const today = new Date().toDateString();
  if (today !== memResetDate) {
    memCount = 0;
    memResetDate = today;
  }
  if (memCount >= DAILY_LIMIT)
    return res.status(429).json({errors: [{msg: `1日のリクエスト上限（${DAILY_LIMIT}回）に達しました`}]});
  memCount++;
  console.log(`API request count: ${memCount}/${DAILY_LIMIT}`);
  next();
}
