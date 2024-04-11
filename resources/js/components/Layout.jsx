
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';

function TopNav() {
    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            const response = await window.axios.post('/api/user/logout');
            if (response.status === 200) {
                window.location.reload();
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
    return (
        <>
            <TopNav />
            <Outlet />
        </>
    );
}