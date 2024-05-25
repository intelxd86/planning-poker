import React, { createContext, useContext, useState } from 'react';
import { useMediaQuery } from '@mui/material';

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    let initialState = window.state || {};
    if (prefersDarkMode) {
        initialState = { ...initialState, darkMode: true };
    }
    const [state, setState] = useState(initialState);
    return (
        <AppStateContext.Provider value={{ state, setState }}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    return useContext(AppStateContext);
}
