# Java React Portfolio

既存のNext.js製Dependency Vulnerability Scannerをフロントエンドとして引き継ぎ、Java 17とSpring BootによるREST APIを組み合わせるポートフォリオです。

現在は設計段階です。以下の構成と技術スタックを順次実装します。

## 予定構成

```text
java-react-portfolio/
├─ frontend/        # Next.js
├─ backend/         # Spring Boot REST API
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

## 予定するローカル開発環境

Next.js、Spring Boot、PostgreSQLはDocker Composeでまとめて起動できる構成にします。Next.jsは `localhost:3000`、Spring Bootは `localhost:8080` で公開する予定です。

## APIクライアント生成

springdoc-openapiでSpring BootのControllerとDTOからOpenAPI仕様を生成し、OrvalでTypeScriptの型、APIクライアント、TanStack Query hooksを生成する予定です。生成物はコミットし、CIで生成漏れを検出します。

## 予定する検証

- JUnit／MockMvcによるバックエンドテスト
- TestcontainersによるPostgreSQL統合テスト
- Vitestによるフロントエンドテスト
- PlaywrightによるE2Eテスト
- CIによるテスト、lint、build、OpenAPI生成差分の検証
