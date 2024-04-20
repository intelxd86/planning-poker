import React from 'react';
import { useState } from 'react';
import { Container } from '@mui/material';
import { useAppState } from './AppStateContext';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { snackbarNotify } from './Utils';
import Typography from '@mui/material/Typography';

export default function CardDeck() {
    const { state, setState } = useAppState();
    const [selectedCard, setSelectedCard] = useState(null);

    if (!state.room || !state.room.game) {
        return null;
    }

    async function selectCard(card) {
        setSelectedCard(card);
        try {
            const response = await window.axios.post('/api/room/' + state.room.room + '/game/' + state.room.game.uuid + '/vote', { value: card });

            if (response.status === 200) {

            }

        } catch (error) {
            if (error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            }
            else {
                console.error(error);
            }
        }
    }


    return (
        <>
            <Container sx={{flexGrow:0, mb: 5}}>
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                >
                    <Typography variant="h4" gutterBottom>
                        Select a card
                    </Typography>
                    {state.room.game.cards.map((card) => (
                        <Grid item>
                            <Card
                                justifyContent='center'
                                key={card}
                                className={card === selectedCard ? 'selected' : ''}
                            >
                                <Button
                                    fullWidth
                                    sx={{ minHeight: '100px' }}
                                    onClick={() => selectCard(card)}
                                >
                                    {card}
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    )
}