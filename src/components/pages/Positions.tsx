import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {Alert, Button, Stack, TextField} from "@mui/material";
import Divider from "@mui/material/Divider";
import AddIcon from '@mui/icons-material/Add';
import Paper from "@mui/material/Paper";
import {PersonKey, PositionKey} from "../../types.ts";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";


export function Positions() {
    const {positions} = usePositionsStore()


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
            <Grid item xs={12}>
                <Grid item container spacing={2}>
                    {positions.map((position) =>
                        <Grid item sm={12} md={4} key={position.key} paddingBottom={2}>
                            <Paper sx={{p: 1, mb: 2, width: "100%", height: "100%"}} elevation={3}>
                                <Typography variant="h4" marginBottom={2}>{position.title}</Typography>

                                <TextField label="Key" name="positionKey" defaultValue={position.key}/>
                                <TextField label="Title" name="positionTitle" defaultValue={position.title}/>
                                <TextField label="Max Votes Per Ballot" name="positionMaxVotesPerBallot" defaultValue={position.maxVotesPerBallot} type={"number"}/>
                                <Divider sx={{mt: 2}} variant="middle"></Divider>
                                <Typography variant="h5" marginTop={2}>Persons</Typography>

                                <Stack spacing={3}>
                                    {position.persons.map((person) => (
                                        <Paper key={person.key} variant={"outlined"} sx={{p: 1}}>
                                            <TextField
                                                label="Key"
                                                defaultValue={person.key}
                                                onChange={(event) => savePersonKey(position.key, person.key, event.target.value)}/>
                                            <TextField
                                                label="Label"
                                                defaultValue={person.name}
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