import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

export default function useTextInput(key, state, props) {

    const [value, setValue] = useState('');

    const input = <TextField
        error={(key in state.errors)}
        helperText={(key in state.errors) ? state.errors[key] : ''}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
        variant='outlined'
        {...props}
    />

    return [input, value, setValue]
}