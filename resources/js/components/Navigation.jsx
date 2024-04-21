import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useAppState } from './AppStateContext';
import CreateGameForm from './CreateGameForm';
import { useNavigate } from 'react-router-dom';
import { snackbarNotify } from './Utils';
import CreateRoom from './CreateRoom';
import { Grid } from '@mui/material';

export default function Navigation() {
    const { state, setState } = useAppState();
    const navigate = useNavigate();
    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            const response = await window.axios.post('/api/user/logout');
            if (response.status === 200) {
                setState({ user: null });
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

    return (
        <AppBar position="static">
            <Toolbar>
                <Grid container fullWidth justifyContent="space-between">
                    <Grid item>
                        {(state.room && state.room.owner === state.user.uuid) ?
                            state.room.game === null || state.room.game.reveal ? <CreateGameForm /> : <Button color="inherit" onClick={handleRevealVotes()}>Reveal cards</Button>
                            : null}
                        {state.room ?
                            state.room.spectators && state.room.spectators.includes(state.user.uuid) ? <Button color="inherit" onClick={handleUnsetSpectator()}>Exit spectartor mode</Button> : <Button color="inherit" onClick={handleSetSpectator()}>Become spectator</Button>
                            : <CreateRoom />}
                    </Grid>
                    <Grid item>
                        {state.room ? <Button color="inherit" onClick={() => navigate('/')}>Leave room</Button> : null}
                        <Button color="inherit" onClick={handleLogout} >Logout</Button>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar >
    )
}