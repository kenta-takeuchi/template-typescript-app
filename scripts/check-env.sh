#!/bin/bash

# 開発環境確認スクリプト
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== テンプレートプロジェクト環境確認 ===${NC}"
echo ""

# Node.js確認
echo -e "${YELLOW}Node.js バージョン確認...${NC}"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
  
  # Check recommended version
  if [[ "$NODE_VERSION" =~ ^v22\. ]]; then
    echo -e "${GREEN}✓ Node.js 22.x です${NC}"
  else
    echo -e "${YELLOW}⚠ 推奨バージョンは Node.js 22.x です${NC}"
  fi
else
  echo -e "${RED}✗ Node.js がインストールされていません${NC}"
  exit 1
fi
echo ""

# pnpm確認
echo -e "${YELLOW}pnpm バージョン確認...${NC}"
if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version)
  echo -e "${GREEN}✓ pnpm: $PNPM_VERSION${NC}"
else
  echo -e "${RED}✗ pnpm がインストールされていません${NC}"
  echo -e "${BLUE}インストール方法: npm install -g pnpm${NC}"
  exit 1
fi
echo ""

# Git確認
echo -e "${YELLOW}Git バージョン確認...${NC}"
if command -v git &> /dev/null; then
  GIT_VERSION=$(git --version)
  echo -e "${GREEN}✓ $GIT_VERSION${NC}"
else
  echo -e "${RED}✗ Git がインストールされていません${NC}"
  exit 1
fi
echo ""

# プロジェクト依存関係確認
echo -e "${YELLOW}プロジェクト依存関係確認...${NC}"
if [ -f "package.json" ]; then
  if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules が存在します${NC}"
    
    # pnpm list実行
    echo -e "${YELLOW}依存関係一覧:${NC}"
    pnpm list --depth=0 2>/dev/null || echo -e "${YELLOW}⚠ 一部の依存関係に問題があります${NC}"
  else
    echo -e "${RED}✗ node_modules が存在しません${NC}"
    echo -e "${BLUE}実行してください: pnpm install${NC}"
  fi
else
  echo -e "${RED}✗ package.json not found${NC}"
  echo -e "${BLUE}Please run from project root directory${NC}"
  exit 1
fi
echo ""

# TypeScript check
echo -e "${YELLOW}TypeScript type check...${NC}"
if pnpm type-check >/dev/null 2>&1; then
  echo -e "${GREEN}✓ TypeScript: no errors${NC}"
else
  echo -e "${YELLOW}⚠ TypeScript: errors found${NC}"
  echo -e "${BLUE}Check details: pnpm type-check${NC}"
fi
echo ""

# ESLint check
echo -e "${YELLOW}ESLint check...${NC}"
if pnpm lint >/dev/null 2>&1; then
  echo -e "${GREEN}✓ ESLint: no issues${NC}"
else
  echo -e "${YELLOW}⚠ ESLint: warnings or errors found${NC}"
  echo -e "${BLUE}Check details: pnpm lint${NC}"
fi
echo ""

# Environment files check
echo -e "${YELLOW}Checking environment files...${NC}"
ENV_FILES=(
  "apps/api/.env.local"
  "apps/web/.env.local"
)

for env_file in "${ENV_FILES[@]}"; do
  if [ -f "$env_file" ]; then
    echo -e "${GREEN}✓ $env_file${NC}"
  else
    echo -e "${YELLOW}⚠ $env_file not found${NC}"
    echo -e "${BLUE}  Create with: cp ${env_file%.local}.example $env_file${NC}"
  fi
done
echo ""

# Port check
echo -e "${YELLOW}Checking port availability...${NC}"
PORTS=(3000 4000)
for port in "${PORTS[@]}"; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port $port is in use${NC}"
  else
    echo -e "${GREEN}✓ Port $port is available${NC}"
  fi
done
echo ""

# Recommended tools check
echo -e "${YELLOW}Checking recommended tools...${NC}"

# VS Code check
if command -v code &> /dev/null; then
  echo -e "${GREEN}✓ VS Code is installed${NC}"
else
  echo -e "${BLUE}ℹ VS Code installation is recommended${NC}"
fi

# Docker check
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓ Docker is installed${NC}"
else
  echo -e "${BLUE}ℹ Docker installation is recommended (for production)${NC}"
fi
echo ""

# Final message
echo -e "${GREEN}=== Environment check complete ===${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Configure environment files (if needed)"
echo -e "2. Start development server: ${GREEN}pnpm dev${NC}"
echo -e "3. Access applications:"
echo -e "   - API Server: http://localhost:4000/health"
echo -e "   - Web App: http://localhost:3000"
echo ""
echo -e "${BLUE}For issues, check docs/development/environment-setup.md${NC}"