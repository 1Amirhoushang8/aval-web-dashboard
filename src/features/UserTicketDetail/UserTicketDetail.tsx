import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Container,
    TextField,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    Fade,
    useMediaQuery,
    useTheme
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ticketService } from "../../API/TicketService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
import apiClient from "../../API/apiClient";
import UserTicketDetailSkeleton from "../../Skeleton/UserTicketDetailSkeleton/UserTicketDetailSkeleton.tsx";
import type { Message } from "../../models/Massage/TicketMassage.ts";

// Helper to unwrap ApiResponse from direct apiClient calls
const unwrap = <T,>(response: { data: { success: boolean; data?: T; message?: string } }): T => {
    if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
    }
    throw new Error(response.data.message || "خطا در دریافت اطلاعات");
};

const toPersianNumber = (num: number | string): string => {
    if (!num) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function UserTicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [ticket, setTicket] = useState<StoredTicket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [userReply, setUserReply] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info" | "warning";
    }>({
        open: false,
        message: "",
        severity: "success"
    });

    const fetchTicketAndMessages = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            // ticketService.getById now returns unwrapped StoredTicket
            const ticketData = await ticketService.getById(id);
            setTicket(ticketData);

            // Fetch messages
            const messagesResponse = await apiClient.get<{ success: boolean; data: Message[]; message?: string }>(`/messages?ticketId=${id}`);
            const messagesData = unwrap<Message[]>(messagesResponse);
            const sortedMessages = [...messagesData].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
            setMessages(sortedMessages);
            setError(false);
        } catch (err: unknown) {
            console.error("Error fetching ticket details:", err);
            setError(true);
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

    const handleDownload = (file: StoredTicket['file'] | boolean) => {
        if (!file || typeof file === "boolean") {
            setSnackbar({ open: true, message: "فایلی برای دانلود وجود ندارد", severity: "info" });
            return;
        }

        const fileObj = file as { name: string; type: string; size: number; data: string };
        if (!fileObj.data) {
            setSnackbar({ open: true, message: "داده فایل موجود نیست", severity: "error" });
            return;
        }

        const link = document.createElement('a');
        link.href = fileObj.data;
        link.download = fileObj.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSnackbar({ open: true, message: "دانلود فایل آغاز شد", severity: "success" });
    };

    const handleSendMessage = async () => {
        if (!ticket || !id || !userReply.trim()) return;

        setSubmitting(true);
        try {
            const now = new Date();
            const timestamp = now.toLocaleDateString('fa-IR') + " " + now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

            const newMessage: Omit<Message, "id"> = {
                ticketId: id,
                senderId: ticket.userId,
                senderType: "user",
                text: userReply.trim(),
                timestamp,
                isRead: false
            };

            const messageResponse = await apiClient.post<{ success: boolean; data: Message; message?: string }>("/messages", newMessage);
            const savedMessage = unwrap<Message>(messageResponse);

            const updatedTicket: StoredTicket = {
                ...ticket,
                status: "pending"
            };
            await ticketService.update(id, updatedTicket);

            setMessages(prev => [...prev, savedMessage].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
            setTicket(updatedTicket);
            setUserReply("");
            setSnackbar({ open: true, message: "پیام شما با موفقیت ارسال شد", severity: "success" });
        } catch (err: unknown) {
            console.error("Failed to send message:", err);
            const message = err instanceof Error ? err.message : "خطا در ارسال پیام";
            setSnackbar({ open: true, message, severity: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <UserTicketDetailSkeleton />;

    if (error || !ticket) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <WarningAmberIcon sx={{ fontSize: 60, color: '#ffa000', mb: 2 }} />
                <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn', mb: 3 }}>تیکت مورد نظر یافت نشد.</Typography>
                <Button variant="contained" onClick={() => navigate("/MyTickets")} sx={{ fontFamily: 'Vazirmatn', bgcolor: '#666AF2' }}>بازگشت</Button>
            </Container>
        );
    }

    const hasFile = ticket.file && typeof ticket.file === 'object' && 'data' in ticket.file;

    // First message is the ticket description
    const descriptionMessage: Message & { hasFile?: boolean } = {
        id: 'description-msg',
        ticketId: String(ticket.id),
        senderId: ticket.userId,
        senderType: 'user',
        text: ticket.description,
        timestamp: `${ticket.date} ${ticket.time}`,
        isRead: true,
        hasFile
    };

    const allMessages = [descriptionMessage, ...messages];

    return (
        <Container
            maxWidth={false}
            sx={{
                width: '80%',
                py: isMobile ? 2 : 4,
                px: isMobile ? 1 : 2,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Vazirmatn'
            }}
            dir="rtl"
        >
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
                <Button
                    startIcon={<ArrowForwardIcon sx={{ ml: 1, mr: 0 }} />}
                    onClick={() => navigate("/MyTickets")}
                    sx={{
                        fontFamily: 'Vazirmatn',
                        color: '#666AF2',
                        fontWeight: 700,
                        mb: isMobile ? 1 : 2,
                        fontSize: isMobile ? '0.8rem' : '0.875rem'
                    }}
                >
                    بازگشت به تیکت‌های من
                </Button>
                <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{
                        fontWeight: 800,
                        color: '#1a1a1a',
                        fontFamily: 'Vazirmatn',
                        fontSize: isMobile ? '1.2rem' : '1.5rem'
                    }}
                >
                    {ticket.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#95a5a6', fontSize: isMobile ? '0.7rem' : '0.85rem' }}>
                    شناسه تیکت: {toPersianNumber(ticket.id)} | تاریخ ثبت: {toPersianNumber(ticket.date)}
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    mb: isMobile ? 2 : 3,
                    p: isMobile ? 1.5 : 3,
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
                    <Fade in key={msg.id} timeout={500}>
                        <Box sx={{
                            alignSelf: msg.senderType === 'user' ? 'flex-start' : 'flex-end',
                            maxWidth: isMobile ? '95%' : '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.senderType === 'user' ? 'flex-start' : 'flex-end'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                {msg.senderType === 'user' ? <PersonIcon fontSize="small" sx={{ color: '#555' }} /> : <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#666AF2' }} />}
                                <Typography variant="caption" sx={{ fontWeight: 700, color: msg.senderType === 'user' ? '#555' : '#666AF2', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                    {msg.senderType === 'user' ? 'شما' : 'پشتیبانی'}
                                </Typography>
                            </Box>

                            <Paper sx={{
                                p: isMobile ? 1.5 : 2,
                                borderRadius: msg.senderType === 'user' ? '0 20px 20px 20px' : '20px 0 20px 20px',
                                bgcolor: msg.senderType === 'user' ? '#fff' : '#f0f1ff',
                                border: msg.senderType === 'user' ? '1px solid #e0e0e0' : '1px solid #d1d4f9',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                width: '100%'
                            }}>
                                <Typography sx={{
                                    fontFamily: 'Vazirmatn',
                                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                                    lineHeight: 1.6,
                                    color: '#333',
                                    wordBreak: 'break-word'
                                }}>
                                    {msg.text}
                                </Typography>
                                {msg.senderType === 'user' && idx === 0 && hasFile && (
                                    <Button
                                        onClick={() => handleDownload(ticket.file)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            mt: 1,
                                            color: '#666AF2',
                                            fontSize: isMobile ? '0.7rem' : '0.75rem',
                                            textTransform: 'none'
                                        }}
                                    >
                                        <AttachFileIcon fontSize="small" />
                                        <Typography variant="caption">دانلود فایل پیوست</Typography>
                                    </Button>
                                )}
                            </Paper>
                            <Typography variant="caption" sx={{ mt: 0.5, color: '#aaa', fontSize: isMobile ? '0.6rem' : '0.7rem' }}>
                                {toPersianNumber(msg.timestamp)}
                            </Typography>
                        </Box>
                    </Fade>
                ))}
                <div ref={scrollRef} />
            </Paper>

            <Paper elevation={0} sx={{ p: isMobile ? 1 : 2, borderRadius: 4, border: '1px solid #666AF2', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, alignItems: 'flex-end' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        variant="standard"
                        placeholder="نیاز به توضیح بیشتری دارید؟ اینجا بنویسید..."
                        value={userReply}
                        onChange={(e) => setUserReply(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                fontFamily: 'Vazirmatn',
                                fontSize: isMobile ? '0.85rem' : '0.9rem',
                                px: isMobile ? 0.5 : 1,
                                py: isMobile ? 0.5 : 1
                            }
                        }}
                    />
                    <IconButton
                        onClick={handleSendMessage}
                        disabled={submitting || !userReply.trim()}
                        sx={{
                            bgcolor: '#666AF2',
                            color: '#fff',
                            '&:hover': { bgcolor: '#5558d9' },
                            '&.Mui-disabled': { bgcolor: '#ececec' },
                            width: isMobile ? 40 : 48,
                            height: isMobile ? 40 : 48
                        }}
                    >
                        {submitting ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : <SendIcon sx={{ transform: 'rotate(180deg)' }} />}
                    </IconButton>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} sx={{ fontFamily: 'Vazirmatn', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}