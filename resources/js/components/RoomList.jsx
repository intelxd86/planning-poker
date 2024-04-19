import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export default function RoomList() {

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
            <Typography variant="h6" align="center">My rooms</Typography>

                {rooms.map((room) => (
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ m: 1 }}
                        onClick={() => navigate('/room/' + room.uuid)}
                        key={room.uuid}
                    >
                        {room.name}
                    </Button>
                ))}

        </Box>
    )
}