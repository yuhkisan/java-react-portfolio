# Java React Portfolio

既存のNext.js製Dependency Vulnerability Scannerをフロントエンドとして引き継ぎ、Java 17とSpring BootによるREST APIを組み合わせたポートフォリオです。

## 構成

```text
java-react-portfolio/
├─ frontend/        # Next.js
├─ backend/         # Spring Boot REST API
├─ compose.yaml     # PostgreSQL
└─ README.md
```

既存リポジトリ `yuhkisan/next-vuln-report-portfolio` は、Gitの履歴を保持した状態で `frontend/` へ取り込みます。

## 技術スタック

### Frontend

- Next.js 16（App Router）
- React 19
- TypeScript
- MUI 7
- TanStack Query
- Orval
- Vitest
- Playwright

Next.jsは基本的にクライアントサイドのSPAとして使用します。TanStack QueryはSpring Boot上のサーバー状態を管理し、ローカルなUI状態にはReactの `useState` などを使用します。

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

ローカル開発ではNext.jsを `localhost:3000`、Spring Bootを `localhost:8080` で起動します。PostgreSQLはDocker Composeで起動します。

## APIクライアント生成

springdoc-openapiがSpring BootのControllerとDTOからOpenAPI仕様を公開し、OrvalがTypeScriptの型、APIクライアント、TanStack Query hooksを生成します。生成物はコミットし、CIで生成漏れを検出します。

## 移行方針

画面からAPI、DBまでを縦に通す単位で段階的に移行します。最初の対象はプロジェクト一覧です。Spring Boot側で動作を検証できるまでは既存のNext.js Route HandlerとPrismaを残し、全機能の置き換え後に削除します。

## テスト

- JUnit／MockMvcによるバックエンドテスト
- TestcontainersによるPostgreSQL統合テスト
- Vitestによるフロントエンドテスト
- PlaywrightによるE2Eテスト
- CIによるテスト、lint、build、OpenAPI生成差分の検証

## 開発フロー

Codexは `codex/*` でPRを作成し、レビュー後にMerge Commitで `main` へ取り込みます。
