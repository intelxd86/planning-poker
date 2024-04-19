import React from 'react';
import { Container } from '@mui/material';
import { useAppState } from './AppStateContext';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';



export default function CardDeck() {
    const { state, setState } = useAppState();

    if (!state.room || !state.room.game) {
        return null;
    }

    const selectCard = (card) => {
        console.log(card);
        /*window.axios.post('/api/room/' + state.room.uuid + '/game/card', { card: card })
            .then((response) => {
                setState(prevState => ({ ...prevState, room: response.data }));
            }).catch((error) => {
                console.error(error);
            });*/
    }

    return (
        <>
            <Container>
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                >
                    {state.room.game.cards.map((card) => (
                        <Grid item>
                            <Card sx={{
                                minHeight: '50px',
                                p: 4,
                                cursor: "pointer"
                            }}
                                justifyContent='center' onClick={() => selectCard(card)}
                                key={card}>
                                {card}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    )
}