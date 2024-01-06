import {usePositions, useVoteStore} from "../context.ts";
import Grid from "@mui/material/Grid";

export function Results() {
    const positions = usePositions()
    const {votes} = useVoteStore()

    return (
        <>
            <Grid item xs={8}>
                Total Votes
            </Grid>
            <Grid item xs={4}>
                {votes.length}
            </Grid>
            <ul>
                {positions.map((position, positionIndex) => (
                    <li key={position.key}>
                        {position.title}
                        <ul>
                            {position.persons.map((person) => (
                                <li key={person.key}>
                                    {/*{person.name} - {countVoted(votes, position.key, person.key)}*/}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>

        </>
    );
}