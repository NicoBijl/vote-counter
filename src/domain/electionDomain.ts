import { Position, PersonKey } from '../types';
import { Ballot } from '../hooks/useBallotStore';

/**
 * Enum representing the election status of a candidate
 */
export enum CandidateStatus {
    ELECTED = 'elected',
    ABOVE_DIVISOR = 'above-divisor',
    BELOW_DIVISOR = 'below-divisor'
}

/**
 * Interface representing a candidate with their vote count and status
 */
export interface CandidateResult {
    key: PersonKey;
    votes: number;
    status: CandidateStatus;
}

/**
 * Calculates the electoral divisor for a position
 * @param position The position
 * @param ballots All ballots
 * @param electoralDivisorVariable The electoral divisor variable (default: 0.8)
 * @returns The electoral divisor
 */
export function calculateElectoralDivisor(
    position: Position, 
    ballots: Ballot[], 
    electoralDivisorVariable: number = 0.8
): number {
    const persons = position.persons.length;
    const validVotes = ballots
        .flatMap(b => b.vote)
        .filter(v => v.position === position.key && v.person !== "invalid")
        .length;

    return Math.ceil(validVotes / persons * electoralDivisorVariable);
}

/**
 * Counts the votes for a person in a position
 * @param position The position
 * @param personKey The person key
 * @param ballots All ballots
 * @returns The number of votes
 */
export function countVotes(position: Position, personKey: PersonKey, ballots: Ballot[]): number {
    const checked = ballots
        .flatMap(b => b.vote)
        .filter(v => v.position === position.key && v.person === personKey)
        .length;

    return personKey === 'invalid' ? checked * position.maxVotesPerBallot : checked;
}

/**
 * Gets the top candidates for a position
 * @param position The position
 * @param ballots All ballots
 * @returns Array of person keys for the top candidates
 */
export function getTopCandidates(position: Position, ballots: Ballot[]): PersonKey[] {
    const candidatesWithVotes = position.persons
        .map(person => ({ 
            key: person.key, 
            votes: countVotes(position, person.key, ballots) 
        }))
        .sort((a, b) => b.votes - a.votes);

    // If there are no candidates, return empty array
    if (candidatesWithVotes.length === 0) {
        return [];
    }

    // Get the vote count of the candidate at the maxVacancies position (if exists)
    const cutoffIndex = Math.min(position.maxVacancies - 1, candidatesWithVotes.length - 1);
    const cutoffVotes = candidatesWithVotes[cutoffIndex].votes;

    // Include all candidates with votes >= cutoffVotes
    return candidatesWithVotes
        .filter(candidate => candidate.votes >= cutoffVotes)
        .map(candidate => candidate.key);
}

/**
 * Determines the election status of a candidate
 * @param position The position
 * @param personKey The person key
 * @param ballots All ballots
 * @param electoralDivisorVariable The electoral divisor variable (default: 0.8)
 * @returns The candidate status
 */
export function getCandidateStatus(
    position: Position, 
    personKey: PersonKey, 
    ballots: Ballot[],
    electoralDivisorVariable: number = 0.8
): CandidateStatus {
    if (personKey === 'invalid') {
        return CandidateStatus.BELOW_DIVISOR;
    }

    const votes = countVotes(position, personKey, ballots);
    const divisor = calculateElectoralDivisor(position, ballots, electoralDivisorVariable);
    const topCandidates = getTopCandidates(position, ballots);

    if (votes >= divisor) {
        if (topCandidates.includes(personKey)) {
            return CandidateStatus.ELECTED;
        } else {
            return CandidateStatus.ABOVE_DIVISOR;
        }
    }

    return CandidateStatus.BELOW_DIVISOR;
}

/**
 * Gets the results for all candidates in a position
 * @param position The position
 * @param ballots All ballots
 * @param electoralDivisorVariable The electoral divisor variable (default: 0.8)
 * @returns Array of candidate results
 */
export function getPositionResults(
    position: Position, 
    ballots: Ballot[],
    electoralDivisorVariable: number = 0.8
): CandidateResult[] {
    return position.persons.map(person => {
        const votes = countVotes(position, person.key, ballots);
        const status = getCandidateStatus(position, person.key, ballots, electoralDivisorVariable);

        return {
            key: person.key,
            votes,
            status
        };
    });
}
