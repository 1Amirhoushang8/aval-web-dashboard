import { Box, Container, Skeleton, Paper, Divider } from "@mui/material";

export default function AdminTicketDetailSkeleton() {
    return (
        <Container maxWidth="md" sx={{ py: 4 }} dir="rtl">

            <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="70%" height={45} sx={{ borderRadius: 2, mb: 1 }} />
                <Skeleton variant="text" width="40%" height={25} />
            </Box>


            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={100} height={30} />
                </Box>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" />
            </Paper>

            <Divider sx={{ mb: 4 }}>
                <Skeleton variant="text" width={80} />
            </Divider>


            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={120} height={30} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2, mb: 3 }} />
                <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
            </Paper>
        </Container>
    );
}