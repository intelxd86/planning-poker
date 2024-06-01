import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SickIcon from '@mui/icons-material/Sick';
import { useAppState } from './AppStateContext';
import { snackbarNotify } from './Utils';

const RageQuitButton = () => {
    const { state, setState } = useAppState();

    const [isHovered, setIsHovered] = useState(false);
    const [hoverTime, setHoverTime] = useState(0);
    const [buttonChanged, setButtonChanged] = useState(false);
    const navigate = useNavigate();

    const startHover = useCallback(() => {
        setIsHovered(true);
    }, []);

    const stopHover = useCallback(() => {
        setIsHovered(false);
        setHoverTime(0);
        setButtonChanged(false);
    }, []);

    useEffect(() => {
        let timer;
        if (isHovered) {
            timer = setInterval(() => {
                setHoverTime(prevTime => {
                    if (prevTime >= 5) {
                        setButtonChanged(true);
                        clearInterval(timer);
                        return prevTime;
                    }
                    return prevTime + 1;
                });
            }, 1000);
        } else {
            clearInterval(timer);
        }

        return () => {
            clearInterval(timer);
        };
    }, [isHovered, buttonChanged]);

    const handleRageQuit = async () => {
        try {
            const response = await window.axios.post('/api/room/' + state.room.room + '/quit');
            if (response.status === 200) {
                navigate('/');
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                snackbarNotify(error.response.data.errors)
            }
            else {
                console.error(error);
            }
        }
    }

    return (
        <>
            {!buttonChanged ? (
                <Button
                    onMouseEnter={startHover}
                    onMouseLeave={stopHover}
                    onClick={() => navigate('/')}
                    endIcon={<MeetingRoomIcon />}
                    color="inherit"
                >
                    Leave room
                </Button >
            ) : (
                <Button
                    color="error"
                    onMouseLeave={stopHover}
                    endIcon={<SickIcon />}
                    onClick={handleRageQuit}
                >
                    Rage quit!
                </Button>
            )}
        </>
    );
};

export default RageQuitButton;
