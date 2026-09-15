# Next.js 16 + Prisma 7 + SQLite セットアップガイド

公式ドキュメントには「Next.js + SQLite + Prisma 7」の組み合わせのガイドが完全な形では存在しないため、複数のガイドを統合した手順です。

## 1. 依存関係のインストール

```bash
# 開発用依存関係
npm install prisma tsx @types/better-sqlite3 --save-dev

# 実行用依存関係
# prisma@7 では SQLite のためにアダプターが必要です
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
```

## 2. Prisma の初期化 (SQLite)

```bash
# NOTE: output オプションで生成先を明示的に指定する場合
npx prisma init --datasource-provider sqlite --output ../generated/prisma
```

## 3. 設定ファイル設定

### `prisma.config.ts`

`dotenv` で環境変数を読み込み、`seed` コマンドを設定します。

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### `prisma/schema.prisma`

出力先の設定（`init` コマンドの `--output` を反映）。

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

### `.env`

`file:` プレフィックスを付けてパスを指定します。

```env
DATABASE_URL="file:./dev.db"
```

## 4. シングルトン Prisma Client の作成 (`lib/prisma.ts`)

Next.js の開発環境（ホットリロード）対策としてシングルトンパターンを使用し、かつ SQLite アダプターを適用する重要なファイルです。

```typescript
import "dotenv/config";
// カスタムoutputパスを指定したため、そこからインポート
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// SQLite アダプターの使用
const adapter = new PrismaBetterSqlite3({
  url: connectionString,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
```

## 5. シードスクリプト (`prisma/seed.ts`)

`lib/prisma.ts` のシングルトンインスタンスを利用して実行します。

```typescript
import { prisma } from "../lib/prisma";

async function main() {
  // データの投入処理...
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

## 6. コマンド実行

```bash
# マイグレーション実行とクライアント生成
npx prisma migrate dev --name init

# シードデータの投入
npx prisma db seed

# Prisma Studio の起動
npx prisma studio
```

## 7. `.gitignore` 設定

生成されたファイルや DB ファイルを除外します。

```gitignore
# prisma
*.db
*.db-journal

/generated
```
