import { Position, PersonKey } from '../types';
import { Ballot } from '../hooks/useBallotStore';

/**
 * Enum representing the election status of a candidate
 */
export enum CandidateStatus {
    ELECTED = 'elected',
    TIED = 'tied',
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

export function calculateAttendanceRatio(ballotsCount: number, totalAllowedVoters: number): string {
    if (totalAllowedVoters === 0) return "N/A";
    return ((ballotsCount / totalAllowedVoters) * 100).toFixed(1) + "%";
}

export function calculateTotalValidVotes(ballots: Ballot[]): number {
    return ballots.flatMap(b => b.vote).filter(v => v.person !== "invalid").length;
}

export function calculateChecksum(array: number[]): number {
    return array.reduce((acc, val, index) => acc + val * Math.pow(2, index), 0);
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

export function calculateBlankVotes(position: Position, ballots: Ballot[]): number {
    return ballots.flatMap(b => {
        const isInvalid = !!b.vote.find(v => v.position === position.key && v.person === "invalid");
        if (isInvalid) {
            return 0;
        } else {
            return position.maxVotesPerBallot - b.vote.filter(v => v.position === position.key && v.person !== "invalid").length;
        }
    }).reduce((acc, val) => acc + val, 0);
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

    if (candidatesWithVotes.length === 0) {
        return [];
    }

    const cutoffIndex = Math.min(position.maxVacancies - 1, candidatesWithVotes.length - 1);
    const cutoffVotes = candidatesWithVotes[cutoffIndex].votes;

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

    if (votes < divisor) {
        return CandidateStatus.BELOW_DIVISOR;
    }

    const allCandidateVotes = position.persons.map(p => countVotes(position, p.key, ballots));
    const higherCount = allCandidateVotes.filter(v => v > votes).length;
    const sameCount = allCandidateVotes.filter(v => v === votes).length;

    if (higherCount + sameCount <= position.maxVacancies) {
        return CandidateStatus.ELECTED;
    }

    if (higherCount < position.maxVacancies) {
        return CandidateStatus.TIED;
    }

    return CandidateStatus.ABOVE_DIVISOR;
}

export interface VoteStats {
    name: string;
    value: number;
    color?: string;
    total: number;
    key?: string;
}

export function getPositionVoteStats(position: Position, ballots: Ballot[]): VoteStats[] {
    const personVotes = position.persons.map(person => ({
        name: person.name,
        value: countVotes(position, person.key, ballots),
        key: person.key
    }));

    const invalid = countVotes(position, "invalid", ballots);
    const blank = calculateBlankVotes(position, ballots);
    const total = personVotes.reduce((sum, entry) => sum + entry.value, 0) + blank + invalid;

    return [
        ...personVotes.map(entry => ({...entry, total})),
        { name: 'Blank', value: blank, total },
        { name: 'Invalid', value: invalid, total }
    ];
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
