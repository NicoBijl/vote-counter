import Grid from "@mui/material/Grid";
import {PersonKey, Position, PositionKey} from "../../types.ts";
import Typography from "@mui/material/Typography";
import {Alert, Chip, ListItem, Tooltip} from "@mui/material";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import {useSettingsStore} from "../../hooks/useSettingsStore.ts";
import Divider from "@mui/material/Divider";

export function Results() {
    const {positions} = usePositionsStore()
    const {ballots} = useBallotStore()
    const {electoralDivisorVariable, sortResultsByVoteCount} = useSettingsStore()

    function checksum(array: number[]) {
        // Sum the votes. Assuming 'votes' is an array of numbers
        // Apply a simple transformation, e.g., modulo to keep it within a certain range
        return array.reduce((acc, val, index) => acc + val * Math.pow(2, index), 0); // Adjust the modulo value as needed to control the checksum's size
    }

    function calcElectoralDivisor(position: Position): string {
        const persons = position.persons.length
        const validVotes = ballots.flatMap(b => b.vote).filter(v => v.position == position.key && v.person != "invalid").length
        return `Math.ceil(${validVotes} / ${persons} * ${electoralDivisorVariable})`
        // roundUp(validVotes / persons * ${electoralDivisorVariable})
        // (117+76+101+59 )/4*0.8 == 70.6 => 71
        // (84+73+116+156)/4*.8 == 85.8 => 71
        // (100+74+109+86+93+145)/6*.8 == 80.9333 => 81
        // (170+86)/2*.8 == 102.4 => 103
    }

    function electoralDivisor(position: Position): number {
        const persons = position.persons.length
        const validVotes = ballots.flatMap(b => b.vote).filter(v => v.position == position.key && v.person != "invalid").length
        return Math.ceil(validVotes / persons * electoralDivisorVariable)
    }

    function countVotesForPositions(positions: Position[]): number[] {
        return positions.flatMap(position => {
            const persons = position.persons ?? [];
            const votesPerPerson = persons.map(person => countVotes(position, person.key));
            return votesPerPerson.concat([countVotes(position, 'invalid')]);
        });
    }

    function positionChecksum(position: Position) {
        const votesPerPerson = countVotesForPositions([position]);
        console.log("positionChecksum", votesPerPerson, checksum(votesPerPerson));
        return checksum(votesPerPerson);
    }

    function totalChecksumByPositions() {
        const positionChecksums = positions.map(position => {
            return positionChecksum(position)
        });
        return checksum(positionChecksums);
    }

    function totalChecksum() {
        const allVotesCounted = countVotesForPositions(positions);
        console.log("totalChecksum", allVotesCounted, checksum(allVotesCounted));
        return checksum(allVotesCounted);
    }

    function countVotes(position: Position, personKey: PersonKey): number {
        const checked = ballots.flatMap(b => b.vote).filter(v => v.position == position.key && v.person == personKey).length
        return personKey == 'invalid' ? checked * position.max : checked;
    }

    function chipColor(position: Position, personKey: PersonKey) {
        if (countVotes(position, personKey) >= electoralDivisor(position)) {
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
            <Alert severity={"info"} sx={{mb: 2}}>
                This page displays the detailed results of the election. It shows each position along with the list of
                candidates and their respective vote counts. Additionally, the number of blank and invalid votes are
                clearly indicated. Candidates who have received more or equal votes than the electoral divisor are
                highlighted in green, signifying their leading status.
            </Alert>
            <Paper sx={{p: 2}}>
                <Grid container>
                    <Grid item container>
                        <Grid item container>
                            {positions.map((position) => (
                                <Grid item xs={6} sm={3} key={"votes-" + position.key}>
                                    <Typography variant="h4">{position.title}</Typography>
                                    <Typography variant="subtitle2">Max: {position.max}</Typography>
                                    <List>
                                        {position.persons.sort((p1, p2) => {
                                            if (!sortResultsByVoteCount) {
                                                return 0;
                                            }
                                            return countVotes(position, p2.key) - countVotes(position, p1.key);
                                        }).map((person) => (
                                            <ListItem disableGutters key={person.key}>
                                                <Chip label={countVotes(position, person.key)} variant="filled"
                                                      color={chipColor(position, person.key)} sx={{mr: 2}}/>
                                                <ListItemText>{person.name}</ListItemText>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            ))}
                        </Grid>
                        <Grid item container>
                            {positions.map((position) => (
                                <Grid item xs={6} sm={3} key={"rest-" + position.key}>
                                    <Divider variant={"middle"}></Divider>
                                    <List>
                                        <ListItem disableGutters>
                                            <Chip label={countVotes(position, "invalid")} variant="outlined"
                                                  sx={{mr: 2}}/>
                                            Invalid
                                        </ListItem>
                                        <ListItem disableGutters>
                                            <Chip label={blankVotes(position.key)} variant="outlined" sx={{mr: 2}}/>
                                            Blank
                                        </ListItem>
                                        <ListItem disableGutters>
                                            <Chip label={ballots.length * position.max} variant="outlined"
                                                  sx={{mr: 2}}/>
                                            Allowed Votes
                                        </ListItem>
                                        <Tooltip title={calcElectoralDivisor(position)} arrow
                                                 placement="bottom-start">
                                            <ListItem disableGutters>
                                                <Chip label={electoralDivisor(position)} variant="outlined"
                                                      sx={{mr: 2}}/>
                                                <span>Electoral Divisor</span>
                                            </ListItem>
                                        </Tooltip>
                                        <ListItem disableGutters>
                                            <Chip label={positionChecksum(position)} variant="outlined"
                                                  sx={{mr: 2}}/>
                                            Checksum
                                        </ListItem>
                                        <ListItem disableGutters>
                                            <Chip label={positionChecksum(position).toString(36)} variant="outlined"
                                                  sx={{mr: 2}}/>
                                            Hash
                                        </ListItem>
                                    </List>
                                </Grid>
                            ))}
                        </Grid>
                        <Grid item container sx={{pt: 4}}>
                            <List>
                                <ListItem>
                                    <Chip label={ballots.length} variant="outlined" sx={{mr: 2}}/>
                                    Total Ballots
                                </ListItem>
                                <ListItem>
                                    <Chip label={totalChecksumByPositions()} variant="outlined" color={"info"}
                                          sx={{mr: 2}}/>
                                    Total checksum (by positions)
                                </ListItem>
                                <ListItem>
                                    <Chip label={totalChecksum()} variant="outlined" sx={{mr: 2}}/>
                                    Total checksum
                                </ListItem>
                                <ListItem>
                                    <Chip label={totalChecksum().toString(36)} variant="outlined" sx={{mr: 2}}/>
                                    Hash
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}