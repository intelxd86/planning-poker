
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useAppState } from './AppStateContext';

function TopNav() {
    const { state, setState } = useAppState();
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

    return (
        <AppBar position="static">
            <Toolbar>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Toolbar>
        </AppBar >
    )
}

export default function Layout() {
    const { state } = useAppState();
    return (
        <>
            { state.user ? <TopNav /> : null }
            <Outlet />
        </>
    );
}