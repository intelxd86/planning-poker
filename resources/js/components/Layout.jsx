
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import Navigation from './Navigation';
import LoginForm from './LoginForm';
import { Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function Layout() {
    const { state } = useAppState();

    if (!state.user) {
        return <LoginForm />
    }

    const theme = useTheme();
    return (
        <>
            <Navigation />
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight + 8}px)`,
                }}
                padding={0}
                margin={0}
            >
                <Outlet />
            </Container>
        </>
    );
}