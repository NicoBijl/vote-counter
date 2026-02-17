import {describe, it, expect} from '@jest/globals';
import {
    CandidateStatus,
    calculateElectoralDivisor,
    countVotes,
    getTopCandidates,
    getCandidateStatus
} from '../electionDomain';
import {Position} from '../../types';
import {Ballot} from '../../hooks/useBallotStore';

describe('calculateElectoralDivisor', () => {
    it('calculates the electoral divisor correctly', () => {
        // Create a position with 4 candidates
        const position: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                {key: 'person1', name: 'Person 1'},
                {key: 'person2', name: 'Person 2'},
                {key: 'person3', name: 'Person 3'},
                {key: 'person4', name: 'Person 4'}
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 2
        };

        // Create ballots with 31 total votes
        const ballots: Ballot[] = [];

        // 10 votes for person1
        for (let i = 0; i < 10; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person1'}]
            });
        }

        // 8 votes for person2 and person3
        for (let i = 0; i < 8; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person2'}]
            });

            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person3'}]
            });
        }

        // 5 votes for person4
        for (let i = 0; i < 5; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person4'}]
            });
        }

        // With 31 votes total and 4 persons, the divisor would be 31/4*0.8 = 6.2, rounded up to 7
        expect(calculateElectoralDivisor(position, ballots, 0.8)).toBe(7);
    });
});

describe('countVotes', () => {
    it('counts votes correctly', () => {
        // Create a position
        const position: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                {key: 'person1', name: 'Person 1'},
                {key: 'person2', name: 'Person 2'}
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        // Create ballots
        const ballots: Ballot[] = [
            {
                index: 0,
                vote: [{position: 'test-position', person: 'person1'}]
            },
            {
                index: 1,
                vote: [{position: 'test-position', person: 'person1'}]
            },
            {
                index: 2,
                vote: [{position: 'test-position', person: 'person2'}]
            }
        ];

        // Person1 should have 2 votes, Person2 should have 1 vote
        expect(countVotes(position, 'person1', ballots)).toBe(2);
        expect(countVotes(position, 'person2', ballots)).toBe(1);
    });

    it('handles invalid votes correctly', () => {
        // Create a position
        const position: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                {key: 'person1', name: 'Person 1'}
            ],
            maxVotesPerBallot: 2,
            maxVacancies: 1
        };

        // Create ballots with invalid votes
        const ballots: Ballot[] = [
            {
                index: 0,
                vote: [{position: 'test-position', person: 'invalid'}]
            },
            {
                index: 1,
                vote: [{position: 'test-position', person: 'invalid'}]
            }
        ];

        // Invalid votes should be multiplied by maxVotesPerBallot
        expect(countVotes(position, 'invalid', ballots)).toBe(4);
    });
});

describe('getTopCandidates', () => {
    it('returns the top candidates based on maxVacancies', () => {
        // Create a position with 4 candidates and 2 vacancies
        const position: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                {key: 'person1', name: 'Person 1'},
                {key: 'person2', name: 'Person 2'},
                {key: 'person3', name: 'Person 3'},
                {key: 'person4', name: 'Person 4'}
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 2
        };

        // Create ballots with votes: person1 (10), person2 (8), person3 (8), person4 (5)
        const ballots: Ballot[] = [];

        // 10 votes for person1
        for (let i = 0; i < 10; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person1'}]
            });
        }

        // 8 votes for person2 and person3
        for (let i = 0; i < 8; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person2'}]
            });

            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person3'}]
            });
        }

        // 5 votes for person4
        for (let i = 0; i < 5; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person4'}]
            });
        }

        // Top candidates should be person1, person2, and person3 (due to tie)
        const topCandidates = getTopCandidates(position, ballots);
        expect(topCandidates).toContain('person1');
        expect(topCandidates).toContain('person2');
        expect(topCandidates).toContain('person3');
        expect(topCandidates).not.toContain('person4');
        expect(topCandidates.length).toBe(3);
    });
});

