import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, useParams, Routes } from 'react-router-dom';
import { Typography, Box, Container, Button, TextField, Grid, Autocomplete } from '@mui/material';

function PokerRoom() {
    const [users, setUsers] = useState([]);
    const { uuid } = useParams();

    useEffect(() => {
        const channel = window.Echo.join('room.' + uuid);

        channel
            .here((currentUsers) => {
                setUsers(currentUsers);
            })
            .joining((user) => {
                setUsers((prevUsers) => {
                    if (prevUsers.some((u) => u.id === user.id)) {
                        return prevUsers;
                    } else {
                        return [...prevUsers, user];
                    }
                });
            })
            .leaving((user) => {
                setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
            })
            .error((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div>
            <h2>Online Users</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
};

function CreateRoom() {
    return (
        <Box
            component="form"
            sx={{
                m: 1, p: 1
            }}
            noValidate
            autoComplete="off"
        >
            <Grid
                container
                alignItems="center"
                direction="column"
            >
                <Grid item>
                    <TextField label="Room name" variant="outlined" sx={{ m: 1 }} />
                </Grid>
                <Grid item>
                    <TextField label="Deck UUID" variant="outlined" sx={{ m: 1 }} />
                </Grid>
                <Grid item>
                    <Button variant="contained" sx={{ m: 1 }}>Create room</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function Lobby() {

    return (
        <Container maxWidth="sm">
            <CreateRoom />
        </Container>
    );
}

export default PokerRoom;

if (document.getElementById('poker')) {
    const Index = ReactDOM.createRoot(document.getElementById("poker"));

    Index.render(
        <React.StrictMode>
            <Router>
                <Routes>
                    <Route path="/room/:uuid" element={<PokerRoom />} />
                    <Route path="*" element={<Lobby />} />
                </Routes>
            </Router>
        </React.StrictMode>
    )
}
