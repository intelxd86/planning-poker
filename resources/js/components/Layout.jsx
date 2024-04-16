
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import Navigation from './Navigation';
import LoginForm from './LoginForm';

export default function Layout() {
    const { state } = useAppState();

    if (!state.user) {
        return <LoginForm />
    }
    return (
        <>
            <Navigation />
            <Outlet />
        </>
    );
}