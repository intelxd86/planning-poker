import React from 'react';
import { useAppState } from './AppStateContext';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

export default function PokerTable() {
    const { state, setState } = useAppState();

    return (
        <Container sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={3}
            >
                {
                    state.users && state.users.map((user) => (
                        <Grid item>
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