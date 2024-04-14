
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import Navigation from './Navigation';

export default function Layout() {
    const { state } = useAppState();
    return (
        <>
            {state.user ? <Navigation /> : null}
            <Outlet />
        </>
    );
}