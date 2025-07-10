module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // Next.js App Router requires default exports for pages and layouts
    'import/no-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
