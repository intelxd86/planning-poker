import { createTheme } from '@mui/material/styles';

const catppuccinMocha = {
    rosewater: '#F5E0DC',
    flamingo: '#F2CDCD',
    pink: '#F5C2E7',
    mauve: '#CBA6F7',
    red: '#F38BA8',
    maroon: '#EBA0AC',
    peach: '#FAB387',
    yellow: '#F9E2AF',
    green: '#A6E3A1',
    teal: '#94E2D5',
    sky: '#89DCEB',
    sapphire: '#74C7EC',
    blue: '#89B4FA',
    lavender: '#B4BEFE',
    text: '#CDD6F4',
    subtext1: '#BAC2DE',
    subtext0: '#A6ADC8',
    overlay2: '#9399B2',
    overlay1: '#7F849C',
    overlay0: '#6C7086',
    surface2: '#585B70',
    surface1: '#45475A',
    surface0: '#313244',
    base: '#1E1E2E',
    mantle: '#181825',
    crust: '#11111B',
};

const DarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: catppuccinMocha.sapphire,
        },
        secondary: {
            main: catppuccinMocha.teal,
        },
        background: {
            default: catppuccinMocha.mantle,
            paper: catppuccinMocha.mantle,
        },
        text: {
            primary: catppuccinMocha.text,
            secondary: catppuccinMocha.subtext0,
        },
        error: {
            main: catppuccinMocha.red,
        },
        warning: {
            main: catppuccinMocha.peach,
        },
        info: {
            main: catppuccinMocha.sky,
        },
        success: {
            main: catppuccinMocha.green,
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: catppuccinMocha.base,
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
    customComponents: {
        pokerCard: {
            backgroundColor: catppuccinMocha.surface0,
            selectedBackgroundColor: catppuccinMocha.surface1,
        },
        tableCard: {
            backgroundColor: catppuccinMocha.mantle,
            selectedBackgroundColor: catppuccinMocha.surface0,
        },
        histogram: {
            grid: catppuccinMocha.surface0,
            label: catppuccinMocha.subtext0,
        }
    },
});

export default DarkTheme;
