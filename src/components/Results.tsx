import {useBallotStore, usePositions} from "../context.ts";
import Grid from "@mui/material/Grid";
import {PersonKey, PositionKey} from "../types.ts";

export function Results() {
    const positions = usePositions()
    const {ballots} = useBallotStore()

    function countVoted(positionKey: PositionKey, personKey: PersonKey): number {
        return ballots.flatMap(b => b.vote).filter(v => v.position == positionKey && v.person == personKey).length
    }

    function blankVotes(positionKey: PositionKey): number {
        const maxForPosition = positions.find(p => p.key == positionKey)!.max
        return ballots.flatMap(b => {
            const isInvalid = !!b.vote.find(v => v.position == positionKey && v.person == "invalid")
            if (isInvalid) {
                return 0
            } else {
                return maxForPosition - b.vote.filter(v => v.position == positionKey && v.person != "invalid").length
            }
        }).reduce((acc, val) => acc + val, 0)
    }

    return (
        <>
            <Grid container xs={12}>
                <Grid container xs={6}>
                    <ul>
                        {positions.map((position) => (
                            <li key={position.key}>
                                {position.title}
                                <ul>
                                    {position.persons.map((person) => (
                                        <li key={person.key}>
                                            {person.name} = {countVoted(position.key, person.key)}
                                        </li>
                                    ))}
                                    <li>
                                        Invalid = {countVoted(position.key, "invalid")}
                                    </li>
                                    <li>
                                        Blank = {blankVotes(position.key)}
                                    </li>
                                </ul>
                            </li>
                        ))}
                    </ul>
                </Grid>
                <Grid container xs={6} alignContent="flex-start">
                    <Grid item xs={6}>
                        Total Ballots:
                    </Grid>
                    <Grid item xs={6}>
                        {ballots.length}
                    </Grid>
                    <Grid item xs={6}>
                        Electoral divisor:
                    </Grid>
                    <Grid item xs={6}>
                        {ballots.length} ??
                    </Grid>
                    <Grid item xs={6}>
                        Total allowed voters:
                    </Grid>
                    <Grid item xs={6}>
                        {ballots.length} ??
                    </Grid>
                    <Grid item xs={6}>
                        Attendance:
                    </Grid>
                    <Grid item xs={6}>
                        {ballots.length} %
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}