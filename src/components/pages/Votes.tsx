import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Pagination,
    Snackbar,
    Tooltip
} from "@mui/material";
import { Alert } from "@mui/material";
import { PersonKey, Position, PositionKey } from "../../types.ts";
import { ChangeEvent, useEffect, useRef, useState, useOptimistic, useTransition } from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Paper from "@mui/material/Paper";
import { useBallotStore } from "../../hooks/useBallotStore.ts";
import { usePositionsStore } from "../../hooks/usePositionsStore.ts";
import { useHotkeys } from "react-hotkeys-hook";
import { useParams, useNavigate } from 'react-router-dom';  

export interface BallotPositionProps {
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
    const positionRef = useRef<HTMLInputElement | null>(null);

    function changePositionFocus(position: Position) {
        console.log('change focus to position with key: ', position.key)
        setFocusPosition(position)
        positionRef.current?.focus();
    }

    useHotkeys(position.title[0], () => changePositionFocus(position), { enableOnFormTags: true })

    useEffect(() => {
        if (focussed) {
            positionRef.current?.focus();
        }
    }, [focussed]);

    function onFocusPosition() {
        setFocusPosition(position);
    }

    return <>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{
            mb: 2,
            mt: 2,
            padding: ".6rem",
            borderRadius: ".3rem",
            "&.focus:focus-visible": {
                outline: "2px solid #1976d2",
                backgroundColor: "rgba(25, 118, 210, 0.04)"
            },
            "& .focus-indicator": {
                display: "none"
            },
            "&.focus:focus-visible .focus-indicator": {
                display: "inline-flex"
            },
            "&:not(:focus-visible)": {
                outline: "none",
                backgroundColor: "transparent"
            }
        }}
            tabIndex={positionTabIndex}
            onFocus={onFocusPosition}
            className={focussed ? "focus" : ""}
            ref={positionRef}
        >
            <Grid alignItems="center" container>
                <Grid size={2}>
                    <Chip label={position.title[0].toLowerCase()} variant="outlined" className="focus-indicator" />
                </Grid>
                <Grid size="grow"><Typography variant="h4">
                    {position.title}
                </Typography></Grid>
            </Grid>
            <Grid alignItems="center" container>
                <Grid size={2}></Grid>
                <Grid size="auto">
                    <Typography variant="subtitle2">Max votes per ballot: {position.maxVotesPerBallot}</Typography>
                </Grid>
            </Grid>

            {position.persons.map((person, personIndex) => (
                <Grid container key={person.key}>
                    <Grid size={2}>
                        <Chip label={personIndex + 1} variant="outlined" className="focus-indicator" />
                    </Grid>
                    <Grid size="auto">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    tabIndex={positionTabIndex + personIndex + 1}
                                    onChange={(_event, checked) => setChecked(position.key, person.key, checked)}
                                    checked={isChecked(position.key, person.key)}
                                    disabled={(maxReached(position.key) && !isChecked(position.key, person.key)) || isChecked(position.key, "invalid")}
                                />
                            }
                            label={person.name} />
                    </Grid>
                </Grid>
            ))}
            <Grid container>
                <Grid size={2}>
                    <Chip label={'i'} variant="outlined" className="focus-indicator" />
                </Grid>
                <Grid size="auto">
                    <FormControlLabel
                        control={
                            <Checkbox color={"error"}
                                tabIndex={positionTabIndex + position.persons.length + 1}
                                onChange={(_event, checked) => setChecked(position.key, "invalid", checked)}
                                checked={isChecked(position.key, "invalid")}
                            />
                        }
                        label="Invalid" />
                </Grid>
            </Grid>
        </Grid>
    </>;
}

