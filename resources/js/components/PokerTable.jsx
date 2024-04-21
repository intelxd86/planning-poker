import React from 'react';
import { useAppState } from './AppStateContext';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';

export default function PokerTable() {
    const { state, setState } = useAppState();

    return (
        <Container sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom textAlign={'center'}>
                Game: {state.room?.game?.name}
            </Typography>
            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={3}
            >
                {
                    state.users && state.users.map((user) => (
                        <Grid item key={user.uuid}>
                            <Card key={user.uuid}>
                                {user.name}
                            </Card>
                        </Grid>
                    ))
                }
            </Grid>
        </Container>
    )
}