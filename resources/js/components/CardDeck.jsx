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
import { styled, useTheme } from '@mui/system';
import { ThemeContext } from '@emotion/react';
import { blueGrey, lightBlue } from '@mui/material/colors';

const PokerCard = styled(Card)(({ theme }) => {
    const currentTheme = useTheme();
    const { pokerCard } = currentTheme.customComponents;

    return {
        transition: 'all 0.1s ease-in-out',
        backgroundColor: pokerCard.backgroundColor,
        color: pokerCard.color,
        '&:hover': {
            transform: 'scale(1.1)',
        },
    };
});

export default function CardDeck() {
    const { state, setState } = useAppState();
    const [selectedCard, setSelectedCard] = useState(state.room?.game?.user_vote_value ? state.room.game.user_vote_value : null);
    const currentTheme = useTheme();
    const { pokerCard } = currentTheme.customComponents;

    useEffect(() => {
        const userVoteValue = state.room?.game?.user_vote_value;
        if (userVoteValue !== selectedCard) {
            setSelectedCard(userVoteValue);
        }
    }, [state.room?.game?.user_vote_value]);

    const selectedCardStyle = {
        backgroundColor: pokerCard.selectedBackgroundColor,
        position: 'relative',
        bottom: '5px',
        transition: 'all 0.1s ease-in-out',
    };

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
                setState(prev => (
                    {
                        ...prev,
                        room:
                        {
                            ...prev.room,
                            game:
                            {
                                ...prev.room.game,
                                user_vote_value: card
                            }
                        }
                    }));
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

    if (!state.room.game) {
        return null;
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
                        <Grid item
                            key={card}>
                            <PokerCard
                                style={String(card) === String(selectedCard) ? selectedCardStyle : {}}
                            >
                                <Button
                                    fullWidth
                                    sx={{ minHeight: '100px' }}
                                    onClick={() => selectCard(card)}
                                    size='large'
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