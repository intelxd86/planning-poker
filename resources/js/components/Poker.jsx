import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, DialogContent, Dialog } from '@mui/material';
import { useAppState } from './AppStateContext';

function PokerRoom() {
    const { state, setState } = useAppState();
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
        <>
            <div>
                <h2>Online Users</h2>
                <ul>
                    {users.map((user) => (
                        <li key={user.id}>{user.name}</li>
                    ))}
                </ul>
            </div>
            {roomState.owner === state.user ? <CreateNewGame /> : null}
        </>
    );
};

function CreateNewGame() {
    const { uuid } = useParams();
    const [gameName, setGameName] = useState('');
    const [deckUUID, setDeckUUID] = useState('');
    const [decks, setDecks] = useState([]);
    const [open, setOpen] = React.useState(false);

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={handleClickOpen}>
                Create new game
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: submitCreateGame
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>

                    <Box
                        sx={{ p: 1 }}
                    >
                        <TextField
                            label="Game name"
                            variant="outlined"
                            fullWidth
                            onChange={(e) => setGameName(e.target.value)}
                            value={gameName}
                        />
                    </Box>
                    <Box
                        sx={{ p: 1 }}
                    >
                        <FormControl
                            fullWidth
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
                    <Box
                        sx={{ p: 1 }}
                    >
                        <Button
                            variant="contained"
                            fullWidth
                            type="submit"
                        >
                            Create new game
                        </Button>
                    </Box>
                </DialogContent>

            </Dialog>
        </React.Fragment >
    )
}

export default PokerRoom