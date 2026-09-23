# Spring BootとCompose構築 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Issue #5としてNext.js、Spring Boot、PostgreSQLをComposeで起動し、バックエンドのDB接続をヘルスチェックで確認できるようにする。

**Architecture:** `backend/`に独立したSpring Bootアプリを作り、`compose.yaml`で既存Next.jsとPostgreSQLを接続する。Next.jsは既存SQLiteを専用ボリュームで使い続け、Spring BootはPostgreSQLへ接続する。

**Tech Stack:** Java 17、Spring Boot 4.1系、Maven Wrapper、Node.js 22、Next.js 16、Prisma SQLite、PostgreSQL 17、Flyway、Docker Compose。

**Spec:** `docs/superpowers/specs/2026-09-23-spring-boot-compose-design.md`

## Global Constraints

- 作業Issueは#5。ブランチは`codex/setup-spring-boot`、コミット説明は日本語、PR本文に`Closes #5`を記載する。
- `frontend/`の現行画面・Route Handler・Prismaスキーマ・解析処理は変更しない。
- 今回は業務APIと業務テーブルを作らない。Flywayの最初の業務マイグレーションは機能移行Issueで追加する。
- Next.jsのSQLiteとSpring BootのPostgreSQLは同期しない。
- Java 17、Node.js 22、PostgreSQL 17を使い、フロント3000、バックエンド8080を公開する。
- `.env`と生成物をGitへ登録しない。サンプルの値はローカル開発専用とする。

## File Map

| ファイル | 責任 |
| --- | --- |
| `backend/pom.xml`、`backend/mvnw*`、`backend/.mvn/wrapper/*` | Maven依存と再現可能なビルド |
| `backend/src/main/java/com/yuhkisan/portfolio/PortfolioApplication.java` | Spring Bootの起動点 |
| `backend/src/main/resources/application.yml` | JDBC、Flyway、JPA、Actuator設定 |
| `backend/Dockerfile`、`backend/.dockerignore` | Javaアプリのコンテナ化 |
| `frontend/Dockerfile`、`frontend/.dockerignore`、`frontend/docker-entrypoint.sh` | 既存Next.jsのコンテナ起動とSQLite初期化 |
| `compose.yaml`、`.env.example` | 3サービス、ヘルスチェック、ボリューム、環境変数 |
| `.gitignore`、`.gitattributes`、`.editorconfig`、`README.md` | 秘密情報、改行、開発・検証手順 |

## Review Focus

1. `.env`がない状態では、手順に従って`.env.example`から復元でき、必要値の欠落が明瞭に失敗することをTask 3で確認する。
2. PostgreSQLの起動が遅い場合、`service_healthy`がバックエンドの起動を待つことをTask 2で確認する。
3. SQLiteの新規ボリュームではテーブルとデモデータが作られることをTask 2で確認する。
4. Compose再起動時にSQLiteのseedが重複せず、両DBのデータが残ることをTask 3で確認する。
5. PostgreSQL停止時、バックエンドのActuatorヘルスが`UP`を返さないことをTask 3で確認する。

---

### Task 1: Spring Bootの土台とDB設定

**Files:** `backend/pom.xml`、`backend/mvnw`、`backend/mvnw.cmd`、`backend/.mvn/wrapper/maven-wrapper.properties`、`backend/src/main/java/com/yuhkisan/portfolio/PortfolioApplication.java`、`backend/src/main/resources/application.yml`、`backend/Dockerfile`、`backend/.dockerignore`

**Interfaces:** `SPRING_DATASOURCE_URL`、`SPRING_DATASOURCE_USERNAME`、`SPRING_DATASOURCE_PASSWORD`を環境から受け取る。HTTP `GET /actuator/health`を公開する。Task 2のComposeはこれらを設定して起動する。

- [ ] **Step 1: Spring Initializrの生成物を取得**

  Spring InitializrのMaven、Java 17、Spring Boot 4.1系、group `com.yuhkisan`、artifact `portfolio`を指定する。依存はSpring Web MVC、Spring Data JPA、Validation、Flyway、PostgreSQL Driver、Actuator。Maven Wrapperを含む生成物を`backend/`へ展開する。生成結果の`pom.xml`、Maven Wrapper、起動クラスを読んで実際の依存IDを確認する。`flyway-database-postgresql`がなければ追加する。

