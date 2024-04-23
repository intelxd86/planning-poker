import { enqueueSnackbar } from 'notistack';

export function snackbarNotify(errors) {
    Object.entries(errors).forEach(([field, messages]) => {
        messages.forEach(message => {
            enqueueSnackbar(message, { variant: 'error' });
        });
    });
}