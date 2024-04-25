import React from 'react';
import { useEffect, useState } from 'react';
import { useAppState } from './AppStateContext';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { Chip, Typography } from '@mui/material';
import Face2Icon from '@mui/icons-material/Face2';
import Face6Icon from '@mui/icons-material/Face6';
import { CheckCircle } from '@mui/icons-material';
import HelpIcon from '@mui/icons-material/Help';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { light } from '@mui/material/styles/createPalette';
import { blueGrey, grey, indigo, lightBlue, purple } from '@mui/material/colors';


function Test() {
    return (
        <Typography variant="h6">13</Typography>
    )
}


export default function PokerTable() {
    const { state, setState } = useAppState();

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

                    state.users && state.users.map((user) => (
                        <Grid
                            item
                            key={user.uuid}
                            justifyContent="center"
                            alignItems="center"
                            textAlign={'center'}
                        >
                            <Card
                                sx={{
                                    width: '64px',
                                    height: '100px',
                                    m: '0 auto',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: state.room?.game?.voted.some(u => u.uuid === user.uuid) ? indigo[50] : blueGrey[50],
                                    transition: 'all 0.1s ease-in-out',
                                }}
                            >
                                {state.room?.game?.voted.some(u => u.uuid === user.uuid) ?
                                    state.room?.game?.result?.votes !== null && state.room?.game?.result?.votes.hasOwnProperty(user.uuid)
                                        ? <Typography sx={{ fontSize: '40px' }} color={'primary'}>
                                            {state.room?.game?.result?.votes[user.uuid]}
                                        </Typography> : <CheckCircle sx={{ fontSize: '40px' }} color='primary' />
                                    : <HelpIcon fontSize='large' />}
                            </Card>
                            <Chip
                                icon={<Face6Icon />}
                                label={user.name}
                                sx={{ mt: 1 }}
                            />
                        </Grid>
                    ))

                }
            </Grid>
        </Container >
    )
}