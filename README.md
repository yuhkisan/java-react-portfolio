# Java React Portfolio

既存のNext.js製Dependency Vulnerability Scannerをフロントエンドとして引き継ぎ、Java 17とSpring BootによるREST APIを組み合わせるポートフォリオです。

既存のNext.jsアプリを `frontend/` に取り込み、Spring BootとPostgreSQLの起動環境を追加しています。業務APIの移行は今後のIssueで行います。

## 構成

```text
java-react-portfolio/
├─ frontend/        # Next.js（実装済み）
├─ backend/         # Spring Boot（業務APIは今後追加）
├─ compose.yaml     # ローカル実行環境
├─ README.md
└─ AGENTS.md
```

## 採用予定の技術スタック

### Frontend

- Next.js 16（App Router）
- React 19
- TypeScript
- MUI 7
- TanStack Query
- Orval
- Vitest
- Playwright

Next.jsは基本的にクライアントサイドのSPAとして使用する予定です。TanStack QueryでSpring Boot上のサーバー状態を管理し、ローカルなUI状態にはReactの `useState` などを使用します。

### Backend

- Java 17
- Spring Boot 4.1.x
- Maven
- Spring Web MVC
- Spring Data JPA
- Bean Validation
- Flyway
- PostgreSQL
- springdoc-openapi
- JUnit
- MockMvc
- Testcontainers

## ローカル開発環境

Docker Engine（Docker Desktopなど）とDocker Composeが必要です。ComposeはNode.js 22、Java 17、PostgreSQL 17のコンテナを使用し、ホストへのJava・Node.js・PostgreSQLのインストールは不要です。初回起動はイメージのダウンロードとビルドに時間がかかります。

```powershell
Copy-Item .env.example .env
docker compose up --build
```

- Next.js: http://localhost:3000
- Spring Bootヘルスチェック: http://localhost:8080/actuator/health （DB接続が正常なら `{"status":"UP"}`）
- 停止: `docker compose down`。データを残すため `--volumes` は付けません。

`.env.example` の値はローカル開発用のサンプルです。必要なら `.env` を編集してください。`.env` はGit管理対象外です。Compose起動には `POSTGRES_DB`、`POSTGRES_USER`、`POSTGRES_PASSWORD` が必要です。ポート3000と8080を使用中の場合は空けてから起動してください。

フロントエンドの既存Prisma/SQLiteは `sqlite_data` ボリュームに保存し、初回のみデモデータを投入します。Spring Boot用PostgreSQLは `pgdata` ボリュームに保存します。両DBは同期しません。Spring Boot側に業務テーブルや業務APIはまだありません。

バックエンドだけをビルドする場合は、Java 17を用意して `cd backend` の後にWindowsでは `./mvnw.cmd package`、その他では `./mvnw package` を実行します。業務ロジックは未追加のため、現時点でJava側のテストは0件です。

## APIクライアント生成

springdoc-openapiでSpring BootのControllerとDTOからOpenAPI仕様を生成し、OrvalでTypeScriptの型、APIクライアント、TanStack Query hooksを生成する予定です。生成物はコミットし、CIで生成漏れを検出します。

## 予定する検証

- JUnit／MockMvcによるバックエンドテスト
- TestcontainersによるPostgreSQL統合テスト
- Vitestによるフロントエンドテスト
- PlaywrightによるE2Eテスト
- CIによるテスト、lint、build、OpenAPI生成差分の検証
