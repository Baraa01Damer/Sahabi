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
                top: 60,
                right: 10,
                bgcolor: '#24292e', // GitHub color
                '&:hover': {
                    bgcolor: '#2f363d', // Slightly change color to lighter on hover
                },
                display: { xs: 'none', sm: 'flex' }, // Hide on mobile, show on small screens and up
            }}
            size="small"
            aria-label="View repository on GitHub"
        >
            <GitHubIcon sx={{ color: 'white' }} />
        </Fab>
    );
};

export default GitHubLink; 