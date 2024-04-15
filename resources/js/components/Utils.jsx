import { enqueueSnackbar } from 'notistack';

export function snackbarNotify(errors) {
    Object.entries(errors).forEach(([field, messages]) => {
        console.log(`Errors for ${field}:`);
        messages.forEach(message => {
            enqueueSnackbar(message, { variant: 'error' });
        });
    });

}