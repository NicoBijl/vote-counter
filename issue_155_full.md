title:	UI/UX Redesign: Rebuild Positions Management Page
state:	OPEN
author:	NicoBijl
labels:	enhancement, ready, ui/ux
comments:	0
assignees:	
projects:	
milestone:	
number:	155
--
UI/UX Redesign: Rebuild Positions Management Page

## Context
The current Positions page (@src/components/pages/Positions.tsx, see @vote.bijlit.nl_.png for current UI) displays positions as cards in a grid. Each card contains forms to edit the position details and a list of persons associated with that position.

## Problem Statement
The current UI has several limitations:
- **Scalability**: As the number of positions and people grows, the page becomes long and difficult to navigate.
- **Ordering**: No ability to re-order positions or people within a position.
- **Edit/View Modes**: The forms are always in edit mode, which can lead to accidental changes.
- **Person Management**: The list of persons within each position card is cumbersome for larger lists.
- **Key Modification Enforcement**: The application needs a robust way to prevent modifying keys that are already used in the ballot store (votes), while still allowing modification or removal of unused keys.
- **Missing CRUD**: "Add New Person" and "Add New Position" buttons are non-functional.

## Proposed UX/UI Design

### UX Principles
- **Clarity**: Separate viewing from editing.
- **Efficiency**: Allow quick scanning, sorting, and re-ordering.
- **Context**: Group related information (position + persons), keep it collapsible.
- **Enforcement**: Graphically distinguish editable vs. non-editable keys based on their usage in votes.

### New Layout Structure
An **Expandable Table** for better sorting and quick scanning of position attributes.

#### 1. Positions Table (Collapsed State)
A standard data table where each row represents a position.
- **Columns**:
  - Drag Handle (for re-ordering)
  - Title
  - Key
  - Max Votes
  - Max Vacancies
  - Persons (Count)
  - Actions (Edit, Delete, Expand/Collapse)
- **Global Actions**:
  - Add New Position button

#### 2. Positions Table (Expanded State - Position/Person Details)
Reveals the full details and a nested table/list for Persons.

- **Position Details Form**:
  - **Key**: Input field (read-only if used in votes).
  - **Title**: Editable input field.
  - **Max Votes**: Editable number input.
  - **Max Vacancies**: Editable number input.
- **Persons Management Section**:
  - **Nested Persons Table**:
    - Drag Handle (for re-ordering within position)
    - Key (read-only if used in votes)
    - Name (editable)
    - Actions (Edit, Delete)
  - **Add New Person** button.

### Specific Design Constraints & Interactions

#### 1. Re-ordering (Drag-and-Drop)
- Use drag-and-drop on both Position rows (main table) and Person rows (expanded details).
- A drag handle icon should be visible on the left of each draggable row.
- Use `@dnd-kit/core` or `@hello-pangea/dnd` for implementation.

#### 2. Fine-Grained Key Modification Enforcement
The application must check if a specific key (Position Key or Person Key) is present in the ballot store (votes).

**Requirements for Implementation**:
- Check usage of each specific `position.key` and `person.key` in the `votes` data.
- **If a Key is USED**:
    - The 'Key' input field for that Position/Person must be **read-only/disabled** and clearly marked as such.
    - The 'Delete' action for that Position/Person must be **disabled**. Add a tooltip explaining that it cannot be deleted because it has associated votes.
- **If a Key is UNUSED**:
    - The 'Key' input field must be **editable**.
    - The 'Delete' action must be **enabled**.

#### 3. Edit/View States
- **View Mode**: Table rows display text. Clicking 'Edit' icon transforms fields to editable inputs.
- **Inline Editing**: Prefer inline editing over modals.

#### 4. Save/Cancel Flow (CRITICAL)
When clicking 'Edit' on a row:
- Row enters **Edit Mode**: fields become editable inputs
- Row actions change to **[Save] [Cancel]** buttons
- On **Save**: Validate inputs, then update store, then return to View Mode
- On **Cancel**: Discard changes, revert to original values, return to View Mode

#### 5. Creation Flow
When clicking 'Add New Position' or 'Add New Person':
- Append a new empty row at the **bottom** of the list
- The new row enters **Edit Mode** immediately (focus on first field)
- User fills in the details and clicks Save
- On Save: Validate (including uniqueness of keys), then add to store

