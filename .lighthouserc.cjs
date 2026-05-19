module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'yarn --cwd ../.. start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 60000,
      url: [
        'http://127.0.0.1:3000/',
        'http://127.0.0.1:3000/blog',
        'http://127.0.0.1:3000/about',
      ],
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: 'filesystem',
    },
  },
};