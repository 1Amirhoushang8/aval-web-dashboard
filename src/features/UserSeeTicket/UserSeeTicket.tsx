import { useState, useEffect } from "react";
import "./UserSeeTicket.scss";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Typography, Box, IconButton, Tooltip, Skeleton,
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ticketService } from "../../API/TicketService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
import UserSeeTicketSkeleton from "../../Skeleton/UserSeeTicket/UserSeeTicket.tsx";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const toPersianNumber = (num: number | string): string => {
    if (!num) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function UserSeeTickets() {
    const [tickets, setTickets] = useState<StoredTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");


    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [selectedTicketId, setSelectedTicketId] = useState<string | number | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error"
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
            setUserName(currentUser.FullName || currentUser.username || "کاربر");


            const response = await ticketService.getAll();

            const userTickets = response.data.filter(
                (t: StoredTicket) => String(t.userId) === String(currentUser.id)
            );

            setTickets(userTickets.reverse());
        } catch (err) {

            console.error("JSON Server connection error:", err);
            setError("خطا در اتصال به سرور. لطفا مطمئن شوید JSON Server در حال اجراست.");
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    useEffect(() => { fetchUserTickets(); }, []);

    const openDeleteConfirm = (id: string | number) => {
        setSelectedTicketId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedTicketId === null) return;

        try {

            await ticketService.delete(selectedTicketId);
            setTickets(prev => prev.filter(t => t.id !== selectedTicketId));
            setSnackbar({ open: true, message: "تیکت با موفقیت حذف شد", severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "حذف تیکت با خطا مواجه شد", severity: "error" });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedTicketId(null);
        }
    };

    const getStatusChip = (status: string) => {

        const configs: Record<string, {
            label: string,
            color: "success" | "primary" | "warning" | "default"
        }> = {
            "answered": { label: "پاسخ داده شده", color: "success" },
            "in-progress": { label: "در حال بررسی", color: "primary" },
            "pending": { label: "در انتظار", color: "warning" }
        };
        const config = configs[status] || configs["pending"];
        return (
            <Chip
                label={config.label}
                color={config.color}
                variant="outlined"
                sx={{ fontFamily: 'Vazirmatn', fontWeight: 600 }}
            />
        );
    };

    return (
        <div className="user-tickets-page" dir="rtl" style={{ fontFamily: 'Vazirmatn, sans-serif', padding: '20px' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Vazirmatn', fontWeight: 800 }}>تیکت‌های من</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>مدیریت و پیگیری درخواست‌های پشتیبانی</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f5f5f5', p: '6px 16px', borderRadius: 8 }}>
                    <AccountCircleIcon color="primary" />
                    <Typography sx={{ fontFamily: 'Vazirmatn', fontWeight: 600 }}>
                        {loading ? <Skeleton width={60} /> : userName}
                    </Typography>
                </Box>
            </Box>

            {error && !loading && (
                <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn' }} action={
                    <Button color="inherit" size="small" onClick={fetchUserTickets}>تلاش مجدد</Button>
                }>{error}</Alert>
            )}

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#fcfcfc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn' }}>موضوع و شرح</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn' }}>زمان ثبت</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn' }}>وضعیت</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn' }}>پاسخ ادمین</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'Vazirmatn' }}>عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <UserSeeTicketSkeleton />
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} hover>
                                    <TableCell sx={{ maxWidth: 250 }}>
                                        <Typography sx={{ fontFamily: 'Vazirmatn', fontWeight: 700 }}>{ticket.title}</Typography>
                                        <Typography variant="caption" sx={{ fontFamily: 'Vazirmatn', color: 'gray', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {ticket.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>{toPersianNumber(ticket.date)}</Typography>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>{toPersianNumber(ticket.time)}</Typography>
                                    </TableCell>
                                    <TableCell>{getStatusChip(ticket.status || "pending")}</TableCell>
                                    <TableCell>
                                        {ticket.adminResponse ? (
                                            <Box sx={{ p: 1.5, bgcolor: '#f0f9ff', borderRadius: 2, borderRight: '4px solid #0288d1' }}>
                                                <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', color: '#01579b' }}>{ticket.adminResponse}</Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" sx={{ fontFamily: 'Vazirmatn', fontStyle: 'italic', color: '#bbb' }}>در انتظار پاسخ...</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="حذف">
                                            <IconButton onClick={() => openDeleteConfirm(ticket.id)} color="error"><DeleteIcon /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <WarningAmberIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                                    <Typography sx={{ fontFamily: 'Vazirmatn', color: '#999' }}>هنوز تیکتی ثبت نکرده‌اید.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} dir="rtl">
                <DialogTitle sx={{ fontFamily: 'Vazirmatn', fontWeight: 700 }}>تایید حذف</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontFamily: 'Vazirmatn' }}>
                        آیا از حذف این تیکت اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontFamily: 'Vazirmatn' }}>انصراف</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" sx={{ fontFamily: 'Vazirmatn' }}>حذف</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ fontFamily: 'Vazirmatn', width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </div>
    );
}