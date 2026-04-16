import { useOptimistic, useState, useTransition } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIndicatorIcon,
    Edit as EditIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { Person, PersonKey, Position, PositionKey } from "../../types.ts";
import { usePositionsStore } from "../../hooks/usePositionsStore.ts";
import { Ballot, useBallotStore } from "../../hooks/useBallotStore.ts";

function isPositionKeyUsed(positionKey: PositionKey, ballots: Ballot[]): boolean {
    return ballots.some(ballot =>
        ballot.vote.some(v => v.position === positionKey)
    );
}

function isPersonKeyUsed(positionKey: PositionKey, personKey: PersonKey, ballots: Ballot[]): boolean {
    return ballots.some(ballot =>
        ballot.vote.some(v => v.position === positionKey && v.person === personKey)
    );
}

function DisabledButtonWrapper({ children, disabledTooltip }: { children: React.ReactNode; disabledTooltip?: string }) {
    if (!disabledTooltip) {
        return <>{children}</>;
    }
    return (
        <Tooltip title={disabledTooltip}>
            <span style={{ display: 'inline-flex' }}>
                {children}
            </span>
        </Tooltip>
    );
}

interface PersonRowProps {
    person: Person;
    positionKey: PositionKey;
    index: number;
    isUsed: boolean;
    onUpdate: (updatedPerson: Person) => void;
    onDelete: (personKey: PersonKey) => void;
    otherPersonKeys: PersonKey[];
}

