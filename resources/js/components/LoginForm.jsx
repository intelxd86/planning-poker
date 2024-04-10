import { Box, TextField, Button, Paper, Container, DialogContent, Dialog, DialogActions } from '@mui/material';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import useTextInput from './UseTextInput';

function RegisterForm() {
    const [state, setState] = useState({ errors: {} });

    const [nameInput, name, setName] = useTextInput('name', state, { label: 'Name', required: true, id: 'register_name', margin: 'dense' });
    const [emailInput, email, setEmail] = useTextInput('email', state, { label: 'Email Address', required: true, id: 'register_email', type: 'email', margin: 'dense' });
    const [passwordInput, password, setPassword] = useTextInput('password', state, { label: 'Password', required: true, id: 'register_password', type: 'password', margin: 'dense' });
    const [passwordConfirmatonInput, passwordConfirmaton, setPasswordConfirmaton] = useTextInput('password_confirmation', state, { label: 'Password Confirmation', required: true, id: 'register_password_confirmation', type: 'password', margin: 'dense' });

    const [open, setOpen] = React.useState(false);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    async function submitCreateUser(e) {
        e.preventDefault();
        try {
            const response = await window.axios.post('/api/user/create', {
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            });
        } catch (error) {
            if (error.response && error.response.status === 422) {
                console.log(error);
                setState(prev => ({ ...prev, errors: error.response.data.errors }));
            } else {
                console.error(error);
            }
        }
    }


    return (
        <React.Fragment>
            <Button
                variant="outlined"
                margin="dense"
                sx={{ mt: 1 }}
                onClick={handleClickOpen}
                fullWidth
            >
                Create new user
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: submitCreateUser,
                    noValidate: true,
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    {nameInput}
                    {emailInput}
                    {passwordInput}
                    {passwordConfirmatonInput}
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        margin="dense"
                        sx={{ mt: 1 }}
                    >
                        Create user
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClose}
                        margin="dense"
                        sx={{ mt: 1 }}
                    >
                        Cancel
                    </Button>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );

}

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

export default LoginForm;

if (document.getElementById('login_form')) {
    const Index = ReactDOM.createRoot(document.getElementById("login_form"));

    Index.render(
        <React.StrictMode>
            <LoginForm />
        </React.StrictMode>
    )
}