- [ ] **Step 2: 設定を書く**

  `backend/src/main/resources/application.yml`に次の設定を置く。ローカルの固定パスワードをJava設定へ埋め込まない。

  ```yaml
  spring:
    datasource:
      url: ${SPRING_DATASOURCE_URL}
      username: ${SPRING_DATASOURCE_USERNAME}
      password: ${SPRING_DATASOURCE_PASSWORD}
    jpa:
      hibernate:
        ddl-auto: validate
    flyway:
      enabled: true
  management:
    endpoints:
      web:
        exposure:
          include: health
    endpoint:
      health:
        show-details: never
  ```

- [ ] **Step 3: バックエンドイメージを作る**

  `backend/Dockerfile`をJava 17のビルド段階と実行段階に分ける。ビルド段階で`./mvnw -B -DskipTests package`を実行し、実行段階では生成jarだけを起動する。`backend/.dockerignore`には`target/`とIDE生成物を列挙する。

  ```dockerfile
  FROM eclipse-temurin:17-jdk-jammy AS build
  WORKDIR /app
  COPY . .
  RUN chmod +x mvnw && ./mvnw -B -DskipTests package

  FROM eclipse-temurin:17-jre-jammy
  WORKDIR /app
  COPY --from=build /app/target/*.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```

- [ ] **Step 4: 独立ビルドを検証する**

  `docker build -t portfolio-backend:issue5 ./backend`を実行し、Java 17でjarができることを確認する。Docker Engineがない場合はMaven Wrapperで`backend/mvnw.cmd -B -DskipTests package`を試し、どちらも実行できなければ環境要因を記録する。差分を確認し、`feat: Spring Bootの土台とDB設定を追加する`でコミットする。

### Task 2: 3サービスのCompose接続

**Files:** `frontend/Dockerfile`、`frontend/.dockerignore`、`frontend/docker-entrypoint.sh`、`compose.yaml`、`.env.example`

**Interfaces:** Task 1のバックエンド環境変数を供給する。SQLiteは`file:/data/dev.db`を使い、`sqlite_data`ボリュームに保存する。PostgreSQLは`pgdata`ボリュームに保存する。

- [ ] **Step 1: フロントエンドのイメージと起動処理を書く**

  Node.js 22 Debian系イメージで`npm ci`、`npx prisma generate`を行う。`docker-entrypoint.sh`は`set -eu`で始める。`/data/dev.db`がない場合、`DATABASE_URL=file:/data/.bootstrap.db`で`npx prisma db push`と`npm run db:seed`を完了させてから`/data/dev.db`へ移動する。失敗した`.bootstrap.db`は次回初期化前に削除する。通常起動時は`DATABASE_URL=file:/data/dev.db`で`npx prisma db push`を実行し、`exec npm run dev -- --hostname 0.0.0.0`で起動する。`frontend/.dockerignore`は`node_modules/`、`.next/`、`generated/`、`*.db`、`.env`を除外する。

  ```sh
  #!/bin/sh
  set -eu
  if [ ! -f /data/dev.db ]; then
    rm -f /data/.bootstrap.db
    DATABASE_URL=file:/data/.bootstrap.db npx prisma db push
    DATABASE_URL=file:/data/.bootstrap.db npm run db:seed
    mv /data/.bootstrap.db /data/dev.db
  fi
  export DATABASE_URL=file:/data/dev.db
  npx prisma db push
  exec npm run dev -- --hostname 0.0.0.0
  ```

  Dockerfileでは`COPY package*.json ./`、`RUN npm ci`、`COPY . .`、`RUN DATABASE_URL=file:/data/dev.db npx prisma generate`の順に置き、entrypointを実行可能にする。

