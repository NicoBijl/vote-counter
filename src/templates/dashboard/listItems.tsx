import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HouseIcon from '@mui/icons-material/House';
import BallotIcon from '@mui/icons-material/Ballot';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface NavItemsProps {
    onClick: (nextPage: string) => void
}

export default function NavItems({onClick}: NavItemsProps) {
    return (

        <>
            <ListItemButton  onClick={() => onClick('dashboard')}>
                <ListItemIcon>
                    <HouseIcon/>
                </ListItemIcon>
                <ListItemText primary="Dashboard"/>
            </ListItemButton>
            <ListItemButton onClick={() => onClick('results')}>
                <ListItemIcon>
                    <AssignmentIcon/>
                </ListItemIcon>
                <ListItemText primary="Results"/>
            </ListItemButton>
            <ListItemButton onClick={() => onClick('positions')}>
                <ListItemIcon>
                    <PeopleIcon/>
                </ListItemIcon>
                <ListItemText primary="Positions"/>
            </ListItemButton>
            <ListItemButton onClick={() => onClick('votes')}>
                <ListItemIcon>
                    <BallotIcon/>
                </ListItemIcon>
                <ListItemText primary="Votes"/>
            </ListItemButton>
        </>
    );
}