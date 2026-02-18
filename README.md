# pitch-demos

案件提案用のデモ・プロトタイプ集

## デモ一覧

| デモ名 | 概要 | 使用技術 |
|--------|------|----------|
| ocr-suite | AI-OCR機能のデモスイート | Express, Gemini 3 Flash, Vertex AI |

### ocr-suite

病院食の食事トレー画像をAIで解析し、品目ごとの摂取率（0〜100%）を自動判定する。

- **モデル**: Gemini 3 Flash (Vertex AI)
- **認証**: サービスアカウント (GCPプロジェクト: pitch-demos)
- **フロント**: Tailwind CSS + DaisyUI, webpack
- **サーバー**: Express + express-handlebars
- **コスト管理**: 1日あたりAPIリクエスト50回制限（ファイル永続化）、GCP予算アラート

## ディレクトリ構成

```
pitch-demos/
├── ocr-suite/
│   ├── bin/                  # サーバー起動スクリプト
│   ├── client/               # フロントエンド (webpack)
│   │   └── src/
│   ├── credentials/          # サービスアカウントキー (gitignore)
│   ├── data/                 # リクエストカウンター等の永続化データ (gitignore)
│   ├── middlewares/           # Express共通ミドルウェア
│   ├── prompts/              # AIプロンプト (.md)
│   ├── public/               # 静的ファイル・ビルド成果物
│   ├── routes/               # ページ・APIルート
│   ├── services/             # Gemini API呼び出し
│   └── views/                # Handlebarsテンプレート
├── .gitignore
├── CHANGELOG.md
└── README.md
```

## セットアップ

```bash
cd ocr-suite
npm install
cd client && npm install && npx webpack --mode production && cd ..
npm start
```

http://localhost:3000 でアクセス。
