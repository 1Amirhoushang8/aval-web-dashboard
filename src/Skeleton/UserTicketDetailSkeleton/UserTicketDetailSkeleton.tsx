import { Box, Container, Skeleton, Paper, Divider } from "@mui/material";

export default function UserTicketDetailSkeleton() {
    return (
        <Container maxWidth="md" sx={{ py: 4 }} dir="rtl">

            <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width={150} height={40} sx={{ borderRadius: 2 }} />
            </Box>


            <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="20%" height={20} />
            </Box>


            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0', mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={150} height={30} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2, mb: 1 }} />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="95%" />
                <Skeleton variant="text" width="40%" />
            </Paper>

            <Divider sx={{ mb: 5 }}>
                <Skeleton variant="text" width={100} />
            </Divider>


            <Box sx={{ pr: { md: 6, xs: 0 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: '20px 0 20px 20px',
                        bgcolor: '#f8f9ff',
                        border: '1px solid #eee',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width={120} height={30} />
                    </Box>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="60%" />
                </Paper>
            </Box>
        </Container>
    );
}