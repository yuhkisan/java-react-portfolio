# Spring Bootとローカル実行環境の設計

## 目的

Issue #5の範囲で、既存Next.jsアプリ、Spring Boot、PostgreSQLをリポジトリのルートからDocker Composeで起動できるようにする。Spring BootのヘルスチェックでPostgreSQLへの接続を確認でき、必要な環境変数をサンプルファイルから把握できる状態を完成とする。

## 現状と境界

- Next.jsアプリは`frontend/`にあり、Route HandlerとPrismaを使ってSQLiteへアクセスする。
- Spring Bootの業務APIとテーブルはまだ存在しない。機能移行は後続のIssue #7から始める。
- Next.jsのSSRは引き続き利用できる。移行した画面では、必要に応じてServer ComponentからSpring Boot APIを呼ぶ。
- このIssueでは既存画面のデータ取得先、Prismaスキーマ、解析処理を変更しない。

## 構成

| サービス | 技術 | ポート | データ |
| --- | --- | --- | --- |
| frontend | Next.js 16、Node.js 22 | 3000 | 既存PrismaのSQLiteを専用ボリュームに保存 |
| backend | Java 17、Spring Boot 4.1系、Maven Wrapper | 8080 | PostgreSQLへ接続 |
| db | PostgreSQL 17 | コンテナ内5432 | 専用ボリュームに保存 |

`backend/`にはSpring Web MVC、Spring Data JPA、Bean Validation、Flyway、PostgreSQL JDBC Driver、Actuator、テスト用スターターを用意する。Flywayは起動時に動作する設定とし、業務テーブル用の最初のマイグレーションは機能移行Issueで追加する。Hibernateによる自動スキーマ変更は無効化する。

Composeの起動順はPostgreSQLのヘルスチェック、Spring Boot、Next.jsとする。Spring Bootの`/actuator/health`はDB接続を含むヘルス状態を返す。PostgreSQL接続失敗時はSpring Bootを正常扱いにしない。コンテナには開発環境用の固定メジャーバージョンのイメージを使い、Java・Node.js・PostgreSQLのバージョンをREADMEにも明示する。

## 既存Next.jsの起動

フロントエンド用イメージで依存関係とPrisma Clientを準備する。Compose起動時にはSQLiteのテーブルを`prisma db push`で確認し、DBが初回作成されたときだけ既存のseedを実行する。SQLiteファイルはフロントエンド専用のボリュームに置き、コンテナ再作成で消えないようにする。Next.jsはコンテナ内の全インターフェースで待ち受ける。

Spring Boot用PostgreSQLと既存Next.js用SQLiteの間では、データの複製や同期を行わない。移行した機能から順にSpring BootのAPIを使い、旧実装の削除はIssue #8で扱う。

## 設定と操作

ルートの`.env.example`にローカル開発で必要な変数と安全な例示値を記載する。実際の`.env`はGitの管理対象から除外する。Composeは環境変数を各サービスへ渡し、DBパスワードをソースに埋め込まない。READMEに`.env.example`から`.env`を作成し、`docker compose up --build`で起動、`docker compose down`で停止する手順を記載する。

ルートの`.gitignore`、`.gitattributes`、`.editorconfig`を整備し、生成物・環境変数・改行コードの取り扱いを明確にする。Maven Wrapperはリポジトリに含め、ホストへのMavenインストールを不要にする。

## 検証

1. Maven Wrapperでバックエンドのテストとパッケージを実行する。
2. `docker compose config`で構成と環境変数展開を確認する。
3. クリーンなボリュームから`docker compose up --build`を実行し、3サービスが起動することを確認する。
4. `http://localhost:8080/actuator/health`が`UP`を返し、`http://localhost:3000`で既存画面が表示できることを確認する。
5. 再起動後も両DBのデータがボリュームに残ることを確認する。

Docker Engineが利用できない環境では、Compose起動検証が未実施であることを明示する。設定ファイルだけの検証を起動成功として扱わない。
