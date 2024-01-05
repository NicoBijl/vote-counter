export interface Position {
    max: number,
    key: PositionKey,
    title: string,
    persons: Array<Person>
}

export interface Person {
    key: PersonKey,
    name: string
}

export type PositionKey = string
export type PersonKey = string