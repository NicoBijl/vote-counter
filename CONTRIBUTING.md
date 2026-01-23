# Contributing to Vote Counter

Thank you for your interest in contributing to Vote Counter!

## Development Workflow

1.  **Installation**: Run `npm install` to install dependencies.
2.  **Development**: Run `npm run dev` to start the development server.
3.  **Testing**:
    *   Unit tests: `npm test`
    *   E2E tests: `npm run test:e2e`
    *   **AI/CLI Environments**: For automated testing, use `npm run test:e2e:cli:chrome` to ensure a smooth, headless execution specifically on Chrome.
4.  **Linting**: Run `npm run lint` before committing.
5.  **Building**: Run `npm run build` to verify the build.

## Testing Guidelines

### End-to-End (E2E) Testing
We use Playwright for E2E testing. 
- Always ensure the development server is running (`npm run dev`) before running E2E tests.
- When running tests in an automated environment (CI, AI agents, CLI), use the optimized script:
  ```bash
  npm run test:e2e:cli:chrome
  ```
