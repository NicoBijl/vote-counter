import Grid from "@mui/material/Grid";
import {PersonKey, Position, PositionKey} from "../../types.ts";
import Typography from "@mui/material/Typography";
import {Alert, Box, Chip, FormControlLabel, ListItem, Switch, Tooltip} from "@mui/material";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import {usePositionsStore} from "../../hooks/usePositionsStore.ts";
import {useBallotStore} from "../../hooks/useBallotStore.ts";
import {useSettingsStore} from "../../hooks/useSettingsStore.ts";
import Divider from "@mui/material/Divider";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip} from "recharts";
import {calculateElectoralDivisor, CandidateStatus, countVotes, getCandidateStatus, getTopCandidates} from "../../domain/electionDomain.ts";

export function Results() {
    const {positions} = usePositionsStore()
    const {ballots} = useBallotStore()
    const {electoralDivisorVariable, totalAllowedVoters, sortResultsByVoteCount, setSortResultsByVoteCount} = useSettingsStore()

    function calculateAttendanceRatio(): string {
        if (totalAllowedVoters === 0) return "N/A";
        return ((ballots.length / totalAllowedVoters) * 100).toFixed(1) + "%";
    }

    function calculateTotalValidVotes(): number {
        return ballots.flatMap(b => b.vote).filter(v => v.person !== "invalid").length;
    }

    function checksum(array: number[]) {
        // Sum the votes. Assuming 'votes' is an array of numbers
        // Apply a simple transformation, e.g., modulo to keep it within a certain range
        return array.reduce((acc, val, index) => acc + val * Math.pow(2, index), 0); // Adjust the modulo value as needed to control the checksum's size
    }

    function calcElectoralDivisor(position: Position): string {
        const persons = position.persons.length
        const validVotes = ballots.flatMap(b => b.vote).filter(v => v.position == position.key && v.person != "invalid").length
        return `Math.ceil(${validVotes} / ${persons} * ${electoralDivisorVariable})`
        // roundUp(validVotes / persons * ${electoralDivisorVariable})
        // (117+76+101+59 )/4*0.8 == 70.6 => 71
        // (84+73+116+156)/4*.8 == 85.8 => 71
        // (100+74+109+86+93+145)/6*.8 == 80.9333 => 81
        // (170+86)/2*.8 == 102.4 => 103
    }

    function electoralDivisor(position: Position): number {
        return calculateElectoralDivisor(position, ballots, electoralDivisorVariable);
    }

    function countVotesForPositions(positions: Position[]): number[] {
        return positions.flatMap(position => {
            const persons = position.persons ?? [];
            const votesPerPerson = persons.map(person => countVotes(position, person.key, ballots));
            return votesPerPerson.concat([countVotes(position, 'invalid', ballots)]);
        });
    }

    function positionChecksum(position: Position) {
        const votesPerPerson = countVotesForPositions([position]);
        console.log("positionChecksum", votesPerPerson, checksum(votesPerPerson));
        return checksum(votesPerPerson);
    }

    function totalChecksumByPositions() {
        const positionChecksums = positions.map(position => {
            return positionChecksum(position)
        });
        return checksum(positionChecksums);
    }

    function totalChecksum() {
        const allVotesCounted = countVotesForPositions(positions);
        console.log("totalChecksum", allVotesCounted, checksum(allVotesCounted));
        return checksum(allVotesCounted);
    }
    function chipColor(position: Position, personKey: PersonKey): { color: 'success' | 'warning' | 'default', variant?: 'outlined' } {
        const status = getCandidateStatus(position, personKey, ballots, electoralDivisorVariable);

        switch (status) {
            case CandidateStatus.ELECTED:
                return { color: 'success' };
            case CandidateStatus.TIED:
                return { color: 'warning' };
            case CandidateStatus.ABOVE_DIVISOR:
                return { color: 'success', variant: 'outlined' };
            case CandidateStatus.BELOW_DIVISOR:
            default:
                return { color: 'default' };
        }
    }

    function blankVotes(positionKey: PositionKey): number {
        const maxVotesPerBallot = positions.find(p => p.key == positionKey)!.maxVotesPerBallot
        return ballots.flatMap(b => {
            const isInvalid = !!b.vote.find(v => v.position == positionKey && v.person == "invalid")
            if (isInvalid) {
                return 0
            } else {
                return maxVotesPerBallot - b.vote.filter(v => v.position == positionKey && v.person != "invalid").length
            }
        }).reduce((acc, val) => acc + val, 0)
    }

    interface VoteStats {
        name: string;
        value: number;
        color?: string;
        total: number;
        key?: string;
    }

    // Function to generate pie chart data for each position
    function getPositionVoteStats(position: Position): VoteStats[] {
        // Get vote counts for each person
        const personVotes = position.persons.map(person => ({
            name: person.name,
            value: countVotes(position, person.key, ballots),
            key: person.key
        }));

        // Add blank and invalid
        const invalid = countVotes(position, "invalid", ballots);
        const blank = blankVotes(position.key);

        // Calculate total
        const total = personVotes.reduce((sum, entry) => sum + entry.value, 0) + blank + invalid;

        // Add total to each entry
        return [
            ...personVotes.map(entry => ({...entry, total})),
            {name: 'Blank', value: blank, color: '#9e9e9e', total},
            {name: 'Invalid', value: invalid, color: '#f44336', total}
        ];
    }

    // Colors for the pie chart - generate a color palette with enough colors for persons plus blank/invalid
    function generateColorPalette(position: Position) {
        // Generate colors for each person
        const personColors = position.persons.map((_, index) => {
            // Use different hues of blue and green for persons
            return `hsl(${200 - index * (120 / Math.max(1, position.persons.length))}, 70%, 50%)`;
        });

        // Add colors for blank and invalid
        return [...personColors, '#9e9e9e', '#f44336'];
    }

    function isPositionTied(position: Position): boolean {
        const topCandidates = getTopCandidates(position, ballots);
        return topCandidates.length > position.maxVacancies;
    }

    return (
        <>
            <Alert severity={"info"} sx={{mb: 2}}>
                This page displays the detailed results of the election. It shows each position along with the list of
                candidates and their respective vote counts. Additionally, the number of blank and invalid votes, allowed votes,
                and valid votes per position are clearly indicated. Candidates who have received more or equal votes than 
                the electoral divisor are highlighted in green, signifying their leading status.
            </Alert>
            <Paper sx={{p: 2, position: 'relative'}}>
                <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={sortResultsByVoteCount}
                                onChange={(_, checked) => setSortResultsByVoteCount(checked)}
                                size="small"
                            />
                        }
                        label={
                            <Typography variant="caption">
                                Sort by votes
                            </Typography>
                        }
                    />
                </Box>
                <Grid container>
                    <Grid container>
                        <Grid container>
                            {positions.map((position) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={"votes-" + position.key}>
                                    <Typography variant="h4">{position.title}</Typography>
                                    {isPositionTied(position) && (
                                        <Alert severity="warning" sx={{ mb: 1, py: 0 }}>
                                            <Typography variant="caption">
                                                Tie detected: manual resolution required.
                                            </Typography>
                                        </Alert>
                                    )}
                                    <Typography variant="subtitle2">
                                        Max votes per ballot: {position.maxVotesPerBallot} • Available positions: {position.maxVacancies}
                                    </Typography>
                                    <List>
                                        {/* When not sorting by vote count, display all persons in original order */}
                                        {!sortResultsByVoteCount && position.persons.map((person) => (
                                            <ListItem 
                                                disableGutters 
                                                key={person.key} 
                                                data-testid={`person-item-${position.key}-${person.key}`}>
                                                <Chip 
                                                      label={countVotes(position, person.key, ballots)}
                                                      {...chipColor(position, person.key)}
                                                      sx={{mr: 2}}
                                                      data-testid={`person-chip-${position.key}-${person.key}`}/>
                                                <ListItemText>{person.name}</ListItemText>
                                            </ListItem>
                                        ))}

                                        {/* When sorting by vote count, display persons above electoral divisor first */}
                                        {sortResultsByVoteCount && [...position.persons]
                                            .sort((p1, p2) => countVotes(position, p2.key, ballots) - countVotes(position, p1.key, ballots))
                                            .filter(person => countVotes(position, person.key, ballots) >= electoralDivisor(position))
                                            .map((person) => (
                                                <ListItem 
                                                    disableGutters 
                                                    key={person.key}
                                                    data-testid={`person-item-sorted-above-${position.key}-${person.key}`}>
                                                    <Chip 
                                                          label={countVotes(position, person.key, ballots)}
                                                          {...chipColor(position, person.key)}
                                                          sx={{mr: 2}}
                                                          data-testid={`person-chip-sorted-above-${position.key}-${person.key}`}/>
                                                    <ListItemText>{person.name}</ListItemText>
                                                </ListItem>
                                            ))}

                                        {/* Electoral Divisor Display */}
                                        {sortResultsByVoteCount && (
                                            <Box sx={{ position: 'relative', my: 4 }} data-testid={`electoral-divisor-container-${position.key}`}>
                                                <Divider>
                                                    <Chip 
                                                        label={`Electoral Divisor: ${electoralDivisor(position)}`}
                                                        size="small"
                                                        variant="outlined"
                                                        data-testid={`electoral-divisor-chip-${position.key}`}
                                                    />
                                                </Divider>
                                            </Box>
                                        )}

                                        {/* When sorting by vote count, display persons below electoral divisor after the divider */}
                                        {sortResultsByVoteCount && [...position.persons]
                                            .sort((p1, p2) => countVotes(position, p2.key, ballots) - countVotes(position, p1.key, ballots))
                                            .filter(person => countVotes(position, person.key, ballots) < electoralDivisor(position))
                                            .map((person) => (
                                                <ListItem 
                                                    disableGutters 
                                                    key={person.key}
                                                    data-testid={`person-item-sorted-below-${position.key}-${person.key}`}>
                                                    <Chip 
                                                          label={countVotes(position, person.key, ballots)}
                                                          {...chipColor(position, person.key)}
                                                          sx={{mr: 2}}
                                                          data-testid={`person-chip-sorted-below-${position.key}-${person.key}`}/>
                                                    <ListItemText>{person.name}</ListItemText>
                                                </ListItem>
                                            ))}
                                    </List>
                                </Grid>
                            ))}
                        </Grid>
                        <Grid container>
                            {positions.map((position) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={"rest-" + position.key}>
                                    <Divider variant={"middle"}></Divider>

                                    {/* Vote Statistics Pie Chart */}
                                    <Box sx={{ height: 200, width: "100%", mt: 2 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getPositionVoteStats(position)}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={30}
                                                    outerRadius={60}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    label={({ value }) => `${value}`}
                                                >
                                                    {getPositionVoteStats(position).map((_: VoteStats, index: number) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={generateColorPalette(position)[index % generateColorPalette(position).length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    formatter={(value, name, entry) => {
                                                        const { total } = entry.payload;
                                                        const percent = ((value as number) / total * 100).toFixed(1);
                                                        return [`${value} votes (${percent}%)`, name];
                                                    }} 
                                                />
                                                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                                    {getPositionVoteStats(position)[0].total}
                                                </text>
                                                <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '12px' }}>
                                                    votes
                                                </text>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>

                                    {/* Stats in compact form */}
                                    <List dense>
                                        {!sortResultsByVoteCount && (
                                            <Tooltip title={calcElectoralDivisor(position)} arrow placement="bottom-start">
                                                <ListItem disableGutters>
                                                    <Chip label={electoralDivisor(position)} variant="outlined" size="small" sx={{mr: 1}}/>
                                                    <Typography variant="caption">Electoral Divisor</Typography>
                                                </ListItem>
                                            </Tooltip>
                                        )}
                                        <ListItem disableGutters>
                                            <Chip label={positionChecksum(position)} variant="outlined" size="small" sx={{mr: 1}}/>
                                            <Typography variant="caption">Checksum</Typography>
                                        </ListItem>
                                    </List>
                                </Grid>
                            ))}
                        </Grid>
                        <Grid container sx={{pt: 4}}>
                            <List>
                                <ListItem>
                                    <Chip label={ballots.length} variant="outlined" sx={{mr: 2}}/>
                                    Total Ballots
                                </ListItem>
                                <ListItem>
                                    <Chip label={calculateTotalValidVotes()} variant="outlined" sx={{mr: 2}}/>
                                    Total Valid Votes
                                </ListItem>
                                <ListItem>
                                    <Chip label={calculateAttendanceRatio()} variant="outlined" color={totalAllowedVoters > 0 ? "primary" : "default"} sx={{mr: 2}}/>
                                    Attendance Ratio {totalAllowedVoters === 0 && "(Set total allowed voters in Settings)"}
                                </ListItem>
                                <ListItem>
                                    <Chip label={totalChecksumByPositions()} variant="outlined" color={"info"}
                                          sx={{mr: 2}}/>
                                    Total checksum (by positions)
                                </ListItem>
                                <ListItem>
                                    <Chip label={totalChecksum()} variant="outlined" sx={{mr: 2}}/>
                                    Total checksum
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}
