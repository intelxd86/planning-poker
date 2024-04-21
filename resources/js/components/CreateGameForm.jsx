import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, DialogContent, Dialog } from '@mui/material';
import { snackbarNotify } from './Utils';

export default function CreateGameForm() {
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
        try {
            const response = await window.axios.post('/api/room/' + uuid + '/game', { name: gameName, deck: deckUUID });
            if (response.status === 200) {
                setOpen(false);
            }
        } catch (error) {
            snackbarNotify(error.response.data.errors)
        }
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
            <Button color="inherit" onClick={handleClickOpen}>
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
                            Create game
                        </Button>
                    </Box>
                </DialogContent>

            </Dialog>
        </React.Fragment >
    )
}