# Vote Counter Project Guidelines

## Project Overview
Vote Counter is a sophisticated ballot counting application designed to streamline and secure the voting process. The application focuses on accuracy, transparency, and user accessibility in managing and counting votes for various positions.

### Core Features
- **Real-time Vote Counting**: Instant vote tallying with live updates
- **Error Detection**: Built-in validation mechanisms to minimize counting errors
- **Accessibility Features**: Support for users with different abilities
- **Multi-Device Synchronization**: Consistent results across devices
- **Position-Based Voting Rules**: Customizable voting rules per position

## Technical Stack
- React with TypeScript
- Modern UI components
- Real-time data synchronization
- Responsive design principles

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Maintain component-based architecture
- Write clean, documented code

### Feature Development
1. Create feature branch from main
2. Implement required functionality
3. Add necessary tests
4. Submit PR for review

### Testing Requirements
- Unit tests for core functionality
- Integration tests for critical flows
- E2E tests: use `npm run test:e2e:cli:chrome` when running automated tests (especially for AI/CLI environments)
- Accessibility testing
- Cross-device compatibility testing

### Documentation
- Keep code documentation up-to-date
- Document new features in README
- Update user guide for significant changes

## Project Structure
```
src/
  components/
    pages/         # Main application pages
    MainContainer  # Core layout component
    NavItems       # Navigation components
  App.tsx         # Root application component
```

## Contribution Guidelines
1. Follow the established code style
2. Write meaningful commit messages
3. Keep PRs focused and manageable
4. Include tests for new features
5. Update documentation as needed
