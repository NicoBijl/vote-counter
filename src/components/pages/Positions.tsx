import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {Alert, Button, Stack, TextField} from "@mui/material";
import Divider from "@mui/material/Divider";
import AddIcon from '@mui/icons-material/Add';
import Paper from "@mui/material/Paper";
import {PersonKey, PositionKey} from "../../types.ts";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";


export function Positions() {
    const {positions, setPositions} = usePositionsStore();

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
            <Alert severity={"warning"} sx={{mb: 2}}>
                Please update position keys only before vote registration. Changes made afterwards may
                lead to malfunctions.
            </Alert>
            <Grid size={12}>
                <Grid container spacing={2}>
                    {positions.map((position) =>
                        <Grid size={{ sm: 12, md: 4 }} key={position.key} sx={{ pb: 2 }}>
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
