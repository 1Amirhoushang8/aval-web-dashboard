import { useState, useEffect } from "react";
import "./AdminTicketPage.scss";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, TextField,
    IconButton,
    Dialog, DialogTitle,  DialogActions,
    Snackbar, Alert, Menu, MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import { ticketService } from "../../API/TicketService";
import { userService } from "../../API/UserService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
import type { User } from "../../models/AccountingInterfaces/AccountingInterface";
import AdminTicketSkeleton from "../../Skeleton/AdminTicketPage/AdminTicketPage.tsx";

interface Ticket extends StoredTicket {
    userFullName: string;
    localStatus: "pending" | "answered" | "in-progress";
}

const toPersianNumber = (num: number | string): string => {
    if (num === null || num === undefined) return '۰';
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketsRes, usersRes] = await Promise.all([
                ticketService.getAll(),
                userService.getAll()
            ]);

            const fetchedUsers: User[] = usersRes.data;
            setUsers(fetchedUsers);

            // FIX: Map users by ID (converting to string to ensure a match)
            const userMap = new Map<string, string>();
            fetchedUsers.forEach((u) => {
                userMap.set(String(u.id), u.FullName || "نامشخص");
            });

            const ticketsData = ticketsRes.data.map((t: StoredTicket) => {
                // Find the username using the map
                const username = userMap.get(String(t.userId));

                let localStatus: "pending" | "answered" | "in-progress" = "pending";
                if (t.adminResponse) localStatus = "answered";

                return {
                    ...t,
                    userFullName: username || `کاربر ${toPersianNumber(t.userId || "")}`,
                    localStatus
                };
            });

            setTickets(ticketsData.reverse());
        } catch (error) {
            // ESLint fix: Variable 'error' is now used
            console.error("Critical error fetching dashboard data:", error);
            setSnackbar({ open: true, message: "خطا در دریافت اطلاعات", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const submitResponse = async (id: string) => {
        const responseText = responses[id];
        if (!responseText?.trim()) return;

        try {
            setSubmittingId(id);
            const currentTicket = tickets.find(t => t.id === id);
            if (!currentTicket) return;

            const updatedTicket = {
                ...currentTicket,
                adminResponse: responseText,
                status: "answered"
            };

            // @ts-ignore - Removing UI-only helper fields before sending to API
            delete updatedTicket.userFullName;
            // @ts-ignore
            delete updatedTicket.localStatus;

            await ticketService.update(Number(id), updatedTicket as Omit<StoredTicket, "id">);

            setTickets(prev => prev.map(t => t.id === id ? { ...t, adminResponse: responseText, localStatus: "answered" } : t));
            setResponses(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            setSnackbar({ open: true, message: "پاسخ ثبت شد", severity: "success" });
        } catch (error) {
            console.error("Failed to submit response:", error);
            setSnackbar({ open: true, message: "خطا در ثبت پاسخ", severity: "error" });
        } finally {
            setSubmittingId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await ticketService.delete(Number(deleteId));
            setTickets(prev => prev.filter(t => t.id !== deleteId));
            setSnackbar({ open: true, message: "تیکت حذف شد", severity: "success" });
        } catch (error) {
            console.error("Error during ticket deletion:", error);
            setSnackbar({ open: true, message: "خطا در حذف تیکت", severity: "error" });
        } finally {
            setDeleteConfirmOpen(false);
        }
    };

    const handleStatusChange = async (status: "pending" | "answered" | "in-progress") => {
        if (activeIndex === null) return;
        const ticket = tickets[activeIndex];
        try {
            const updated = { ...ticket, adminResponse: status === "answered" ? (ticket.adminResponse || "تایید شد") : (status === "pending" ? null : ticket.adminResponse) };

            // @ts-ignore
            const { userFullName, localStatus, ...apiData } = updated;
            await ticketService.update(Number(ticket.id), apiData as Omit<StoredTicket, "id">);

            setTickets(prev => prev.map((t, i) => i === activeIndex ? { ...t, localStatus: status, adminResponse: updated.adminResponse } : t));
            setSnackbar({ open: true, message: "وضعیت بروز شد", severity: "success" });
        } catch (error) {
            console.error("Status update error:", error);
            setSnackbar({ open: true, message: "خطا در تغییر وضعیت", severity: "error" });
        } finally {
            setAnchorEl(null);
        }
    };

    if (loading) return <AdminTicketSkeleton rows={5} />;

    return (
        <div className="admin-ticket-page" dir="rtl" style={{ fontFamily: 'Vazirmatn' }}>
            <div className="page-header">
                <div className="header-title">
                    <h1>مدیریت تیکت‌های پشتیبانی</h1>
                    <p className="subtitle">نمایش تیکت‌ها بر اساس نام کاربری</p>
                </div>
                <div className="stats-container">
                    <div className="stat-card total">
                        <span className="stat-label">کل</span>
                        <span className="stat-value">{toPersianNumber(tickets.length)}</span>
                    </div>
                </div>
            </div>

            <TableContainer component={Paper} className="tickets-table-container">
                <Table className="tickets-table">
                    <TableHead>
                        <TableRow>
                            <TableCell>نام کاربری</TableCell>
                            <TableCell>عنوان</TableCell>
                            <TableCell>توضیحات</TableCell>
                            <TableCell>فایل</TableCell>
                            <TableCell>زمان</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>پاسخ</TableCell>
                            <TableCell>عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map((ticket, index) => (
                            <TableRow key={ticket.id} className={`${ticket.localStatus}-row`}>
                                <TableCell>
                                    <div className="user-info">
                                        <PersonIcon className="user-icon" />
                                        <span className="user-name"><b>{ticket.userFullName}</b></span>
                                    </div>
                                </TableCell>
                                <TableCell>{ticket.title}</TableCell>
                                <TableCell><div className="ticket-description">{ticket.description}</div></TableCell>
                                <TableCell>{ticket.file ? <AttachFileIcon sx={{ color: '#666AF2' }} /> : "—"}</TableCell>
                                <TableCell>
                                    <div className="date-time">
                                        <span>{toPersianNumber(ticket.date)}</span>
                                        <span className="time">{toPersianNumber(ticket.time)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`status-badge ${ticket.localStatus}`}>
                                        {ticket.localStatus === 'answered' ? 'پاسخ داده شد' : 'در انتظار'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {ticket.localStatus !== 'answered' ? (
                                        <div className="response-section">
                                            <TextField
                                                size="small"
                                                value={responses[ticket.id] || ""}
                                                onChange={(e) => setResponses(p => ({...p, [ticket.id]: e.target.value}))}
                                            />
                                            <IconButton onClick={() => submitResponse(ticket.id)} disabled={submittingId === ticket.id}><SendIcon /></IconButton>
                                        </div>
                                    ) : <div className="completed-response">{ticket.adminResponse}</div>}
                                </TableCell>
                                <TableCell>
                                    <div className="action-buttons">
                                        <Button size="small" variant="contained" onClick={(e) => {setAnchorEl(e.currentTarget); setActiveIndex(index);}}>وضعیت</Button>
                                        <IconButton onClick={() => {setDeleteId(ticket.id); setDeleteConfirmOpen(true);}} sx={{ color: '#dc2626' }}><DeleteIcon /></IconButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => handleStatusChange("pending")}>در انتظار</MenuItem>
                <MenuItem onClick={() => handleStatusChange("answered")}>پاسخ داده شد</MenuItem>
            </Menu>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>حذف تیکت</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error">حذف</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} sx={{ fontFamily: 'Vazirmatn' }}>{snackbar.message}</Alert>
            </Snackbar>
        </div>
    );
}