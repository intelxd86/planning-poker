import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
});

function Poker() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const channel = window.Echo.join('example');

        channel
            .here((currentUsers) => {
                setUsers(currentUsers);
            })
            .joining((user) => {
                setUsers((prevUsers) => {
                    if (prevUsers.some((u) => u.id === user.id)) {
                        return prevUsers;
                    } else {
                        return [...prevUsers, user];
                    }
                });
            })
            .leaving((user) => {
                setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
            });
    }, []);

    return (
        <div>
            <h2>Online Users</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Poker;

if (document.getElementById('poker')) {
    const Index = ReactDOM.createRoot(document.getElementById("poker"));

    Index.render(
        <React.StrictMode>
            <Poker />
        </React.StrictMode>
    )
}
