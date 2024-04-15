
import React, { useState } from 'react';
import useTextInput from './UseTextInput';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { snackbarNotify } from './Utils';

export default function RegisterForm() {
    const [state, setState] = useState({ errors: {} });

    const [nameInput, name, setName] = useTextInput('name', state, { label: 'Name', required: true, id: 'register_name', margin: 'dense' });
    const [emailInput, email, setEmail] = useTextInput('email', state, { label: 'Email Address', required: true, id: 'register_email', type: 'email', margin: 'dense' });
    const [passwordInput, password, setPassword] = useTextInput('password', state, { label: 'Password', required: true, id: 'register_password', type: 'password', margin: 'dense' });
    const [passwordConfirmatonInput, passwordConfirmation, setPasswordConfirmaton] = useTextInput('password_confirmation', state, { label: 'Password Confirmation', required: true, id: 'register_password_confirmation', type: 'password', margin: 'dense' });

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
            snackbarNotify(error.response.data.errors)
            if (error.response && error.response.status === 422) {
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