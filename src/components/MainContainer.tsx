import * as React from 'react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavItems from "./NavItems.tsx";
import {Dashboard} from "./pages/Dashboard.tsx";
import {Votes} from "./pages/Votes.tsx";
import {Positions} from "./pages/Positions.tsx";
import {Results} from "./pages/Results.tsx";
import {Settings} from "./pages/Settings.tsx";
import {CollaborationModal} from "./CollaborationModal.tsx";
import {SyncIndicator} from "./SyncIndicator.tsx";

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({theme, open}) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

export default function MainContainer() {
    const [open, setOpen] = React.useState(true);
    const location = useLocation();  // <-- get current location for title
    const toggleDrawer = () => {
        setOpen(!open);
    };

    // Derive page title from the current path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'dashboard';
        const segment = path.substring(1); // remove leading '/'
        if (segment.startsWith('votes/')) return 'votes'; // handle /votes/3
        return segment || 'dashboard';
    };

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar position="absolute" open={open}>
                <Toolbar
                    sx={{
                        pr: '24px',
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: '36px',
                            ...(open && {display: 'none'}),
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{flexGrow: 1}}
                    >
                        Vote Counter App
                    </Typography>
                    <SyncIndicator />
                    <CollaborationModal />
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon/>
                    </IconButton>
                </Toolbar>
                <Divider/>
                <List component="nav">
                    {/* NavItems no longer needs an onClick prop */}
                    <NavItems />
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar/>
                <Container maxWidth={false} sx={{mt: 4, mb: 4}}>
                    <Grid container>
                        <Grid size={{ xs: 12 }}>
                            <Typography component="h1" variant="h3" color="primary"
                                        sx={{textTransform: "capitalize"}}>
                                {getPageTitle()}
                            </Typography>
                            {/* Define routes */}
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/positions" element={<Positions />} />
                                <Route path="/results" element={<Results />} />
                                <Route path="/votes" element={<Votes />} />
                                <Route path="/votes/:voteIndex" element={<Votes />} />
                            </Routes>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}
