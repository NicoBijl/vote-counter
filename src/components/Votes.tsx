import {Ballot, usePositions, useVoteStore} from "../context.ts";
import {Button, Checkbox, FormControl, FormControlLabel, Pagination} from "@mui/material";
import {Person, Position} from "../types.ts";
import {ChangeEvent, useState} from "react";

export function Votes(position: Position, person: Person) {
    const {votes, addVotes, currentVoteIndex, nextVote, previousVote, setVoteIndex, setBallotVote} = useVoteStore()
    const [currentBallot, setCurrentBallot] = useState({} as Ballot)
    const positions = usePositions()

    function togglePerson(position: Position, person: Person, checked: boolean) {
        console.log("Toggle", position.key, person.key, votes)
        setBallotVote(currentVoteIndex, position.key, person.key, checked)
    }

    function handleVoteChange(_event: ChangeEvent<unknown>, pageNumber: number) {
        console.log("Vote index changed", pageNumber)
        setVoteIndex(pageNumber)
    }

    return <>
        <Pagination
            count={Math.max(votes.length, 1)}
            color="primary"
            page={currentVoteIndex + 1}
            onChange={handleVoteChange}/>

        <FormControl>
            <ul>
                {positions.map((position, positionIndex) => <li key={position.key}>
                    {position.title}
                    <ul>
                        {position.persons.map((person) => (
                            <li key={person.key}>
                                <FormControlLabel
                                    control={<Checkbox
                                        onChange={(event, checked) => togglePerson(position, person, checked)}/>}
                                    label={person.name}/>
                            </li>
                        ))}
                    </ul>
                </li>)}
            </ul>
            <Button onClick={nextVote} variant="outlined">Next Vote</Button>
        </FormControl>
    </>;
}