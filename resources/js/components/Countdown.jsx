import React, { useState, useEffect } from 'react';
import { Slide, Typography, Box } from '@mui/material';
import Fade from '@mui/material/Fade';

export default function Countdown({ duration, onComplete }) {
    const [count, setCount] = useState(duration);
    const [slideIn, setSlideIn] = useState(false);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        setSlideIn(true);
        setFade(true);

        const timer = setInterval(() => {
            setSlideIn(false);
            setFade(false);
            setTimeout(() => {
                if (count > 1) {
                    setCount(count - 1);
                    setSlideIn(true);
                    setFade(true);
                } else {
                    clearInterval(timer);
                    onComplete && onComplete();
                }
            }, 500);
        }, 1000);

        return () => clearInterval(timer);
    }, [count, onComplete]);

    return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh"
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9001,
                background: 'rgba(0, 0, 0, 0.5)',
                transition: 'all 0.3s ease-in-out'
            }}>
            <Slide direction={slideIn ? "up" : "down"} in={slideIn} mountOnEnter unmountOnExit>
                <div>
                    <Fade in={fade} timeout={250}>
                        <Typography variant="h1" textAlign="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {count}
                        </Typography>
                    </Fade>
                </div>
            </Slide>
        </Box>
    );
}
