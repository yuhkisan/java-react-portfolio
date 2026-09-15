---
trigger: always_on
---

# コーディングルール

## TypeScript

### 1. 型定義は `type` を優先

- `interface` は継承や宣言マージが必要な場合のみ使用
- それ以外は `type` で統一する

```typescript
// ❌ 不要な interface
interface UserProps {
  name: string;
}

// ✅ type を使う
type UserProps = {
  name: string;
};
```

### 2. 型推論を最大限活用

- TypeScript が推論できる箇所には型注釈を書かない
- 明示的な型が必要な場合のみ型を書く:
  - 関数の引数
  - 空配列や空オブジェクトの初期化
  - Public API（エクスポートする関数の戻り値など）

```typescript
// ❌ 不要な型注釈
const count: number = 0;
const name: string = "Taro";
const user: { name: string } = { name: "Taro" };

// ✅ 型推論に任せる
const count = 0;
const name = "Taro";
const user = { name: "Taro" };

// ✅ 型が必要なケース
const items: string[] = []; // 空配列
function getUser(id: string): User | undefined {
  // 引数と戻り値
  return users.find((u) => u.id === id);
}
```

### 3. その他

- `any` は原則禁止、どうしても必要な場合は `unknown` を検討
- ユニオン型や条件型は積極的に活用する

## リファクタリング

### 1. 小さなコミット単位で進める

- 大きなリファクタリングは複数のコミットに分割する
- 1 つのコミットで「移動 + 修正 + 削除」をまとめない
- レビューしやすい粒度を意識する

```bash
# ❌ 1コミットで全部やる
git commit -m "refactor: page.tsx を features に分離"  # 700行の差分

# ✅ ステップごとにコミット
git commit -m "refactor: ProjectListView を features に移動"
git commit -m "refactor: page.tsx から View を呼び出すだけに変更"
```

### 2. ファイル移動は `git mv` を使う

- `git mv` で移動すると Git が履歴を追跡できる
- コピー＆削除だと「新規作成 + 削除」に見える

```bash
# ✅ 移動として認識される
git mv app/projects/page.tsx features/projects/ProjectListView.tsx
```
