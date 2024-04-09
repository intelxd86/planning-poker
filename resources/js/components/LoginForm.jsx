import { Box, TextField, Button, Paper, Container, DialogContent, Dialog, DialogActions } from '@mui/material';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmaton, setPasswordConfirmaton] = useState('');

    const [open, setOpen] = React.useState(false);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    async function submitCreateUser(e) {
        e.preventDefault();
        const response = await window.axios.post('/api/user/create',
            {
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirmaton
            });
    }

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={handleClickOpen} fullWidth>
                Create new user
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: submitCreateUser
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        required
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="password_confirmation"
                        label="Password Confirmation"
                        type="password"
                        fullWidth
                        required
                        onChange={(e) => setPasswordConfirmaton(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                    >
                        Create user
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );

}

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
            sx={{ "minHeight": "100vh", m: "0 auto", "flexDirection": "column", "justifyContent": "center", "alignItems": "center", "display": "flex" }}
        >
            <Paper
                sx={{
                    p: 1, width: "100%"
                }}
            >
                <Box
                    component="form"
                    noValidate
                    autoComplete="off"
                    sx={{ width: "100%" }}
                    onSubmit={handleSubmit}

                >
                    <Box
                        sx={{ p: 1 }}
                    >
                        <TextField
                            sx={{ width: "100%" }}
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
                            sx={{ width: "100%" }}
                            id="password"
                            label="Password"
                            value={password}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Box>
                    <Box
                        sx={{ p: 1 }}
                    >
                        <Button
                            variant="contained"
                            sx={{ width: "100%" }}

                            type="submit"
                        >
                            Login
                        </Button>
                    </Box>

                </Box>
                <Box
                    sx={{ p: 1 }}
                >
                    <RegisterForm />
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
