import  { useState, useEffect } from "react";
import "./AdminTicketPage.scss";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, TextField,
    IconButton,
    Dialog, DialogTitle, DialogActions,
    Snackbar, Alert, Menu, MenuItem, Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import PhoneIcon from "@mui/icons-material/Phone";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { ticketService } from "../../API/TicketService";
import { userService } from "../../API/UserService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
import type { User } from "../../models/AccountingInterfaces/AccountingInterface";
import AdminTicketSkeleton from "../../Skeleton/AdminTicketPage/AdminTicketPage.tsx";

interface Ticket extends StoredTicket {
    username: string;
    userPhone: string;
    localStatus: "pending" | "answered" | "in-progress";
}

const toPersianNumber = (num: number | string): string => {
    if (num === null || num === undefined) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

export default function AdminTicketPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
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
            const userMap = new Map<string, { username: string, phone: string }>();

            fetchedUsers.forEach((u) => {
                userMap.set(String(u.id), {
                    username: u.username || "نامشخص",
                    phone: u.phoneNumber || "—"
                });
            });

            const ticketsData: Ticket[] = ticketsRes.data.map((t: StoredTicket) => {
                const userData = userMap.get(String(t.userId));
                let localStatus: "pending" | "answered" | "in-progress" = "pending";

                if (t.adminResponse) localStatus = "answered";
                if (t.status === "in-progress") localStatus = "in-progress";

                return {
                    ...t,
                    username: userData?.username || `کاربر ${toPersianNumber(t.userId || "")}`,
                    userPhone: userData?.phone || "",
                    localStatus
                };
            });

            setTickets(ticketsData.reverse());
        } catch (error) {
            console.error("Critical error fetching dashboard data:", error);
            setSnackbar({ open: true, message: "خطا در دریافت اطلاعات", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDownload = (fileUrl: string, fileName: string) => {
        if (!fileUrl) return;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'download';
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const submitResponse = async (id: string | number) => {
        const idString = String(id);
        const responseText = responses[idString];
        if (!responseText?.trim()) return;

        try {
            setSubmittingId(idString);
            const currentTicket = tickets.find(t => String(t.id) === idString);
            if (!currentTicket) return;

            const { username, userPhone, localStatus, ...apiPayload } = currentTicket;

            const updatedTicket: StoredTicket = {
                ...apiPayload,
                adminResponse: responseText,
                status: "answered"
            };

            await ticketService.update(id, updatedTicket);

            setTickets(prev => prev.map(t => String(t.id) === idString ? { ...t, adminResponse: responseText, localStatus: "answered" } : t));
            setResponses(prev => {
                const updated = { ...prev };
                delete updated[idString];
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
        if (deleteId === null) return;
        try {
            await ticketService.delete(deleteId);
            setTickets(prev => prev.filter(t => t.id !== deleteId));
            setSnackbar({ open: true, message: "تیکت حذف شد", severity: "success" });
        } catch (error) {
            setSnackbar({ open: true, message: "خطا در حذف تیکت", severity: "error" });
        } finally {
            setDeleteConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleStatusChange = async (status: "pending" | "answered" | "in-progress") => {
        if (activeIndex === null) return;
        const ticket = tickets[activeIndex];
        try {
            const { username, userPhone, localStatus, ...apiData } = ticket;

            const updatedPayload: StoredTicket = {
                ...apiData,
                adminResponse: status === "answered" ? (ticket.adminResponse || "تایید شد") : (status === "pending" ? null : ticket.adminResponse),
                status: status
            };

            await ticketService.update(ticket.id, updatedPayload);

            setTickets(prev => prev.map((t, i) => i === activeIndex ? {
                ...t,
                localStatus: status,
                adminResponse: updatedPayload.adminResponse || null,
                status: status
            } : t));
            setSnackbar({ open: true, message: "وضعیت بروز شد", severity: "success" });
        } catch (error) {
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
                    <p className="subtitle">نمایش تیکت‌ها و اطلاعات تماس کاربران</p>
                </div>
                <div className="stats-container">
                    <div className="stat-card total">
                        <span className="stat-label">کل تیکت‌ها</span>
                        <span className="stat-value">{toPersianNumber(tickets.length)}</span>
                    </div>
                </div>
            </div>

            <TableContainer component={Paper} className="tickets-table-container">
                <Table className="tickets-table">
                    <TableHead>
                        <TableRow>
                            <TableCell>نام کاربری / تماس</TableCell>
                            <TableCell>عنوان</TableCell>
                            <TableCell>توضیحات</TableCell>
                            <TableCell>پیوست</TableCell>
                            <TableCell>زمان</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>پاسخ ادمین</TableCell>
                            <TableCell>عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map((ticket, index) => (
                            <TableRow key={ticket.id} className={`${ticket.localStatus}-row`}>
                                <TableCell>
                                    <div className="user-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <PersonIcon fontSize="small" sx={{ color: '#666AF2' }} />
                                            <span className="user-name"><b>{ticket.username}</b></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.85rem' }}>
                                            <PhoneIcon sx={{ fontSize: '1rem' }} />
                                            <span>{toPersianNumber(ticket.userPhone)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{ticket.title}</TableCell>
                                <TableCell>
                                    <div className="ticket-description" title={ticket.description}>
                                        {ticket.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {ticket.file && ticket.file.url ? (
                                        <Tooltip title={`دانلود فایل: ${ticket.file.name} (${(ticket.file.size / 1024).toFixed(1)} KB)`}>
                                            <IconButton onClick={() => handleDownload(ticket.file!.url, ticket.file!.name)}>
                                                <AttachFileIcon sx={{ color: '#666AF2', transform: 'rotate(45deg)' }} />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <span style={{ color: '#ccc', fontSize: '0.8rem' }}>بدون فایل</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="date-time">
                                        <span>{toPersianNumber(ticket.date)}</span>
                                        <span className="time">{toPersianNumber(ticket.time)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`status-badge ${ticket.localStatus}`}>
                                        {ticket.localStatus === 'answered' ? 'پاسخ داده شد' :
                                            ticket.localStatus === 'in-progress' ? 'در حال بررسی' : 'در انتظار'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {ticket.localStatus !== 'answered' ? (
                                        <div className="response-section">
                                            <TextField
                                                placeholder="پاسخ خود را بنویسید..."
                                                size="small"
                                                fullWidth
                                                value={responses[String(ticket.id)] || ""}
                                                onChange={(e) => setResponses(p => ({...p, [String(ticket.id)]: e.target.value}))}
                                            />
                                            <IconButton
                                                onClick={() => submitResponse(ticket.id)}
                                                disabled={submittingId === String(ticket.id)}
                                                color="primary"
                                            >
                                                <SendIcon />
                                            </IconButton>
                                        </div>
                                    ) : (
                                        <div className="completed-response" style={{ color: '#2e7d32', fontWeight: '500' }}>
                                            {ticket.adminResponse}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="action-buttons">
                                        <Button size="small" variant="outlined" onClick={(e) => {setAnchorEl(e.currentTarget); setActiveIndex(index);}}>تغییر وضعیت</Button>
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
                <MenuItem onClick={() => handleStatusChange("in-progress")}>در حال بررسی</MenuItem>
                <MenuItem onClick={() => handleStatusChange("answered")}>پاسخ داده شد</MenuItem>
            </Menu>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle sx={{ fontFamily: 'Vazirmatn' }}>آیا از حذف این تیکت مطمئن هستید؟</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error">حذف نهایی</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snackbar.severity as any} sx={{ fontFamily: 'Vazirmatn' }}>{snackbar.message}</Alert>
            </Snackbar>
        </div>
    );
}