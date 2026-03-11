import { Ballot } from "../types";

/**
 * Computes a SHA-256 hash of the ballots array.
 * We sort ballots by index and then their votes to ensure consistency.
 */
export async function computeBallotHash(ballots: Ballot[]): Promise<string> {
    const sortedBallots = [...ballots].sort((a, b) => a.index - b.index);
    const simplifiedData = sortedBallots.map(b => ({
        index: b.index,
        votes: [...b.vote].sort((v1, v2) => 
            v1.position.localeCompare(v2.position) || v1.person.localeCompare(v2.person)
        )
    }));
    
    const msgUint8 = new TextEncoder().encode(JSON.stringify(simplifiedData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
