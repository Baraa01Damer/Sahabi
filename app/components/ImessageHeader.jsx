import { Box, Typography, IconButton, Avatar } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState, useEffect } from 'react';
import { IoIosBatteryFull } from "react-icons/io";

export default function iMessageHeader() {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
            setCurrentTime(`${displayHours}:${minutes}`);
        };

        // Update time immediately
        updateTime();

        // Update time every minute
        const interval = setInterval(updateTime, 60000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ width: '100%', bgcolor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: 1 }}>
            {/* Status Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1, fontSize: 14, color: '#222' }}>
                <span style={{ fontWeight: 500 }}>{currentTime}</span>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IoIosBatteryFull size={30} />
                </Box>
            </Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 1 }}>
                <IconButton size="small">
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <Avatar
                        src="/sahabi.png"
                        alt="Sahabi Logo"
                        sx={{
                            width: 48,
                            height: 48,
                            p: 1.2,
                            bgcolor: 'white'
                        }}
                    />
                    <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#222', lineHeight: 1 }}>Sahabi</Typography>
                    {/*<Typography sx={{ fontSize: 12, color: '#888', mt: 0.2 }}>iMessage</Typography>*/}
                </Box>
                <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
} 