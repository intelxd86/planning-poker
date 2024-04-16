import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import { useNavigate } from 'react-router-dom';

function PokerRoom() {
    const { state, setState } = useAppState();
    const { uuid } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const room = fetchRoom();

        if (!room) {
            return;
        }

        joinChannel();

        return () => {
            window.Echo.leave('room.' + uuid);
        };
    }, []);

    const fetchRoom = async () => {
        window.axios.get('/api/room/' + uuid)
            .then((response) => {
                setState(prevState => ({ ...prevState, room: response.data }));
                return response.data;
            }).catch((error) => {
                console.error(error);
                navigate('/');
                return null;
            });
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
                    if (prevState.users.some(u => u.id === user.id)) {
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
                    users: prevState.users.filter(u => u.id !== user.id)
                }));
            })
            .listen('NewGameEvent', (event) => {
                console.log(event);
            })
            .listen('GameEndEvent', (event) => {
                console.log(event);
            })
            .listen('VoteEvent', (event) => {
                console.log(event);
            })
            .listen('UserSpectatorEvent', (event) => {
                console.log(event);
            })
            .error((error) => {
                console.error(error);
            });
    }

    return (
        <>
            <div>
                <h2>Online Users</h2>
                <ul>
                    {state.users && state.users.map((user) => (
                        <li key={user.id}>{user.name}</li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default PokerRoom