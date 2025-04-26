'use client';

import { Box, Typography } from '@mui/material';

const LogoSection = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                gap: 1,
            }}
        >
            <Box
                component="img"
                src="/sahabi.png"
                alt="Sahabi Logo"
                sx={{
                    width: { xs: '80px', sm: '120px' },
                    height: 'auto',
                }}
            />
            <Typography
                variant="h4"
                component="h1"
                sx={{
                    fontWeight: 200,
                    color: '#000',
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                    textAlign: 'center',
                    display: 'block',
                }}
            >
                Sahabi
            </Typography>
        </Box>
    );
};

export default LogoSection; 