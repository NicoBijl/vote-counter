import Typography from "@mui/material/Typography";
import {Alert, Button, Card, FormControlLabel, Snackbar, Stack, Switch, TextField} from "@mui/material";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import DownloadIcon from '@mui/icons-material/Download';
import DangerousIcon from '@mui/icons-material/Dangerous';
import UploadIcon from '@mui/icons-material/Upload';
import {useRef, useState} from "react";
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
    const [uploadError, setUploadError] = useState<string | null>(null)


    function downloadFile(value: object, fileName: string) {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(value)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const d = new Date()
        link.download = `vote-counter-${fileName}-${d.toISOString()}.json`;
        link.click();
    }

    const exportVotes = () => {
        downloadFile(ballots, 'ballots');
    };
    const removeAllVotes = () => {
        removeAllBallots();
    }
    const exportPositions = () => {
        downloadFile(positions, 'positions');
    };

    const openFileChooserPositions = () => {
        console.log("file ", importPositionsFile?.current)
        importPositionsFile.current?.click()
    }

    const openFileChooserVotes = () => {
        console.log("file ", importVotesFile?.current)
        importVotesFile.current?.click()
    }
    const onPositionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const fileReader = new FileReader()
        fileReader.readAsText(e.target.files[0], "UTF-8")
        fileReader.onload = e => {
            console.log('e.target.result', e?.target?.result)
            const fileContent = e?.target?.result
            if (typeof fileContent === "string") {
                const jsonObjects = JSON.parse(fileContent) as object[]
                if (!Array.isArray(jsonObjects)) {
                    console.log("File content is not an array!")
                    setUploadError("Uploaded file must contain an array of positions")
                    return;
                }

                try {
                    // Try parsing as new format first
                    if (jsonObjects.every(v => isPosition(v))) {
                        const positionsInput = jsonObjects as Position[]
                        console.log("Uploaded positions in new format", positionsInput)
                        setPositions(positionsInput)
                    } else {
                        // Try converting from legacy format
                        const convertedPositions = convertLegacyPositions(jsonObjects as LegacyPosition[]);
                        console.log("Converted positions from legacy format", convertedPositions)
                        setPositions(convertedPositions)
                    }

                    importPositionsFile.current!.value = ""
                    setDialogOpen(true)
                    setPositionsUploadTime(new Date())
                    setUploadError(null)
                } catch (error) {
                    console.log("Failed to parse positions in any format!", error)
                    setUploadError("Failed to parse positions. Please check the file format.")
                }


            } else {
                console.log("other file content", typeof fileContent)
            }
        }
    }


    const onVotesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const fileReader = new FileReader()
        fileReader.readAsText(e.target.files[0], "UTF-8")
        fileReader.onload = e => {
            console.log('e.target.result', e?.target?.result)
            const fileContent = e?.target?.result
            if (typeof fileContent === "string") {
                try {
                    const jsonObjects = JSON.parse(fileContent) as object[]
                    if (!Array.isArray(jsonObjects)) {
                        console.log("File content is not an array!")
                        setUploadError("Uploaded file must contain an array of ballots")
                        return;
                    }

                    // Validate ballots
                    if (jsonObjects.every(v => isBallot(v))) {
                        const ballotsInput = jsonObjects as Ballot[]
                        console.log("Uploaded ballots", ballotsInput)

                        // Set the imported ballots in the store
                        importBallots(ballotsInput);

                        importVotesFile.current!.value = ""
                        setVotesDialogOpen(true)
                        setVotesUploadTime(new Date())
                        setUploadError(null)
                    } else {
                        console.log("Invalid ballot format")
                        setUploadError("Invalid ballot format. Please check the file structure.")
                    }
                } catch (error) {
                    console.log("Failed to parse ballots!", error)
                    setUploadError("Failed to parse ballots. Please check the file format.")
                }
            } else {
                console.log("other file content", typeof fileContent)
            }
        }
    }

    return (
        <>
            <Snackbar
                open={importPositionsConfirmDialogOpen && !uploadError}
                autoHideDuration={6000}
                onClose={() => setDialogOpen(false)}
                message={"Positions successfully imported at " + positionUploadTime?.toLocaleTimeString()}
            />
            <Snackbar
                open={importVotesConfirmDialogOpen && !uploadError}
                autoHideDuration={6000}
                onClose={() => setVotesDialogOpen(false)}
                message={"Votes successfully imported at " + votesUploadTime?.toLocaleTimeString()}
            />
            <Snackbar
                open={!!uploadError}
                autoHideDuration={6000}
                onClose={() => setUploadError(null)}
            >
                <Alert onClose={() => setUploadError(null)} severity="error">
                    {uploadError}
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
                        <Button startIcon={<UploadIcon/>} onClick={openFileChooserPositions}>Import
                            Positions</Button>
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
                        <Button startIcon={<UploadIcon/>} onClick={openFileChooserVotes}>Import Votes</Button>
                        <Button color={"error"} startIcon={<DangerousIcon/>} onClick={removeAllVotes}>Remove all
                            votes</Button>
                        <input type='file' id='importVotes' ref={importVotesFile} 
                               style={{display: 'none'}}
                               onChange={onVotesFileChange}/>
                    </Stack>
                </Card>
                <Card sx={{p: 2}}>
                    <Stack spacing={2}>
                        <Typography variant={"h4"}>Results</Typography>

                        <FormControlLabel control={
                            <Switch defaultChecked={sortResultsByVoteCount}
                                    onChange={
                                        (_, checked) => {
                                            setSortResultsByVoteCount(checked)
                                        }
                                    }/>
                        } label="Sort results by vote count"/>


                        <TextField inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
                                   label="Electoral Divisor"
                                   defaultValue={electoralDivisorVariable}
                                   onChange={(e) => {
                                       const value = Number(e.target.value) || 0
                                       if (value != 0) {
                                           console.log('updating electoralDivisorVariable to ', value)
                                           setElectoralDivisorVariable(value);
                                       }
                                   }
                                   }/>

                        <TextField
                            inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
                            label="Total Allowed Voters"
                            defaultValue={totalAllowedVoters}
                            onChange={(e) => {
                                const value = Number(e.target.value) || 0;
                                setTotalAllowedVoters(value);
                            }}
                            helperText="Set this to calculate attendance ratio"
                        />

                        {/*    Add sort by vote count toggle */}
                    </Stack>
                </Card>

            </Stack>
        </>
    );
}
