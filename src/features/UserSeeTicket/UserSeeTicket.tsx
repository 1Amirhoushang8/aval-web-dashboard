import { useState, useEffect } from "react";
import "./UserSeeTicket.scss";
import { useNavigate } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, Skeleton,
    Button, Snackbar, Alert, useMediaQuery, useTheme
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ticketService } from "../../API/TicketService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
import UserSeeTicketSkeleton from "../../Skeleton/UserSeeTicket/UserSeeTicket.tsx";

const toPersianNumber = (num: number | string): string => {
    if (!num) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function UserSeeTickets() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [tickets, setTickets] = useState<StoredTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info" | "warning";
    }>({
        open: false,
        message: "",
        severity: "success"
    });

    const fetchUserTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setError("کاربر یافت نشد. لطفا ابتدا وارد حساب خود شوید.");
                setLoading(false);
                return;
            }

            const currentUser = JSON.parse(userStr);
            // Handle both camelCase and PascalCase from stored user object
            const displayName = currentUser.fullName || currentUser.FullName || currentUser.username || "کاربر";
            setUserName(displayName);

            // ticketService.getAll() returns unwrapped StoredTicket[]
            const allTickets = await ticketService.getAll();
            const userTickets = allTickets.filter(
                (t) => String(t.userId) === String(currentUser.id)
            );

            setTickets(userTickets.reverse());
        } catch (err: unknown) {
            console.error("Server connection error:", err);
            const message = err instanceof Error ? err.message : "خطا در اتصال به سرور.";
            setError(message);
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    useEffect(() => {
        fetchUserTickets();
    }, []);

    const handleNavigateToDetails = (id: string | number) => {
        navigate(`/user-ticket-detail/${id}`);
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { label: string; className: string }> = {
            "answered": { label: "پاسخ داده شده", className: "answered" },
            "in-progress": { label: "در حال بررسی", className: "in-progress" },
            "pending": { label: "در انتظار", className: "pending" }
        };
        const config = configs[status] || configs["pending"];

        return (
            <div className={`status-badge ${config.className}`}>
                {config.label}
            </div>
        );
    };

    return (
        <div className="user-tickets-page" dir="rtl" style={{ fontFamily: 'Vazirmatn, sans-serif', padding: isMobile ? '16px' : '24px' }}>

            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 2 : 0,
                mb: isMobile ? 2 : 4
            }}>
                <Box>
                    <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontFamily: 'Vazirmatn', fontWeight: 800, color: '#1a1a1a' }}>تیکت‌های من</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn', mt: 0.5 }}>مدیریت و پیگیری درخواست‌های پشتیبانی</Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: '#fff',
                    border: '1px solid #eee',
                    p: isMobile ? '6px 12px' : '8px 16px',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                    <AccountCircleIcon sx={{ color: '#666AF2', fontSize: isMobile ? 20 : 24 }} />
                    <Typography sx={{ fontFamily: 'Vazirmatn', fontWeight: 600, color: '#444', fontSize: isMobile ? '0.85rem' : '1rem' }}>
                        {loading ? <Skeleton width={60} /> : userName}
                    </Typography>
                </Box>
            </Box>

            {error && !loading && (
                <Alert severity="error" sx={{ mb: 3, fontFamily: 'Vazirmatn', borderRadius: 2 }} action={
                    <Button color="inherit" size="small" onClick={fetchUserTickets}>تلاش مجدد</Button>
                }>{error}</Alert>
            )}

            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflowX: 'auto',
                    width: '100%'
                }}
            >
                <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn', color: '#555', py: isMobile ? 1 : 1.5 }}>عنوان تیکت</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn', color: '#555', py: isMobile ? 1 : 1.5 }}>توضیح کوتاه</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn', color: '#555', py: isMobile ? 1 : 1.5 }}>زمان ثبت</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn', color: '#555', py: isMobile ? 1 : 1.5 }}>وضعیت</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn', color: '#555', textAlign: 'center', py: isMobile ? 1 : 1.5 }}>عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <UserSeeTicketSkeleton />
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ minWidth: isMobile ? 130 : 150, py: isMobile ? 1.5 : 2 }}>
                                        <Typography sx={{ fontFamily: 'Vazirmatn', fontWeight: 700, color: '#2c3e50', fontSize: isMobile ? '0.85rem' : '1rem' }}>
                                            {ticket.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: isMobile ? 200 : 350, py: isMobile ? 1.5 : 2 }}>
                                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', color: '#7f8c8d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                            {ticket.shortDetail || "---"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: isMobile ? 1.5 : 2 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{toPersianNumber(ticket.date)}</Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>{toPersianNumber(ticket.time)}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: isMobile ? 1.5 : 2 }}>
                                        {getStatusBadge(ticket.status || "pending")}
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: isMobile ? 1.5 : 2 }}>
                                        <Button
                                            className="quick-change-btn"
                                            onClick={() => handleNavigateToDetails(ticket.id)}
                                            style={{ fontFamily: 'Vazirmatn', fontSize: isMobile ? '0.7rem' : '0.8rem', padding: isMobile ? '4px 8px' : '6px 12px' }}
                                        >
                                            مشاهده جزئیات
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: isMobile ? 8 : 12 }}>
                                    <WarningAmberIcon sx={{ fontSize: isMobile ? 32 : 48, color: '#dfe6e9', mb: 2 }} />
                                    <Typography sx={{ fontFamily: 'Vazirmatn', color: '#b2bec3', fontWeight: 500, fontSize: isMobile ? '0.85rem' : '1rem' }}>هنوز تیکتی توسط شما ثبت نشده است.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert severity={snackbar.severity} sx={{ fontFamily: 'Vazirmatn', width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}