
import React, { useState } from 'react';
import useTextInput from './UseTextInput';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { snackbarNotify } from './Utils';
import { useAppState } from './AppStateContext';
import { enqueueSnackbar } from 'notistack';

export default function CreateDeckForm(props) {
    const [formState, setFormState] = useState({ errors: {} });
    const [open, setOpen] = React.useState(false);
    const { state, setState } = useAppState();

    const [nameInput, name, setName] = useTextInput('name', formState, { label: 'Name', required: true, id: 'deck_name', margin: 'dense' });
    const [cardsInput, cards, setCards] = useTextInput('cards', formState, { label: 'Cards', required: true, id: 'deck_cards', type: 'text', margin: 'dense', helperText: 'Comma separated list of cards, up to 3 characters per value' });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    async function submitCreateDeck(e) {
        e.preventDefault();
        try {
            const response = await window.axios.post('/api/deck/', { name: name, cards: cards });
            if (response.status === 200) {
                setOpen(false);
                props.setState(prevState => ({
                    ...prevState,
                    fetchDeck: true,
                    overrideDeckUUID: response.data.deck
                }));
                enqueueSnackbar('Deck created', { variant: 'success' })
                setName('');
                setCards('');
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                snackbarNotify(error.response.data.errors)
            }
            else {
                console.error(error);
            }
        }
    }

    return (
        <React.Fragment>
            <Button
                onClick={handleClickOpen}
                margin="dense"
                fullWidth
                sx={{ mt: 1 }}
                variant="outlined"
            >
                Create new deck
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{}}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    {nameInput}
                    {cardsInput}
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        margin="dense"
                        sx={{ mt: 1 }}
                        onClick={submitCreateDeck}
                    >
                        Create deck
                    </Button>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        fullWidth
                        margin="dense"
                        sx={{ mt: 1 }}
                    >
                        Cancel
                    </Button>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}