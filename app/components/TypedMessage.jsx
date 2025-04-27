'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const TypedMessage = ({ message, onComplete, onUpdate }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevMessage, setPrevMessage] = useState('');

    // If the message prop changes (new message, not just streaming), reset state
    useEffect(() => {
        if (message !== prevMessage && !message.startsWith(prevMessage)) {
            setDisplayedText('');
            setCurrentIndex(0);
        }
        setPrevMessage(message);
    }, [message]);

    useEffect(() => {
        // Only animate the new part of the message
        if (currentIndex < message.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(message.slice(0, currentIndex + 1));
                setCurrentIndex(prev => prev + 1);
                if (onUpdate) {
                    onUpdate();
                }
            }, 1); // Adjust typing speed here (lower number = faster)

            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, message, onComplete, onUpdate]);

    return (
        <Box>
            {displayedText}
        </Box>
    );
};

export default TypedMessage; 