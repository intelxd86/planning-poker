import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    let initialState = window.state || {};

    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
        initialState = { ...initialState, darkMode: JSON.parse(storedDarkMode) };
    } else if (prefersDarkMode) {
        initialState = { ...initialState, darkMode: true };
    }

    const [state, setState] = useState(initialState);

    useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode !== null) {
            setState(prevState => ({
                ...prevState,
                darkMode: JSON.parse(storedDarkMode)
            }));
        }
    }, []);

    return (
        <AppStateContext.Provider value={{ state, setState }}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    return useContext(AppStateContext);
}
