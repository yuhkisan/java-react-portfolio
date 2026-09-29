# Dependency Vulnerability Scanner

Dependency Vulnerability Scanner は、依存関係の脆弱性スキャンを学ぶために開発しているアプリです。Next.js のフロントエンドと Java 25・Spring Boot の REST API を組み合わせる構成を目指しています。

現在は既存の Next.js アプリを `frontend/` に配置し、`backend/` に Spring Boot アプリを用意しています。REST API と Docker Compose は今後実装します。

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

このREADME.mdがあるフォルダで以下を実行します。ローカルへのMavenのインストールは不要です。最初にPostgreSQLを起動し、次にバックエンドを起動します。Dockerコンテナからホスト上のPostgreSQLには `host.docker.internal` で接続します。

```powershell
docker run --rm --name dependency-vulnerability-scanner-postgres `
  -e POSTGRES_DB=dependency_vulnerability_scanner `
  -e POSTGRES_USER=app `
  -e POSTGRES_PASSWORD=dummy-password `
  -p 5432:5432 `
  -d postgres:18-alpine

docker build -t dependency-vulnerability-scanner-backend:local ./backend
docker run --rm --name dependency-vulnerability-scanner-backend-standalone -p 127.0.0.1:18080:8080 `
  --add-host host.docker.internal=host-gateway `
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/dependency_vulnerability_scanner `
  -e SPRING_DATASOURCE_USERNAME=app `
  -e SPRING_DATASOURCE_PASSWORD=dummy-password `
  dependency-vulnerability-scanner-backend:local
```

アプリケーションは次の環境変数でPostgreSQLに接続します。以下はローカル開発用の例です。パスワードは実際に使用する環境に合わせて設定してください。

| 環境変数 | ローカルの例 |
| --- | --- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/dependency_vulnerability_scanner` |
| `SPRING_DATASOURCE_USERNAME` | `app` |
| `SPRING_DATASOURCE_PASSWORD` | `dummy-password` |

起動ログに `Started DependencyVulnerabilityScannerApplication` が出れば起動完了です。`http://localhost:18080/actuator/health` が `UP` を返し、DBの状態も確認できます。バックエンドを止めるには `Ctrl+C` を押し、PostgreSQLは別のPowerShellで `docker stop dependency-vulnerability-scanner-postgres` を実行して停止します。Dockerfileのビルド工程ではテストを実行せず、DBを使う統合テストはMaven Wrapperで実行します。

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

`spotless:apply` はJavaコードを整形し、`spotless:check` は整形済みか確認します。`./mvnw verify` でも自動的に確認されます。

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
