# CLAUDE.md

このファイルはClaude Code (claude.ai/code) がこのリポジトリで作業する際のガイド。

## ビルド・実行コマンド

```bash
# サーバー (プロジェクトルートから)
npm start              # サーバー起動 (port 3000)
npm run dev            # nodemonで起動 (自動リロード)
npm run deploy         # Cloudflare Workers デプロイ
npm run dev:workers    # Workers ローカルエミュレーション

# クライアント (client/ から)
npm run build          # 本番webpackビルド
npm run build:dev      # 開発webpackビルド
npm run watch          # watchモード (本番)
```

**初回セットアップ:**
```bash
npm install
cd client && npm install && npm run build && cd ..
npm start
```

**注意:** フロントエンドのJS/CSS変更は `client/` で `npm run build` が必要。サーバー側の変更 (routes, services, middlewares) はnodemonが自動検知する。

## アーキテクチャ

案件提案用デモアプリ。現在のデモ: **食事摂取量AI判定**

### 技術スタック
- **サーバー:** Express + Handlebars (ESモジュール、`"type": "module"`)
- **クライアント:** Vanilla JS + Tailwind CSS + DaisyUI、webpackでバンドル
- **AI:** Gemini 3 Flash (AI Studio APIキー認証)
- **ホスティング:** Cloudflare Workers (`nodejs_compat`)

### 主要パターン

- **サーバー側importエイリアス:** `#~/` がプロジェクトルートにマッピング (package.jsonの`"imports"`)
- **テンプレート:** Handlebarsテンプレートを JS template literal でエクスポート、`lib/render.js` でコンパイル（Workers互換のためfs不使用）
- **webpack出力:** `client/src/` → `public/build/` (JS, CSS, メディア)
- **Tailwindスキャン対象:** `views/**/*.js` と `client/src/**/*.js`
- **レート制限:** `middlewares/dailyLimit.js` で1日50回（インメモリ、再起動でリセット）
- **nodemon除外:** `client/`, `public/`, `views/`, `data/`
- **リクエストボディ上限:** 100MB (base64画像用)
- **AI応答:** 決定的設定 (temperature=0, topP=0, topK=1) + 構造化JSONスキーマ

### ルート構成
- `GET /` — 食事摂取量判定ページ
- `GET /status` — API使用状況ページ
- `POST /api/meal-intake` — 判定API (dailyLimitミドルウェアで保護)
- `GET /api/status` — 使用状況API (JSON)

## 言語

UIテキスト・コメント・プロンプトは日本語。コミットメッセージとコード識別子は英語。
