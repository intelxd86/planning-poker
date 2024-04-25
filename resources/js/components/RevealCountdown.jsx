import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import { useAppState } from './AppStateContext';
import { snackbarNotify } from './Utils';

function RevealCountdown() {
    const [count, setCount] = useState(null);
    const { state, setState } = useAppState();

    const startCountdown = (duration) => {
        setCount(duration);
    };

    useEffect(() => {
        if (state.room?.game?.ended === true && state.room?.game?.reveal === false && state.room?.game?.result === null) {
            startCountdown(3);
        }
    }, [state.room?.game?.ended]);

    useEffect(() => {
        let intervalId;

        if (count > 0) {
            intervalId = setInterval(() => {
                setCount((prevCount) => prevCount - 1);
            }, 1000);
        } else if (count === 0) {
            clearInterval(intervalId);

            window.axios.post('/api/room/' + state.room.room + '/game/' + state.room.game.uuid + '/reveal')
                .then(response => {
                    if (response.status === 200) {
                        setState(prevState => ({
                            ...prevState,
                            room: {
                                ...prevState.room,
                                game: {
                                    ...prevState.room.game,
                                    result: response.data,
                                    reveal: true,
                                }
                            }
                        }))
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        snackbarNotify(error.response.data.errors)
                    } else {
                        console.error(error);
                    }
                });
        }

        return () => clearInterval(intervalId);
    }, [count]);


    if (!count || count === 0) {
        return null;
    }

    return (
        <div>
            <Typography variant="h4" textAlign={'center'}>{count}...</Typography>
        </div>
    );
}

export default RevealCountdown;
