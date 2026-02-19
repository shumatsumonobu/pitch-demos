// 1日あたりのAPIリクエスト上限
const DAILY_LIMIT = 50;
let requestCount = 0;
let resetDate = new Date().toDateString();

export function getStatus() {
  const today = new Date().toDateString();
  if (today !== resetDate) {
    requestCount = 0;
    resetDate = today;
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
  console.log(`API request count: ${requestCount}/${DAILY_LIMIT}`);
  next();
}
