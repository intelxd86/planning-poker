import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, useParams } from 'react-router-dom';

function PokerRoom() {
    const [users, setUsers] = useState([]);
    const { uuid } = useParams();

    useEffect(() => {
        const channel = window.Echo.join('room.' + uuid);

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

export default PokerRoom;

if (document.getElementById('poker')) {
    const Index = ReactDOM.createRoot(document.getElementById("poker"));

    Index.render(
        <React.StrictMode>
            <Router>
                <Switch>
                    <Route path="/room/:uuid" component={PokerRoom} />
                </Switch>
            </Router>

        </React.StrictMode>
    )
}
