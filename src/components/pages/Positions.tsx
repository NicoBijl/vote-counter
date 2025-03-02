import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {Alert, Button, Stack, TextField} from "@mui/material";
import Divider from "@mui/material/Divider";
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import Paper from "@mui/material/Paper";
import {PersonKey, PositionKey} from "../../types.ts";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {convertLegacyPositions} from "../../utils/positionUtils";
import {useState, useRef} from "react";


export function Positions() {
    const {positions, setPositions} = usePositionsStore();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate that data is an array
            if (!Array.isArray(data)) {
                throw new Error("Uploaded file must contain an array of positions");
            }

            // Convert positions from potentially legacy format
            const convertedPositions = convertLegacyPositions(data);
            setPositions(convertedPositions);
        } catch (error) {
            console.error("[DEBUG_LOG] Error uploading positions:", error);
            setUploadError(error instanceof Error ? error.message : "Failed to upload positions");
        }

        // Clear the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    function savePositionField(positionKey: PositionKey, field: string, value: string | number) {
        const newPositions = positions.map(position => {
            if (position.key === positionKey) {
                return {
                    ...position,
                    [field]: field === 'maxVotesPerBallot' || field === 'maxVacancies' ? Number(value) : value
                };
            }
            return position;
        });
        setPositions(newPositions);
    }

    function savePersonKey(positionKey: PositionKey, personKey: PersonKey, newName: string) {
        console.log('savePersonKey', positionKey, personKey, newName)
    }

    function savePersonName(positionKey: PositionKey, personKey: PersonKey, newName: string) {
        console.log('savePersonName', positionKey, personKey, newName)
    }

    return (
        <>
            {uploadError && (
                <Alert severity="error" sx={{mb: 2}}>
                    {uploadError}
                </Alert>
            )}
            <Alert severity={"warning"} sx={{mb: 2}}>
                Please update position keys only before vote registration. Changes made afterwards may
                lead to malfunctions.
            </Alert>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
            <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 2 }}
            >
                Upload Positions
            </Button>
            <Grid item xs={12}>
                <Grid item container spacing={2}>
                    {positions.map((position) =>
                        <Grid item sm={12} md={4} key={position.key} paddingBottom={2}>
                            <Paper sx={{p: 1, mb: 2, width: "100%", height: "100%"}} elevation={3}>
                                <Typography variant="h4" marginBottom={2}>{position.title}</Typography>

                                <TextField 
                                    label="Key" 
                                    name="positionKey" 
                                    defaultValue={position.key}
                                    helperText="Unique identifier for this position. Used internally and should not be changed after voting has started."
                                    fullWidth
                                    margin="normal"
                                    onChange={(event) => savePositionField(position.key, 'key', event.target.value)}
                                />
                                <TextField 
                                    label="Title" 
                                    name="positionTitle" 
                                    defaultValue={position.title}
                                    helperText="The display name of this position shown to users."
                                    fullWidth
                                    margin="normal"
                                    onChange={(event) => savePositionField(position.key, 'title', event.target.value)}
                                />
                                <TextField 
                                    label="Max Votes Per Ballot" 
                                    name="positionMaxVotesPerBallot" 
                                    defaultValue={position.maxVotesPerBallot} 
                                    type={"number"}
                                    helperText="Maximum number of votes a voter can cast for this position on a single ballot."
                                    fullWidth
                                    margin="normal"
                                    onChange={(event) => savePositionField(position.key, 'maxVotesPerBallot', event.target.value)}
                                />
                                <TextField 
                                    label="Max Vacancies" 
                                    name="positionMaxVacancies" 
                                    defaultValue={position.maxVacancies} 
                                    type={"number"}
                                    helperText="Number of positions to be filled. This determines how many candidates can be elected."
                                    fullWidth
                                    margin="normal"
                                    onChange={(event) => savePositionField(position.key, 'maxVacancies', event.target.value)}
                                />
                                <Divider sx={{mt: 2}} variant="middle"></Divider>
                                <Typography variant="h5" marginTop={2}>Persons</Typography>

                                <Stack spacing={3}>
                                    {position.persons.map((person) => (
                                        <Paper key={person.key} variant={"outlined"} sx={{p: 1}}>
                                            <TextField
                                                label="Key"
                                                defaultValue={person.key}
                                                helperText="Unique identifier for this person. Used internally and should not be changed after voting has started."
                                                fullWidth
                                                margin="normal"
                                                onChange={(event) => savePersonKey(position.key, person.key, event.target.value)}/>
                                            <TextField
                                                label="Name"
                                                defaultValue={person.name}
                                                helperText="The display name of this person shown on ballots and results."
                                                fullWidth
                                                margin="normal"
                                                onChange={(event) => savePersonName(position.key, person.key, event.target.value)}/>
                                        </Paper>
                                    ))}
                                </Stack>

                                <Button sx={{mt: 2, width: "100%"}} startIcon={<AddIcon/>}>
                                    Add New Person for {position.title}
                                </Button>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
                <Button sx={{mt: 2, width: "100%"}} startIcon={<AddIcon/>}>
                    Add New Position
                </Button>
            </Grid>

        </>
    );
}
