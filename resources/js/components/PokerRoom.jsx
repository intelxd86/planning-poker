import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import { useNavigate } from 'react-router-dom';
import CardDeck from './CardDeck';
import { Container } from '@mui/material';
import PokerTable from './PokerTable';
import Countdown from './Countdown';

function PokerRoom() {
    const { state, setState } = useAppState();
    const { uuid } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            try {
                const room = await fetchRoom();
                if (!room) {
                    navigate('/');
                    return;
                }
                if (room.game) {
                    const game = await fetchGame(room.game.uuid);
                    game.reveal_countdown = false;
                    room.game = game
                }
                await joinChannel();

                setState(prevState => ({
                    ...prevState,
                    room: {
                        ...prevState.room,
                        ...room
                    },
                    users: room.game?.voted || []
                }));
            } catch (error) {
                console.error(error);
            }
        }

        init();

        return () => {
            window.Echo.leave('room.' + uuid);
        };
    }, []);

    const fetchGame = async (game) => {
        try {
            const response = await window.axios.get('/api/room/' + uuid + '/game/' + game)
            return response.data;
        } catch (error) {
            if (error.response && error.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            }
            console.error(error);
            throw error;
        }
    }

    const fetchRoom = async () => {
        try {
            const response = await window.axios.get('/api/room/' + uuid)
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
            }
            console.error(error);
            return null;
        }
    }

    const joinChannel = async () => {

        const channel = window.Echo.join('room.' + uuid);

        channel
            .here((currentUsers) => {
                setState(prevState => {
                    const existingUuids = new Set(prevState.users.map(user => user.uuid));
                    const newUsers = currentUsers.filter(user => !existingUuids.has(user.uuid));

                    return {
                        ...prevState,
                        users: [...prevState.users, ...newUsers],
                        ws_users: currentUsers
                    };
                });

            })
            .joining((user) => {
                setState(prevState => {
                    if (prevState.users.some(u => u.uuid === user.uuid)) {
                        return prevState;
                    } else {
                        return {
                            ...prevState,
                            users: [...prevState.users, user],
                            ws_users: [...prevState.ws_users, user]
                        };
                    }
                });
            })
            .leaving((user) => {
                setState(prevState => {
                    const userVoted = prevState.room?.game?.voted?.some(v => v.uuid === user.uuid) || false;

                    if (!userVoted) {
                        return {
                            ...prevState,
                            users: prevState.users.filter(u => u.uuid !== user.uuid)
                        };
                    }

                    return {
                        ...prevState,
                        ws_users: prevState.ws_users.filter(u => u.uuid !== user.uuid)
                    };
                });
            })
            .listen('NewGameEvent', (event) => {
                console.log('NewGameEvent', event);
                fetchGame(event.game)
                    .then(game => {
                        setState(prevState => ({
                            ...prevState,
                            room: {
                                ...prevState.room,
                                game: game
                            },
                            users: prevState.ws_users
                        }));
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .listen('GameEndEvent', (event) => {
                console.log('GameEndEvent', event);
                fetchGame(event.game)
                    .then(game => {
                        game.reveal_countdown = true;
                        setState(prevState => ({
                            ...prevState,
                            room: {
                                ...prevState.room,
                                game: game
                            }
                        }));
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .listen('VoteEvent', (event) => {
                console.log('VoteEvent', event);
                let user = event.user;
                if (event.voted === true) {
                    setState(prevState => {
                        if (prevState.room.game.voted.some(u => u.uuid === user)) {
                            return prevState;
                        } else {
                            return {
                                ...prevState,
                                room: {
                                    ...prevState.room,
                                    game: {
                                        ...prevState.room.game,
                                        voted: [...prevState.room.game.voted, user]
                                    }
                                },
                            };
                        }
                    });
                } else {
                    setState(prevState => ({
                        ...prevState,
                        room: {
                            ...prevState.room,
                            game: {
                                ...prevState.room.game,
                                voted: prevState.room.game.voted.filter(u => u.uuid !== user.uuid)
                            }
                        }
                    }));
                }
            })
            .listen('UserSpectatorEvent', (event) => {
                console.log('UserSpectatorEvent', event);
                let userUuid = event.user;
                if (event.spectator === true) {
                    setState(prevState => {
                        if (prevState.room.spectators.includes(userUuid)) {
                            return prevState;
                        } else {
                            return {
                                ...prevState,
                                room: {
                                    ...prevState.room,
                                    spectators: [...prevState.room.spectators, userUuid],
                                    game: {
                                        ...prevState.room.game,
                                        user_vote_value: String(userUuid) === String(state.user.uuid) ? null : prevState.room.game.user_vote_value
                                    }
                                },
                            };
                        }
                    });
                } else {
                    setState(prevState => ({
                        ...prevState,
                        room: {
                            ...prevState.room,
                            spectators: prevState.room.spectators.filter(u => { u.uuid !== userUuid })
                        }
                    }));
                }


            })
            .error((error) => {
                console.error(error);
            });
    }

    const handleRevealCountdown = async () => {

        try {
            const response = await window.axios.post('/api/room/' + state.room.room + '/game/' + state.room.game.uuid + '/reveal')
            if (response.status === 200) {
                setState(prevState => ({
                    ...prevState,
                    room: {
                        ...prevState.room,
                        game: {
                            ...prevState.room.game,
                            result: response.data,
                            reveal: true,
                            reveal_countdown: false
                        }
                    }
                }))
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                snackbarNotify(error.response.data.errors)
            } else {
                console.error(error);
            }
        }
    }

    useEffect(() => {
        console.log('state', state);
    }, [state]);

    return (
        <>
            {state.room?.game?.reveal_countdown === true ?
                <Countdown
                    duration={3}
                    sx={{
                        transition: 'all 0.5s ease-in-out',
                    }}
                    onComplete={handleRevealCountdown} />
                : null}
            <PokerTable />
            <CardDeck />
        </>
    );
};

export default PokerRoom