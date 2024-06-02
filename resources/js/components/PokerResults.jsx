import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppState } from './AppStateContext';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Histogram from './Histogram';
import { snackbarNotify } from './Utils';
import { enqueueSnackbar } from 'notistack';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { AppBar, Toolbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

export default function PokerResults() {
    const { state, setState } = useAppState();
    const [openRestartDialog, setOpenRestartDialog] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);

    const [gameHistory, setGameHistory] = useState([]);

    const fetchGameHistory = async () => {
        try {
            const response = await window.axios.get('/api/room/' + state.room.room + '/history');
            if (response.status === 200) {
                setGameHistory(response.data);
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

    useEffect(() => {
        if (state.room?.game?.reveal) {
            fetchGameHistory();
        }
    }, [state.room?.game?.reveal]);

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.zebra
        },
        '& td, & th': {
            borderColor: theme.palette.divider
        }
    }));
    const GameHistoryDialog = ({ open, onClose }) => {
        return (
            <Dialog
                open={open}
                onClose={onClose}
                scroll='paper'
                fullScreen
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Recently played games
                        </Typography>
                    </Toolbar>
                </AppBar>
                <TableContainer component={Paper}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Game name</TableCell>
                                <TableCell align="right">Ended at</TableCell>
                                <TableCell align="center">Mode</TableCell>
                                <TableCell align="center">Min</TableCell>
                                <TableCell align="center">Max</TableCell>
                                <TableCell align="center">Average</TableCell>
                                <TableCell align="center">Median</TableCell>
                                <TableCell align="center">Votes histogram</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                gameHistory.map((game, index) => (
                                    <StyledTableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {game.name}
                                        </TableCell>
                                        <TableCell align="right">
                                            {new Date(game.ended_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            {game.result?.modes}
                                        </TableCell>
                                        <TableCell align="center">
                                            {game.result?.min || '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {game.result?.max || '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {game.result?.average || '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {game.result?.median || '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Histogram data={game.result?.histogram || {}} />
                                        </TableCell>
                                    </StyledTableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Dialog>
        );
    };

    const RestartGameDialog = ({ open, onClose, onConfirm }) => {
        return (
            <Dialog
                open={open}
                onClose={onClose}
            >
                <DialogTitle>{"Restart game"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to restart the game? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} color="primary" autoFocus variant='contained'>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const handleOpenRestartDialog = () => {
        setOpenRestartDialog(true);
    };

    const handleOpenHistoryDialog = () => {
        setOpenHistoryDialog(true);
    };

    const handleCloseRestartDialog = () => {
        setOpenRestartDialog(false);
    };

    const handleCloseHistoryDialog = () => {
        setOpenHistoryDialog(false);
    };

    const handleConfirmRestart = () => {
        submitRestartGame();
        setOpenRestartDialog(false);
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
            {state.room.game ?<Container
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
                    onClick={handleOpenHistoryDialog}
                >
                    Show past games
                </Button>
                <Button
                    variant='outlined'
                    fullWidth={false}
                    margin='dense'
                    onClick={handleOpenRestartDialog}
                >
                    Restart game
                </Button>
                <RestartGameDialog
                    open={openRestartDialog}
                    onClose={handleCloseRestartDialog}
                    onConfirm={handleConfirmRestart}
                />
                <GameHistoryDialog
                    open={openHistoryDialog}
                    onClose={handleCloseHistoryDialog}
                />
            </Container>}
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