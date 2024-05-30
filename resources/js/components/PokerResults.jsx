import { Typography } from '@mui/material';
import React, { useState } from 'react';
import { useAppState } from './AppStateContext';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Histogram from './Histogram';
import { snackbarNotify } from './Utils';
import { enqueueSnackbar } from 'notistack';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';


export default function PokerResults() {
    const { state, setState } = useAppState();
    const [openDialog, setOpenDialog] = useState(false);

    const RestartGameDialog = ({ open, onClose, onConfirm }) => {
        return (
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Restart game"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to restart the game? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleConfirmRestart = () => {
        submitRestartGame();
        setOpenDialog(false);
    };

    async function submitRestartGame() {
        try {
            const response = await window.axios.post('/api/room/' + state.room.room + '/game/' + state.room.game.uuid + '/restart');
            if (response.status === 200) {
                enqueueSnackbar('Game restarted', { variant: 'success' })
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                snackbarNotify(error.response.data.errors)
            }
            else {
                console.error(error);
            }
        }
    }

    return (
        <>
            <Container
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 2,
                }}
            >
                <Button
                    variant='contained'
                    fullWidth={false}
                    margin='dense'
                >
                    Voting history
                </Button>
                <Button
                    variant='outlined'
                    fullWidth={false}
                    margin='dense'
                    onClick={handleOpenDialog}
                >
                    Restart game
                </Button>
                <RestartGameDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    onConfirm={handleConfirmRestart}
                />
            </Container>
            {state.room.game ? <Container sx={{ flexGrow: 0, mb: 5 }}>
                <Divider orientation="horizontal" flexItem sx={{ my: 2 }}>
                    <Chip label="Game result" />
                </Divider>
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
                        Mode: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.modes || '-'}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Min: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.min || '-'}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Max: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.max || '-'}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Average: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.average || '-'}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Median: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.median || '-'}</Typography>
                    </Typography>
                </Card>
            </Container> : null}
            <Histogram data={state.room?.game?.result?.histogram || {}} />
        </>
    )
}