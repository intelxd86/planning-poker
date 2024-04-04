import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, useParams, Routes, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { Typography, Box, Container, Button, TextField, Grid, Autocomplete, ButtonGroupContext, FormControl, InputLabel, Select, MenuItem, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function PokerRoom() {
    const [users, setUsers] = useState([]);
    const { uuid } = useParams();
    const [roomState, setRoomState] = useState({});

    useEffect(() => {

        const response = window.axios.get('/api/room/' + uuid);
        response.then((response) => {
            setRoomState(response.data);
            console.log(response.data);
        });

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
            .listen('NewGameEvent', (event) => {
                console.log(event);
            })
            .listen('GameEndEvent', (event) => {
                console.log(event);
            })
            .listen('VoteEvent', (event) => {
                console.log(event);
            })
            .listen('UserSpectatorEvent', (event) => {
                console.log(event);
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
            <CreateNewGame />
        </div>
    );
};

function CreateNewGame() {
    const { uuid } = useParams();
    const [gameName, setGameName] = useState('');
    const [deckUUID, setDeckUUID] = useState('');
    const [decks, setDecks] = useState([]);

    useEffect(() => {
        window.axios.get('/api/deck').then((response) => {
            const deckOptions = response.data.map((deck) => ({ label: deck.name + ' (' + deck.cards + ')', id: deck.uuid }));
            setDecks(deckOptions);
            setDeckUUID(deckOptions[0].id);
        });
    }, []);

    async function submitCreateGame(e) {
        e.preventDefault();
        const response = await window.axios.post('/api/room/' + uuid + '/game', { name: gameName, deck: deckUUID });
    }

    function handleDeckChange(event) {
        setDeckUUID(event.target.value);
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
                    <FormControl
                        fullWidth
                        sx={{ m: 1 }}
                    >
                        <InputLabel id="game-deck-select-label">Card deck</InputLabel>
                        <Select
                            labelId="game-deck-select-label"
                            id="game-deck-select"
                            value={deckUUID}
                            label="Deck UUID"
                            onChange={handleDeckChange}
                        >
                            {decks.map((deck) => (
                                <MenuItem key={deck.id} value={deck.id}>
                                    {deck.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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

function TopNav() {
    function Logout() {
        window.axios.post('/api/user/logout').then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            }
        });
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Button color="inherit" onClick={Logout}>Logout</Button>
            </Toolbar>
        </AppBar >
    )
}

function Layout() {
    return (
        <>
            <TopNav />
            <Outlet />
        </>
    );
}

export default PokerRoom;

if (document.getElementById('poker')) {
    const Index = ReactDOM.createRoot(document.getElementById("poker"));

    Index.render(
        <React.StrictMode>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />} >
                        <Route index element={<Lobby />} />
                        <Route path="/room/:uuid" element={<PokerRoom />} />
                        <Route path="*" element={<Lobby />} />
                    </Route>
                </Routes>
            </Router>
        </React.StrictMode>
    )
}
