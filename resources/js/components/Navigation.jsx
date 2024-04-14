import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useAppState } from './AppStateContext';
import CreateGameForm from './CreateGameForm';
import { useNavigate } from 'react-router-dom';

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
                // snackbar
            } else {
                console.error(error);
            }
        }
    };

    console.log('nav', state.room, state.user.uuid)

    return (
        <AppBar position="static">
            <Toolbar>
                {state.room ? <Button color="inherit" onClick={() => navigate('/')}>Leave Room</Button> : null}
                {(state.room && state.room.owner === state.user.uuid) ? <CreateGameForm /> : null}
                <Button color="inherit" onClick={handleLogout} >Logout</Button>
            </Toolbar>
        </AppBar >
    )
}