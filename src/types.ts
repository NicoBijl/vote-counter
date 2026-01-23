export interface Position {
    maxVotesPerBallot: number,
    maxVacancies: number,
    key: PositionKey,
    title: string,
    persons: Array<Person>
}

export function isPosition(object: unknown): object is Position {
    if (typeof object !== 'object' || object === null) return false;
    const record = object as Record<string, unknown>;
    return 'key' in record && 'title' in record && 'persons' in record && 'maxVotesPerBallot' in record && 'maxVacancies' in record;
}

export function isBallot(object: unknown): object is Ballot {
    if (typeof object !== 'object' || object === null) return false;
    const record = object as Record<string, unknown>;
    return 'index' in record && 'vote' in record && Array.isArray(record.vote);
}

export interface Person {
    key: PersonKey,
    name: string
}
export type PositionKey = string

export type PersonKey = string

export interface Vote {
    position: PositionKey;
    person: PersonKey;
}

export interface Ballot {
    id: string;
    index: number;
    vote: Vote[];
}
