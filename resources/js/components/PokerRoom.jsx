import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import { useNavigate } from 'react-router-dom';
import CardDeck from './CardDeck';
import { Container } from '@mui/material';
import PokerTable from './PokerTable';

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
                console.log(room)
                if (room.game) {
                    const game = await fetchGame(room.game.uuid);
                    room.game = game
                }
                await joinChannel();

                setState(prevState => ({
                    ...prevState,
                    room: {
                        ...prevState.room,
                        ...room
                    }
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
                console.log('here', currentUsers);
                setState(prevState => ({ ...prevState, users: currentUsers }))
            })
            .joining((user) => {
                console.log('joining', user);
                setState(prevState => {
                    if (prevState.users.includes(user.uuid)) {
                        return prevState;
                    } else {
                        return {
                            ...prevState,
                            users: [...prevState.users, user],
                        };
                    }
                });
            })
            .leaving((user) => {
                setState(prevState => ({
                    ...prevState,
                    users: prevState.users.filter(u => u.uuid !== user.uuid)
                }));
            })
            .listen('NewGameEvent', (event) => {
                console.log(event);
                fetchGame(event.game)
                    .then(game => {
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
            .listen('GameEndEvent', (event) => {
                console.log(event);
                fetchGame(event.game)
                    .then(game => {
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
                console.log(event);
            })
            .listen('UserSpectatorEvent', (event) => {
                console.log(event);
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
                                    spectators: [...prevState.room.spectators, userUuid]
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

    return (
        <>
            <PokerTable />
            <CardDeck />
        </>
    );
};

export default PokerRoom