#### 6. Validation Rules
- `key` must be unique across all positions (for position keys) or within the position (for person keys)
- `title` cannot be empty
- `maxVotesPerBallot` must be >= 1
- `maxVacancies` must be >= 1
- Show inline validation errors in red text below the field

#### 7. Delete Confirmation
When clicking 'Delete' on a Position or Person:
- Show a confirmation dialog: "Are you sure you want to delete [Name]? This action cannot be undone."
- If the key is used in votes, the button should already be disabled (see Section 2)

#### 8. Store Integration
- Use `usePositionsStore` for positions and persons data
- Use `useVotesStore` to check if a key exists in the votes data

## Technical Requirement: React 19 Action Hooks
When implementing this issue, you MUST use React 19 patterns (as established in Issue #97):
- **useActionState**: Use this for all CRUD operations (Add/Edit/Delete positions and persons).
- **Pending States**: Show a loading indicator (e.g., spinner or skeleton) while positions are being saved to the store.
- **Optimistic UI**: Use `useOptimistic` to immediately show new positions or candidates in the list before the store update completes.
- **Error Handling**: Use the built-in error state from `useActionState` to display validation errors (e.g., duplicate keys) using MUI `TextField` error props.

### Material-UI Component Suggestions
- `@mui/material/Table` (TableContainer, Table, TableHead, TableBody, TableRow, TableCell)
- `@mui/material/TextField` (for inputs)
- `@mui/material/IconButton` (Edit, Delete, DragIndicator, ExpandMore, ExpandLess)
- `@mui/material/Dialog` (for delete confirmation)
- `@hello-pangea/dnd` for Drag and Drop re-ordering.

## Acceptance Criteria
- [ ] New expandable table/list UI implemented for Positions.
- [ ] Positions and People within a position can be re-ordered using drag-and-drop.
- [ ] CRUD operations are functional for both Positions and Persons.
- [ ] Inline editing flow with explicit Save/Cancel buttons.
- [ ] Creation flow adds new row in Edit mode at bottom of list.
- [ ] Validation: keys unique, title required, numbers >= 1.
- [ ] Delete shows confirmation dialog.
- [ ] **State Enforcement**: For each Position/Person, their 'Key' is disabled in edit mode and 'Delete' is disabled IF and only IF that specific key is present in the `votes` data.
- [ ] React 19 Action Hooks used (useActionState, useOptimistic)
- [ ] Page is responsive and performs well with large amounts of data.
- [ ] Code is modular and well-tested, integrating with existing stores.

## Mockup / Wireframe Concept

```
+-----------------------------------------------------------------------+
| Positions Management                                    [+ New Position] |
+-----------------------------------------------------------------------+
|  Drag | Title        | Key      | Max V | Max Vac | Persons | Actions |
+-------+--------------+----------+-------+---------+---------+---------+
| [:::] | Scriba       | scriba   | 1     | 1       | 3       | [Edit] [Delete] [V] |
|       |              |          |       |         |         |         |
| (Expanded details for Scriba)                                         |
|  +---------------------------------------------------------------+     |
|  |  Position Details:                                            |     |
|  |    Key:   [scriba] (read-only if used in votes)             |     |
|  |    Title: [Scriba]                                           |     |
|  |    Max V: [1]   Max Vac: [1]                                 |     |
|  |                                                               |     |
|  |  [Save] [Cancel]  ← Shown when in Edit mode                 |     |
|  |                                                               |     |
|  |  Persons:                                       [+ New Person]|     |
|  |  +-------+----------+-----------------------+---------+        |     |
|  |  | Drag  | Key      | Name                  | Actions |        |     |
|  |  +-------+----------+-----------------------+---------+        |     |
|  |  | [:::] | p1       | Person One            | [E] [D] |        |     |
|  |  | [:::] | p2       | Person Two            | [E] [D] |        |     |
|  |  +-------+----------+-----------------------+---------+        |     |
|  +---------------------------------------------------------------+     |
+-------+--------------+----------+-------+---------+---------+---------+
| [:::] | Vz. Diaconie | diaconie | 1     | 1       | 2       | [Edit] [Delete] [>] |
+-------+--------------+----------+-------+---------+---------+---------+
```

## Related Issues
- **Issue #85** (Drag-and-drop Position Editor): This issue has been merged into #155. The drag-and-drop functionality is now covered by this issue.
- **Issue #97** (React: Migrate to Action Hooks): Reference for React 19 patterns to use.
