import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HouseIcon from '@mui/icons-material/House';
import PeopleIcon from '@mui/icons-material/People';
import BallotIcon from '@mui/icons-material/Ballot';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavLink } from 'react-router-dom';

// The onClick prop is no longer needed – remove the interface entirely
export default function NavItems() {
    return (
        <>
            <ListItemButton component={NavLink} to="/">
                <ListItemIcon>
                    <HouseIcon/>
                </ListItemIcon>
                <ListItemText primary="Dashboard"/>
            </ListItemButton>
            <ListItemButton component={NavLink} to="/results">
                <ListItemIcon>
                    <AssignmentIcon/>
                </ListItemIcon>
                <ListItemText primary="Results"/>
            </ListItemButton>
            <ListItemButton component={NavLink} to="/positions">
                <ListItemIcon>
                    <PeopleIcon/>
                </ListItemIcon>
                <ListItemText primary="Positions"/>
            </ListItemButton>
            <ListItemButton component={NavLink} to="/votes">
                <ListItemIcon>
                    <BallotIcon/>
                </ListItemIcon>
                <ListItemText primary="Votes"/>
            </ListItemButton>
            <ListItemButton component={NavLink} to="/settings">
                <ListItemIcon>
                    <SettingsIcon/>
                </ListItemIcon>
                <ListItemText primary="Settings"/>
            </ListItemButton>
        </>
    );
}