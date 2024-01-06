import {Ballot, createNewBallot, usePositions, useVoteStore} from "../context.ts";
import {Button, Checkbox, FormControl, FormControlLabel, Pagination} from "@mui/material";
import {Person, Position} from "../types.ts";
import {ChangeEvent, useState} from "react";

export function Votes(position: Position, person: Person) {
    const {votes, currentVoteIndex, nextVote, setVoteIndex, setBallotVote} = useVoteStore()
    const currentVote = useVoteStore(state => state.votes.find(b => b.index == state.currentVoteIndex) ?? createNewBallot(state.currentVoteIndex))
    const positions = usePositions()

    function togglePerson(position: Position, person: Person, checked: boolean) {
        console.log("Toggle", position.key, person.key, currentVote)
        setBallotVote(currentVoteIndex, position.key, person.key, checked)
    }

    function handleVoteChange(_event: ChangeEvent<unknown>, pageNumber: number) {
        setVoteIndex(pageNumber - 1)
    }

    return <>
        Vote: {currentVoteIndex}
        <ul>
            {[...currentVote.vote.keys()].map((positionKey) => (
                <li key={positionKey}>
                    vote : {positionKey}
                    <ul>
                        {[...currentVote.vote.get(positionKey)!.keys()].map((personKey) => (
                            <li key={personKey}>
                                {personKey} - checked: {
                                currentVote.vote.get(positionKey)?.get(personKey) ? "yes" : "no"
                            }
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ul>

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
                                    control={
                                        <Checkbox
                                            onChange={(_event, checked) => togglePerson(position, person, checked)}
                                            checked={!!currentVote.vote.get(position.key)?.get(person.key)}
                                        />
                                    }
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