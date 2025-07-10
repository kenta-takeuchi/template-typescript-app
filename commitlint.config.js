/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type に使用できる値を定義
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新機能
        'fix', // バグ修正
        'docs', // ドキュメント変更
        'style', // コードスタイル変更（フォーマット等）
        'refactor', // リファクタリング
        'perf', // パフォーマンス改善
        'test', // テスト追加・修正
        'chore', // ビルド・設定変更
        'ci', // CI/CD設定変更
        'build', // ビルドシステム変更
        'revert', // 変更の取り消し
      ],
    ],
    // サブジェクトの最小文字数
    'subject-min-length': [2, 'always', 3],
    // サブジェクトの最大文字数
    'subject-max-length': [2, 'always', 100],
    // サブジェクトの先頭文字は小文字
    'subject-case': [2, 'always', 'lower-case'],
    // サブジェクトの末尾にピリオド不要
    'subject-full-stop': [2, 'never', '.'],
    // ヘッダーの最大文字数
    'header-max-length': [2, 'always', 100],
    // 本文の最大行長
    'body-max-line-length': [2, 'always', 100],
    // フッターの最大行長
    'footer-max-line-length': [2, 'always', 100],
  },
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: {
          feat: {
            description: '新機能',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'バグ修正',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'ドキュメント変更',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: 'コードスタイル変更（機能に影響しない）',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'リファクタリング',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'パフォーマンス改善',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'テスト追加・修正',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: 'ビルドシステム・外部依存変更',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: 'CI/CD設定変更',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: 'その他の変更',
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: '変更の取り消し',
            title: 'Reverts',
            emoji: '🗑',
          },
        },
      },
      scope: {
        description:
          'What is the scope of this change (e.g. component or file name)',
      },
      subject: {
        description:
          'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
