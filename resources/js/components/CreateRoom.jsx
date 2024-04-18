import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

export default function CreateRoom() {

    const navigate = useNavigate();

    const handleCreateRoom = () => async (e) => {
        e.preventDefault();
        try {
            const response = await window.axios.post('/api/room');
            if (response.status === 200) {
                navigate('/room/' + response.data.room);
            }
        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            }
        }
    }

    return (
        <Button color="inherit" onClick={handleCreateRoom()}>
            Create room
        </Button>
    )
}