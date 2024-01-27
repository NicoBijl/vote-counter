import {Button, Checkbox, FormControlLabel, Pagination} from "@mui/material";
import {PersonKey, PositionKey} from "../../types.ts";
import {ChangeEvent} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Paper from "@mui/material/Paper";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";

export function Votes() {
    const {ballots, currentBallotIndex, nextVote, previousVote, setVoteIndex, setBallotVote} = useBallotStore()
    const currentVote = useBallotStore(state => state.ballots.find(b => b.index == state.currentBallotIndex))
    const {positions} = usePositionsStore()

    function togglePerson(position: PositionKey, person: PersonKey, checked: boolean) {
        console.log("Toggle", position, person, currentVote)
        setBallotVote(currentBallotIndex, position, person, checked)
    }

    function handleVoteChange(_event: ChangeEvent<unknown>, pageNumber: number) {
        setVoteIndex(pageNumber - 1)
    }

    function isChecked(positionKey: PositionKey, personKey: PersonKey): boolean {
        return !!currentVote?.vote.find(v => v.position == positionKey && v.person == personKey)
    }

    function maxReached(positionKey: PositionKey): boolean {
        console.log("currentBallotIndex", currentBallotIndex)
        console.log("currentVote", currentVote)
        console.log("currentVote.vote", currentVote.vote)
        return currentVote.vote.filter(v => v.position == positionKey).length >= (positions.find(p => p.key == positionKey)!.max)
    }

    return <>
        <Paper sx={{p: 1}}>
            <Grid container spacing={1} alignItems={"stretch"}>
                <Grid item md sm={12}>
                    <Button variant="outlined" sx={{height: '100%', width: '100%'}}
                            aria-label="previous vote"
                            disabled={currentBallotIndex == 0}
                            onClick={previousVote}>
                        <KeyboardArrowLeftIcon/>
                    </Button>
                </Grid>
                <Grid item xs={10}>
                    <Grid item container>
                        <Grid item xs={12}>
                            <Typography variant="h2" sx={{textAlign: "center"}}>Vote:
                                # {currentBallotIndex + 1}</Typography>
                        </Grid>


                        {positions.map((position) =>
                            <Grid item xs={6} sm={4} key={position.key} marginBottom={2} marginTop={2}>
                                <Typography variant="h4">{position.title}</Typography>
                                <Typography variant="subtitle2">Max: {position.max}</Typography>
                                {position.persons.map((person) => (
                                    <Box key={person.key}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    onChange={(_event, checked) => togglePerson(position.key, person.key, checked)}
                                                    checked={isChecked(position.key, person.key)}
                                                    disabled={(maxReached(position.key) && !isChecked(position.key, person.key)) || isChecked(position.key, "invalid")}
                                                />
                                            }
                                            label={person.name}/>
                                    </Box>
                                ))}
                                <Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                onChange={(_event, checked) => togglePerson(position.key, "invalid", checked)}
                                                checked={isChecked(position.key, "invalid")}
                                            />
                                        }
                                        label="Invalid"/>
                                </Box>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button onClick={nextVote} variant="contained" color="primary" sx={{mt: 2, mb: 2}}>
                                Next Vote
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item md sm={12}>
                    <Button variant="outlined" sx={{height: '100%', width: '100%'}} aria-label="next vote"
                            onClick={nextVote}
                            disabled={currentBallotIndex == ballots.length - 1}>
                        <KeyboardArrowRightIcon/>
                    </Button>
                </Grid>

                <Grid item xs={12} alignContent="stretch">
                    <Pagination
                        count={Math.max(ballots.length, 1)}
                        color="primary"
                        page={currentBallotIndex + 1}
                        showFirstButton showLastButton
                        onChange={handleVoteChange}
                        siblingCount={3}
                        sx={{mt: 2, mb: 4, justifyContent: "center", display: "flex"}}
                    />
                </Grid>
            </Grid>


            {/*<ul>*/}
            {/*    {currentVote?.vote.map((vote, index) => (*/}
            {/*        <li key={"vote-" + index}>*/}
            {/*            vote : {vote.position} / {vote.person}*/}
            {/*        </li>*/}
            {/*    ))}*/}
            {/*</ul>*/}
        </Paper>
    </>;
}