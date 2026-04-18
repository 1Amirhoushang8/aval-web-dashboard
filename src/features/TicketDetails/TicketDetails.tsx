import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Container,
    TextField,
    Alert,
    Snackbar,
    IconButton,
    CircularProgress,
    Avatar,
    Fade,
    Link,
    useMediaQuery,
    useTheme
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import apiClient from "../../API/apiClient";
import { ticketService } from "../../API/TicketService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
import AdminTicketDetailSkeleton from "../../Skeleton/TicketDetailSkeleton/TicketDetailSkeleton.tsx";

import type { Message } from "../../models/Massage/TicketMassage.ts";

const toPersianNumber = (num: number | string): string => {
    if (!num) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function TicketDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [ticket, setTicket] = useState<StoredTicket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userName, setUserName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [adminReply, setAdminReply] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const adminId = localStorage.getItem("userId") || "3962";

    const fetchTicketAndMessages = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [ticketRes, messagesRes] = await Promise.all([
                ticketService.getById(id),
                apiClient.get<Message[]>("/messages", { params: { ticketId: id } })
            ]);
            const ticketData = ticketRes.data;
            setTicket(ticketData);

            try {
                const userRes = await apiClient.get(`/users/${ticketData.userId}`);
                setUserName(userRes.data.FullName || userRes.data.username || `کاربر ${ticketData.userId}`);
            } catch {
                setUserName(`کاربر ${ticketData.userId}`);
            }

            const sortedMessages = messagesRes.data.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
            setMessages(sortedMessages);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTicketAndMessages();
    }, [fetchTicketAndMessages]);

    const scrollToBottom = useCallback(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (!loading) scrollToBottom();
    }, [loading, messages, scrollToBottom]);

    const handleSubmitResponse = useCallback(async () => {
        if (!ticket || !id || !adminReply.trim()) return;

        setSubmitting(true);
        try {
            const newMessage: Omit<Message, "id"> = {
                ticketId: id,
                senderId: adminId,
                senderType: "admin",
                text: adminReply.trim(),
                timestamp: new Date().toLocaleDateString('fa-IR') + " " + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                isRead: false
            };

            const response = await apiClient.post<Message>("/messages", newMessage);
            const savedMessage = response.data;

            const updatedTicket: StoredTicket = {
                ...ticket,
                adminResponse: adminReply.trim(),
                status: "answered"
            };
            await ticketService.update(id, updatedTicket);

            setMessages(prev => [...prev, savedMessage].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
            setTicket(updatedTicket);
            setAdminReply("");
            setSnackbar({ open: true, message: "پاسخ ارسال شد", severity: "success" });
        } catch (err) {
            console.error("Error sending message:", err);
            setSnackbar({ open: true, message: "خطا در برقراری ارتباط", severity: "error" });
        } finally {
            setSubmitting(false);
        }
    }, [ticket, id, adminReply, adminId]);

    if (loading) return <AdminTicketDetailSkeleton />;

    if (!ticket) return (
        <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center', fontFamily: 'Vazirmatn' }}>
            <Typography>تیکت مورد نظر یافت نشد.</Typography>
            <Button onClick={() => navigate("/AdminTicketPage")}>بازگشت</Button>
        </Container>
    );

    const hasFile = ticket.file && typeof ticket.file === 'object' && 'url' in ticket.file;

    const descriptionMessage = {
        id: 'description-msg',
        text: ticket.description,
        senderType: 'user' as const,
        timestamp: ticket.time,
        date: ticket.date,
        hasFile: hasFile
    };

    const allMessages = [
        descriptionMessage,
        ...messages.map(msg => ({
            ...msg,
            hasFile: false
        }))
    ];

    return (
        <Container maxWidth={false} sx={{
            width: '80%',
            py: isMobile ? 1 : 2, px: isMobile ? 1 : 2, height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Vazirmatn' }} dir="rtl">
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                    <Button
                        startIcon={<ArrowForwardIcon sx={{ ml: 1 }} />}
                        onClick={() => navigate("/AdminTicketPage")}
                        sx={{ fontFamily: 'Vazirmatn', color: '#666AF2', fontWeight: 700 }}
                    >
                        بازگشت
                    </Button>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 800, fontFamily: 'Vazirmatn', color: '#1a202c' }}>
                        {ticket.title}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ color: '#718096', display: 'block', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                        ارسال کننده: {userName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#718096', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                        تاریخ: {toPersianNumber(ticket.date)}
                    </Typography>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    mb: 2,
                    p: isMobile ? 2 : 3,
                    borderRadius: 4,
                    border: '1px solid #e0e0e0',
                    bgcolor: '#fcfcfc',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? 2 : 3
                }}
            >
                {allMessages.map((msg, idx) => (
                    <Fade in key={msg.id}>
                        <Box sx={{
                            alignSelf: msg.senderType === 'admin' ? 'flex-end' : 'flex-start',
                            maxWidth: isMobile ? '95%' : '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.senderType === 'admin' ? 'flex-end' : 'flex-start'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                {msg.senderType === 'admin' && <Typography variant="caption" sx={{ color: '#a0aec0', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>مدیریت</Typography>}
                                <Avatar sx={{
                                    width: isMobile ? 24 : 28,
                                    height: isMobile ? 24 : 28,
                                    bgcolor: msg.senderType === 'admin' ? '#666AF2' : '#cbd5e0',
                                    fontSize: 14
                                }}>
                                    {msg.senderType === 'admin' ? <AdminPanelSettingsIcon sx={{ fontSize: isMobile ? 14 : 16 }} /> : <PersonIcon sx={{ fontSize: isMobile ? 14 : 16 }} />}
                                </Avatar>
                                {msg.senderType === 'user' && <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 700, fontSize: isMobile ? '0.7rem' : '0.75rem' }}>{userName}</Typography>}
                            </Box>

                            <Paper sx={{
                                p: isMobile ? 1.5 : 2,
                                borderRadius: msg.senderType === 'admin' ? '20px 0 20px 20px' : '0 20px 20px 20px',
                                bgcolor: msg.senderType === 'admin' ? '#f0f1ff' : '#ffffff',
                                color: '#2d3748',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                border: '1px solid #e0e0e0',
                                width: '100%'
                            }}>
                                <Typography sx={{ fontFamily: 'Vazirmatn', fontSize: isMobile ? '0.85rem' : '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                                    {msg.text}
                                </Typography>

                                {msg.senderType === 'user' && idx === 0 && hasFile && (
                                    <Link
                                        href={ticket.file && typeof ticket.file === 'object' && 'url' in ticket.file ? ticket.file.url : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: '#666AF2', fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                                    >
                                        <AttachFileIcon fontSize="small" />
                                        <Typography variant="caption">مشاهده فایل پیوست</Typography>
                                    </Link>
                                )}

                                <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'left', opacity: 0.7, fontSize: isMobile ? '0.6rem' : '0.7rem' }}>
                                    {toPersianNumber(msg.timestamp)}
                                </Typography>
                            </Paper>
                        </Box>
                    </Fade>
                ))}
                <div ref={scrollRef} />
            </Paper>

            <Paper elevation={4} sx={{ p: isMobile ? 1 : 1.5, borderRadius: 5, border: '1px solid #666AF2', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', gap: isMobile ? 1 : 1.5, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={5}
                        variant="standard"
                        placeholder="پاسخ خود را بنویسید..."
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        disabled={submitting}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitResponse();
                            }
                        }}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontFamily: 'Vazirmatn', px: isMobile ? 1 : 2, py: isMobile ? 0.5 : 1, fontSize: isMobile ? '0.85rem' : '0.9rem' }
                        }}
                    />
                    <IconButton
                        onClick={handleSubmitResponse}
                        disabled={submitting || !adminReply.trim()}
                        sx={{
                            bgcolor: '#666AF2',
                            color: '#fff',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#5558d9', transform: 'scale(1.05)' },
                            '&.Mui-disabled': { bgcolor: '#edf2f7', color: '#a0aec0' },
                            width: isMobile ? 40 : 48,
                            height: isMobile ? 40 : 48
                        }}
                    >
                        {submitting ? <CircularProgress size={isMobile ? 20 : 22} color="inherit" /> : <SendIcon sx={{ transform: 'rotate(180deg)' }} />}
                    </IconButton>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ fontFamily: 'Vazirmatn', borderRadius: 3 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}