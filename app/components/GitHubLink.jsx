'use client';

import { Fab } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const GitHubLink = () => {
    return (
        <Fab
            component="a"
            href="https://github.com/Baraa01Damer/Sahabi"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                bgcolor: '#24292e', // GitHub color
                '&:hover': {
                    bgcolor: '#2f363d', // Slightly change color to lighter on hover
                },
            }}
            size="large"
            aria-label="View source on GitHub"
        >
            <GitHubIcon sx={{ color: 'white' }} />
        </Fab>
    );
};

export default GitHubLink; 