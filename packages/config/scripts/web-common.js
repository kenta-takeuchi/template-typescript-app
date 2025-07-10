#!/usr/bin/env node

/**
 * 共通Webアプリケーション用スクリプト
 * Next.js アプリケーション向けの標準的なnpmスクリプトを提供
 */

const path = require('path');
const { execSync } = require('child_process');

// 環境変数またはpackage.jsonからポート番号を取得
function getPort() {
  const port = process.env.PORT;
  if (port) return port;

  // package.jsonから推定
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const name = packageJson.name;

  if (name.includes('jobseeker')) return '3000';
  if (name.includes('company')) return '3001';
  if (name.includes('agent')) return '3002';

  return '3000'; // デフォルト
}

const scripts = {
  build: () => execSync('next build', { stdio: 'inherit' }),
  dev: () => {
    const port = getPort();
    execSync(`next dev -p ${port}`, { stdio: 'inherit' });
  },
  start: () => {
    const port = getPort();
    execSync(`next start -p ${port}`, { stdio: 'inherit' });
  },
  lint: () => execSync('next lint', { stdio: 'inherit' }),
  'type-check': () => execSync('tsc --noEmit', { stdio: 'inherit' }),
  test: () => execSync('jest --passWithNoTests', { stdio: 'inherit' }),
  'test:watch': () => execSync('jest --watch', { stdio: 'inherit' }),
  clean: () => execSync('rm -rf .next out', { stdio: 'inherit' }),
};

// コマンドライン引数から実行するスクリプトを取得
const scriptName = process.argv[2];

if (!scriptName || !scripts[scriptName]) {
  console.error('使用可能なスクリプト:', Object.keys(scripts).join(', '));
  process.exit(1);
}

try {
  scripts[scriptName]();
} catch (error) {
  process.exit(error.status || 1);
}
