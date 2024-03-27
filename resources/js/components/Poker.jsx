import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, useParams, Routes, useNavigate, Navigate } from 'react-router-dom';
import { Typography, Box, Container, Button, TextField, Grid, Autocomplete, ButtonGroupContext } from '@mui/material';

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

function CreateNewGame() {

    const [gameName, setGameName] = useState('');
    const [deckUUID, setDeckUUID] = useState('');

    async function submitCreateGame(e) {
        e.preventDefault();
        const response = await window.axios.post('/api/room/', { name: gameName, deck: deckUUID });
        console.log(response.data);
    }

    return (
        <Box
            component="form"
            sx={{
                m: 1, p: 1
            }}
            noValidate
            autoComplete="off"
            onSubmit={submitCreateGame}
        >
            <Box>
                <Box>
                    <TextField
                        label="Game name"
                        variant="outlined"
                        sx={{ m: 1 }}
                        fullWidth
                        onChange={(e) => setGameName(e.target.value)}
                        value={gameName}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Deck UUID"
                        variant="outlined"
                        sx={{ m: 1 }}
                        fullWidth
                        onChange={(e) => setDeckUUID(e.target.value)}
                        value={deckUUID}
                    />
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ m: 1 }}
                        type="submit"
                    >
                        Create new game
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}


function CreateRoom() {

    const navigate = useNavigate();

    async function submitCreateRoom(e) {
        e.preventDefault();
        const response = await window.axios.post('/api/room');
        if (response.status === 200) {
            navigate('/room/' + response.data.room);
        }
    }

    return (
        <Box
            component="form"
            sx={{
                m: 1, p: 1
            }}
            autoComplete="off"
            onSubmit={submitCreateRoom}
        >
            <Box>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{ m: 1 }}
                    type="submit"
                >
                    Create room
                </Button>
            </Box>
        </Box>
    )
}

function ListRooms() {

    const [rooms, setRooms] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        window.axios.get('/api/room').then((response) => {
            setRooms(response.data.rooms);
        });
    }, []);

    return (
        <Box
            sx={{
                m: 1, p: 1
            }}
        >
            <Typography variant="h4">Recent rooms</Typography>
            <ul>
                {rooms.map((room) => (
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ m: 1 }}
                            onClick={() => navigate('/room/' + room)}
                            key={room}
                        >
                            {room}
                        </Button>
                ))}
            </ul>
        </Box>
    )
}

function Lobby() {

    return (
        <Container maxWidth="sm">
            <CreateRoom />
            <ListRooms />
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
