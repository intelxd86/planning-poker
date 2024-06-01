import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useAppState } from './AppStateContext';
import CreateGameForm from './CreateGameForm';
import { useNavigate } from 'react-router-dom';
import { snackbarNotify } from './Utils';
import CreateRoom from './CreateRoom';
import { Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AlarmIcon from '@mui/icons-material/Alarm';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BuildIcon from '@mui/icons-material/Build';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import RageQuitButton from './RageQuitButton';

export default function Navigation() {
    const { state, setState } = useAppState();
    const navigate = useNavigate();
    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            const response = await window.axios.post('/api/user/logout');
            if (response.status === 200) {
                setState(prevState => ({
                    ...prevState,
                    user: null
                }))
            }
        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            } else {
                console.error(error);
            }
        }
    };

    const handleSetSpectator = () => async (e) => {
        e.preventDefault();

        try {
            await window.axios.post('/api/room/' + state.room.room + '/spectator');
        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            } else {
                console.error(error);
            }
        }
    };

    const handleUnsetSpectator = () => async (e) => {
        e.preventDefault();

        try {
            await window.axios.delete('/api/room/' + state.room.room + '/spectator');
        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            } else {
                console.error(error);
            }
        }
    };

    const handleRevealVotes = () => async (e) => {
        e.preventDefault();

        try {
            await window.axios.post('/api/room/' + state.room.room + '/game/' + state.room.game.uuid + '/end');
        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            } else {
                console.error(error);
            }
        }
    }

    const toggleOpMode = () => async (e) => {
        e.preventDefault();

        try {
            await window.axios.post('/api/room/' + state.room.room + '/opmode');
        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            } else {
                console.error(error);
            }
        }
    }

    const handleToggleDarkMode = () => {
        setState(prevState => {
            const newDarkMode = !prevState.darkMode;
            localStorage.setItem('darkMode', newDarkMode);
            return {
                ...prevState,
                darkMode: newDarkMode
            };
        });
    };

    const isRoomOwner = state.room?.owner.uuid === state.user.uuid || false;
    const showCreateGameForm = !state.room || !state.room.game || state.room.game.result !== null;
    const isSpectator = state.room?.spectators?.includes(state.user.uuid);
    const revealDisabled = state.room?.game?.reveal === false && state.room?.game?.ended === true;

    return (
        <AppBar position="static">
            <Toolbar>
                <Grid container justifyContent="space-between">
                    <Grid item>
                        {(isRoomOwner || state.room?.owner_managed === false) && (
                            showCreateGameForm ?
                                <CreateGameForm /> :
                                <Button color="inherit" onClick={handleRevealVotes()} startIcon={<AlarmIcon />} disabled={revealDisabled}>
                                    Reveal cards
                                </Button>
                        )}
                        {state.room && (
                            isSpectator ?
                                <Button color="inherit" onClick={handleUnsetSpectator()} startIcon={<VisibilityOffIcon />}>
                                    Exit spectator mode
                                </Button> :
                                <Button color="inherit" onClick={handleSetSpectator()} startIcon={<VisibilityIcon />}>
                                    Become spectator
                                </Button>
                        )}
                        {state.room && isRoomOwner && (state.room.owner_managed ?
                            <Button color='inherit' startIcon={<BuildIcon />} onClick={toggleOpMode()}>Allow everyone to manage</Button>
                            :
                            <Button color='inherit' startIcon={<AdminPanelSettingsIcon />} onClick={toggleOpMode()}>Disallow everyone to manage</Button>
                        )}
                        {!state.room && <CreateRoom />}
                    </Grid>
                    <Grid item>
                        <Button color="inherit" onClick={handleToggleDarkMode} endIcon={state.darkMode ? <LightModeIcon /> : <DarkModeIcon />}>{
                            state.darkMode ? 'Light mode' : 'Dark mode'
                        }</Button>
                        {state.room ? <RageQuitButton /> : null}
                        <Button color="inherit" onClick={handleLogout} endIcon={<LogoutIcon />} >Logout</Button>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar >
    )
}