function PersonRow({ person, positionKey, index, isUsed, onUpdate, onDelete, otherPersonKeys }: PersonRowProps) {
    const [isEditing, setIsEditing] = useState(person.key === "" && person.name === "");
    const [editData, setEditData] = useState<Person>({ ...person });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isDuplicateKey = editData.key !== person.key && otherPersonKeys.includes(editData.key);
    const isValid = editData.key.trim() !== "" && editData.name.trim() !== "" && !isDuplicateKey;

    const handleSave = () => {
        if (isValid) {
            onUpdate(editData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (person.key === "" && person.name === "") {
            onDelete(person.key);
        } else {
            setEditData({ ...person });
            setIsEditing(false);
        }
    };

    return (
        <Draggable draggableId={`person-${positionKey}-${person.key}`} index={index}>
            {(provided) => (
                <TableRow
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell width={50}>
                        <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center' }}>
                            <DragIndicatorIcon color="action" data-testid="DragIndicatorIcon" />
                        </Box>
                    </TableCell>
                    <TableCell>
                        {isEditing ? (
                            <TextField
                                size="small"
                                value={editData.key}
                                onChange={(e) => setEditData({ ...editData, key: e.target.value })}
                                disabled={isUsed}
                                error={isDuplicateKey || editData.key.trim() === ""}
                                helperText={isDuplicateKey ? "Key already exists" : ""}
                                fullWidth
                                placeholder="Key"
                                slotProps={{ htmlInput: { "aria-label": "Person Key" } }}
                            />
                        ) : (
                            <Typography variant="body2">{person.key}</Typography>
                        )}
                    </TableCell>
                    <TableCell>
                        {isEditing ? (
                            <TextField
                                size="small"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                fullWidth
                                error={editData.name.trim() === ""}
                                placeholder="Name"
                                slotProps={{ htmlInput: { "aria-label": "Person Name" } }}
                            />
                        ) : (
                            <Typography variant="body2">{person.name}</Typography>
                        )}
                    </TableCell>
                    <TableCell align="right">
                        {isEditing ? (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Tooltip title="Save">
                                    <IconButton onClick={handleSave} color="primary" disabled={!isValid} aria-label="Save Person">
                                        <SaveIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                    <IconButton onClick={handleCancel} color="error" aria-label="Cancel Person">
                                        <CancelIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Tooltip title="Edit">
                                    <IconButton onClick={() => setIsEditing(true)} color="primary" aria-label="Edit Person">
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <DisabledButtonWrapper disabledTooltip={isUsed ? "Cannot delete: key is used in votes" : undefined}>
                                    <IconButton
                                        onClick={() => setShowDeleteConfirm(true)}
                                        color="error"
                                        disabled={isUsed}
                                        aria-label="Delete Person"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </DisabledButtonWrapper>
                            </Box>
                        )}
                        <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                            <DialogTitle>Delete Person</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to delete {person.name}? This action cannot be undone.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                                <Button onClick={() => { onDelete(person.key); setShowDeleteConfirm(false); }} color="error">Delete</Button>
                            </DialogActions>
                        </Dialog>
                    </TableCell>
                </TableRow>
            )}
        </Draggable>
    );
}

interface PositionRowProps {
    position: Position;
    index: number;
    ballots: Ballot[];
    onUpdate: (updatedPosition: Position) => void;
    onDelete: (positionKey: PositionKey) => void;
    otherPositionKeys: PositionKey[];
}

function PositionRow({ position, index, ballots, onUpdate, onDelete, otherPositionKeys }: PositionRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(position.key === "" && position.title === "");
    const [editData, setEditData] = useState<Position>({ ...position });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isUsed = isPositionKeyUsed(position.key, ballots);
    const isDuplicateKey = editData.key !== position.key && otherPositionKeys.includes(editData.key);
    const isValid = editData.key.trim() !== "" &&
                    editData.title.trim() !== "" &&
                    editData.maxVotesPerBallot >= 1 &&
                    editData.maxVacancies >= 1 &&
                    !isDuplicateKey;

    const handleSave = () => {
        if (isValid) {
            onUpdate(editData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (position.key === "" && position.title === "") {
            onDelete(position.key);
        } else {
            setEditData({ ...position });
            setIsEditing(false);
        }
    };

    const handlePersonUpdate = (updatedPerson: Person, personIndex: number) => {
        const newPersons = [...position.persons];
        newPersons[personIndex] = updatedPerson;
        onUpdate({ ...position, persons: newPersons });
    };

    const handlePersonDelete = (personIndex: number) => {
        const newPersons = [...position.persons];
        newPersons.splice(personIndex, 1);
        onUpdate({ ...position, persons: newPersons });
    };

    const handleAddPerson = () => {
        const newPersons = [...position.persons, { key: "", name: "" }];
        onUpdate({ ...position, persons: newPersons });
        setIsExpanded(true);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(position.persons);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        onUpdate({ ...position, persons: items });
    };

    return (
        <>
            <Draggable draggableId={`position-${position.key}`} index={index}>
                {(provided) => (
                    <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ '& > *': { borderBottom: 'unset' } }}
                    >
                        <TableCell width={50}>
                            <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center' }}>
                                <DragIndicatorIcon color="action" data-testid="DragIndicatorIcon" />
                            </Box>
                        </TableCell>
                        <TableCell>
                            {isEditing ? (
                                <TextField
                                    size="small"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    error={editData.title.trim() === ""}
                                    placeholder="Title"
                                    slotProps={{ htmlInput: { "aria-label": "Position Title" } }}
                                />
                            ) : (
                                <Typography variant="body1" fontWeight="bold">{position.title}</Typography>
                            )}
                        </TableCell>
                        <TableCell>
                            {isEditing ? (
                                <TextField
                                    size="small"
                                    value={editData.key}
                                    onChange={(e) => setEditData({ ...editData, key: e.target.value })}
                                    disabled={isUsed}
                                    error={isDuplicateKey || editData.key.trim() === ""}
                                    helperText={isDuplicateKey ? "Key already exists" : ""}
                                    placeholder="Key"
                                    slotProps={{ htmlInput: { "aria-label": "Position Key" } }}
                                />
                            ) : (
                                <Typography variant="body2" color="textSecondary">{position.key}</Typography>
                            )}
                        </TableCell>
                        <TableCell align="center">
                            {isEditing ? (
                                <TextField
                                    size="small"
                                    type="number"
                                    value={editData.maxVotesPerBallot}
                                    onChange={(e) => setEditData({ ...editData, maxVotesPerBallot: parseInt(e.target.value) || 0 })}
                                    sx={{ width: 80 }}
                                    error={editData.maxVotesPerBallot < 1}
                                    slotProps={{ htmlInput: { "aria-label": "Max Votes", min: 1 } }}
                                />
                            ) : (
                                position.maxVotesPerBallot
                            )}
                        </TableCell>
                        <TableCell align="center">
                            {isEditing ? (
                                <TextField
                                    size="small"
                                    type="number"
                                    value={editData.maxVacancies}
                                    onChange={(e) => setEditData({ ...editData, maxVacancies: parseInt(e.target.value) || 0 })}
                                    sx={{ width: 80 }}
                                    error={editData.maxVacancies < 1}
                                    slotProps={{ htmlInput: { "aria-label": "Max Vacancies", min: 1 } }}
                                />
                            ) : (
                                position.maxVacancies
                            )}
                        </TableCell>
                        <TableCell align="center">{position.persons.length}</TableCell>
                        <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {isEditing ? (
                                    <>
                                        <Tooltip title="Save">
                                            <IconButton onClick={handleSave} color="primary" disabled={!isValid} aria-label="Save Position">
                                                <SaveIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                            <IconButton onClick={handleCancel} color="error" aria-label="Cancel Position">
                                                <CancelIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => setIsEditing(true)} color="primary" aria-label="Edit Position">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <DisabledButtonWrapper disabledTooltip={isUsed ? "Cannot delete: key is used in votes" : undefined}>
                                            <IconButton
                                                onClick={() => setShowDeleteConfirm(true)}
                                                color="error"
                                                disabled={isUsed}
                                                aria-label="Delete Position"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </DisabledButtonWrapper>
                                        <IconButton
                                            aria-label="expand row"
                                            size="small"
                                            onClick={() => setIsExpanded(!isExpanded)}
                                        >
                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </>
                                )}
                            </Box>
                            <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                                <DialogTitle>Delete Position</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Are you sure you want to delete {position.title}? All associated persons will also be removed. This action cannot be undone.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                                    <Button onClick={() => { onDelete(position.key); setShowDeleteConfirm(false); }} color="error">Delete</Button>
                                </DialogActions>
                            </Dialog>
                        </TableCell>
                    </TableRow>
                )}
            </Draggable>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Persons for {position.title}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddPerson}
                                    aria-label={`Add New Person for ${position.title}`}
                                >
                                    Add Person
                                </Button>
                            </Box>
                            <TableContainer component={Paper} variant="outlined">
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId={`persons-${position.key}`}>
                                        {(provided) => (
                                            <Table size="small" ref={provided.innerRef} {...provided.droppableProps}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell width={50} />
                                                        <TableCell>Key</TableCell>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell align="right">Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {position.persons.map((person, pIndex) => (
                                                        <PersonRow
                                                            key={person.key || `new-person-${pIndex}`}
                                                            person={person}
                                                            positionKey={position.key}
                                                            index={pIndex}
                                                            isUsed={isPersonKeyUsed(position.key, person.key, ballots)}
                                                            onUpdate={(updated) => handlePersonUpdate(updated, pIndex)}
                                                            onDelete={() => handlePersonDelete(pIndex)}
                                                            otherPersonKeys={position.persons.map((p, i) => i !== pIndex ? p.key : "").filter(k => k !== "")}
                                                        />
                                                    ))}
                                                    {provided.placeholder}
                                                    {position.persons.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={4} align="center">
                                                                <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                                                    No persons added yet.
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </TableContainer>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export function Positions() {
    const { positions, setPositions } = usePositionsStore();
    const { ballots } = useBallotStore();
    const [isPending, startTransition] = useTransition();

    const [optimisticPositions, setOptimisticPositions] = useOptimistic(
        positions,
        (_state, newPositions: Position[]) => newPositions
    );

    const updatePositions = (newPositions: Position[]) => {
        startTransition(() => {
            setOptimisticPositions(newPositions);
            setPositions(newPositions);
        });
    };

    const handleAddPosition = () => {
        const newPositions = [...optimisticPositions, {
            key: "",
            title: "",
            maxVotesPerBallot: 1,
            maxVacancies: 1,
            persons: []
        }];
        updatePositions(newPositions);
    };

    const handleUpdatePosition = (updatedPosition: Position, index: number) => {
        const newPositions = [...optimisticPositions];
        newPositions[index] = updatedPosition;
        updatePositions(newPositions);
    };

    const handleDeletePosition = (index: number) => {
        const newPositions = [...optimisticPositions];
        newPositions.splice(index, 1);
        updatePositions(newPositions);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(optimisticPositions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        updatePositions(items);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
                Please update position keys only before vote registration. Changes made afterwards may
                lead to malfunctions. Fields are disabled if they are already used in existing ballots.
            </Alert>

            <TableContainer component={Paper} elevation={3}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="positions">
                        {(provided) => (
                            <Table aria-label="positions table" ref={provided.innerRef} {...provided.droppableProps}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={50} />
                                        <TableCell>Title</TableCell>
                                        <TableCell>Key</TableCell>
                                        <TableCell align="center">Max Votes</TableCell>
                                        <TableCell align="center">Max Vacancies</TableCell>
                                        <TableCell align="center">Persons</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {optimisticPositions.map((position, index) => (
                                        <PositionRow
                                            key={position.key || `new-pos-${index}`}
                                            position={position}
                                            index={index}
                                            ballots={ballots}
                                            onUpdate={(updated) => handleUpdatePosition(updated, index)}
                                            onDelete={() => handleDeletePosition(index)}
                                            otherPositionKeys={optimisticPositions.map((p, i) => i !== index ? p.key : "").filter(k => k !== "")}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </TableBody>
                            </Table>
                        )}
                    </Droppable>
                </DragDropContext>
            </TableContainer>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={handleAddPosition}
                    disabled={isPending}
                    fullWidth
                    size="large"
                >
                    {isPending ? 'Adding...' : 'Add New Position'}
                </Button>
            </Box>

            {isPending && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption">Saving changes...</Typography>
                </Box>
            )}
        </Box>
    );
}
