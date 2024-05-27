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
                    Room: <Typography color="secondary" variant='body1' component='span'>{state.room?.name}</Typography>
                </Typography>

                <Divider orientation="vertical" variant="middle" flexItem />
                {state.room.game ? <>

                    <Typography variant='body1'>
                        Game: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.name}</Typography>
                    </Typography>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Typography variant='body1'>
                        Game state: <Typography color="secondary" variant='body1' component='span'>{state.room?.game?.ended ? 'Finished' : 'Ongoing'}</Typography>
                    </Typography>
                </>
                    : <Typography variant='body1'>
                        No ongoing or past game. <Typography color="secondary" variant='body1' component='span'>Create new game!</Typography>
                    </Typography>
                }
                <Divider orientation="vertical" variant="middle" flexItem />
                <Typography variant='body1'>
                    Operator: <Typography color="secondary" variant='body1' component='span'>{state.room?.owner?.name}</Typography>
                </Typography>
            </Card>
        </Container>
    )
}