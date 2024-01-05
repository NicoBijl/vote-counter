import {usePositions} from "../context.ts";

export function Results() {
    const positions = usePositions()

    return (
        <>
            <ul>
                {positions.map((position, positionIndex) => (
                    <li key={position.key}>
                        {position.title}
                        <ul>
                            {position.persons.map((person) => (
                                <li key={person.key}>
                                    {person.name}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>

        </>
    );
}