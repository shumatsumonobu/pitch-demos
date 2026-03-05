import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import url from 'node:url';
import dailyLimit from './middlewares/dailyLimit.js';
import indexRouter from './routes/index.js';
import mealIntakeApiRouter from './routes/api/meal-intake.js';
import shelfStockApiRouter from './routes/api/shelf-stock.js';
import statusApiRouter from './routes/api/status.js';

const app = express();

// ミドルウェア
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({extended: true, limit: '100mb'}));

// 静的ファイル配信（ローカル用、Workers では Cloudflare Assets が配信）
try {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, 'public')));
} catch {
  // Workers 環境では import.meta.url が使えないためスキップ
}

// ルート
app.use('/', indexRouter);
app.use('/api', dailyLimit, mealIntakeApiRouter);
app.use('/api', dailyLimit, shelfStockApiRouter);
app.use('/api', statusApiRouter);

// 404ハンドラ
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// エラーハンドラ
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({error: err.message || 'Internal Server Error'});
});

export default app;
