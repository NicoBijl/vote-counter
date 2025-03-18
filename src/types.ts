export interface Position {
    max: number,
    key: PositionKey,
    title: string,
    persons: Array<Person>
}

export function isPosition(object: unknown): object is Position {
    return typeof object === 'object' && object !== null && 'key' in object && 'title' in object && 'persons' in object && 'max' in object
}

export interface Person {
    key: PersonKey,
    name: string
}

export interface Ballot {
    index: number
    vote: Array<Vote>
}

export interface Vote {
    position: PositionKey
    person: PersonKey
}

export function isBallot(object: unknown): object is Ballot {
    return typeof object === 'object' && object !== null && 'index' in object && 'vote' in object && Array.isArray((object as {vote: unknown[]}).vote)
}

export type PositionKey = string
export type PersonKey = string
