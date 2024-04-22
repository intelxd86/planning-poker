import React, { useEffect } from 'react';
import { useState } from 'react';
import { Container, Divider } from '@mui/material';
import { useAppState } from './AppStateContext';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { snackbarNotify } from './Utils';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';
import { ThemeContext } from '@emotion/react';
import { useTheme } from '@mui/material/styles';
import { blueGrey, lightBlue } from '@mui/material/colors';

const PokerCard = styled(Card)({
    transition: 'transform 0.1s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)'
    },
});

export default function CardDeck() {
    const { state, setState } = useAppState();
    const [selectedCard, setSelectedCard] = useState(state.room?.game?.user_vote_value ? state.room.game.user_vote_value : null);
    const theme = useTheme();

    useEffect(() => {
        console.log('userVoteValue ', state.room?.game?.user_vote_value);
        const userVoteValue = state.room?.game?.user_vote_value;
        if (userVoteValue !== selectedCard) {
            setSelectedCard(userVoteValue);
        }
    }, [state.room?.game]);

    const selectedCardStyle = {
        backgroundColor: lightBlue[50],
        position: 'relative',
        bottom: '5px',
        transition: 'transform 0.1s ease-in-out',
    };

    if (!state.room || !state.room.game) {
        return null;
    }

    async function selectCard(card) {

        if (state.room.game.ended) {
            return;
        }

        if (String(card) === String(selectedCard)) {
            card = null;
        }

        try {
            const response = await window.axios.post('/api/room/' + state.room.room + '/game/' + state.room.game.uuid + '/vote', card ? { value: card } : {});

            if (response.status === 200) {
                setSelectedCard(card);
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

            <Container sx={{ flexGrow: 0, mb: 5 }}>
                <Divider orientation="horizontal" flexItem sx={{ my: 2 }}>Select your card</Divider>
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                >
                    {state.room.game.cards.map((card) => (
                        <Grid item>
                            <PokerCard
                                justifyContent='center'
                                key={card}
                                style={String(card) === String(selectedCard) ? selectedCardStyle : {}}
                            >
                                <Button
                                    fullWidth
                                    sx={{ minHeight: '100px' }}
                                    onClick={() => selectCard(card)}
                                    key={card}
                                >
                                    {card}
                                </Button>
                            </PokerCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    )
}