import {Button, Checkbox, FormControlLabel, Pagination} from "@mui/material";
import {PersonKey, Position, PositionKey} from "../../types.ts";
import {ChangeEvent, useRef, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Paper from "@mui/material/Paper";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {useHotkeys} from "react-hotkeys-hook";

interface BallotPositionProps {
    position: Position,
    positionTabIndex: number,
    focussed: boolean,
    setFocusPosition: (position: Position) => void,
    isChecked: (positionKey: PositionKey, personKey: PersonKey) => boolean,
    setChecked: (position: PositionKey, person: PersonKey, checked: boolean) => void,
    maxReached: (positionKey: PositionKey) => boolean
}

export function BallotPosition({
                                   position,
                                   positionTabIndex,
                                   focussed,
                                   setFocusPosition,
                                   isChecked,
                                   setChecked,
                                   maxReached
                               }: BallotPositionProps) {
    let tabIndex = positionTabIndex
    const positionRef = useRef(null)

    useHotkeys(position.title[0], () => changePositionFocus(position), {enableOnFormTags: true})

    function getNextPersonTabIndex() {
        tabIndex = tabIndex + 1
        return tabIndex;
    }

    function changePositionFocus(position: Position) {
        console.log('change focus to position with key: ', position.key)
        setFocusPosition(position)
    }

    return <>
        <Grid item xs={6} sm={4} marginBottom={2} marginTop={2}
              tabIndex={tabIndex}
              className={focussed ? "focus" : ""}
              ref={positionRef}
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
    </>;
}

export function Votes() {
    const {ballots, currentBallotIndex, nextVote, previousVote, setVoteIndex, setBallotVote} = useBallotStore()
    const currentVote = useBallotStore(state => state.ballots.find(b => b.index == state.currentBallotIndex))
    const {positions} = usePositionsStore()
    const [focusPosition, setFocusPosition] = useState<Position | null>(null)
    let tabIndex = 1000


    // setup hotkeys for numbers, when a position is focussed, the numbers will select the person by index.
    for (let i = 1; i <= 9; i++) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
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
    useHotkeys("Enter", nextVote, {enableOnFormTags: true})
    useHotkeys("ArrowRight", nextVote, {enableOnFormTags: true})
    useHotkeys("ArrowLeft", previousVote, {enableOnFormTags: true})
    useHotkeys("Backspace", previousVote, {enableOnFormTags: true})

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
                            <BallotPosition key={position.key}
                                            position={position}
                                            positionTabIndex={getNextPositionTabIndex()}
                                            focussed={focusPosition?.key === position.key}
                                            setFocusPosition={(position) => {
                                                setFocusPosition(position)
                                            }}
                                            isChecked={isChecked}
                                            setChecked={setChecked}
                                            maxReached={maxReached}
                            ></BallotPosition>
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