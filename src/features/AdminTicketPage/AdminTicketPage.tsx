import React, { useState, useEffect } from "react";
import "./AdminTicketPage.scss";
import { useNavigate } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button,
    IconButton,
    Dialog, DialogTitle, DialogActions,
    Snackbar, Alert, Menu, MenuItem, Tooltip,
    type AlertColor,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { ticketService } from "../../API/TicketService";
import { userService } from "../../API/UserService";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface";
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
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: AlertColor;
    }>({
        open: false,
        message: "",
        severity: "success"
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketsData, usersData] = await Promise.all([
                ticketService.getAll(),
                userService.getAll()
            ]);

            const userMap = new Map<string, { username: string, phone: string }>();
            usersData.forEach((u) => {
                userMap.set(String(u.id), {
                    username: u.fullName || u.username || "نامشخص",
                    phone: u.phoneNumber || "—"
                });
            });

            const enrichedTickets: Ticket[] = ticketsData.map((t: StoredTicket): Ticket => {
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

            setTickets(enrichedTickets.reverse());
        } catch (error: unknown) {
            console.error("Fetch error:", error);
            const message = error instanceof Error ? error.message : "خطا در دریافت اطلاعات";
            setSnackbar({ open: true, message, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDownload = (file: StoredTicket['file'] | boolean): void => {
        if (!file || typeof file === "boolean") {
            setSnackbar({ open: true, message: "فایلی برای دانلود وجود ندارد", severity: "info" });
            return;
        }

        // The backend now returns the file as a JSON string, parse it back to an object
        let fileObj: { name: string; type: string; size: number; data: string };
        try {
            // If file is already an object (legacy data), assign directly; otherwise parse the JSON string
            if (typeof file === "object") {
                fileObj = file as { name: string; type: string; size: number; data: string };
            } else {
                fileObj = JSON.parse(file as string);
            }
        } catch {
            setSnackbar({ open: true, message: "داده فایل معتبر نیست", severity: "error" });
            return;
        }

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

    const handleNavigateToDetails = (id: string | number) => {
        navigate(`/ticket-details/${id}`);
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (deleteId === null) return;
        try {
            await ticketService.delete(deleteId);
            setTickets(prev => prev.filter(t => t.id !== deleteId));
            setSnackbar({ open: true, message: "تیکت حذف شد", severity: "success" });
        } catch (error: unknown) {
            console.error("Delete error:", error);
            const message = error instanceof Error ? error.message : "خطا در حذف تیکت";
            setSnackbar({ open: true, message, severity: "error" });
        } finally {
            setDeleteConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleStatusChange = async (newStatus: "pending" | "answered" | "in-progress"): Promise<void> => {
        if (activeIndex === null) return;
        const ticket = tickets[activeIndex];
        try {
            const { ...apiData } = ticket;
            const updatedPayload: StoredTicket = {
                ...apiData,
                adminResponse: newStatus === "answered" ? (ticket.adminResponse || "تایید شد") : (newStatus === "pending" ? null : ticket.adminResponse),
                status: newStatus
            };

            await ticketService.update(ticket.id, updatedPayload);

            setTickets(prev => prev.map((t, i) => i === activeIndex ? {
                ...t,
                localStatus: newStatus,
                adminResponse: updatedPayload.adminResponse,
                status: newStatus
            } : t));
            setSnackbar({ open: true, message: "وضعیت بروز شد", severity: "success" });
        } catch (error: unknown) {
            console.error("Status update failed:", error);
            const message = error instanceof Error ? error.message : "خطا در تغییر وضعیت";
            setSnackbar({ open: true, message, severity: "error" });
        } finally {
            setAnchorEl(null);
            setActiveIndex(null);
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
                            <TableCell>توضیحات کوتاه</TableCell>
                            <TableCell>پیوست</TableCell>
                            <TableCell>زمان</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>جزئیات</TableCell>
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
                                    <div className="ticket-description">
                                        {ticket.shortDetail || "---"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {ticket.file ? (
                                        <Tooltip title={typeof ticket.file === 'string' ? "دانلود فایل" : `دانلود فایل: ${(ticket.file as any)?.name || '...'}`}>
                                            <IconButton onClick={() => handleDownload(ticket.file)}>
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
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        className="quick-change-btn"
                                        style={{ fontFamily: 'Vazirmatn' }}
                                        onClick={() => handleNavigateToDetails(ticket.id)}
                                    >
                                        مشاهده جزئیات
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <div className="action-buttons">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            className="quick-change-btn"
                                            style={{ fontFamily: 'Vazirmatn' }}
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                setAnchorEl(e.currentTarget);
                                                setActiveIndex(index);
                                            }}
                                        >
                                            تغییر وضعیت
                                        </Button>
                                        <IconButton onClick={() => { setDeleteId(ticket.id); setDeleteConfirmOpen(true); }} sx={{ color: '#dc2626' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => { setAnchorEl(null); setActiveIndex(null); }}
            >
                <MenuItem sx={{ fontFamily: 'Vazirmatn' }} onClick={() => handleStatusChange("pending")}>در انتظار</MenuItem>
                <MenuItem sx={{ fontFamily: 'Vazirmatn' }} onClick={() => handleStatusChange("in-progress")}>در حال بررسی</MenuItem>
                <MenuItem sx={{ fontFamily: 'Vazirmatn' }} onClick={() => handleStatusChange("answered")}>پاسخ داده شد</MenuItem>
            </Menu>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle sx={{ fontFamily: 'Vazirmatn' }}>آیا از حذف این تیکت مطمئن هستید؟</DialogTitle>
                <DialogActions>
                    <Button sx={{ fontFamily: 'Vazirmatn' }} onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
                    <Button sx={{ fontFamily: 'Vazirmatn' }} onClick={handleConfirmDelete} variant="contained" color="error">حذف نهایی</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ fontFamily: 'Vazirmatn', direction: 'rtl' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}