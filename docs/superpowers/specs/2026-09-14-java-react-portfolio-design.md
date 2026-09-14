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

Codexは `codex/*` でPRを作成し、レビュー後にMerge Commitで `main` へ取り込む。

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

TanStack QueryはSpring Boot上のサーバー状態だけを管理する。モーダルの開閉、入力途中の値など、ローカルなUI状態にはReactの `useState` などを使用する。

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

生成物はリポジトリへコミットする。開発者はバックエンドAPIを変更した後に生成コマンドを実行する。CIでも同じ生成処理を実行し、生成物に未コミット差分があれば失敗させる。

## 移行方法

一度に全機能を書き換えず、画面からAPI、DBまでを縦に通す単位で移行する。

最初の単位はプロジェクト一覧とする。

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

バックエンドはSpringの `ProblemDetail` を基礎としてエラー形式を統一し、Bean Validationのエラーは項目単位で識別できる形にする。

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

## 最初の完了条件

- 旧Next.jsアプリが `frontend/` で起動し、既存テストが実行できる。
- Spring Bootが `backend/` で起動し、Java 17でビルドできる。
- PostgreSQLとFlywayによってプロジェクトデータを用意できる。
- Spring Bootのプロジェクト一覧APIがOpenAPIに現れる。
- Orvalが型付きTanStack Query hookを生成する。
- 既存のプロジェクト一覧画面が生成hookを通じてSpring Bootからデータを取得する。
- CIがAPIクライアントの生成漏れを検出する。
