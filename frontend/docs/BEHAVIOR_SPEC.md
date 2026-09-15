# 挙動仕様 (Behavior Spec)

本ドキュメントは、Dependency Vulnerability Scanner の**挙動・制約・例外**を仕様として整理したものです。  
ユーザー操作の手順は `docs/USER_MANUAL.md` を参照してください。

---

## 1. 対象範囲

- 対象: 画面操作、アップロードAPI、解析ロジック、表示ロジック
- 非対象: デプロイ手順、開発環境構築

---

## 2. 入力と制約

### 2.1 対応ファイル

- `package-lock.json`（v2 / v3）
- `package.json`

### 2.2 制約

- JSON形式のみ
- 5MB以下
- `.json` 拡張子のみ許可

### 2.3 エラー条件（クライアント）

| 条件 | 表示メッセージ |
|---|---|
| 空ファイル | 空のファイルです。依存情報を含む JSON をアップロードしてください。 |
| 5MB超過 | ファイルサイズが5MBを超えています。5MB以下にしてください。 |
| 拡張子が .json 以外 | JSON ファイルのみ対応しています。 |
| JSON 解析失敗 | JSONとして解析できません。形式を確認してください。 |
| チーム未選択 | チームが見つかりません。先にチームを作成してください。 |
| ネットワークエラー | ネットワークエラーが発生しました |
| 予期しない失敗 | アップロードに失敗しました |

---

## 3. アップロードAPI

### 3.1 エンドポイント

- `POST /api/scans`
- `multipart/form-data`
  - `file`: File
  - `teamId`: string

### 3.2 正常応答

```
{
  projectId: string,
  status: "completed",
  vulnerabilityCount: number
}
```

### 3.3 エラー応答

| 条件 | ステータス | メッセージ |
|---|---|---|
| file / teamId 不足 | 400 | file and teamId are required |
| 空ファイル | 400 | 空のファイルです。依存情報を含む JSON をアップロードしてください。 |
| 5MB超過 | 413 | ファイルサイズが5MBを超えています。5MB以下にしてください。 |
| JSON解析失敗 | 400 | JSONとして解析できません。形式を確認してください。 |
| lockfile v1 など未対応 | 400 | 対応していない lockfile バージョンです。v2/v3 の package-lock.json をアップロードしてください。 |
| lockfile 形式不正 | 400 | package-lock.json の形式が不正です。内容を確認してください。 |
| 依存関係なし | 400 | 依存関係が見つかりませんでした。内容を確認してください。 |
| package.json 依存なし | 400 | 依存関係が見つかりませんでした。dependencies/devDependencies を確認してください。 |
| 未対応JSON | 400 | 対応していない JSON 形式です。package-lock.json または package.json をアップロードしてください。 |

---

## 4. 依存関係の抽出ルール

### 4.1 package.json

- `dependencies` / `devDependencies` を使用
- semver の `minVersion` で解決
  - 不正なバージョン範囲はスキップ
- `dependencyType`: `dependencies` → `prod`, `devDependencies` → `dev`
- `isDirect`: 常に `true`
- 同一 `name@version` は dedupe し、`prod` があれば `prod` を優先

### 4.2 package-lock.json (v2 / v3)

- `packages` セクションを使用
  - `""` をルートとみなす
- `name` が無い場合はパス（`node_modules/xxx`）から抽出
- `version` がないエントリは除外
- `isDirect`:
  - ルート `dependencies` / `devDependencies` に含まれるものを `true`
- `dependencyType`:
  - ルート `dependencies` → `prod`
  - ルート `devDependencies` → `dev`
  - それ以外は `pkg.dev` が `true` なら `dev`、なければ `prod`
- 同一 `name@version` は dedupe し、`prod` があれば `prod` を優先

---

## 5. 脆弱性マッチング

### 5.1 既知ルール

- ルールは固定配列で管理
- `packageName` は小文字で比較（ケースインセンシティブ）
- `semver.satisfies()` で `vulnerableRange` を評価
- マッチした場合はそのルールを優先

### 5.2 フォールバック（擬似ロジック）

- ルールに一致しない場合、入力から**決定論的に**生成
- 発生率: 35%
- 深刻度の重み:
  - Critical 5 / High 20 / Medium 45 / Low 30
- CVEは `CVE-<year>-<id>` 形式で決定論生成
- `fixedIn` は semver の patch を 1〜3 回インクリメント
- `vulnerableRange` は `<fixedIn>`（fixedIn なしの場合は `*`）
- URL は `https://example.com/security/.../<CVE>` の形式

---

## 6. Root Dependency グルーピング

- `isDirect` のパッケージ群を **Root Dependency 候補** とする
- `dependencyType` が `prod` / `dev` の候補が存在する場合は優先
- それ以外は全候補から決定論的に選択
- 直接依存は自分自身が Root Dependency
- **注意**: 実際の依存グラフを復元するものではなく擬似グルーピング

---

## 7. 画面挙動

### 7.1 チーム選択

- チーム一覧はSSRで取得
- `teamId` は URL クエリ（`?teamId=xxx`）で管理
- 未指定時は先頭チームを選択し、URL に反映

### 7.2 プロジェクト一覧

- `/projects?teamId=xxx` でフィルタリング
- 空の場合はアップロード誘導の空状態を表示
- 解析中 / 失敗のプロジェクトは詳細へ遷移不可
- 名前変更 / 削除は DB に反映（永続化）

### 7.3 脆弱性詳細

- グループ見出し: `Root Dependency: <name>` + 件数
- 行クリックで詳細ドロワーを開く
- ドロワー内: Dependency Path / 参照リンク / 推奨アクション

### 7.4 AI解説

- 行の「AI解説」ボタンで Gemini 分析を表示
- API キー未設定時はモックレスポンス
- モック時はダイアログに注記を表示
- プロジェクト詳細の「AIリスク分析」も同様にモック注記を表示

---

## 8. 設定画面

- `/settings` は **モック挙動**
  - チーム名変更 / 削除は永続化しない
  - 1つだけ残ったチームは削除不可
- 画面上にモックである旨の注記を表示
- 最後のチーム削除を試みた場合は「最後のチームは削除できません（デモ制限）」と表示

---

## 9. 通知

- トーストは `sonner` を使用
- 成功: `toast.success(...)`
- 失敗: `toast.error(...)`
