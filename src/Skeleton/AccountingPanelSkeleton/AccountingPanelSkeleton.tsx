import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';

const ModalSkeleton: React.FC = () => {
    return (
        <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 450, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, direction: 'rtl'
        }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                <Skeleton width="60%" sx={{ mx: 'auto' }} />
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} width="60%" sx={{ mx: 'auto' }} /> {/* Select */}
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Skeleton variant="rounded" height={36} sx={{ flex: 1 }} />
                    <Skeleton variant="rounded" height={36} sx={{ flex: 1 }} />
                </Box>
            </Box>
        </Box>
    );
};

export default ModalSkeleton;