export function Votes() {
    const { voteIndex } = useParams();              
    const navigate = useNavigate();         

    const {
        ballots,
        removeBallot,
        nextVote,
        setBallotVote
    } = useBallotStore()
    
    const currentBallotIndex = voteIndex ? Math.max(0, parseInt(voteIndex, 10) - 1) : 0;
    
    const storeBallots = useBallotStore(state => state.ballots)
    const { positions } = usePositionsStore()
    const [focusPosition, setFocusPosition] = useState<Position | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const [optimisticBallots, setOptimisticBallots] = useOptimistic(
        storeBallots
    );

    const currentVote = optimisticBallots.find(b => b.index == currentBallotIndex)

    // Sync URL param: handle missing or invalid voteIndex
    useEffect(() => {
        if (!voteIndex) {
            navigate('/votes/1', { replace: true });
            return;
        }

        const urlIndex = parseInt(voteIndex, 10);
        if (isNaN(urlIndex) || urlIndex < 1) {
            navigate('/votes/1', { replace: true });
            return;
        }

        const maxIndex = ballots.length;
        if (urlIndex > maxIndex) {
            navigate(`/votes/${maxIndex}`, { replace: true });
        }
    }, [voteIndex, ballots.length, navigate]);

    function focusPreviousPosition() {
        if (focusPosition) {
            const updatedIndex = Math.max(positions.indexOf(focusPosition) - 1, 0)
            setFocusPosition(positions[updatedIndex]);
        }
    }

    function focusNextPosition() {
        if (focusPosition) {
            const updatedIndex = Math.min(positions.indexOf(focusPosition) + 1, positions.length - 1)
            setFocusPosition(positions[updatedIndex]);
        }
    }
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFocusPosition(prev => {
           
            if (prev?.key === positions[0]?.key) return prev;
            return positions[0];
        });

        if (isDialogOpen) {
            setIsDialogOpen(false);
        }
    }, [currentBallotIndex, positions, isDialogOpen]);

    function isChecked(positionKey: PositionKey, personKey: PersonKey): boolean {
        return !!currentVote?.vote.find(v => v.position == positionKey && v.person == personKey)
    }

    function maxReached(positionKey: PositionKey): boolean {
        return currentVote!.vote.filter(v => v.position == positionKey).length >= (positions.find(p => p.key == positionKey)!.maxVotesPerBallot)
    }

    function toggleChecked(position: Position, personKey: PersonKey) {
        if (personKey == "invalid" || isChecked(position.key, personKey) || !maxReached(position.key)) {
            const newChecked = !isChecked(position.key, personKey);
            
            startTransition(async () => {
                try {
                    const updatedBallots = optimisticBallots.map(ballot => {
                        if (ballot.index !== currentBallotIndex) return ballot;
                        
                        let newVote;
                        if (personKey == "invalid" && newChecked) {
                            newVote = ballot.vote.filter(v => v.position !== position.key)
                                .concat([{ position: position.key, person: personKey }]);
                        } else if (newChecked) {
                            newVote = ballot.vote
                                .filter(v => v.position !== position.key || v.person !== "invalid")
                                .concat([{ position: position.key, person: personKey }]);
                        } else {
                            newVote = ballot.vote.filter(v => !(v.position === position.key && v.person === personKey));
                        }
                        
                        return { ...ballot, vote: newVote };
                    });
                    
                    setOptimisticBallots(updatedBallots);
                    setBallotVote(currentBallotIndex, position.key, personKey, newChecked);
                } catch (error) {
                    setErrorMessage(`Failed to update vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            });
        }
    }

    function setChecked(position: PositionKey, person: PersonKey, checked: boolean) {
        startTransition(async () => {
            try {
                const updatedBallots = optimisticBallots.map(ballot => {
                    if (ballot.index !== currentBallotIndex) return ballot;
                    
                    let newVote;
                    if (person == "invalid" && checked) {
                        newVote = ballot.vote.filter(v => v.position !== position)
                            .concat([{ position, person }]);
                    } else if (checked) {
                        newVote = ballot.vote
                            .filter(v => v.position !== position || v.person !== "invalid")
                            .concat([{ position, person }]);
                    } else {
                        newVote = ballot.vote.filter(v => !(v.position === position && v.person === person));
                    }
                    
                    return { ...ballot, vote: newVote };
                });
                
                setOptimisticBallots(updatedBallots);
                setBallotVote(currentBallotIndex, position, person, checked);
            } catch (error) {
                setErrorMessage(`Failed to update vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }

    function handleVoteChange(_event: ChangeEvent<unknown>, pageNumber: number) {
        navigate(`/votes/${pageNumber}`);
    }

    function handleDialogClose() {
        setIsDialogOpen(false)
    }

   
    function remove() {
        if (!currentVote) return;
        
        startTransition(async () => {
            try {
                const updatedBallots = optimisticBallots
                    .filter(b => b.index !== currentVote.index)
                    .map((b, idx) => ({ ...b, index: idx }));
                
                setOptimisticBallots(updatedBallots);
                removeBallot(currentVote);
                
                const newIndex = Math.max(0, Math.min(currentBallotIndex, updatedBallots.length - 1));
                navigate(`/votes/${newIndex + 1}`);
                setIsDialogOpen(false);
            } catch (error) {
                setErrorMessage(`Failed to remove ballot: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }

    function openRemoveConfirmationDialog() {
        if (currentBallotIndex == 0) {
            return 
        }
        setIsDialogOpen(true);
    }

    const handleNextVote = () => {
        const nextIndex = currentBallotIndex + 2; 
        if (nextIndex <= optimisticBallots.length) {
            navigate(`/votes/${nextIndex}`);
        } else {
            startTransition(async () => {
                try {
                    const updatedBallots = [...optimisticBallots, {
                        index: optimisticBallots.length,
                        vote: []
                    }];
                    setOptimisticBallots(updatedBallots);
                    nextVote(currentBallotIndex);
                    navigate(`/votes/${nextIndex}`);
                } catch (error) {
                    setErrorMessage(`Failed to create new ballot: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            });
        }
    };

    const handlePreviousVote = () => {
        const prevIndex = currentBallotIndex; 
        if (prevIndex >= 1) {
            navigate(`/votes/${prevIndex}`);
        }
    };

    
    useHotkeys('1,2,3,4,5,6,7,8,9', (event) => {
        const index = parseInt(event.key) - 1;
        if (focusPosition && focusPosition.persons[index]) {
            console.log("focused Position: ", focusPosition, index + 1)
            toggleChecked(focusPosition, focusPosition.persons[index].key);
        }
    }, { enableOnFormTags: true })
    useHotkeys("i", () => {
        if (focusPosition) {
            toggleChecked(focusPosition, "invalid");
        }
    }, { enableOnFormTags: true })
    useHotkeys("n", handleNextVote, { enableOnFormTags: true })               
    useHotkeys("ArrowUp", handlePreviousVote, { enableOnFormTags: true })         
    useHotkeys("ArrowDown", () => {
        if (currentBallotIndex !== ballots.length - 1) {
            handleNextVote();                                                     
    }
    }, { enableOnFormTags: true })
    useHotkeys("ArrowLeft", focusPreviousPosition, { enableOnFormTags: true })
    useHotkeys("ArrowRight", focusNextPosition, { enableOnFormTags: true })
    useHotkeys("Backspace", openRemoveConfirmationDialog, { enableOnFormTags: true })
    useHotkeys("Escape", () => {
        setIsDialogOpen(false);
    }, { enableOnFormTags: true }
    )

    return <>
        <Snackbar
            open={!!errorMessage}
            autoHideDuration={6000}
            onClose={() => setErrorMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert severity="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
            </Alert>
        </Snackbar>
        <Paper sx={{ p: 1 }} className={"vote"}>
            <Dialog
                open={isDialogOpen}
                onClose={handleDialogClose}
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure you want to remove this ballot?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Removing this ballot can't be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={remove} color={"error"} autoFocus id="confirm-remove-button">
                        Remove Ballot
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container spacing={1} alignItems={"stretch"}>
                <Grid size="auto" sx={{ display: { lg: 'none', xl: 'block' }, maxWidth: "150px" }}>
                    <Tooltip title="Previous vote (Up arrow)">
                        <span>
                            <Button variant="outlined" sx={{ height: '100%', width: '100%' }}
                                aria-label="previous vote"
                                tabIndex={500}
                                disabled={currentBallotIndex == 0}
                                onClick={handlePreviousVote}>          
                                <KeyboardArrowLeftIcon />
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid size="grow">
                    <Grid container>
                        <Grid size={12}>
                            <Box sx={{ textAlign: "center", position: 'relative', display: 'inline-block', width: '100%' }}>
                                <Typography variant="h2" component="span">
                                    Vote: # {currentBallotIndex + 1}
                                </Typography>
                                {isPending && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(calc(100% + 8px), -50%)' }} />}
                            </Box>
                        </Grid>

                        {positions.map((position, index) =>
                            <BallotPosition key={position.key}
                                position={position}
                                positionTabIndex={1100 + (index * 100)}
                                focussed={focusPosition?.key === position.key}
                                setFocusPosition={(position) => {
                                    setFocusPosition(position)
                                }}
                                isChecked={isChecked}
                                setChecked={setChecked}
                                maxReached={maxReached}
                            ></BallotPosition>
                        )}
                        <Grid container size={12} justifyContent="space-evenly">
                            <Tooltip title="Next ballot (N)">

                                <Button onClick={handleNextVote} variant="contained" color="primary" sx={{ mt: 2, mb: 2 }} tabIndex={2000}>
                                    Next Ballot
                                </Button>
                            </Tooltip>
                            <Tooltip title="Remove ballot (Backspace)">
                                <span>
                                    <Button disabled={currentBallotIndex == 0}
                                        onClick={remove}
                                        variant="outlined" color="error"
                                        sx={{ mt: 2, mb: 2 }}
                                        tabIndex={2000}
                                        id="remove-ballot-button"
                                    >
                                        Remove Ballot
                                    </Button>
                                </span>
                            </Tooltip>

                        </Grid>
                    </Grid>
                </Grid>
                <Grid size="auto" sx={{ display: { lg: 'none', xl: 'block' }, maxWidth: "150px" }}>
                    <Tooltip title="Next vote (Down arrow or N)">
                        <span>
                            <Button variant="outlined" tabIndex={3000} sx={{ height: '100%', width: '100%' }}
                                aria-label="next vote"
                                onClick={handleNextVote}
                                disabled={currentBallotIndex == optimisticBallots.length - 1}>
                            
                                <KeyboardArrowRightIcon />
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>

                <Grid size={12} sx={{ alignContent: "stretch" }}>
                    <Pagination
                        count={Math.max(optimisticBallots.length, 1)}
                        color="primary"
                        page={currentBallotIndex + 1}
                        showFirstButton showLastButton
                        onChange={handleVoteChange}
                        siblingCount={3}
                        sx={{ mt: 2, mb: 4, justifyContent: "center", display: "flex" }}
                    />

                </Grid>
            </Grid>
        </Paper>
    </>;
}
