import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import { useNavigate } from 'react-router-dom';
import CardDeck from './CardDeck';
import PokerTable from './PokerTable';
import Countdown from './Countdown';
import PokerResults from './PokerResults';
import { enqueueSnackbar } from 'notistack';
import audioFile from '../assets/door_slam.mp3';

function PokerRoom() {
    const { state, setState } = useAppState();
    const { uuid } = useParams();
    const navigate = useNavigate();
    const initRef = useRef(false);
    const audioRef = useRef(null);

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

        if (!initRef.current) {
            initRef.current = true;
            init();
        }

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
                    const userExistsInUsers = prevState.users.some(u => u.uuid === user.uuid);
                    const userExistsInWsUsers = prevState.ws_users.some(u => u.uuid === user.uuid);

                    if (userExistsInUsers && userExistsInWsUsers) {
                        return prevState;
                    } else {
                        const updatedUsers = userExistsInUsers ? prevState.users : [...prevState.users, user];
                        const updatedWsUsers = userExistsInWsUsers ? prevState.ws_users : [...prevState.ws_users, user];

                        return {
                            ...prevState,
                            users: updatedUsers,
                            ws_users: updatedWsUsers
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
                enqueueSnackbar('New game has just started', { variant: 'success' })
                fetchGame(event.game)
                    .then(game => {
                        setState(prevState => {
                            return {
                                ...prevState,
                                room: {
                                    ...prevState.room,
                                    game: game
                                },
                                users: prevState.ws_users
                            }
                        });
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
                            spectators: prevState.room.spectators.filter(u => String(u) !== String(userUuid))
                        }
                    }));

                }


            })
            .listen('RoomUpdatedEvent', (event) => {
                console.log('RoomUpdatedEvent', event);
                setState(prevState => ({
                    ...prevState,
                    room: {
                        ...prevState.room,
                        ...event.room
                    }
                }));
            })
            .listen('UserRageQuitEvent', (event) => {
                console.log('UserRageQuitEvent', event);
                audioRef.current.play();
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

    if (!state.room) {
        return null;
    }

    return (
        <>
            <audio ref={audioRef} src={audioFile} type="audio/mpeg" style={{ display: 'none' }} />
            {state.room?.game?.reveal_countdown === true ?
                <Countdown
                    duration={3}
                    sx={{
                        transition: 'all 0.5s ease-in-out',
                    }}
                    onComplete={handleRevealCountdown} />
                : null}
            <PokerTable />
            {!state.room?.game?.uuid || (state.room.game.ended === true && state.room.game.reveal === true) ?
                state.room?.game?.result === null ? null : <PokerResults />
                : <CardDeck />}
        </>
    );
};

export default PokerRoom