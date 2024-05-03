import React from 'react';
import { Container, Card, Typography, Divider } from '@mui/material';
import { useAppState } from './AppStateContext';


export default function GameInfo() {
    const { state } = useAppState();

    return (
        <Container sx={{ py: 3 }}>
            <Card sx={{
                margin: '0 auto',
                maxWidth: 'fit-content',
                width: 'auto',
                display: 'flex',
                '& hr': {
                    mx: 0.5,
                },
                '& p': {
                    my: 1,
                    mx: 2
                },
            }}
            >
                <Typography variant='body1'>
                    Game: {state.room?.game?.name}
                </Typography>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Typography variant='body1'>
                    Game state: {state.room?.game?.ended ? 'Ended' : 'Ongoing'}
                </Typography>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Typography variant='body1'>
                    Operator: {state.room?.owner?.name}
                </Typography>
            </Card>
        </Container>
    )
}