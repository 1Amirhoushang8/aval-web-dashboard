import { useState, useEffect } from "react";
import "./AdminTicketPage.scss";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, TextField,
    Typography, CircularProgress, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Snackbar, Alert, Menu, MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import { ticketService } from "../../API/TicketService";
import { userService } from "../../API/UserService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
import type { User } from "../../models/AccountingInterfaces/AccountingInterface";
import AdminTicketSkeleton from "../../Skeleton/AdminTicketPage/AdminTicketPage.tsx";

// Extended Ticket interface for local state
interface Ticket extends StoredTicket {
    userId: string;
    userFullName: string;
    localStatus: "pending" | "answered" | "in-progress";
}

// Convert English numbers to Persian (for display)
const toPersianNumber = (num: number | string): string => {
    if (num === null || num === undefined) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function AdminTicketPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "info"
    });

    // Fetch all tickets and users
    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch tickets and users in parallel
            const [ticketsResponse, usersResponse] = await Promise.all([
                ticketService.getAll(),
                userService.getAll()
            ]);

            setUsers(usersResponse.data);

            // Create a map for quick user lookup
            const userMap = new Map<string, User>();
            usersResponse.data.forEach((user: User) => {
                userMap.set(user.id.toString(), user);
            });

            // Transform tickets data to include user full name and local status
            const ticketsData = ticketsResponse.data.map((ticket) => {
                // Find the user for this ticket using the map
                const user = userMap.get(ticket.userId?.toString() || "");

                // Determine local status based on adminResponse
                let localStatus: "pending" | "answered" | "in-progress" = "pending";

                if (ticket.adminResponse) {
                    localStatus = "answered";
                }

                return {
                    ...ticket,
                    userId: ticket.userId || "",
                    userFullName: user?.FullName || `کاربر ${toPersianNumber(ticket.userId || Math.random())}`,
                    localStatus
                };
            });

            setTickets(ticketsData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setSnackbar({
                open: true,
                message: "خطا در دریافت اطلاعات",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleResponseChange = (id: string, value: string) => {
        setResponses(prev => ({ ...prev, [id]: value }));
    };

    const submitResponse = async (id: string) => {
        const responseText = responses[id];
        if (!responseText || responseText.trim() === "") {
            setSnackbar({
                open: true,
                message: "لطفاً پاسخ را وارد کنید",
                severity: "error"
            });
            return;
        }

        try {
            setSubmittingId(id);

            const currentTicket = tickets.find(t => t.id === id);
            if (!currentTicket) {
                throw new Error("تیکت یافت نشد");
            }

            // Create update payload matching StoredTicket interface
            const updatedTicket: Partial<StoredTicket> = {
                title: currentTicket.title,
                description: currentTicket.description,
                date: currentTicket.date,
                time: currentTicket.time,
                adminResponse: responseText,
                file: currentTicket.file
            };

            await ticketService.update(Number(id), updatedTicket as Omit<StoredTicket, "id">);

            setSnackbar({
                open: true,
                message: "پاسخ با موفقیت ثبت شد",
                severity: "success"
            });

            // Clear the response input
            setResponses(prev => {
                const newResponses = { ...prev };
                delete newResponses[id];
                return newResponses;
            });

            // Update local state - mark as answered
            setTickets(prevTickets =>
                prevTickets.map(t =>
                    t.id === id
                        ? { ...t, adminResponse: responseText, localStatus: "answered" }
                        : t
                )
            );

        } catch (error) {
            console.error("Error submitting response:", error);
            setSnackbar({
                open: true,
                message: "خطا در ثبت پاسخ. لطفاً دوباره تلاش کنید.",
                severity: "error"
            });
        } finally {
            setSubmittingId(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            await ticketService.delete(Number(deleteId));
            setTickets(prevTickets => prevTickets.filter(t => t.id !== deleteId));
            setSnackbar({
                open: true,
                message: "تیکت با موفقیت حذف شد",
                severity: "success"
            });
        } catch (error) {
            console.error("Failed to delete ticket:", error);
            setSnackbar({
                open: true,
                message: "خطا در حذف تیکت",
                severity: "error"
            });
        } finally {
            handleCloseDeleteConfirm();
        }
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        setAnchorEl(event.currentTarget);
        setActiveIndex(index);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setActiveIndex(null);
    };

    const handleStatusChange = async (status: "pending" | "answered" | "in-progress") => {
        if (activeIndex === null) return;

        const ticket = tickets[activeIndex];
        if (ticket.localStatus === status) {
            handleCloseMenu();
            return;
        }

        try {
            // Create update payload matching StoredTicket interface
            const updatedTicket: Partial<StoredTicket> = {
                title: ticket.title,
                description: ticket.description,
                date: ticket.date,
                time: ticket.time,
                file: ticket.file,
                adminResponse: status === "answered" ? (ticket.adminResponse || "پاسخ داده شد") :
                    (status === "pending" ? null : ticket.adminResponse)
            };

            await ticketService.update(Number(ticket.id), updatedTicket as Omit<StoredTicket, "id">);

            // Update local state
            setTickets(prevTickets =>
                prevTickets.map((t, idx) =>
                    idx === activeIndex
                        ? { ...t, localStatus: status, adminResponse: updatedTicket.adminResponse }
                        : t
                )
            );

            const statusText = status === 'answered' ? 'پاسخ داده شده' :
                status === 'in-progress' ? 'در حال بررسی' : 'در انتظار';

            setSnackbar({
                open: true,
                message: `وضعیت تیکت به ${statusText} تغییر کرد`,
                severity: "success"
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            setSnackbar({
                open: true,
                message: "خطا در تغییر وضعیت",
                severity: "error"
            });
        } finally {
            handleCloseMenu();
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const getUserFullName = (userId: string): string => {
        const user = users.find(u => u.id.toString() === userId);
        return user?.FullName || `کاربر ${toPersianNumber(userId)}`;
    };

    const pendingCount = tickets.filter(t => t.localStatus === 'pending').length;
    const inProgressCount = tickets.filter(t => t.localStatus === 'in-progress').length;
    const answeredCount = tickets.filter(t => t.localStatus === 'answered').length;

    if (loading) {
        return <AdminTicketSkeleton rows={5} />;
    }

    return (
        <div className="admin-ticket-page" dir="rtl">
            {/* Header with stats */}
            <div className="page-header">
                <div className="header-title">
                    <h1>مدیریت تیکت‌های پشتیبانی</h1>
                    <p className="subtitle">مشاهده و پاسخ به تیکت‌های کاربران</p>
                </div>
                <div className="stats-container">
                    <div className="stat-card total">
                        <span className="stat-label">کل تیکت‌ها</span>
                        <span className="stat-value">{toPersianNumber(tickets.length)}</span>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-label">در انتظار</span>
                        <span className="stat-value">{toPersianNumber(pendingCount)}</span>
                    </div>
                    <div className="stat-card in-progress">
                        <span className="stat-label">در حال بررسی</span>
                        <span className="stat-value">{toPersianNumber(inProgressCount)}</span>
                    </div>
                    <div className="stat-card answered">
                        <span className="stat-label">پاسخ داده شده</span>
                        <span className="stat-value">{toPersianNumber(answeredCount)}</span>
                    </div>
                </div>
            </div>

            {/* Tickets Table */}
            <TableContainer component={Paper} className="tickets-table-container">
                <Table className="tickets-table">
                    <TableHead>
                        <TableRow>
                            <TableCell>نام کاربر</TableCell>
                            <TableCell>عنوان تیکت</TableCell>
                            <TableCell>توضیحات</TableCell>
                            <TableCell>فایل پیوست</TableCell>
                            <TableCell>تاریخ و زمان</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>پاسخ مدیریت</TableCell>
                            <TableCell>عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        هیچ تیکتی یافت نشد
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket, index) => (
                                <TableRow key={ticket.id} className={`${ticket.localStatus}-row`}>
                                    <TableCell>
                                        <div className="user-info">
                                            <PersonIcon className="user-icon" />
                                            <span className="user-name">{getUserFullName(ticket.userId)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="ticket-title">
                                            {ticket.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="ticket-description" title={ticket.description}>
                                            {ticket.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {ticket.file ? (
                                            <Tooltip title={ticket.file.name} arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => window.open(ticket.file?.url, '_blank')}
                                                    sx={{ color: '#666AF2' }}
                                                >
                                                    <AttachFileIcon />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <span className="no-file">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="date-time">
                                            <span className="date">{ticket.date}</span>
                                            <span className="time">{ticket.time}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`status-badge ${ticket.localStatus}`}>
                                            {ticket.localStatus === 'answered' && (
                                                <>
                                                    <CheckCircleIcon sx={{ fontSize: 16, ml: 0.5 }} />
                                                    پاسخ داده شده
                                                </>
                                            )}
                                            {ticket.localStatus === 'in-progress' && (
                                                <>
                                                    <PendingIcon sx={{ fontSize: 16, ml: 0.5 }} />
                                                    در حال بررسی
                                                </>
                                            )}
                                            {ticket.localStatus === 'pending' && (
                                                <>
                                                    <PendingIcon sx={{ fontSize: 16, ml: 0.5 }} />
                                                    در انتظار
                                                </>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {ticket.localStatus === 'pending' || ticket.localStatus === 'in-progress' ? (
                                            <div className="response-section">
                                                <TextField
                                                    size="small"
                                                    placeholder="پاسخ خود را بنویسید..."
                                                    value={responses[ticket.id] || ""}
                                                    onChange={(e) => handleResponseChange(ticket.id, e.target.value)}
                                                    multiline
                                                    maxRows={2}
                                                    disabled={submittingId === ticket.id}
                                                    fullWidth
                                                    variant="outlined"
                                                    className="response-input"
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={() => submitResponse(ticket.id)}
                                                    disabled={!responses[ticket.id]?.trim() || submittingId === ticket.id}
                                                    className="submit-response-btn"
                                                    sx={{
                                                        backgroundColor: '#2DC68D',
                                                        '&:hover': { backgroundColor: '#25a874' },
                                                        minWidth: '100px'
                                                    }}
                                                    startIcon={submittingId === ticket.id ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SendIcon />}
                                                >
                                                    {submittingId === ticket.id ? 'در حال ثبت' : 'ثبت'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="completed-response">
                                                <p>{ticket.adminResponse}</p>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="action-buttons">
                                            <Button
                                                className="quick-change-btn"
                                                onClick={(e) => handleOpenMenu(e, index)}
                                                sx={{
                                                    backgroundColor: '#3579F3',
                                                    '&:hover': { backgroundColor: '#2a5fc2' }
                                                }}
                                            >
                                                تغییر وضعیت
                                            </Button>
                                            <Tooltip title="حذف تیکت" arrow>
                                                <IconButton
                                                    onClick={() => handleDeleteClick(ticket.id)}
                                                    sx={{
                                                        color: '#dc2626',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                                            transform: 'scale(1.1)',
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Quick Status Change Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                className="status-menu"
            >
                <MenuItem onClick={() => handleStatusChange("pending")}>
                    <PendingIcon sx={{ fontSize: 20, ml: 1 }} />
                    در انتظار
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("in-progress")}>
                    <PendingIcon sx={{ fontSize: 20, ml: 1 }} />
                    در حال بررسی
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("answered")}>
                    <CheckCircleIcon sx={{ fontSize: 20, ml: 1 }} />
                    پاسخ داده شده
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCloseDeleteConfirm}
                maxWidth="xs"
                fullWidth
                className="delete-dialog"
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        direction: 'rtl'
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>
                    تایید حذف
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        آیا از حذف این تیکت اطمینان دارید؟
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        این عمل قابل بازگشت نیست.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button
                        onClick={handleCloseDeleteConfirm}
                        variant="outlined"
                        sx={{ borderColor: '#6b7280', color: '#6b7280' }}
                    >
                        انصراف
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
                    >
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        fontFamily: 'Vazirmatn, sans-serif',
                        fontSize: '0.95rem',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}