
import React, { useEffect } from 'react';
import { Container } from '@mui/material';
import { useAppState } from './AppStateContext';
import RoomList from './RoomList';


export default function Lobby() {
    const { state, setState } = useAppState();

    useEffect(() => {
        setState(prevState => ({ ...prevState, room: null, users: [] }));
    }, []);

    return (
        <Container maxWidth="sm">
            <RoomList />
        </Container>
    );
}