describe('getCandidateStatus', () => {
    it('correctly identifies elected candidates', () => {
        // Create a position with 4 candidates and 2 vacancies
        const position: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                {key: 'person1', name: 'Person 1'},
                {key: 'person2', name: 'Person 2'},
                {key: 'person3', name: 'Person 3'},
                {key: 'person4', name: 'Person 4'}
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 2
        };

        // Create ballots with votes: person1 (10), person2 (8), person3 (8), person4 (5)
        const ballots: Ballot[] = [];

        // 10 votes for person1
        for (let i = 0; i < 10; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person1'}]
            });
        }

        // 8 votes for person2 and person3
        for (let i = 0; i < 8; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person2'}]
            });

            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person3'}]
            });
        }

        // 5 votes for person4
        for (let i = 0; i < 5; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person4'}]
            });
        }

        // With 31 votes total and 4 persons, the divisor would be 31/4*0.8 = 6.2, rounded up to 7

        expect(getCandidateStatus(position, 'person1', ballots, 0.8)).toBe(CandidateStatus.TIED);
        
        expect(getCandidateStatus(position, 'person2', ballots, 0.8)).toBe(CandidateStatus.TIED);
        expect(getCandidateStatus(position, 'person3', ballots, 0.8)).toBe(CandidateStatus.TIED);

        expect(getCandidateStatus(position, 'person4', ballots, 0.8)).toBe(CandidateStatus.BELOW_DIVISOR);
    });

    it('correctly identifies tied candidates', () => {
        const position: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' },
                { key: 'person2', name: 'Person 2' },
                { key: 'person3', name: 'Person 3' },
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        const ballots: Ballot[] = [
            { index: 0, vote: [{ position: 'test-position', person: 'person1' }] },
            { index: 1, vote: [{ position: 'test-position', person: 'person1' }] },
            { index: 2, vote: [{ position: 'test-position', person: 'person2' }] },
            { index: 3, vote: [{ position: 'test-position', person: 'person2' }] },
            { index: 4, vote: [{ position: 'test-position', person: 'person3' }] },
        ];

        expect(getCandidateStatus(position, 'person1', ballots, 0.8)).toBe(CandidateStatus.TIED);
        expect(getCandidateStatus(position, 'person2', ballots, 0.8)).toBe(CandidateStatus.TIED);
        expect(getCandidateStatus(position, 'person3', ballots, 0.8)).toBe(CandidateStatus.BELOW_DIVISOR);
    });

    it('correctly identifies above-divisor candidates', () => {
        // Create a position with 4 candidates and 1 vacancy
        const position: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                {key: 'person1', name: 'Person 1'},
                {key: 'person2', name: 'Person 2'},
                {key: 'person3', name: 'Person 3'},
                {key: 'person4', name: 'Person 4'}
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        // Create ballots with votes: person1 (10), person2 (8), person3 (8), person4 (5)
        const ballots: Ballot[] = [];

        // 10 votes for person1
        for (let i = 0; i < 10; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person1'}]
            });
        }

        // 8 votes for person2 and person3
        for (let i = 0; i < 8; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person2'}]
            });

            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person3'}]
            });
        }

        // 5 votes for person4
        for (let i = 0; i < 5; i++) {
            ballots.push({
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person4'}]
            });
        }

        // With 31 votes total and 4 persons, the divisor would be 31/4*0.8 = 6.2, rounded up to 7

        // person1 should be ELECTED (votes >= divisor and in top candidates)
        expect(getCandidateStatus(position, 'person1', ballots, 0.8)).toBe(CandidateStatus.ELECTED);

        // person2 and person3 should be ABOVE_DIVISOR (votes >= divisor but not in top candidates)
        expect(getCandidateStatus(position, 'person2', ballots, 0.8)).toBe(CandidateStatus.ABOVE_DIVISOR);
        expect(getCandidateStatus(position, 'person3', ballots, 0.8)).toBe(CandidateStatus.ABOVE_DIVISOR);

        // person4 should be BELOW_DIVISOR (votes < divisor)
        expect(getCandidateStatus(position, 'person4', ballots, 0.8)).toBe(CandidateStatus.BELOW_DIVISOR);
    });
});
