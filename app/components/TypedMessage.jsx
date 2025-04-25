'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const TypedMessage = ({ message, onComplete, onUpdate }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < message.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + message[currentIndex]);
                setCurrentIndex(prev => prev + 1);
                if (onUpdate) {
                    onUpdate();
                }
            }, 0); // Adjust typing speed here (lower number = faster)

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