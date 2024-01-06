import {Ballot, createNewBallot, usePositions, useVoteStore} from "../context.ts";
import {Button, Checkbox, FormControl, FormControlLabel, Pagination, Stack} from "@mui/material";
import {Person, PersonKey, Position, PositionKey} from "../types.ts";
import {ChangeEvent, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export function Votes() {
    const {votes, currentVoteIndex, nextVote, previousVote, setVoteIndex, setBallotVote} = useVoteStore()
    const currentVote = useVoteStore(state => state.votes.find(b => b.index == state.currentVoteIndex)!)
    const positions = usePositions()

    function togglePerson(position: Position, person: Person, checked: boolean) {
        console.log("Toggle", position.key, person.key, currentVote)
        setBallotVote(currentVoteIndex, position.key, person.key, checked)
    }

    function handleVoteChange(_event: ChangeEvent<unknown>, pageNumber: number) {
        setVoteIndex(pageNumber - 1)
    }

    function isChecked(positionKey: PositionKey, personKey: PersonKey): boolean {
        return currentVote?.vote.find(v => v.position == positionKey && v.person == personKey)?.checked ?? false
    }

    return <>
        <FormControl>
            <Grid container alignItems={"stretch"}>
                <Grid item xs={1} sx={{pr: 4}}>
                    <Button variant="outlined" sx={{height: '100%', width: '100%'}}
                            aria-label="previous vote"
                            disabled={currentVoteIndex==0}
                            onClick={previousVote}>
                        <KeyboardArrowLeftIcon/>
                    </Button>
                </Grid>
                <Grid item xs={10}>
                    <Grid item container>
                        <Grid item xs={12}>
                            <Typography variant="h3">Vote: {currentVoteIndex}</Typography>
                        </Grid>


                        {positions.map((position, positionIndex) =>
                            <Grid item xs={6} sm={4} key={position.key} marginBottom={2} marginTop={2}>
                                <Typography variant="h4">{position.title}</Typography>
                                {position.persons.map((person) => (
                                    <Box key={person.key}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    onChange={(_event, checked) => togglePerson(position, person, checked)}
                                                    checked={isChecked(position.key, person.key)}
                                                />
                                            }
                                            label={person.name}/>
                                    </Box>
                                ))}
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button onClick={nextVote} variant="contained" color="primary" sx={{mt: 2, mb: 2}}>Next
                                Vote</Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={1} sx={{pl: 4}}>
                    <Button variant="outlined" sx={{height: '100%', width: '100%'}} aria-label="next vote"
                            onClick={nextVote}>
                        <KeyboardArrowRightIcon/>
                    </Button>
                </Grid>

                <Grid item xs={12} alignContent="stretch">
                    <Pagination
                        count={Math.max(votes.length, 1)}
                        color="primary"
                        page={currentVoteIndex + 1}
                        showFirstButton showLastButton
                        onChange={handleVoteChange}
                        siblingCount={3}
                        sx={{mt: 2, mb: 4, justifyContent: "center", display: "flex"}}
                    />
                </Grid>
            </Grid>

        </FormControl>


        <ul>
            {currentVote?.vote.map((vote, index) => (
                <li key={"vote-" + index}>
                    vote : {vote.position} / {vote.person} = {vote.checked ? "yes" : "no"}
                </li>
            ))}
        </ul>
    </>;
}