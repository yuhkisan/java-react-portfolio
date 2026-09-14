# Java・Reactポートフォリオ再構成 設計

## 目的

既存のNext.js製Dependency Vulnerability Scannerをフロントエンドとして引き継ぎ、Java 17とSpring Bootによる独立したREST APIへバックエンド機能を移す。既存の画面、解析機能、テスト、開発履歴を活用しながら、Java／Spring BootとReactの実務的な連携を示せるモノレポを作る。

## リポジトリ構成

```text
java-react-portfolio/
├─ frontend/        # 既存Next.jsアプリ
├─ backend/         # Spring Boot REST API
├─ compose.yaml     # PostgreSQL
└─ README.md
```

旧リポジトリ `yuhkisan/next-vuln-report-portfolio` は、Gitの履歴を保持した状態で `frontend/` へ取り込む。以後のフロントエンドとバックエンドの変更は、このリポジトリで管理する。

## ブランチとレビュー

`main` はCIが成功したレビュー済みの状態に保ち、実装を直接コミットしない。Codexは `codex/*` の短命な作業ブランチで実装、テスト、コミット、PR作成を担当する。リポジトリ所有者はPRの差分と検証結果を確認し、必要な修正を依頼した後、問題がなければマージする。

マージには通常のMerge Commitを使用する。

作業ブランチは原則として最新の `main` から作成する。先行作業へ依存する場合だけ親作業ブランチから派生させ、親PRがマージされた後に `main` を取り込む。1つのPRは、レビューと検証が可能な1つの機能または縦の移行単位に限定する。

GitHub操作にはリポジトリ所有者の認証を利用するため、GitHub上の別アカウントによる承認とはならない。役割として、Codexを実装担当、リポジトリ所有者をレビューおよびマージ判断担当として分離する。

## 技術構成

### フロントエンド

- Next.js 16（App Router）
- React 19
- TypeScript
- MUI 7
- TanStack Query
- Orval
- Vitest
- Playwright

Next.jsは基本的にクライアントサイドのSPAとして使用する。Server ComponentsやSSRを必須とはせず、独立したSpring Boot APIをブラウザから呼び出す。

TanStack QueryはSpring Boot上のサーバー状態だけを管理する。モーダルの開閉、入力途中の値など、ローカルなUI状態にはReactの `useState` などを使用する。Redux、RTK Query、Jotai、Zustandは初期構成に含めない。

### バックエンド

- Java 17
- Spring Boot 4.1.x（実装開始時の安定版へ固定）
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

バックエンドはJSON形式のREST APIを提供する。永続化はPostgreSQLへ統一し、スキーマ変更はFlywayで管理する。

ローカル開発ではNext.jsを `localhost:3000`、Spring Bootを `localhost:8080` で起動する。Spring Boot側のCORS許可元は設定値で管理し、開発時はNext.jsのオリジンだけを許可する。

## API型生成

Spring BootのControllerとDTOを基に、springdoc-openapiが `/v3/api-docs` へOpenAPI仕様を公開する。Orvalはその仕様を入力として、TypeScriptのリクエスト／レスポンス型、APIクライアント、TanStack Query hooksを `frontend/` 配下へ生成する。

```text
Spring Controller・DTO
        ↓
OpenAPI (/v3/api-docs)
        ↓
Orval
        ↓
TypeScript型・APIクライアント・TanStack Query hooks
```

生成物はリポジトリへコミットする。開発者はバックエンドAPIを変更した後に生成コマンドを実行する。CIでも同じ生成処理を実行し、生成物に未コミット差分があれば失敗させる。

## 移行方法

一度に全機能を書き換えず、画面からAPI、DBまでを縦に通す単位で移行する。

最初の単位はプロジェクト一覧とする。

1. 既存Next.jsフロントエンドを取り込み、現状のビルドとテストを確認する。
2. Spring BootとPostgreSQLの起動基盤を作る。
3. プロジェクト一覧APIとDBマイグレーションを実装する。
4. OpenAPIからTanStack Query hookを生成する。
5. 既存画面の取得元をNext.js APIからSpring Bootへ変更する。
6. バックエンド、フロントエンド、E2Eの各テストを通す。

以後、プロジェクト更新・削除、ファイルアップロード、依存関係解析、スキャン結果表示を同じ方法で段階的に移す。対応機能がSpring Boot側で検証できるまでは、既存のNext.js Route HandlerとPrismaを削除しない。全機能の置き換え後に不要なAPI Routes、Prisma、SQLiteを削除する。

## データフロー

```text
ブラウザ
  ↓ TanStack Query生成hook
Next.jsクライアント画面
  ↓ JSON / multipart HTTP
Spring Boot REST API
  ↓ Spring Data JPA
PostgreSQL
```

Next.jsはバックエンドの業務データを保持しない。キャッシュはTanStack Queryが担当し、永続データの正本はPostgreSQLとする。

## エラー処理

バックエンドはSpringの `ProblemDetail` を基礎として、入力エラー、未検出、競合、サーバーエラーを一貫したJSON形式で返す。Bean Validationのエラーは項目単位で識別できる形にする。フロントエンドは生成された型を利用し、画面全体の取得失敗、項目エラー、更新失敗を用途に応じて表示する。

Mutation成功後のキャッシュ無効化は生成コードを直接編集せず、Orval設定または生成コードを包むアプリケーション側のhookで定義する。

## テスト方針

- バックエンド単体テスト：ドメインロジックと入力検証
- APIテスト：MockMvcでHTTP契約とエラー応答を検証
- DB統合テスト：Testcontainers上のPostgreSQLでRepositoryとFlywayを検証
- フロントエンドテスト：既存Vitestを維持し、API境界はMSW等で再現
- E2Eテスト：PlaywrightでNext.jsからSpring Boot、PostgreSQLまでの主要操作を検証
- CI：Javaテスト、フロントテスト、lint、build、OpenAPI生成差分、E2Eを検証

## 初期スコープ外

- 認証・認可の追加
- 実在する脆弱性データベースとの連携
- 本番クラウド構成の確定
- Reduxなど追加のグローバル状態管理
- 全画面の一括移行

これらは既存機能のSpring Boot移行が完了してから、独立した変更として検討する。

## 最初の完了条件

- 旧Next.jsアプリが `frontend/` で起動し、既存テストが実行できる。
- Spring Bootが `backend/` で起動し、Java 17でビルドできる。
- PostgreSQLとFlywayによってプロジェクトデータを用意できる。
- Spring Bootのプロジェクト一覧APIがOpenAPIに現れる。
- Orvalが型付きTanStack Query hookを生成する。
- 既存のプロジェクト一覧画面が生成hookを通じてSpring Bootからデータを取得する。
- CIがAPIクライアントの生成漏れを検出する。
