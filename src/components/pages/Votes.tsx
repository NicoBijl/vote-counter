import {Button, Checkbox, FormControlLabel, Pagination} from "@mui/material";
import {Person, PersonKey, Position, PositionKey} from "../../types.ts";
import {ChangeEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Paper from "@mui/material/Paper";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {useHotkeys} from "react-hotkeys-hook";

export function Votes() {
    const {ballots, currentBallotIndex, nextVote, previousVote, setVoteIndex, setBallotVote} = useBallotStore()
    const currentVote = useBallotStore(state => state.ballots.find(b => b.index == state.currentBallotIndex))
    const {positions} = usePositionsStore()
    const [focusPosition, setFocusPosition] = useState<Position | null>(null)
    const [focusPerson, setFocusPerson] = useState<Person | null>(null)
    let tabIndex = 1000


    const positionsRefs = []
    for (const position of positions) {
        positionsRefs[position.key] = useRef();
        useHotkeys(position.title[0], () => changePositionFocus(position), {enableOnFormTags: true})
    }
    // setup hotkeys for numbers, when a position is focussed, the numbers will select the person by index.
    for (let i = 1; i <= 9; i++) {
        useHotkeys(`${i}`, () => {
                console.log("focused Position: ", focusPosition, i)
                toggleChecked(focusPosition!, focusPosition!.persons[i - 1].key);
            }, {enableOnFormTags: true}
        )
    }
    // invalid
    useHotkeys("i", () => {
            toggleChecked(focusPosition!, "invalid");
        }, {enableOnFormTags: true}
    )
    useHotkeys("ArrowRight", nextVote, {enableOnFormTags: true})
    useHotkeys("ArrowLeft", previousVote, {enableOnFormTags: true})

    function changePositionFocus(position: Position) {
        console.log('change focus to position with key: ', position.key)
        setFocusPosition(position)
    }

    function toggleChecked(position: Position, personKey: PersonKey) {
        console.log("Toggle", position, personKey, currentVote)
        if (personKey == "invalid" || isChecked(position.key, personKey) || !maxReached(position.key)) {
            setBallotVote(currentBallotIndex, position.key, personKey, !isChecked(position.key, personKey))
        }
    }

    function setChecked(position: PositionKey, person: PersonKey, checked: boolean) {
        console.log("Toggle to", position, person, currentVote, checked)
        setBallotVote(currentBallotIndex, position, person, checked)
    }

    function handleVoteChange(_event: ChangeEvent<unknown>, pageNumber: number) {
        setVoteIndex(pageNumber - 1)
    }

    function isChecked(positionKey: PositionKey, personKey: PersonKey): boolean {
        return !!currentVote?.vote.find(v => v.position == positionKey && v.person == personKey)
    }

    function maxReached(positionKey: PositionKey): boolean {
        return currentVote!.vote.filter(v => v.position == positionKey).length >= (positions.find(p => p.key == positionKey)!.max)
    }

    function getNextPositionTabIndex() {
        tabIndex = (Math.floor(tabIndex / 100) * 100) + 100
        return tabIndex;
    }

    function getNextPersonTabIndex() {
        tabIndex = tabIndex + 1
        return tabIndex;
    }


    return <>
        <Paper sx={{p: 1}} className={"vote"}>
            <Grid container spacing={1} alignItems={"stretch"}>
                <Grid item md sm={12}>
                    <Button variant="outlined" sx={{height: '100%', width: '100%'}}
                            aria-label="previous vote"
                            tabIndex={500}
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
                            <Grid item xs={6} sm={4} key={position.key} marginBottom={2} marginTop={2}
                                  tabIndex={getNextPositionTabIndex()}
                                  className={focusPosition == position ? "focus" : ""}
                                  ref={positionsRefs[position.key]}
                            >
                                <Typography variant="h4">{position.title}</Typography>
                                <Typography variant="subtitle2">Max: {position.max}</Typography>
                                {position.persons.map((person) => (
                                    <Box key={person.key}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    tabIndex={getNextPersonTabIndex()}
                                                    onChange={(_event, checked) => setChecked(position.key, person.key, checked)}
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
                                                tabIndex={getNextPersonTabIndex()}
                                                onChange={(_event, checked) => setChecked(position.key, "invalid", checked)}
                                                checked={isChecked(position.key, "invalid")}
                                            />
                                        }
                                        label="Invalid"/>
                                </Box>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button onClick={nextVote} variant="contained" color="primary" sx={{mt: 2, mb: 2}}
                                    tabIndex={2000}
                            >
                                Next Vote
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item md sm={12}>
                    <Button variant="outlined" tabIndex={3000} sx={{height: '100%', width: '100%'}}
                            aria-label="next vote"
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
        </Paper>
    </>;
}