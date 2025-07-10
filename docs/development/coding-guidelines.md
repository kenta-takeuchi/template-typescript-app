# コーディングガイドライン

## 基本原則

1. **型安全性を重視**: TypeScript の strict mode を使用
2. **読みやすさ優先**: 複雑なワンライナーより、理解しやすいコードを書く
3. **一貫性を保つ**: 既存のコードスタイルに従う
4. **テスト可能な設計**: 依存性注入、純粋関数を心がける

## TypeScript

### 型定義

```typescript
// ❌ 避けるべき例
const user: any = { name: 'John' };
function process(data) {
  // 暗黙的な any
  return data;
}

// ✅ 推奨例
interface User {
  id: string;
  name: string;
  email: string;
}

function process<T>(data: T): T {
  return data;
}
```

### Enum vs Union Types

```typescript
// Union Types を推奨（Tree-shaking 対応）
export type UserRole = 'user' | 'admin';

// Enum は必要な場合のみ使用
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
}
```

### エラーハンドリング

```typescript
// カスタムエラークラスを使用
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Result 型パターン
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

## React/Next.js

### コンポーネント構成

```typescript
// ✅ 関数コンポーネント + TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### カスタムフック

```typescript
// ✅ use プレフィックスを使用
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
```

### データフェッチング

```typescript
// ✅ Server Components でのデータ取得
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// ✅ Client Components での状態管理
'use client';

function UserList() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <UserTable users={data} />;
}
```

## API 設計

### RESTful エンドポイント

```typescript
// ✅ 一貫性のある命名規則
GET    /api/users          // 一覧取得
GET    /api/users/:id      // 個別取得
POST   /api/users          // 作成
PUT    /api/users/:id      // 更新
DELETE /api/users/:id      // 削除

// ✅ クエリパラメータの使用
GET /api/users?page=1&limit=10&sort=createdAt&order=desc
```

### レスポンス形式

```typescript
// 成功レスポンス
{
  "success": true,
  "data": { /* データ */ },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}

// エラーレスポンス
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": { /* 詳細情報 */ }
  }
}
```

## データベース

### Prisma モデル

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  posts     Post[]
  profile   UserProfile?

  // インデックス
  @@index([email, role])
  @@map("users")
}
```

### リポジトリパターン

```typescript
export class UserRepository extends BaseRepository<User> {
  constructor(protected readonly db: PrismaClient) {
    super(db, 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
      include: this.getDefaultInclude(),
    });
  }

  protected getDefaultInclude() {
    return {
      profile: true,
      _count: {
        select: { posts: true },
      },
    };
  }
}
```

## テスト

### ユニットテスト

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new UserService(mockRepository);
  });

  it('should create a user', async () => {
    // Arrange
    const input = { email: 'test@example.com', name: 'Test' };
    const expected = { id: '1', ...input };
    mockRepository.create.mockResolvedValue(expected);

    // Act
    const result = await service.createUser(input);

    // Assert
    expect(result).toEqual(expected);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });
});
```

### 統合テスト

```typescript
describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });
});
```

## Git コミット

### コミットメッセージ

```bash
# 形式: <type>(<scope>): <subject>

feat(auth): JWT認証機能を追加
fix(api): ユーザー検索のバグを修正
docs(readme): セットアップ手順を更新
style(web): コードフォーマットを統一
refactor(db): リポジトリパターンに移行
test(user): ユーザーサービスのテストを追加
chore(deps): 依存関係を更新
```

### タイプ一覧

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更
- `refactor`: バグ修正や機能追加を含まないコード変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスや補助ツールの変更

## コードレビュー

### チェックリスト

- [ ] TypeScript の型が適切に定義されているか
- [ ] エラーハンドリングが適切か
- [ ] テストが書かれているか
- [ ] パフォーマンスへの影響を考慮しているか
- [ ] セキュリティの観点で問題がないか
- [ ] ドキュメント/コメントが適切か

### レビューコメント例

```typescript
// 💭 考慮事項: このクエリは N+1 問題を引き起こす可能性があります
// 💡 提案: include を使用してリレーションを事前に取得してください
// ⚠️ 注意: この関数は副作用があるため、テストが困難です
// ✅ 良い: 適切なエラーハンドリングですね！
```
