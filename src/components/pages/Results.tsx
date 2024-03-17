import Grid from "@mui/material/Grid";
import {PersonKey, PositionKey} from "../../types.ts";
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
    const {electoralDivisorVariable} = useSettingsStore()

    function calcElectoralDivisor(positionKey: PositionKey): string {
        const persons = positions.find(p => p.key == positionKey)!.persons.length
        const validVotes = ballots.flatMap(b => b.vote).filter(v => v.position == positionKey && v.person != "invalid").length
        return `Math.ceil(${validVotes} / ${persons} * ${electoralDivisorVariable})`
        // roundUp(validVotes / persons * ${electoralDivisorVariable})
        // (117+76+101+59 )/4*0.8 == 70.6 => 71
        // (84+73+116+156)/4*.8 == 85.8 => 71
        // (100+74+109+86+93+145)/6*.8 == 80.9333 => 81
        // (170+86)/2*.8 == 102.4 => 103
    }

    function electoralDivisor(positionKey: PositionKey): number {
        const persons = positions.find(p => p.key == positionKey)!.persons.length
        const validVotes = ballots.flatMap(b => b.vote).filter(v => v.position == positionKey && v.person != "invalid").length
        return Math.ceil(validVotes / persons * electoralDivisorVariable)
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
                        </Grid>
                        <Grid item container>

                            {positions.map((position) => (
                                <Grid item xs={6} sm={3} key={"rest-" + position.key}>
                                    <Divider variant={"middle"}></Divider>
                                    <List>
                                        <ListItem disableGutters>
                                            <Chip label={countVoted(position.key, "inva stringlid")} variant="outlined"
                                                  sx={{mr: 2}}/>
                                            Invalid
                                        </ListItem>
                                        <ListItem disableGutters>
                                            <Chip label={blankVotes(position.key)} variant="outlined" sx={{mr: 2}}/>
                                            Blank
                                        </ListItem>
                                        <Tooltip title={calcElectoralDivisor(position.key)} arrow
                                                 placement="bottom-start">
                                            <ListItem disableGutters>
                                                <Chip label={electoralDivisor(position.key)} variant="outlined"
                                                      sx={{mr: 2}}/>
                                                <span>Electoral Divisor</span>
                                            </ListItem>
                                        </Tooltip>
                                    </List>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}