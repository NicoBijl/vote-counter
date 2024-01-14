import {useBallotStore, usePositions} from "../context.ts";
import Grid from "@mui/material/Grid";
import {PersonKey, PositionKey} from "../types.ts";
import Typography from "@mui/material/Typography";
import {Chip, ListItem, Tooltip} from "@mui/material";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";

export function Results() {
    const positions = usePositions()
    const {ballots} = useBallotStore()

    function calcElectoralDivisor(positionKey: PositionKey): string {
        const validVotes = ballots.flatMap(b => b.vote).filter(v => v.position == positionKey && v.person != "invalid").length
        return "roundUp((validVotes / positions * 0.8) + 0.6)" +
            "\n" +
            "Math.ceil((" + validVotes + " / " + positions.length + " * 0.8) + 0.6)"
    }

    function electoralDivisor(positionKey: PositionKey): number {
        const validVotes = ballots.flatMap(b => b.vote).filter(v => v.position == positionKey && v.person != "invalid").length
        return Math.ceil((validVotes / positions.length * 0.8) + 0.6)
    }

    function countVoted(positionKey: PositionKey, personKey: PersonKey): number {
        return ballots.flatMap(b => b.vote).filter(v => v.position == positionKey && v.person == personKey).length
    }

    function chipColor(positionKey: PositionKey, personKey: PersonKey) {
        if (countVoted(positionKey, personKey) >= electoralDivisor(positionKey)) {
            return 'success'
        } else {
            return 'default'
        }
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
            <Grid container>
                <Grid item container>
                    {positions.map((position) => (
                        <Grid item xs={6} sm={4} key={"votes-" + position.key}>
                            <Typography variant="h4">{position.title}</Typography>
                            <Typography variant="subtitle2">Max: {position.max}</Typography>
                            <List>
                                {position.persons.sort((p1, p2) => countVoted(position.key, p2.key) - countVoted(position.key, p1.key)).map((person) => (
                                    <ListItem disableGutters key={person.key}>
                                        <Chip label={countVoted(position.key, person.key)} variant="filled"
                                              color={chipColor(position.key, person.key)} sx={{mr: 2}}/>
                                        <ListItemText>{person.name}</ListItemText>
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                    ))}
                    {positions.map((position) => (
                        <Grid item xs={6} sm={4} key={"rest-" + position.key}>
                            <List>
                                <ListItem disableGutters>
                                    <Chip label={countVoted(position.key, "invalid")} variant="outlined" sx={{mr: 2}}/>
                                    Invalid
                                </ListItem>
                                <ListItem disableGutters>
                                    <Chip label={blankVotes(position.key)} variant="outlined" sx={{mr: 2}}/>
                                    Blank
                                </ListItem>
                                <Tooltip title={calcElectoralDivisor(position.key)} arrow placement="left">
                                    <ListItem disableGutters>
                                        <Chip label={electoralDivisor(position.key)} variant="outlined" sx={{mr: 2}}/>
                                        <span>Electoral Divisor</span>
                                    </ListItem>
                                </Tooltip>
                            </List>
                        </Grid>
                    ))}
                </Grid>
                <Grid container xs={6}>
                    <Grid item xs={6}>
                        Total Ballots:
                    </Grid>
                    <Grid item xs={6}>
                        {ballots.length}
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