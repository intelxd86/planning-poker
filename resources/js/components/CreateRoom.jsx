import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import useTextInput from './UseTextInput';
import { Dialog, DialogContent, Box } from '@mui/material';
import { snackbarNotify } from './Utils';
import GroupIcon from '@mui/icons-material/Group';

export default function CreateRoom() {
    const [formState, setFormState] = useState({ errors: {} });
    const [open, setOpen] = React.useState(false);
    const [roomNameInput, roomName, setRoomName] = useTextInput('name', formState, { label: 'Room name', required: true, id: 'room_name', type: 'text', margin: 'dense' });
    const navigate = useNavigate();

    const handleCreateRoom = () => async (e) => {
        e.preventDefault();
        try {
            const response = await window.axios.post('/api/room', { name: roomName });
            if (response.status === 200) {
                navigate('/room/' + response.data.room);
                setOpen(false);
            }
        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
                if (error.response && error.response.status === 422) {
                    setFormState(prev => ({ ...prev, errors: error.response.data.errors }));
                }
            }
        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <React.Fragment>
            <Button color="inherit" onClick={handleClickOpen} startIcon={<GroupIcon />}>
                Create new room
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>

                    {roomNameInput}
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        margin="dense"
                        sx={{ mt: 1 }}
                        onClick={handleCreateRoom()}
                    >
                        Create room
                    </Button>
                </DialogContent>

            </Dialog>
        </React.Fragment >
    )
}