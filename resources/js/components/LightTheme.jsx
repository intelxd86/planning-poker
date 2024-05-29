import { createTheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import { grey } from '@mui/material/colors';

const baseTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#f8fafc",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    padding: '0.5rem 1rem',
                },
            },
        },
    },

});

const LightTheme = createTheme(baseTheme, {
    customComponents: {
        pokerCard: {
            backgroundColor: grey[50],
            selectedBackgroundColor: '#fff',
        },
        tableCard: {
            backgroundColor: grey[200],
            selectedBackgroundColor: '#fff'
        },
        histogram: {
            grid: '#ddd',
            label: '#999'
        }
    },
});

export default LightTheme;
