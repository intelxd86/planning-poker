import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './Lobby';
import PokerRoom from './PokerRoom';
import Layout from './Layout';
import { SnackbarProvider } from 'notistack';
import { AppStateProvider, useAppState } from './AppStateContext';
import { ThemeProvider } from '@mui/material/styles';
import DarkTheme from './DarkTheme';
import LightTheme from './LightTheme';
import { CssBaseline } from '@mui/material';

function App() {
    const { state, setState } = useAppState();
    return (
        <ThemeProvider theme={state.darkMode ? DarkTheme : LightTheme}>
            <CssBaseline />
            <SnackbarProvider
                maxSnack={5}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />} >
                            <Route index element={<Lobby />} />
                            <Route path="/room/:uuid" element={<PokerRoom />} />
                            <Route path="*" element={<Lobby />} />
                        </Route>
                    </Routes>
                </Router>
            </SnackbarProvider>
        </ThemeProvider>
    )
}

if (document.getElementById('app')) {
    const Index = ReactDOM.createRoot(document.getElementById("app"));

    Index.render(
        <React.StrictMode>
            <AppStateProvider>
                <App />
            </AppStateProvider>
        </React.StrictMode>
    )
}