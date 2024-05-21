import { Box, Button, Paper, Container } from '@mui/material';
import React, { useState, useRef } from 'react';
import useTextInput from './UseTextInput';
import RegisterForm from './RegisterForm';
import { useAppState } from './AppStateContext';
import { snackbarNotify } from './Utils';
import SendOtpForm from './SendOtpForm';

const LoginForm = () => {
    const sendOtpFormRef = useRef(null);
    const [formState, setFormState] = useState({ errors: {} });
    const { state, setState } = useAppState();

    const [otpState, setOtpState] = useState({ passSent: false });

    const [emailInput, email, setEmail] = useTextInput('email', formState, { label: 'Email Address', required: true, id: 'login_email', type: 'email', margin: 'dense' });
    const [passwordInput, password, setPassword] = useTextInput('password', formState, { label: 'Password', required: true, id: 'login_password', type: 'password', margin: 'dense' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await window.axios.post('/api/user/login', { email, password });
            if (response.status === 200) {
                setState(prevState => ({
                    ...prevState,
                    user: { 'uuid': response.data.user }
                }))
            }
        } catch (error) {
            if (error.response.data.errors) {
                snackbarNotify(error.response.data.errors)
                setFormState(prev => ({ ...prev, errors: error.response.data.errors }));
            } else {
                console.error(error);
            }
        }
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (otpState.passSent) {
            handleSubmit(event);
        } else {
            sendOtpFormRef.current.handleSendOtp(event);
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
                    onSubmit={handleFormSubmit}

                >
                    {emailInput}
                    {state.mode !== 'otp' || otpState.passSent ? passwordInput : null}
                    {state.mode !== 'otp' || otpState.passSent ? <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        margin="dense"
                        sx={{ mt: 1 }}
                    >
                        Login
                    </Button> : null}
                </Box>
                {state.mode === 'otp' ? <SendOtpForm
                    setState={setOtpState}
                    state={otpState}
                    snackbarNotify={snackbarNotify}
                    email={email}
                    formState={formState}
                    setFormState={setFormState}
                    ref={sendOtpFormRef} /> : <RegisterForm />}
            </Paper>
        </Container>
    );
};

export default LoginForm