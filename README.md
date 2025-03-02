# Vote Counter App

The Vote Counter App is a robust and user-friendly application built using React with Vite, designed to streamline and
simplify the process of counting votes in elections. This application is tailored for organizations and groups needing
an efficient method to tally votes, manage positions, and display election results. With a focus on accuracy and ease of
use, the Vote Counter App offers a comprehensive solution for managing and understanding electoral outcomes.

## Usage

The Vote Counter App is accessible online at [https://vote.bijlit.nl/](https://vote.bijlit.nl/). To use the app, simply visit the URL in any modern web browser.

### Getting Started

1. **Open the Web App**: Navigate to [https://vote.bijlit.nl/](https://vote.bijlit.nl/) to start the voting process or to view election results.
2. **Navigate the App**: Use the menu or the intuitive user interface to move between different sections of the app, such as voting, viewing candidates, or checking election results.
3. **Vote**: If participating in an election, select your candidates of choice according to the instructions provided within the app. Your selections will be securely submitted for counting.
4. **Results**: Access the results page to see updated counts for each candidate and position. This page also shows information on blank and invalid votes, and highlights candidates who have surpassed the electoral divisor. Results can be sorted by vote count to easily identify the most popular candidates.

The Vote Counter App offers a streamlined experience for managing and participating in elections, providing clear, concise, and immediate insights into electoral outcomes.

For any questions or technical support, please create a GitHub issue in our repository. This allows us to track and address your concerns as efficiently as possible.


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

## Todo:

- **Results Enhancement**
- **Help & Documentation**: Create a dedicated help section with keyboard shortcuts overview and usage examples
- **Voter Metrics**: Implement voter attendance tracking to calculate participation ratio against registered voters
- **Position Management**: Build an intuitive position editor interface with drag-and-drop functionality
- **User Guide**: Develop comprehensive documentation with screenshots and use cases for all app features
- **Cross-Device Validation**: Create a dual-device verification system where votes counted on separate devices can be compared to identify discrepancies and ensure counting accuracy
- **Export Capabilities**: Add functionality to export results in CSV/PDF formats for record-keeping
- **Audit Trails**: Implement logging system for tracking ballot modifications for security and transparency
- **Automated Testing**: Set up comprehensive testing suite for core voting and counting functionality
- **CI/CD Pipeline**: Configure GitHub Actions for automated testing and deployment workflow including OpenCommit for better commit messages
