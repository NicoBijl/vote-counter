import Typography from "@mui/material/Typography";
import {Alert, Button, Card, CircularProgress, FormControlLabel, Snackbar, Stack, Switch, TextField} from "@mui/material";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import DownloadIcon from '@mui/icons-material/Download';
import DangerousIcon from '@mui/icons-material/Dangerous';
import UploadIcon from '@mui/icons-material/Upload';
import {useCallback, useRef, useState, useTransition, useActionState} from "react";
import {Ballot, isBallot, isPosition, Position} from "../../types.ts";
import {convertLegacyPositions, LegacyPosition} from "../../utils/positionUtils";
import {useSettingsStore} from "../../hooks/useSettingsStore.ts";


export function Settings() {
    const {positions, setPositions} = usePositionsStore()
    const {ballots, removeAllBallots, importBallots} = useBallotStore()
    const {
        electoralDivisorVariable,
        setElectoralDivisorVariable,
        sortResultsByVoteCount,
        setSortResultsByVoteCount,
        totalAllowedVoters,
        setTotalAllowedVoters
    } = useSettingsStore()
    const importVotesFile = useRef<HTMLInputElement | null>(null);
    const importPositionsFile = useRef<HTMLInputElement | null>(null);
    const [importPositionsConfirmDialogOpen, setDialogOpen] = useState(false)
    const [importVotesConfirmDialogOpen, setVotesDialogOpen] = useState(false)
    const [positionUploadTime, setPositionsUploadTime] = useState<Date | null>(null)
    const [votesUploadTime, setVotesUploadTime] = useState<Date | null>(null)
    const [, setUploadError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [debouncedElectoralDivisor, setDebouncedElectoralDivisor] = useState(electoralDivisorVariable)
    const [debouncedTotalVoters, setDebouncedTotalVoters] = useState(totalAllowedVoters)

    const downloadFile = useCallback((value: object, fileName: string) => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(value)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const d = new Date()
        link.download = `vote-counter-${fileName}-${d.toISOString()}.json`;
        link.click();
    }, []);

    const exportVotes = useCallback(() => {
        downloadFile(ballots, 'ballots');
    }, [ballots, downloadFile]);

    const removeAllVotes = useCallback(() => {
        startTransition(() => {
            removeAllBallots();
        });
    }, [removeAllBallots]);

    const exportPositions = useCallback(() => {
        downloadFile(positions, 'positions');
    }, [positions, downloadFile]);

    const openFileChooserPositions = () => {
        importPositionsFile.current?.click()
    }

    const openFileChooserVotes = () => {
        importVotesFile.current?.click()
    }

    const handleElectoralDivisorChange = (value: number) => {
        setDebouncedElectoralDivisor(value);
        startTransition(() => {
            setElectoralDivisorVariable(value);
        });
    };

    const handleTotalVotersChange = (value: number) => {
        setDebouncedTotalVoters(value);
        startTransition(() => {
            setTotalAllowedVoters(value);
        });
    };

    const handleSortToggle = (checked: boolean) => {
        startTransition(() => {
            setSortResultsByVoteCount(checked);
        });
    };

    type FileImportState = {
        success: boolean;
        error: string | null;
        fileType: 'positions' | 'votes' | null;
    };

    const [positionsImportState, importPositionsAction, isPositionsImporting] = useActionState<
        FileImportState,
        { fileContent: string; fileName: string }
    >(async (_prevState, formData) => {
        const fileContent = formData.fileContent;
        
        try {
            const jsonObjects = JSON.parse(fileContent) as object[];
            if (!Array.isArray(jsonObjects)) {
                return { success: false, error: "File content is not an array", fileType: 'positions' };
            }

            if (jsonObjects.every(v => isPosition(v))) {
                const positionsInput = jsonObjects as Position[];
                setPositions(positionsInput);
            } else {
                const convertedPositions = convertLegacyPositions(jsonObjects as LegacyPosition[]);
                setPositions(convertedPositions);
            }

            importPositionsFile.current!.value = "";
            return { success: true, error: null, fileType: 'positions' };
        } catch (error) {
            return { 
                success: false, 
                error: `Failed to parse positions: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                fileType: 'positions' 
            };
        }
    }, { success: false, error: null, fileType: null });

    const [votesImportState, importVotesAction, isVotesImporting] = useActionState<
        FileImportState,
        { fileContent: string }
    >(async (_prevState, formData) => {
        try {
            const jsonObjects = JSON.parse(formData.fileContent) as object[];
            if (!Array.isArray(jsonObjects)) {
                return { success: false, error: "File content is not an array", fileType: 'votes' };
            }

            if (jsonObjects.every(v => isBallot(v))) {
                const ballotsInput = jsonObjects as Ballot[];
                importBallots(ballotsInput);
                importVotesFile.current!.value = "";
                return { success: true, error: null, fileType: 'votes' };
            } else {
                return { success: false, error: "Invalid ballot format", fileType: 'votes' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: `Failed to parse ballots: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                fileType: 'votes' 
            };
        }
    }, { success: false, error: null, fileType: null });

    const onPositionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileName = files[0].name;
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            const fileContent = event.target?.result;
            if (typeof fileContent === "string") {
                startTransition(() => {
                    importPositionsAction({ fileContent, fileName });
                });
                setDialogOpen(true);
                setPositionsUploadTime(new Date());
            }
        };
        fileReader.readAsText(files[0], "UTF-8");
    };

    const onVotesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            const fileContent = event.target?.result;
            if (typeof fileContent === "string") {
                startTransition(() => {
                    importVotesAction({ fileContent });
                });
                setVotesDialogOpen(true);
                setVotesUploadTime(new Date());
            }
        };
        fileReader.readAsText(files[0], "UTF-8");
    };



    return (
        <>
            <Snackbar
                open={importPositionsConfirmDialogOpen && !positionsImportState.error}
                autoHideDuration={6000}
                onClose={() => setDialogOpen(false)}
                message={"Positions successfully imported at " + positionUploadTime?.toLocaleTimeString()}
            />
            <Snackbar
                open={importVotesConfirmDialogOpen && !votesImportState.error}
                autoHideDuration={6000}
                onClose={() => setVotesDialogOpen(false)}
                message={"Votes successfully imported at " + votesUploadTime?.toLocaleTimeString()}
            />
            <Snackbar
                open={!!positionsImportState.error || !!votesImportState.error}
                autoHideDuration={6000}
                onClose={() => setUploadError(null)}
            >
                <Alert severity="error">
                    {positionsImportState.error || votesImportState.error}
                </Alert>
            </Snackbar>
            <Stack spacing={2}>
                <Card sx={{p: 2}}>
                    <Stack spacing={2}>
                        <Typography variant={"h4"}>Positions</Typography>

                        <Alert severity={"warning"}>
                            Please update position keys only before vote registration. Changes made afterwards may
                            lead to malfunctions.
                        </Alert>
                        <Button startIcon={<DownloadIcon/>} onClick={exportPositions}>Export Positions</Button>
                        <Button 
                            startIcon={isPositionsImporting ? <CircularProgress size={20} color="inherit" /> : <UploadIcon/>} 
                            onClick={openFileChooserPositions}
                            disabled={isPositionsImporting}
                        >
                            {isPositionsImporting ? 'Importing...' : 'Import Positions'}
                        </Button>
                        <input type='file' id='importPositions' ref={importPositionsFile}
                               style={{display: 'none'}}
                               onChange={onPositionsFileChange}
                        />
                    </Stack>
                </Card>
                <Card sx={{p: 2}}>
                    <Stack spacing={2}>
                        <Typography variant={"h4"}>Votes</Typography>
                        <Button startIcon={<DownloadIcon/>} onClick={exportVotes}>Export Votes</Button>
                        <Button 
                            startIcon={isVotesImporting ? <CircularProgress size={20} color="inherit" /> : <UploadIcon/>} 
                            onClick={openFileChooserVotes}
                            disabled={isVotesImporting}
                        >
                            {isVotesImporting ? 'Importing...' : 'Import Votes'}
                        </Button>
                        <Button 
                            color={"error"} 
                            startIcon={<DangerousIcon/>} 
                            onClick={removeAllVotes}
                            disabled={isPending}
                        >
                            Remove all votes
                        </Button>
                        <input type='file' id='importVotes' ref={importVotesFile} 
                               style={{display: 'none'}}
                               onChange={onVotesFileChange}/>
                    </Stack>
                </Card>
                <Card sx={{p: 2}}>
                    <Stack spacing={2}>
                        <Typography variant={"h4"}>Results</Typography>

                        <FormControlLabel control={
                            <Switch 
                                defaultChecked={sortResultsByVoteCount}
                                onChange={(_, checked) => handleSortToggle(checked)}
                                disabled={isPending}
                            />
                        } label="Sort results by vote count"/>


                        <TextField 
                            inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
                            label="Electoral Divisor"
                            value={debouncedElectoralDivisor}
                            onChange={(e) => {
                                const value = Number(e.target.value) || 0;
                                if (value != 0) {
                                    handleElectoralDivisorChange(value);
                                }
                            }}
                            disabled={isPending}
                            helperText={isPending ? "Updating..." : ""}
                        />

                        <TextField
                            inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
                            label="Total Allowed Voters"
                            value={debouncedTotalVoters}
                            onChange={(e) => {
                                const value = Number(e.target.value) || 0;
                                handleTotalVotersChange(value);
                            }}
                            disabled={isPending}
                            helperText={isPending ? "Updating..." : "Set this to calculate attendance ratio"}
                        />
                    </Stack>
                </Card>

            </Stack>
        </>
    );
}
