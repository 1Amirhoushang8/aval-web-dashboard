import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Snackbar, Alert, Typography, Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AdminUsersSkeleton from "../../Skeleton/AdminUserPage/AdminUserPage.tsx";
import { userService } from "../../API/UserService";
import "./AdminUsersPage.scss";

// ---------- Helper functions (same as Accounting) ----------
const convertPersianToEnglishDigits = (text: string): string => {
    if (!text) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = text;
    for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
        result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
    }
    return result;
};

const normalizePersianText = (text: string): string => {
    if (!text) return '';
    let normalized = text.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    normalized = convertPersianToEnglishDigits(normalized);
    return normalized.trim().toLowerCase();
};

const toPersianNumber = (num: number | string): string => {
    if (num === null || num === undefined) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

interface User {
    id: string | number;
    username: string;
    fullName: string;
    phoneNumber?: string;
    // Add other fields as needed
}

export default function AdminUsersPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | number | null>(null);

    const showError = (message: string) => setError(message);
    const handleCloseError = () => setError(null);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userService.getAll();
                const usersData = Array.isArray(response.data) ? response.data : [];
                setUsers(usersData);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                showError("خطا در دریافت اطلاعات کاربران");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filter users by name
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const term = normalizePersianText(searchTerm);
        return users.filter(user => normalizePersianText(user.fullName).includes(term));
    }, [users, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleDeleteClick = (userId: string | number) => {
        setDeleteUserId(userId);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setDeleteUserId(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteUserId) return;
        try {
            await userService.delete(deleteUserId);
            setUsers(prev => prev.filter(user => user.id !== deleteUserId));
            handleCloseDeleteConfirm();
        } catch (err) {
            showError("خطا در حذف کاربر");
            handleCloseDeleteConfirm();
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <AdminUsersSkeleton />; // or <AccountingSkeleton />
    }

    return (
        <div className="admin-users-page" dir="rtl">

            <div className="page-header">
                <Tooltip title="بازگشت" arrow>
                    <IconButton onClick={handleBack} className="back-button" sx={{ color: 'var(--color-primary)' }}>
                        <ArrowBackIcon />
                    </IconButton>
                </Tooltip>
                <Typography variant="h5" className="page-title">مدیریت کاربران</Typography>
            </div>

            <div className="users-header">
                <div className="search-bar">
                    <TextField
                        variant="outlined"
                        placeholder="جستجو بر اساس نام ..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        size="small"
                        fullWidth
                        sx={{
                            '& .MuiInputBase-input': { textAlign: 'right' },
                            '& .MuiOutlinedInput-root': { borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }
                        }}
                    />
                </div>
            </div>

            {/* Users Table */}
            <TableContainer component={Paper} className="users-table-card">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>شناسه</TableCell>
                            <TableCell>نام کاربری</TableCell>
                            <TableCell>نام کامل</TableCell>
                            <TableCell>شماره تماس</TableCell>
                            <TableCell>عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{toPersianNumber(user.id)}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.phoneNumber ? toPersianNumber(user.phoneNumber) : '---'}</TableCell>
                                    <TableCell>
                                        <Tooltip title="حذف کاربر" arrow>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => handleDeleteClick(user.id)}
                                                sx={{
                                                    color: '#dc2626',
                                                    '&:hover': { backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#b91c1c', transform: 'scale(1.1)' },
                                                    transition: 'all 0.2s ease-in-out'
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography variant="body1" color="text.secondary">
                                            کاربری یافت نشد.
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCloseDeleteConfirm}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    paper: { sx: { borderRadius: 'var(--radius-lg)', direction: 'rtl', p: 2 } }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#ef4444', borderBottom: '2px solid #fee2e2' }}>
                    تایید حذف
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        آیا از حذف این کاربر اطمینان دارید؟
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        این عمل قابل بازگشت نیست.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                    <Button onClick={handleCloseDeleteConfirm} variant="outlined" sx={{ borderColor: '#6b7280', color: '#6b7280' }}>
                        انصراف
                    </Button>
                    <Button onClick={handleConfirmDelete} variant="contained" sx={{ backgroundColor: '#ef4444' }}>
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </div>
    );
}