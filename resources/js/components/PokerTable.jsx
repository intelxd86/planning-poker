import React from 'react';
import { useAppState } from './AppStateContext';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { Chip, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import HelpIcon from '@mui/icons-material/Help';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import { blueGrey, indigo } from '@mui/material/colors';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GameInfo from './GameInfo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function PokerTable() {
    const { state, setState } = useAppState();
    const currentTheme = useTheme();
    const { tableCard } = currentTheme.customComponents;

    return (
        <Container sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
            <GameInfo />
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
                                    backgroundColor: state.room?.game?.voted?.some(u => u.uuid === user.uuid) ? tableCard.selectedBackgroundColor : tableCard.backgroundColor,
                                    transition: 'all 0.1s ease-in-out',
                                }}
                            >
                                {state.room?.game?.voted?.some(u => u.uuid === user.uuid) ?
                                    state.room?.game?.result?.votes !== null && state.room?.game?.result?.votes.hasOwnProperty(user.uuid)
                                        ? <Typography sx={{ fontSize: '30px' }} color={'primary'}>
                                            {state.room?.game?.result?.votes[user.uuid]}
                                        </Typography> : <CheckCircle sx={{ fontSize: '40px' }} color='success' />
                                    : state.room?.spectators?.includes(user.uuid) ? <VisibilityIcon fontSize='large' /> :  state.room?.game?.reveal ? <HighlightOffIcon fontSize='large' /> : <HelpIcon fontSize='large' /> }
                            </Card>
                            <Chip
                                icon={state.ws_users?.some(u => u.uuid === user.uuid) ? <AccountCircleIcon /> : <NoAccountsIcon />}
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