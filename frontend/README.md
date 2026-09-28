# Dependency Vulnerability Scanner

`package-lock.json` / `package.json` を解析して脆弱性レポートを表示するデモアプリです。
脆弱性情報は **モックDB + 決定論的な生成ロジック** を使います。
目的は UI/UX とデータ変換・表示ロジックの設計力を示すことです。
非スコープは「実脆弱性DB連携・厳密な依存グラフ復元・認証/権限管理」です。

## 🌟 主な機能

- **チーム選択 & プロジェクト管理**: チームごとのアップロードと結果の一覧/詳細
- **プロジェクト操作**: 名前変更 / 削除（永続化）
- **アップロード解析**: `package-lock.json` (v2/v3) / `package.json`
- **結果の可視化**: サマリー、フィルタ、Root Dependency グルーピング
- **AI 解説**: Gemini API（未設定時はモック）
- **設定画面**: チーム名変更/削除（モック挙動）

## ✅ 制約

- JSON 形式のみ
- `.json` 拡張子のみ
- 5MB 以下

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript / React 19
- **UI**: MUI v7
- **ORM**: Prisma (SQLite)
- **テスト**: Vitest / Playwright
- **AI**: Gemini API (オプション)

## 📦 ディレクトリ構成（抜粋）

```
app/
  api/scans/           # POST /api/scans (解析)
  projects/            # プロジェクト一覧/詳細
  settings/            # 設定（モック）
  lib/fixtures/        # モック脆弱性DB
prisma/                # Prisma schema/seed
tests/e2e/             # Playwright E2E
```

## 🚀 セットアップ

### 前提条件

- Node.js 22.13 以上（pnpm 12 のインストールに必要）
- pnpm 12.6.0（Corepack 経由で package.json の `packageManager` に固定）

### インストール

```bash
pnpm install
```

### 環境変数

プロジェクトルートに `.env` を作成し、以下を設定します。

```env
DATABASE_URL="file:./dev.db"
```

### DB 準備

```bash
pnpm run db:push
pnpm run db:seed
```

### 開発サーバー

```bash
pnpm run dev
```

## 🎯 使い方（概要）

1. `/` で `package-lock.json` / `package.json` をアップロード
2. 解析完了後、結果画面へ遷移
3. 行クリックで詳細ドロワーを確認

詳細は `docs/USER_MANUAL.md` を参照してください。

関連ドキュメント:
- `docs/USER_MANUAL.md`（操作マニュアル）
- `docs/BEHAVIOR_SPEC.md`（挙動仕様）
- 課題管理: GitHub Issues

## 🧪 テスト

```bash
pnpm test          # Vitest
pnpm run test:e2e  # Playwright
pnpm run lint
pnpm run build
```

## 📝 開発メモ

- 脆弱性データは **固定ルール + 決定論的生成** で作成します。
- 設定画面は **モック挙動** です（チーム名変更/削除は永続化しません）。
- プロジェクト名変更/削除は DB に反映されます。

## 📄 ライセンス

[MIT](LICENSE)
