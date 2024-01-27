export interface Position {
    max: number,
    key: PositionKey,
    title: string,
    persons: Array<Person>
}

export function isPosition(object: any): object is Position {
    return 'key' in object && 'title' in object && 'persons' in object && 'max' in object
}

export interface Person {
    key: PersonKey,
    name: string
}

export type PositionKey = string
export type PersonKey = string