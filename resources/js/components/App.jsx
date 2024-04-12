import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './Lobby';
import PokerRoom from './Poker';
import Layout from './Layout';
import { SnackbarProvider } from 'notistack';
import { AppStateProvider } from './AppStateContext';

if (document.getElementById('app')) {
    const Index = ReactDOM.createRoot(document.getElementById("app"));

    Index.render(
        <React.StrictMode>
            <AppStateProvider>
                <SnackbarProvider>
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
            </AppStateProvider>
        </React.StrictMode>
    )
}