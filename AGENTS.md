# AI Agent Guidelines for Vote Counter

This file provides instructions for AI agents (like Junie, OpenCode, Cursor, Cline, etc.) to ensure consistent and efficient development and testing.

## E2E Testing
When running E2E tests in an automated or AI-driven environment, always use the following command:
```bash
npm run test:e2e:cli:chrome
```

This ensures that:
1. Only Chromium is used (faster and more stable in CI).
2. The HTML report is not automatically opened (which would hang the process).
3. The execution is optimized for CLI environments.

## Development Guidelines
- Follow the rules in `CONTRIBUTING.md` and `README.md`.
- Use TypeScript and follow existing patterns.
- Tests should be placed in `__tests__` folders.
- For E2E tests, add them to the `e2e` directory.
