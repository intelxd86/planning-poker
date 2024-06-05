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
import BlockIcon from '@mui/icons-material/Block';
import Tooltip from '@mui/material/Tooltip';

export default function PokerTable() {
    const { state, setState } = useAppState();
    const currentTheme = useTheme();
    const { tableCard } = currentTheme.customComponents;

    const handleBanUser = (uuid) => () => {

    }

    const isRoomOwner = state.room?.owner.uuid === state.user.uuid || false;

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
                                        </Typography> : <Tooltip title="User voted"><CheckCircle sx={{ fontSize: '40px' }} color='success' /></Tooltip>
                                    : state.room?.spectators?.includes(user.uuid) ? <Tooltip title="Spectator"><VisibilityIcon fontSize='large' /></Tooltip> : state.room?.game?.reveal ? <Tooltip title="User didn't vote"><HighlightOffIcon fontSize='large' /></Tooltip> : <Tooltip title="User didn't vote yet"><HelpIcon fontSize='large' /></Tooltip>}
                            </Card>
                            <Chip
                                icon={state.ws_users?.some(u => u.uuid === user.uuid) ? <Tooltip title="User online"><AccountCircleIcon /></Tooltip> : <Tooltip title="User offline"><NoAccountsIcon /></Tooltip>}
                                label={user.name}
                                sx={{ mt: 1 }}
                                /*onDelete={isRoomOwner ? handleBanUser(user.uuid) : null}*/
                                deleteIcon={isRoomOwner ? <Tooltip title="Ban user"><BlockIcon /></Tooltip> : null}
                            />
                        </Grid>
                    ))

                }
            </Grid>
        </Container >
    )
}