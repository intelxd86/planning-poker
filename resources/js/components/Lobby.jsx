
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { useAppState } from './AppStateContext';

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

export default function Lobby() {

    const { state, setState } = useAppState();

    useEffect(() => {
        setState(prevState => ({ ...prevState, room: null, users: []}));
    }, []);

    return (
        <Container maxWidth="sm">
            <ListRooms />
        </Container>
    );
}