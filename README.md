# pitch-demos

案件提案用のデモ・プロトタイプ集

## デモ

現在のデモ: **食事摂取量AI判定** — 病院食の食事トレー画像をAIで解析し、品目ごとの摂取率（0〜100%）を自動判定する。

- **モデル**: Gemini 3 Flash (AI Studio APIキー認証)
- **フロント**: Tailwind CSS + DaisyUI, webpack
- **サーバー**: Express + Handlebars（テンプレートはJSエクスポート）
- **ホスティング**: Cloudflare Workers（ローカルでもそのまま動作）
- **コスト管理**: 1日あたりAPIリクエスト50回制限（インメモリ、再起動でリセット）

## アーキテクチャ

### Cloudflare Workers 対応

Cloudflare Workers には永続的なファイルシステムがない。デプロイ時に esbuild で `import` チェーンをたどってバンドルされたファイルのみ `/bundle/`（読み取り専用）に配置される。そのため以下の対応を行った。

| 制約 | 対応 |
|------|------|
| `express-handlebars` が内部で `fs.readFile` を使う | `handlebars` パッケージを直接使用。テンプレートをJS template literal としてエクスポートし `import` で読み込み |
| プロンプト `.md` ファイルを `fs.readFileSync` で読んでいた | JS template literal エクスポートに変換 |
| デイリーリミットを `data/daily-limit.json` に永続化していた | インメモリのみに変更（Workers再起動でリセット） |
| サービスアカウントキーをファイルから読んでいた | AI Studio APIキー認証に切り替え（`process.env.GEMINI_API_KEY`） |

### リクエストルーティング（Workers上）

Cloudflare Workers の静的アセット配信は優先順位で動作する。

1. `public/` 内にリクエストパスに一致するファイルがある → Cloudflare Assets が直接配信（Worker不使用）
2. 一致するファイルがない → Worker（Express）が処理

つまり `/build/*.js`, `/build/*.css`, `/images/*` 等はCloudflare Assetsが配信し、`/`, `/status`, `/api/*` はExpressが処理する。

### `wrangler.toml` の設定

- **`compatibility_date`**: Workers ランタイムの動作をこの日付に固定する。Cloudflareはランタイムを定期的に更新するが、この日付より後の破壊的変更は適用されない。設定しないと最古の日付（2021-11-02）がデフォルトになる。定期的に更新推奨。
- **`compatibility_flags = ["nodejs_compat"]`**: Node.js の組み込みモジュール（`path`, `url`, `crypto` 等）と `process.env` を Workers 上で使えるようにする。Express を動かすために必須。
- **`[assets] directory = "./public"`**: この中のファイルが静的アセットとして配信される。

### 環境変数

| 環境 | 設定方法 |
|------|----------|
| ローカル | `.env` ファイル（`dotenv` が読み込み） |
| Workers | `npx wrangler secret put GEMINI_API_KEY` で登録。`nodejs_compat` により自動で `process.env` に注入される |

## ディレクトリ構成

```
pitch-demos/
├── bin/                  # サーバー起動スクリプト
├── client/               # フロントエンド (webpack)
│   └── src/
├── lib/                  # 共通ヘルパー (renderView等)
├── middlewares/           # Expressミドルウェア
├── prompts/              # AIプロンプト (.js エクスポート)
├── public/               # 静的ファイル・ビルド成果物
├── routes/               # ページ・APIルート
├── services/             # Gemini API呼び出し
├── src/                  # Workers エントリポイント
├── views/                # Handlebarsテンプレート (.js エクスポート)
├── wrangler.toml         # Cloudflare Workers 設定
├── .gitignore
├── CHANGELOG.md
└── README.md
```

## セットアップ

```bash
npm install
cd client && npm install && npm run build && cd ..
npm start
```

http://localhost:3000 でアクセス。

## デプロイ (Cloudflare Workers)

### 前提条件

- [Cloudflare アカウント](https://dash.cloudflare.com/sign-up)
- Wrangler CLI（devDependencies に含まれてるのでグローバルインストール不要）

### 初回セットアップ

```bash
# 1. Cloudflare にログイン（ブラウザが開く）
npx wrangler login

# 2. APIキーをシークレットとして登録
npx wrangler secret put GEMINI_API_KEY
# プロンプトが出るので AI Studio のAPIキーを入力

# 3. デプロイ
npm run deploy
```

デプロイ成功すると `https://pitch-demos.<account>.workers.dev` のURLが表示される。

### 2回目以降

```bash
npm run deploy
```

シークレットは一度登録すれば保持される。コードの変更だけなら `npm run deploy` のみでOK。

### Workers ローカルエミュレーション

```bash
npm run dev:workers
```

Wrangler がローカルで Workers 環境をエミュレートする。`.env` のシークレットを使用。本番デプロイ前の動作確認に便利。

### 注意事項

- `public/build/` の中身もデプロイされる。フロントを変更した場合は `cd client && npm run build` してからデプロイする
- デイリーリミットのカウンターはインメモリなので、Workers の再起動（デプロイ時含む）でリセットされる
- Workers の無料プランは 1日10万リクエスト、CPU時間 10ms/リクエスト
