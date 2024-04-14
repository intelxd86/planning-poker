
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { useAppState } from './AppStateContext';
import LoginForm from './LoginForm';

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

export default function Lobby() {

    const { state, setState } = useAppState();

    useEffect(() => {
        setState(prevState => ({ ...prevState, room: null, users: [] }));
    }, []);

    if (!state.user) {
        return (
            <LoginForm />
        )
    }

    return (
        <Container maxWidth="sm">
            <CreateRoom />
            <ListRooms />
        </Container>
    );
}