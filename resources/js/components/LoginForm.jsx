import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await window.axios.post('/api/user/login', { email, password });
            if (response.status === 200) {
                window.location.reload();
            } else {
                console.log('Login failed. Please try again.');
            }
        } catch (error) {
            console.error('exception:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginForm;

if (document.getElementById('login_form')) {
    const Index = ReactDOM.createRoot(document.getElementById("login_form"));

    Index.render(
        <React.StrictMode>
            <LoginForm />
        </React.StrictMode>
    )
}
