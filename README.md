# Vote Counter App

The Vote Counter App is a robust and user-friendly application built using React with Vite, designed to streamline and
simplify the process of counting votes in elections. This application is tailored for organizations and groups needing
an efficient method to tally votes, manage positions, and display election results. With a focus on accuracy and ease of
use, the Vote Counter App offers a comprehensive solution for managing and understanding electoral outcomes.

## Usage

The Vote Counter App is accessible online at [https://vote.bijlit.nl/](https://vote.bijlit.nl/). To use the app, simply visit the URL in any modern web browser.

### Getting Started

1. **Open the Web App**: Navigate to [https://vote.bijlit.nl/](https://vote.bijlit.nl/) to start the voting process or to view election results.
2. **Navigate the App**: Use the menu or the intuitive user interface to move between different sections of the app, such as voting, viewing candidates, or
   checking election results.
3. **Vote**: If participating in an election, select your candidates of choice according to the instructions provided within the app. Your selections will be
   securely submitted for counting.
4. **Results**: Access the results page to see updated counts for each candidate and position. This page also shows information on blank and invalid votes, and
   highlights candidates who have surpassed the electoral divisor. Results can be sorted by vote count to easily identify the most popular candidates.

The Vote Counter App offers a streamlined experience for managing and participating in elections, providing clear, concise, and immediate insights into
electoral outcomes.

For any questions or technical support, please create a GitHub issue in our repository. This allows us to track and address your concerns as efficiently as
possible.

## Domain Language:

- **Voters**: Individuals who participate in the voting process to select candidates for various positions.
- **Candidates**: People nominated or running for election to a position.
- **Positions**: Specific roles or titles candidates are competing for in an election.
- **Ballots**: Physical or digital records of voters' choices, indicating their preferred candidates for each position.
- **Votes**: Individual selections made by voters for candidates in various positions.
- **Electoral Divisor**: The number of votes a candidate needs to be elected. Can be configured for different situations.

## Functionalities

- **Modify Positions**: Allows to add, remove, or modify the positions available in the election.
- **Register and Edit Ballots Containing Votes**: Facilitates the entry of ballot information and the ability to make
  changes if necessary.
- **Show Results**: Displays the election results in a clear and concise manner, potentially with graphical
  representations for better understanding.
- **Modify Settings**: Enables customization of the app settings to suit different election types and preferences.

## Additional Functionalities

- **Real-Time Vote Tallying**: Continuously updates vote counts as ballots are entered, providing up-to-date results.
- **Data Validation and Integrity Checks**: Ensures that all entered data is valid and consistent, reducing the chances
  of errors in the voting process.
- **Accessibility Features**: Makes the app usable for people with different abilities, including those who rely on
  screen readers or need high-contrast visuals.
- **Multi-Device Synchronization**: Ensures that results are consistent across different devices and identifies
  discrepancies in real-time.
- **Position-Based Voting Rules**: Customizes voting rules based on the position, such as allowing single or multiple
  votes per position.

## Development Guidelines

### Project Structure
```
src/
  components/       # React components
    pages/          # Page components
    __tests__/      # Tests for components
  domain/           # Domain logic
    __tests__/      # Tests for domain logic
  hooks/            # Custom React hooks
  utils/            # Utility functions
  types.ts          # TypeScript type definitions
  App.tsx           # Root application component
  main.tsx          # Application entry point
```

### Testing Standards
- **Testing Framework**: Use Jest for all tests
- **Test Location**: Always place tests in a `__tests__` folder within the directory of the code being tested
- **Test Naming**: Name test files with the pattern `[filename].test.ts` or `[ComponentName].test.tsx`
- **Component Testing**: Use React Testing Library for testing React components
- **Test Coverage**: Aim for comprehensive test coverage of domain logic and critical UI components

### Code Style and Standards
- **TypeScript**: Use TypeScript for all code to ensure type safety
- **ESLint**: Follow ESLint rules for consistent code style
- **Component Structure**: Use functional components with hooks
- **State Management**: Use Zustand for global state management
- **UI Components**: Use Material-UI (@mui) for UI components
- **File Organization**: Group related files in appropriate directories (components, domain, hooks, utils)
- **Imports**: Order imports with React/external libraries first, followed by internal modules

### Development Workflow
- **Development Server**: Use `npm run dev` to start the development server
- **Testing**: Use `npm test` to run all tests
- **Building**: Use `npm run build` to create a production build
- **Linting**: Use `npm run lint` to check for code style issues

## End-to-End Testing

This project now includes Playwright end-to-end tests to verify core functionality:

- **Voting Page**: Tests navigation to votes page, casting votes, and moving between ballots
- **Results Page**: Tests navigation to results page and verification of data display

To run E2E tests:
```bash
npm run test:e2e
```

For AI/CLI environments, use the following command to avoid opening the HTML report and run specifically on Chrome:
```bash
npm run test:e2e:cli:chrome
```

## Todo:

- **Results Enhancement**
    - When there are multiple people with the same amount of votes (and more then the electoral divisor) the should be handled the same. But this piece of code
      `.slice(0, position.maxVacancies)` not creates unequal handling. Please fix this.
- **Help & Documentation**: Create a dedicated help section with keyboard shortcuts overview and usage examples
- **Voter Metrics**: Implement voter attendance tracking to calculate participation ratio against registered voters
- **Position Management**: Build an intuitive position editor interface with drag-and-drop functionality
- **User Guide**: Develop comprehensive documentation with screenshots and use cases for all app features
- **Cross-Device Validation**: Create a dual-device verification system where votes counted on separate devices can be compared to identify discrepancies and
  ensure counting accuracy
- **Export Capabilities**: Add functionality to export results in CSV/PDF formats for record-keeping
- **Audit Trails**: Implement logging system for tracking ballot modifications for security and transparency
- **Automated Testing**: Set up comprehensive testing suite for core voting and counting functionality
- **CI/CD Pipeline**: Configure GitHub Actions for automated testing and deployment workflow including OpenCommit for better commit messages
- **Technical Debt & Integrity**
    - **Immer Integration**: Integrate `immer` into Zustand stores for safer and more readable state transitions.
    - **Hook Rule Compliance**: Refactor `Votes.tsx` to remove `useHotkeys` from loops and ensure compliance with React Hook rules.
    - **Logic Consolidation**: Move complex election calculations (divisor, tallying) from components to `electionDomain.ts` and ensure they are memoized.
    - **Tie-Handling UI**: Add explicit visual flagging for "Tied" results where the number of qualified candidates exceeds available vacancies.
- **React 19 & Vite 7 Optimization**
    - **Transition to React Compiler**: Evaluate and enable the React Compiler for automatic memoization.
    - **Use Action Hooks**: Refactor form interactions and state updates to use `useActionState` and `useOptimistic` for smoother UX.
    - **Resource Preloading**: Implement `preload` and `preinit` for critical assets (fonts, theme data) to improve initial load performance.
- **Advanced Electoral Features**
    - **Weighted Voting Support**: Add capability to handle ballots with different weight values for complex organizational votes.
    - **Multiple Election Methods**: Implement support for alternative counting methods (e.g., Single Transferable Vote, Borda count).
    - **Encrypted Local Backups**: Implement an option to export/import encrypted state files to allow safe off-device storage.
- **Enhanced UI/UX**
    - **Dark/Light Mode**: Full theme customization using MUI's system and React 19's theme features.
    - **Live Result Visualizations**: Add more interactive chart types (Sankey diagrams for vote flows, donut charts for vacancy status).
    - **Mobile Counting Mode**: Optimize the Votes page for one-handed operation on mobile devices during physical counts.
