import Typography from "@mui/material/Typography";
import {Alert, Button, Card, FormControlLabel, Snackbar, Stack, Switch, TextField} from "@mui/material";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import DownloadIcon from '@mui/icons-material/Download';
import DangerousIcon from '@mui/icons-material/Dangerous';
import UploadIcon from '@mui/icons-material/Upload';
import {useRef, useState} from "react";
import {isPosition, Position} from "../../types.ts";
import {useSettingsStore} from "../../hooks/useSettingsStore.ts";


export function Settings() {
    const {positions, setPositions} = usePositionsStore()
    const {ballots, removeAllBallots} = useBallotStore()
    const {
        electoralDivisorVariable,
        setElectoralDivisorVariable,
        sortResultsByVoteCount,
        setSortResultsByVoteCount
    } = useSettingsStore()
    const importVotesFile = useRef<HTMLInputElement | null>(null);
    const importPositionsFile = useRef<HTMLInputElement | null>(null);
    const [importPositionsConfirmDialogOpen, setDialogOpen] = useState(false)
    const [positionUploadTime, setPositionsUploadTime] = useState<Date | null>(null)


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
    const onPositionsFileChange = (e: any) => {
        const fileReader = new FileReader()
        fileReader.readAsText(e.target.files[0], "UTF-8")
        fileReader.onload = e => {
            console.log('e.target.result', e?.target?.result)
            const fileContent = e?.target?.result
            if (typeof fileContent === "string") {
                const jsonObjects = JSON.parse(fileContent) as object[]
                if (jsonObjects.every(v => isPosition(v))) {
                    const positionsInput = jsonObjects as Position[]
                    console.log("uploaded positions", jsonObjects, positionsInput)
                    setPositions(positionsInput)
                    importPositionsFile.current!.value = ""
                    setDialogOpen(true)
                    setPositionsUploadTime(new Date())
                } else {
                    console.log("Not every items is valid!")
                    return
                }


            } else {
                console.log("other file content", typeof fileContent)
            }
        }
    }

    return (
        <>
            <Snackbar
                open={importPositionsConfirmDialogOpen}
                autoHideDuration={20000}
                onClose={() => setDialogOpen(false)}
                message={"Positions imported at " + positionUploadTime?.toLocaleTimeString()}
            />
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
                        <Button color={"error"} startIcon={<DangerousIcon/>} onClick={removeAllVotes}>Remove all
                            votes</Button>
                        <input type='importVotes' id='importVotes' ref={importVotesFile} style={{display: 'none'}}/>
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

                        {/*    Add sort by vote count toggle */}
                    </Stack>
                </Card>

            </Stack>
        </>
    );
}