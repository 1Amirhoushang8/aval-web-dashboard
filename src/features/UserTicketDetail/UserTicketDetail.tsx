import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    Container,
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ticketService } from "../../API/TicketService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";

import UserTicketDetailSkeleton from "../../Skeleton/UserTicketDetailSkeleton/UserTicketDetailSkeleton.tsx";

const toPersianNumber = (num: number | string): string => {
    if (!num) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function UserTicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState<StoredTicket | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const fetchTicketData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await ticketService.getById(id);
                setTicket(response.data);
                setError(false);
            } catch (err) {
                console.error("Error fetching ticket details:", err);
                setError(true);
            } finally {
                // Short delay to allow skeleton to be seen (optional)
                setTimeout(() => setLoading(false), 600);
            }
        };

        fetchTicketData();
    }, [id]);

    // Use the Skeleton component here
    if (loading) {
        return <UserTicketDetailSkeleton />;
    }

    if (error || !ticket) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <WarningAmberIcon sx={{ fontSize: 60, color: '#ffa000', mb: 2 }} />
                <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn', mb: 3 }}>تیکت مورد نظر یافت نشد یا خطایی رخ داده است.</Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate("/MyTickets")}
                    sx={{ fontFamily: 'Vazirmatn', bgcolor: '#666AF2' }}
                >
                    بازگشت به لیست تیکت‌ها
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4, fontFamily: 'Vazirmatn' }} dir="rtl">
            {/* Action Bar */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowForwardIcon sx={{ ml: 1, mr: 0 }} />}
                    onClick={() => navigate("/MyTickets")}
                    sx={{ fontFamily: 'Vazirmatn', color: '#666AF2', fontWeight: 700 }}
                >
                    بازگشت به تیکت‌های من
                </Button>
            </Box>

            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontFamily: 'Vazirmatn' }}>
                    {ticket.title}
                </Typography>
                <Typography variant="h6" sx={{ color: '#666AF2', fontWeight: 500, mb: 1, fontFamily: 'Vazirmatn' }}>
                    {ticket.shortDetail}
                </Typography>
                <Typography variant="caption" sx={{ color: '#95a5a6', fontSize: '0.9rem', fontFamily: 'Vazirmatn' }}>
                    زمان ثبت: {toPersianNumber(ticket.date)} ساعت {toPersianNumber(ticket.time)}
                </Typography>
            </Box>

            {/* User Description Card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0', bgcolor: '#fff', mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <ChatBubbleOutlineIcon sx={{ color: '#555' }} />
                    <Typography sx={{ fontWeight: 700, color: '#333', fontFamily: 'Vazirmatn' }}>متن تیکت ارسال شده:</Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 2, color: '#444', textAlign: 'justify', fontFamily: 'Vazirmatn' }}>
                    {ticket.description}
                </Typography>
                {ticket.file && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #eee' }}>
                        <Typography variant="caption" sx={{ color: '#666AF2', fontWeight: 600, fontFamily: 'Vazirmatn' }}>
                            📎 این تیکت دارای فایل پیوست می‌باشد.
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Divider sx={{ mb: 5 }}>
                <Typography sx={{ px: 2, color: '#bbb', fontSize: '0.8rem', fontFamily: 'Vazirmatn' }}>پاسخ‌های پشتیبانی</Typography>
            </Divider>

            {/* Admin Response Section */}
            <Box sx={{ pr: { md: 6, xs: 0 } }}>
                {ticket.adminResponse ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '20px 0 20px 20px',
                            bgcolor: '#f0f1ff',
                            border: '1px solid #d1d4f9',
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                            <AdminPanelSettingsIcon sx={{ color: '#666AF2' }} />
                            <Typography sx={{ fontWeight: 800, color: '#666AF2', fontFamily: 'Vazirmatn' }}>پاسخ مدیریت:</Typography>
                        </Box>
                        <Typography variant="body1" sx={{ lineHeight: 2, color: '#2c3e50', fontFamily: 'Vazirmatn' }}>
                            {ticket.adminResponse}
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 4, border: '2px dashed #ececec' }}>
                        <Typography sx={{ color: '#aaa', fontStyle: 'italic', fontFamily: 'Vazirmatn' }}>
                            در حال حاضر پاسخی برای این تیکت ثبت نشده است. به محض بررسی توسط کارشناسان، پاسخ در این قسمت نمایش داده خواهد شد.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
}