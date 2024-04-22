import React from 'react';
import { useAppState } from './AppStateContext';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { Chip, Typography } from '@mui/material';
import Face2Icon from '@mui/icons-material/Face2';
import Face6Icon from '@mui/icons-material/Face6';
import { CheckCircle } from '@mui/icons-material';
import HelpIcon from '@mui/icons-material/Help';
import Divider from '@mui/material/Divider';

function Test() {
    return (
        <Typography variant="h6">13</Typography>
    )
}


export default function PokerTable() {
    const { state, setState } = useAppState();

    const fakeUsers = [
        { uuid: 1, name: 'John Doe', voted: true },
        { uuid: 2, name: 'Jane Doe', voted: false },
        { uuid: 3, name: 'Alice', voted: true },
        { uuid: 4, name: 'Bob', voted: false },
        { uuid: 5, name: 'Charlie', voted: true },
        { uuid: 6, name: 'David', voted: false },
        { uuid: 7, name: 'Eve', voted: true }
    ];

    return (
        <Container sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
            <Divider orientation="horizontal" flexItem sx={{ my: 2 }}>{state.room?.game?.name}</Divider>
            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={3}
            >
                {
                    //fakeUsers.map((user) => (
                    state.users && state.users.map((user) => (
                        <Grid item key={user.uuid} >

                            <Chip
                                color={user.voted = state.room?.game?.voted.includes(state.user.uuid) ? 'primary' : 'default'}
                                key={user.uuid}
                                deleteIcon={state.room?.game?.voted.includes(state.user.uuid) ? <CheckCircle /> : <HelpIcon fontSize="large" />}
                                onDelete={() => { }}
                                icon={<Face6Icon/>}
                                label={user.name}
                            />

                        </Grid>
                    ))
                }
            </Grid>
        </Container >
    )
}