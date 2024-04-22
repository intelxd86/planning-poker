import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, DialogContent, Dialog } from '@mui/material';
import { snackbarNotify } from './Utils';
import useTextInput from './UseTextInput';
import PollIcon from '@mui/icons-material/Poll';
import { Poll } from '@mui/icons-material';

export default function CreateGameForm() {
    const [formState, setFormState] = useState({ errors: {} });
    const { uuid } = useParams();
    const [gameNameInput, gameName, setGameName] = useTextInput('name', formState, { label: 'Game name', required: true, id: 'game_name', type: 'text', margin: 'dense' });
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
            <Button color="inherit" onClick={handleClickOpen} startIcon={<PollIcon />}>
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

                    {gameNameInput}
                    <FormControl
                        fullWidth
                        margin='dense'
                        sx={{ mb: 1 }}
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
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        margin="dense"
                    >
                        Create game
                    </Button>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}