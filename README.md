# Dependency Vulnerability Scanner

Dependency Vulnerability Scanner は、依存関係の脆弱性スキャンを学ぶために開発しているアプリです。Next.js のフロントエンドと Java 25・Spring Boot の REST API を組み合わせる構成を目指しています。

現在は既存の Next.js アプリを `frontend/` に配置し、`backend/` に Spring Boot の最小アプリを用意しています。REST API と Docker Compose は今後実装します。

## 構成

```text
dependency-vulnerability-scanner/
├─ frontend/        # Next.js（実装済み）
├─ backend/         # Spring Bootの最小アプリ（REST APIは未実装）
├─ compose.yaml     # ローカル実行環境（予定）
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

- Java 25
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

## バックエンド単体の起動

Dockerを起動し、このREADME.mdがあるフォルダで以下を実行します。ローカルへのMavenのインストールは不要です。

```powershell
docker build -t dependency-vulnerability-scanner-backend:local ./backend
docker run --rm --name dependency-vulnerability-scanner-backend-standalone -p 127.0.0.1:18080:8080 dependency-vulnerability-scanner-backend:local
```

Dockerfileのビルド工程にはテストが含まれています。起動ログに `Started DependencyVulnerabilityScannerApplication` が出れば起動完了です。停止するには `Ctrl+C` を押します。まだAPIがないため、`http://localhost:18080/` は404を返します。

## バックエンドのテスト

ローカルで実行するには JDK 25 が必要です。`backend/` に移動して Maven Wrapper を使います。

```sh
cd backend
./mvnw test
./mvnw verify
```

Windows PowerShell では `./mvnw` の代わりに `.\mvnw.cmd` を実行してください。

### バックエンドのコード整形

`backend/` で次のコマンドを実行します。

```sh
./mvnw spotless:apply
./mvnw spotless:check
```

`spotless:apply` はJavaコードを整形し、`spotless:check` は整形済みか確認します。`mvn verify` でも自動的に確認されます。

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
