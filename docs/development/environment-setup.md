# 開発環境セットアップ

## 必要なツール

### Node.js (必須)

- **バージョン**: 22.x 推奨
- **インストール方法**:

  ```bash
  # nvm を使用する場合
  nvm install 22
  nvm use 22

  # または公式サイトからダウンロード
  # https://nodejs.org/
  ```

### pnpm (必須)

- **バージョン**: 8.x 以上
- **インストール方法**:
  ```bash
  npm install -g pnpm
  ```

### Docker (オプション、本番環境用)

- **用途**: ローカルでの本番環境シミュレーション
- **インストール**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 推奨エディタ

- **VS Code** + 以下の拡張機能:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone [repository-url]
cd [project-name]
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

#### API サーバー

```bash
cd apps/api
cp .env.example .env.local
```

必要な環境変数:

```env
# データベース接続
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT認証
JWT_SECRET="your-secret-key-minimum-32-characters"

# Firebase (認証用)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_PRIVATE_KEY="your-private-key"

# SendGrid (メール送信用)
SENDGRID_API_KEY="your-api-key"
SENDGRID_FROM_EMAIL="noreply@example.com"
```

#### Web アプリケーション

```bash
cd apps/web
cp .env.example .env.local
```

必要な環境変数:

```env
# API エンドポイント
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# Firebase (クライアント側)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```

### 4. データベースのセットアップ

#### PostgreSQL のインストール

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### データベースの作成

```bash
createdb template_dev
```

#### マイグレーションの実行

```bash
pnpm db:migrate
```

#### 初期データの投入（オプション）

```bash
pnpm db:seed
```

### 5. 開発サーバーの起動

```bash
# すべてのサービスを起動
pnpm dev

# 個別に起動する場合
pnpm dev --filter=api      # APIサーバーのみ
pnpm dev --filter=web      # Webアプリのみ
```

## アクセスURL

- **API サーバー**: http://localhost:4000

  - ヘルスチェック: http://localhost:4000/health
  - API ドキュメント: http://localhost:4000/docs (実装予定)

- **Web アプリケーション**: http://localhost:3000

## トラブルシューティング

### ポートが使用中の場合

```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :4000

# プロセスを終了
kill -9 [PID]
```

### 依存関係のエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

### データベース接続エラー

1. PostgreSQL が起動していることを確認
2. DATABASE_URL が正しいことを確認
3. データベースが作成されていることを確認

### 型エラー

```bash
# 型定義を再生成
pnpm type-check
pnpm db:generate
pnpm api:generate
```

## 環境確認スクリプト

プロジェクトには環境確認用のスクリプトが含まれています：

```bash
./scripts/check-env.sh
```

このスクリプトは以下を確認します：

- Node.js バージョン
- pnpm のインストール
- 必要な環境変数
- ポートの利用可能性
- 依存関係の状態
