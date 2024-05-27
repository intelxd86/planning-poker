import { Typography } from '@mui/material';
import React from 'react';
import { useAppState } from './AppStateContext';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';

export default function PokerResults() {
    const { state, setState } = useAppState();

    return (
        <>
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
                        Minimum: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.min}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Maximum: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.max}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Average: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.average}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Median: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.result?.median}</Typography>
                    </Typography>
                </Card>
            </Container> : null}
        </>
    )
}