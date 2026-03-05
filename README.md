# pitch-demos

> 案件提案のインパクトを最大化する、動くデモ・プロトタイプ集

---

## Overview

| 項目 | 詳細 |
|------|------|
| AI モデル | Gemini 3 Flash（AI Studio API キー認証） |
| フロントエンド | Tailwind CSS + DaisyUI / webpack |
| サーバー | Express（テンプレートは JS template literal 関数） |
| ホスティング | Cloudflare Workers（ローカルでもそのまま動作） |
| コスト管理 | 1 日あたり API リクエスト 50 回制限（Workers: KV 永続化 / ローカル: インメモリ） |

### デモ一覧

#### 食事摂取量 AI 判定（`/`）

病院食の食事トレー画像を AI が解析し、品目ごとの摂取率（0〜100%）を自動判定する。

- API: `POST /api/meal-intake` → `[{ name, percentage }]`

#### 商品棚 在庫チェック（`/shelf-stock`）

商品棚の画像から、各商品の在庫状況を AI が判定。在庫状況（十分 / 残少 / 欠品）と棚上の位置（上段・中段・下段）を出力する。

- API: `POST /api/shelf-stock` → `[{ name, stock, location }]`

---

## Quick Start

```bash
npm install
cd client && npm install && npm run build && cd ..
npm start
```

http://localhost:3000 でアクセス。

---

## Project Structure

```
pitch-demos/
├── bin/                  サーバー起動スクリプト
├── client/               フロントエンド (webpack)
│   └── src/
├── lib/                  共通ヘルパー (renderView, HTML エスケープ)
├── middlewares/           Express ミドルウェア
├── prompts/              AI プロンプト (.js エクスポート)
├── public/               静的ファイル・ビルド成果物
├── routes/               ページ・API ルート
├── services/             Gemini API 呼び出し
├── shims/                Workers 互換シム (iconv-lite)
├── src/                  Workers エントリポイント
├── views/                テンプレート (JS template literal 関数)
├── wrangler.toml         Cloudflare Workers 設定
└── CHANGELOG.md
```

---

## Architecture

### なぜ Cloudflare Workers か

Cloudflare Workers には永続的なファイルシステムがない。デプロイ時に esbuild が `import` チェーンをたどり、バンドルされたファイルだけが `/bundle/`（読み取り専用）に配置される。この制約に対し、以下のように対応した。

| 制約 | 対応 |
|------|------|
| `express-handlebars` が内部で `fs.readFile` を使う | テンプレートを JS template literal 関数に変換し `import` で読み込み |
| プロンプト `.md` を `fs.readFileSync` で読んでいた | 同じく JS template literal エクスポートに変換 |
| デイリーリミットを `data/daily-limit.json` に書き出していた | Workers KV に永続化（ローカルではインメモリフォールバック） |
| サービスアカウントキーをファイルから読んでいた | AI Studio API キー認証に切り替え（`process.env.GEMINI_API_KEY`） |

### リクエストルーティング（Workers 上）

Cloudflare Workers の静的アセット配信は優先順位ベースで動作する。

1. `public/` 内にリクエストパスに一致するファイルがある → **Cloudflare Assets が直接配信**（Worker 不使用）
2. 一致するファイルがない → **Worker（Express）が処理**

`/build/*.js`, `/build/*.css`, `/images/*` 等は Cloudflare Assets が配信し、`/`, `/status`, `/api/*` は Express が処理する。

### Workers 固有の対応

| 対応 | 理由 |
|------|------|
| `httpServerHandler` (worker.js) | Express を Workers の `fetch` ハンドラに変換するブリッジ（`cloudflare:node`） |
| Gemini クライアント遅延初期化 | Workers のシークレットはデプロイ検証時に未定義。トップレベルで `new GoogleGenAI()` すると失敗する |
| `import.meta.url` try/catch | esbuild バンドル後は `import.meta.url` が使えない。`express.static` はローカル専用 |
| iconv-lite シム | Express 内部の `body-parser` → `raw-body` → `iconv-lite` が Workers の不完全な Node.js streams 実装でクラッシュするため最小限のシムに差し替え（[wrangler #9309](https://github.com/cloudflare/workers-sdk/issues/9309)） |
| KV でデイリーカウンター永続化 | インメモリだと Workers インスタンス破棄・再起動でリセットされるため |

### `wrangler.toml` 設定ガイド

| 設定 | 役割 |
|------|------|
| `compatibility_date` | Workers ランタイムの動作をこの日付に固定。以降の破壊的変更は適用されない。定期的に更新推奨 |
| `compatibility_flags = ["nodejs_compat"]` | Node.js 組み込みモジュール（`path`, `url`, `crypto` 等）と `process.env` を有効化。Express に必須 |
| `[assets] directory = "./public"` | 静的アセットの配信ディレクトリ |
| `[alias] "iconv-lite"` | Wrangler 4.16.0 以降のバグ回避。最小限のシムに差し替え |
| `[[kv_namespaces]]` | デイリーリミットのカウンターを永続化する KV namespace |

### 環境変数

| 環境 | 設定方法 |
|------|----------|
| ローカル | `.env` ファイル（`dotenv` が読み込み） |
| Workers | `npx wrangler secret put GEMINI_API_KEY` で登録。`nodejs_compat` により `process.env` に自動注入 |

---

## Deploy to Cloudflare Workers

### 前提条件

- [Cloudflare アカウント](https://dash.cloudflare.com/sign-up)
- Wrangler CLI（devDependencies に含まれているためグローバルインストール不要）

### 初回セットアップ

```bash
# 1. Cloudflare にログイン（ブラウザが開く）
npx wrangler login

# 2. デプロイ（Worker を作成）
npm run deploy

# 3. API キーをシークレットとして登録（Worker 作成後でないと失敗する）
npx wrangler secret put GEMINI_API_KEY
# プロンプトが出るので AI Studio の API キーを入力
```

デプロイ成功すると `https://pitch-demos.<account>.workers.dev` の URL が表示される。

### 2 回目以降

```bash
npm run deploy
```

シークレットは一度登録すれば保持される。コードの変更だけなら `npm run deploy` のみで OK。

### Workers ローカルエミュレーション

```bash
npm run dev:workers
```

Wrangler がローカルで Workers 環境をエミュレートする。`.env` のシークレットを使用。本番デプロイ前の動作確認に便利。

### ログ・モニタリング

```bash
# リアルタイムログ
npx wrangler tail

# JSON 形式で出力（パイプ処理向け）
npx wrangler tail --format json

# エラーのみフィルタ
npx wrangler tail --status error
```

`wrangler tail` は WebSocket で Workers のログをストリーミングする。`Ctrl+C` で終了。Cloudflare ダッシュボードの Workers > pitch-demos > Logs からも確認可能。

### シークレット管理

```bash
# 一覧
npx wrangler secret list

# 登録・更新（プロンプトで値を入力）
npx wrangler secret put GEMINI_API_KEY

# 削除
npx wrangler secret delete GEMINI_API_KEY
```

### 注意事項

- `public/build/` もデプロイ対象。フロントを変更した場合は `cd client && npm run build` してからデプロイすること
- デイリーリミットのカウンターは KV に永続化されるため、デプロイや再起動でリセットされない（日付変更でリセット）
- Workers 無料プランの上限: 1 日 10 万リクエスト / CPU 時間 10ms/リクエスト
- アセットファイル名は ASCII のみ使用すること（日本語や `%` を含むパスは Wrangler のマニフェスト生成で失敗する）
