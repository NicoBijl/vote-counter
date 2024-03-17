import {Button, Checkbox, Chip, FormControlLabel, Pagination} from "@mui/material";
import {PersonKey, Position, PositionKey} from "../../types.ts";
import {ChangeEvent, useEffect, useRef, useState} from "react";
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
    const positionRef = useRef<HTMLInputElement | null>(null);

    useHotkeys(position.title[0], () => changePositionFocus(position), {enableOnFormTags: true})

    useEffect(() => {
        if (focussed) {
            positionRef.current?.focus();
        }
    }, [focussed]);

    function onFocusPosition() {
        setFocusPosition(position);
    }

    function getNextPersonTabIndex() {
        tabIndex = tabIndex + 1
        return tabIndex;
    }

    function changePositionFocus(position: Position) {
        console.log('change focus to position with key: ', position.key)
        setFocusPosition(position)
        positionRef.current?.focus();
    }

    return <>
        <Grid item xs={6} sm={3} marginBottom={2} marginTop={2}
              tabIndex={tabIndex}
              onFocus={onFocusPosition}
              className={focussed ? "focus" : ""}
              ref={positionRef}
              sx={{padding: ".6rem", borderRadius: ".3rem"}}
        >
            <Grid justifyContent="space-between" alignItems="center" container>
                <Grid item xs><Typography variant="h4">
                    {position.title}
                </Typography></Grid>
                <Grid item xs={"auto"}>
                    <Chip label={position.title[0].toLowerCase()} variant="outlined"/>
                </Grid>

            </Grid>
            <Typography variant="subtitle2">Max: {position.max}</Typography>


            {position.persons.map((person, personIndex) => (
                <Grid justifyContent="space-between" alignItems="center" container key={person.key}>
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
                    {focussed &&
                        <Chip label={personIndex + 1} variant="outlined"/>
                    }
                </Grid>
            ))}
            <Grid justifyContent="space-between" alignItems="center" container>
                <FormControlLabel
                    control={
                        <Checkbox
                            tabIndex={getNextPersonTabIndex()}
                            onChange={(_event, checked) => setChecked(position.key, "invalid", checked)}
                            checked={isChecked(position.key, "invalid")}
                        />
                    }
                    label="Invalid"/>
                {focussed &&
                    <Chip label={'i'} variant="outlined"/>
                }
            </Grid>
        </Grid>
    </>;
}

export function Votes() {
    const {ballots, currentBallotIndex, nextVote, previousVote, setVoteIndex, setBallotVote} = useBallotStore()
    const currentVote = useBallotStore(state => state.ballots.find(b => b.index == state.currentBallotIndex))
    const {positions} = usePositionsStore()
    const [focusPosition, setFocusPosition] = useState<Position | null>(null)
    let tabIndex = 1000

    useEffect(() => {
        console.log("currentBallotIndex updated")
        setFocusPosition(positions[0]);
    }, [currentBallotIndex]);


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
                <Grid item xs="auto" sx={{minWidth: "75px", maxWidth: "150px"}}>
                    <Button variant="outlined" sx={{height: '100%', width: '100%'}}
                            aria-label="previous vote"
                            tabIndex={500}
                            disabled={currentBallotIndex == 0}
                            onClick={previousVote}>
                        <KeyboardArrowLeftIcon/>
                    </Button>
                </Grid>
                <Grid item xs>
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
                        <Grid item container xs={12} justifyContent="space-evenly">
                            <Button onClick={nextVote} variant="contained" color="primary" sx={{mt: 2, mb: 2}}
                                    tabIndex={2000}
                            >
                                Next Vote
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs="auto" sx={{minWidth: "75px", maxWidth: "150px"}}>
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