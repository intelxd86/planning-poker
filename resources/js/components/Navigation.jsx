import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useAppState } from './AppStateContext';
import CreateGameForm from './CreateGameForm';
import { useNavigate } from 'react-router-dom';
import { snackbarNotify } from './Utils';
import CreateRoom from './CreateRoom';

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
            await window.axios.post('/api/room/' + state.room.room + '/game/' + state.room.game + '/end');
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
                {state.room ? <Button color="inherit" onClick={() => navigate('/')}>Leave Room</Button> : null}
                {(state.room && state.room.owner === state.user.uuid) ?
                    state.room.game === null ? <CreateGameForm /> : <Button color="inherit" onClick={handleRevealVotes()}>Reveal Cards</Button>
                    : null}
                {state.room ?
                    state.room.spectators.includes(state.user.uuid) ? <Button color="inherit" onClick={handleUnsetSpectator()}>Unset spectator</Button> : <Button color="inherit" onClick={handleSetSpectator()}>Become spectator</Button>
                    : <CreateRoom />}
                <Button color="inherit" onClick={handleLogout} >Logout</Button>
            </Toolbar>
        </AppBar >
    )
}