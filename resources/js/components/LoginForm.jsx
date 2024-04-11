import { Box, Button, Paper, Container } from '@mui/material';
import React, { useState } from 'react';
import useTextInput from './UseTextInput';
import RegisterForm from './RegisterForm';

const LoginForm = () => {
    const [state, setState] = useState({ errors: {} });

    const [emailInput, email, setEmail] = useTextInput('email', state, { label: 'Email Address', required: true, id: 'login_email', type: 'email', margin: 'dense' });
    const [passwordInput, password, setPassword] = useTextInput('password', state, { label: 'Password', required: true, id: 'login_password', type: 'password', margin: 'dense' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await window.axios.post('/api/user/login', { email, password });
            if (response.status === 200) {
                window.location.reload();
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setState(prev => ({ ...prev, errors: error.response.data.errors }));
            } else {
                console.error(error);
            }
        }
    };


    return (
        <Container
            maxWidth={"sm"}
            sx={{ "minHeight": "100vh", m: "0 auto", "flexDirection": "column", "justifyContent": "center", "alignItems": "center", "display": "flex" }}
        >
            <Paper
                sx={{
                    p: 2, width: "100%"
                }}
            >
                <Box
                    component="form"
                    noValidate
                    autoComplete="off"
                    sx={{ width: "100%" }}
                    onSubmit={handleSubmit}

                >
                    {emailInput}
                    {passwordInput}
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        margin="dense"
                        sx={{ mt: 1 }}
                    >
                        Login
                    </Button>
                </Box>
                <RegisterForm />
            </Paper>
        </Container>
    );
};

export default LoginForm