- [ ] **Step 2: Composeを書く**

  `compose.yaml`に`db`、`backend`、`frontend`を定義する。`db`は`postgres:17`、`pg_isready -h 127.0.0.1 -U $${POSTGRES_USER} -d $${POSTGRES_DB}`のヘルスチェック、`pgdata`を使用する。一時的なUnix socketサーバーをhealthyと判定しない。`backend`は`db`の`service_healthy`に依存し、`SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/${POSTGRES_DB}`などを渡す。`frontend`は`backend`の起動後に開始し、`DATABASE_URL=file:/data/dev.db`と`sqlite_data:/data`を設定する。ホストへ3000、8080を公開する。

  ```yaml
  services:
    db:
      image: postgres:17
      environment:
        POSTGRES_DB: ${POSTGRES_DB:?}
        POSTGRES_USER: ${POSTGRES_USER:?}
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?}
      volumes:
        - pgdata:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
        interval: 5s
        timeout: 3s
        retries: 10
    backend:
      build: ./backend
      depends_on:
        db:
          condition: service_healthy
      environment:
        SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/${POSTGRES_DB:?}
        SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:?}
        SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:?}
      ports:
        - "8080:8080"
    frontend:
      build: ./frontend
      depends_on:
        backend:
          condition: service_started
      environment:
        DATABASE_URL: file:/data/dev.db
      volumes:
        - sqlite_data:/data
      ports:
        - "3000:3000"
  volumes:
    pgdata:
    sqlite_data:
  ```

- [ ] **Step 3: 開発用の環境変数サンプルを置く**

  ルート`.env.example`に`POSTGRES_DB=portfolio`、`POSTGRES_USER=portfolio`、`POSTGRES_PASSWORD=portfolio_dev`を記載する。Composeで`${POSTGRES_DB:?}`、`${POSTGRES_USER:?}`、`${POSTGRES_PASSWORD:?}`を使い、欠落時には構成エラーにする。

- [ ] **Step 4: 起動を検証する**

  `.env.example`を一時的に`.env`としてコピーし、`docker compose config --quiet`、`docker compose up --build -d`、`docker compose ps`を実行する。`db`がhealthyになってから`backend`が起動し、`http://localhost:3000`と`http://localhost:8080/actuator/health`が応答することを確認する。`docker compose exec frontend node -e "const DB=require('better-sqlite3'); const db=new DB('/data/dev.db'); console.log(db.prepare('select count(*) as n from Team').get())"`で初回seedが作ったチームを確認する。確認後、`feat: 3サービスのCompose起動を整備する`でコミットする。

### Task 3: 開発手順と再起動・障害時の検証

**Files:** `.gitignore`、`.gitattributes`、`.editorconfig`、`README.md`

**Interfaces:** Task 2の`docker compose up --build`と`docker compose down`をユーザー向けの入口にする。`.env.example`を唯一の環境変数見本とする。

- [ ] **Step 1: 管理対象と手順を整える**

  ルート`.gitignore`に`.env`、`backend/target/`、Java/Nodeの生成物を記載する。`.gitattributes`で`mvnw`と`*.sh`をLF、`mvnw.cmd`をCRLFに指定する。`.editorconfig`でUTF-8と改行を指定する。READMEにJava 17、Node.js 22、PostgreSQL 17、`.env.example`のコピー、Compose起動・停止、ヘルス確認コマンド、Docker Engineが必要なことを記載する。

- [ ] **Step 2: 環境変数の欠落を検証する**

  `.env`の一時コピーを外し、`docker compose config --quiet`が必須変数の欠落を明示して失敗することを確認する。`.env.example`を戻し、同じコマンドが成功することを確認する。

- [ ] **Step 3: 再起動後のデータを検証する**

  `docker compose exec db psql -U portfolio -d portfolio -c 'create table issue5_persistence_probe (id integer primary key)'`で検証用テーブルを作る。`docker compose down`後に`docker compose up -d`を実行する。Task 2と同じチーム件数が増えていないことと、`docker compose exec db psql -U portfolio -d portfolio -Atc 'select count(*) from issue5_persistence_probe'`が`0`を返すことを確認する。確認後、`docker compose exec db psql -U portfolio -d portfolio -c 'drop table issue5_persistence_probe'`で検証用テーブルを削除する。ボリューム削除オプションは使わない。

- [ ] **Step 4: DB停止時のヘルスを検証する**

  `docker compose stop db`後、`http://localhost:8080/actuator/health`が`UP`でないことを確認する。`docker compose start db`後、`UP`へ戻ることを確認する。失敗が環境固有ならログと状態を記録し、未確認部分をPR本文へ明記する。

- [ ] **Step 5: 差分と最終状態を確認する**

  `git diff --check origin/main...HEAD`、バックエンドのビルド、`docker compose config --quiet`、Composeの3サービス、ヘルス、Next.js表示を再確認する。`docs: ローカル起動手順を整備する`でコミットし、Issue #5の要件と照合した後にレビュー用PRを作る。PR本文に`Closes #5`を記載する。
