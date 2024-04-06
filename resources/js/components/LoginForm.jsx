import { Box, TextField, Button, Paper, Container } from '@mui/material';
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
        <Container
            maxWidth={"sm"}
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ "min-height": "100vh", m: "0 auto" }}
        >
            <Paper
                sx={{
                    p: 1, margin: "0 auto"
                }}
            >
                <Box
                    component="form"
                    noValidate
                    autoComplete="off"
                    fullWidth
                    onSubmit={handleSubmit}

                >
                    <Box
                        sx={{ p: 1 }}
                    >
                        <TextField
                            fullWidth
                            id="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Box>
                    <Box
                        sx={{ p: 1 }}
                    >
                        <TextField
                            fullWidth
                            id="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Box>
                    <Box
                        sx={{ p: 1 }}
                    >
                        <Button
                            variant="contained"
                            fullWidth

                            type="submit"
                        >
                            Login
                        </Button>
                    </Box>
                </Box>
            </Paper>

        </Container>
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
