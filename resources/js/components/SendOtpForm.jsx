import React, { useImperativeHandle, forwardRef } from 'react';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';

const SendOtpForm = forwardRef((props, ref) => {

    useImperativeHandle(ref, () => ({
        handleSendOtp
    }));

    async function handleSendOtp(e) {
        e.preventDefault();

        try {
            const response = await window.axios.post('/api/user/send-otp', { email: props.email });
            if (response.status === 200) {
                props.setState(prevState => ({
                    ...prevState,
                    passSent: true
                }))
                enqueueSnackbar('One-Time Password sent to provided email address.', { variant: 'success' })
                props.setFormState(prev => ({ ...prev, errors: {} }));
            }
        } catch (error) {
            props.snackbarNotify(error.response.data.errors)
            if (error.response && error.response.status === 422) {
                props.setFormState(prev => ({ ...prev, errors: error.response.data.errors }));
            } else {
                console.error(error);
            }
        }
    }

    function handleHavePassword(e) {
        e.preventDefault();
        props.setState(prevState => ({
            ...prevState,
            passSent: true
        }))
    }

    function handleDoNotHavePassword(e) {
        e.preventDefault();
        props.setState(prevState => ({
            ...prevState,
            passSent: false
        }))
    }

    return <React.Fragment>
        {props.state.passSent === true
            ?
            <Button
                variant="outlined"
                margin="dense"
                sx={{ mt: 1 }}
                onClick={handleDoNotHavePassword}
                fullWidth
            >
                Actually I do not have the password
            </Button>
            :
            <>
                <Button
                    variant="contained"
                    margin="dense"
                    sx={{ mt: 1 }}
                    onClick={handleSendOtp}
                    fullWidth
                >
                    Send One-Time Password
                </Button>
                <Button
                    variant="outlined"
                    margin="dense"
                    sx={{ mt: 1 }}
                    onClick={handleHavePassword}
                    fullWidth
                >
                    I already have password
                </Button></>
        }
    </React.Fragment>

})

export default SendOtpForm;