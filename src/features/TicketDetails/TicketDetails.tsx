import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    Container,
    TextField,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
    CircularProgress
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import apiClient from "../../API/apiClient";
import { ticketService } from "../../API/TicketService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";

import AdminTicketDetailSkeleton from "../../Skeleton/TicketDetailSkeleton/TicketDetailSkeleton.tsx";

const toPersianNumber = (num: number | string): string => {
    if (!num) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function TicketDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState<StoredTicket | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [adminReply, setAdminReply] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    useEffect(() => {
        const fetchTicketAndUser = async () => {
            if (id) {
                try {
                    setLoading(true);
                    const res = await ticketService.getById(id);
                    const ticketData = res.data;
                    setTicket(ticketData);

                    try {
                        const userRes = await apiClient.get(`/users/${ticketData.userId}`);
                        setUserName(userRes.data.FullName || userRes.data.username || `شناسه: ${ticketData.userId}`);
                    } catch (userErr) {
                        setUserName(`شناسه کاربر: ${ticketData.userId}`);
                    }

                    if (ticketData.adminResponse) {
                        setAdminReply(ticketData.adminResponse);
                        setIsEditing(false);
                    } else {
                        setIsEditing(true);
                    }
                } catch (err) {
                    console.error("Error fetching ticket details:", err);
                } finally {
                    // Slight delay for smooth transition
                    setTimeout(() => setLoading(false), 600);
                }
            }
        };
        fetchTicketAndUser();
    }, [id]);

    const handleSubmitResponse = async () => {
        if (!ticket || !id) return;
        if (!adminReply.trim()) {
            setSnackbar({ open: true, message: "لطفا متن پاسخ را وارد کنید", severity: "error" });
            return;
        }

        setSubmitting(true);
        try {
            const updatedData: StoredTicket = {
                ...ticket,
                adminResponse: adminReply,
                status: "answered"
            };

            await ticketService.update(id, updatedData);
            setTicket(updatedData);
            setIsEditing(false);
            setSnackbar({ open: true, message: "پاسخ با موفقیت ثبت شد", severity: "success" });
        } catch (err) {
            setSnackbar({ open: true, message: "خطا در ثبت پاسخ", severity: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <AdminTicketDetailSkeleton />;

    if (!ticket) return (
        <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn' }}>تیکت یافت نشد.</Typography>
            <Button onClick={() => navigate("/AdminTicketPage")} sx={{ mt: 2, fontFamily: 'Vazirmatn' }}>بازگشت</Button>
        </Container>
    );

    return (
        <Container maxWidth="md" sx={{ py: 4, fontFamily: 'Vazirmatn' }} dir="rtl">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowForwardIcon sx={{ ml: 1 }} />}
                    onClick={() => navigate("/AdminTicketPage")}
                    sx={{ fontFamily: 'Vazirmatn', color: '#666AF2', mb: 2, fontWeight: 700 }}
                >
                    بازگشت به پنل مدیریت تیکت‌ها
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#2c3e50', fontFamily: 'Vazirmatn', mb: 1 }}>
                    جزئیات تیکت: {ticket.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d', fontFamily: 'Vazirmatn' }}>
                    ارسال کننده: <b>{userName}</b> | تاریخ: {toPersianNumber(ticket.date)} ساعت {toPersianNumber(ticket.time)}
                </Typography>
            </Box>

            {/* User Message Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', bgcolor: '#fdfdfd', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <PersonIcon sx={{ color: '#555' }} />
                    <Typography sx={{ fontWeight: 700, color: '#444', fontFamily: 'Vazirmatn' }}>پیام کاربر:</Typography>
                </Box>
                <Typography sx={{ lineHeight: 1.8, color: '#555', fontFamily: 'Vazirmatn', textAlign: 'justify' }}>
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

            <Divider sx={{ mb: 4 }}>
                <Typography sx={{ color: '#bbb', fontSize: '0.8rem', fontFamily: 'Vazirmatn' }}>پاسخ مدیریت</Typography>
            </Divider>

            {/* Admin Reply Section */}
            <Box>
                {isEditing ? (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #666AF2', bgcolor: '#fff' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                            <ChatBubbleOutlineIcon sx={{ color: '#666AF2' }} />
                            <Typography sx={{ fontWeight: 700, color: '#666AF2', fontFamily: 'Vazirmatn' }}>
                                {ticket.adminResponse ? "ویرایش پاسخ:" : "متن پاسخ شما:"}
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            autoFocus
                            placeholder="پاسخ خود را اینجا بنویسید..."
                            value={adminReply}
                            onChange={(e) => setAdminReply(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": { fontFamily: 'Vazirmatn', borderRadius: 2 },
                                mb: 3
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmitResponse}
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon sx={{ ml: 1 }} />}
                                className="quick-change-btn"
                                sx={{ fontFamily: 'Vazirmatn', height: '40px' }}
                            >
                                {submitting ? "در حال ثبت..." : "ثبت و ارسال پاسخ"}
                            </Button>
                            {ticket.adminResponse && (
                                <Button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setAdminReply(ticket.adminResponse || "");
                                    }}
                                    sx={{ fontFamily: 'Vazirmatn', color: '#95a5a6' }}
                                >
                                    انصراف
                                </Button>
                            )}
                        </Box>
                    </Paper>
                ) : (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f0f1ff', border: '1px solid #d1d4f9', position: 'relative' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AdminPanelSettingsIcon sx={{ color: '#666AF2' }} />
                                <Typography sx={{ fontWeight: 800, color: '#666AF2', fontFamily: 'Vazirmatn' }}>پاسخ شما:</Typography>
                            </Box>
                            <Tooltip title="ویرایش پاسخ">
                                <IconButton
                                    onClick={() => setIsEditing(true)}
                                    sx={{ color: '#666AF2', bgcolor: 'rgba(102, 106, 242, 0.1)', '&:hover': { bgcolor: 'rgba(102, 106, 242, 0.2)' } }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography variant="body1" sx={{ lineHeight: 2, color: '#2c3e50', fontFamily: 'Vazirmatn', whiteSpace: 'pre-line' }}>
                            {ticket.adminResponse}
                        </Typography>
                    </Paper>
                )}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert severity={snackbar.severity} sx={{ fontFamily: 'Vazirmatn', width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}