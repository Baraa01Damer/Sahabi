'use client';

import React from 'react';
import { Box } from '@mui/material';

const TypingAnimation = () => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        bgcolor: 'grey.400',
                        borderRadius: '50%',
                        animation: 'bounce 1s infinite',
                        animationDelay: '0.2s',
                        '@keyframes bounce': {
                            '0%, 100%': {
                                transform: 'translateY(0)',
                            },
                            '50%': {
                                transform: 'translateY(-5px)',
                            },
                        },
                    }}
                />
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        bgcolor: 'grey.400',
                        borderRadius: '50%',
                        animation: 'bounce 1s infinite',
                        animationDelay: '0.3s',
                        '@keyframes bounce': {
                            '0%, 100%': {
                                transform: 'translateY(0)',
                            },
                            '50%': {
                                transform: 'translateY(-5px)',
                            },
                        },
                    }}
                />
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        bgcolor: 'grey.400',
                        borderRadius: '50%',
                        animation: 'bounce 1s infinite',
                        animationDelay: '0.4s',
                        '@keyframes bounce': {
                            '0%, 100%': {
                                transform: 'translateY(0)',
                            },
                            '50%': {
                                transform: 'translateY(-5px)',
                            },
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default TypingAnimation; 