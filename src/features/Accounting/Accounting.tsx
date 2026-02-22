import { useState, useEffect, useMemo,} from "react";
import React from 'react';
import SinglePaymentButton from "../../components/SinglePayButton/SinglePayButton.tsx";
import MultiPaymentButton from "../../components/MultiPayButton/MultiPayButton.tsx";
import AccountingSkeleton from "../../Skeleton/AccountingSkeleton/AccountingSkeleton.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Menu,
    MenuItem,
    Modal,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Typography,
    IconButton,
    Tooltip, type SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "./Accounting.scss";

import type { User } from "../../models/AccountingInterfaces/AccountingInterface.ts";
import { userService } from "../../API/UserService.ts";

// -------------------- Utility Functions --------------------
// Convert Persian/Arabic digits to English digits
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

// Normalize Persian text for search: convert Arabic letters to Persian, digits to English, trim, lowercase
const normalizePersianText = (text: string): string => {
    if (!text) return '';
    // Convert Arabic 'ي' to Persian 'ی' and Arabic 'ك' to Persian 'ک'
    let normalized = text.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    // Convert digits to English
    normalized = convertPersianToEnglishDigits(normalized);
    // Trim and lowercase (for English parts)
    return normalized.trim().toLowerCase();
};

// Convert English numbers to Persian (for display)
const toPersianNumber = (num: number | string): string => {
    if (num === null || num === undefined) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

// Extract only digits from a string (after converting Persian digits to English)
const extractPriceNumber = (priceString: string): string => {
    if (!priceString) return "0";
    const englishString = convertPersianToEnglishDigits(priceString);
    return englishString.replace(/\D/g, '') || "0";
};

// Format price with commas and تومان (returns Persian digits)
const formatPriceWithToman = (priceInput: string): string => {
    if (!priceInput || priceInput.trim() === '') return "۰ تومان";
    const numberPart = extractPriceNumber(priceInput);
    if (numberPart === '0' || numberPart === '') return "۰ تومان";
    const number = parseInt(numberPart, 10);
    if (isNaN(number)) return "۰ تومان";
    const formattedNumber = number.toLocaleString('en-US');
    return toPersianNumber(formattedNumber) + " تومان";
};

// Calculate monthly payment (returns Persian formatted string)
const calculateMonthlyPaymentPersian = (totalPrice: string, months: string): string => {
    const cleanTotal = extractPriceNumber(totalPrice);
    const cleanMonths = extractPriceNumber(months);
    const total = parseInt(cleanTotal) || 0;
    const monthCount = parseInt(cleanMonths) || 1;
    if (monthCount === 0 || total === 0) return "۰ تومان";
    const monthly = Math.floor(total / monthCount);
    return toPersianNumber(monthly.toLocaleString('en-US')) + " تومان";
};

// Clean input for processing (convert to English digits and remove non-digits)
const cleanNumberInput = (value: string): string => {
    if (!value) return '';
    return convertPersianToEnglishDigits(value).replace(/\D/g, '');
};

// Format number with commas for display (returns Persian digits)
const formatNumberWithCommas = (value: string): string => {
    if (!value) return '';
    const cleanValue = cleanNumberInput(value);
    if (cleanValue === '') return '';
    const numberValue = parseInt(cleanValue, 10);
    if (isNaN(numberValue)) return '';
    const formattedNumber = numberValue.toLocaleString('en-US');
    return toPersianNumber(formattedNumber);
};

// -------------------- Main Component --------------------
export default function AccountingPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Delete confirmation dialog state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const showError = (message: string) => setError(message);
    const handleCloseError = () => setError(null);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userService.getAll();
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                showError("خطا در دریافت اطلاعات کاربران");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers().catch(err => console.error("Uncaught error in fetchUsers:", err));
    }, []);

    // Duplicate serial number check (serialNumber is in Persian digits as stored)
    const isDuplicateSerialNumber = (serialNumber: string, excludeIndex?: number): boolean => {
        return users.some((user, idx) =>
            user.SerialNumber === serialNumber && (excludeIndex === undefined || idx !== excludeIndex)
        );
    };

    // -------------------- Filtering --------------------
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const term = normalizePersianText(searchTerm);
        return users.filter(user => {
            const name = normalizePersianText(user.FullName);
            return name.includes(term);
        });
    }, [users, searchTerm]);

    // -------------------- State for modals and menus --------------------
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [activePaymentIndex, setActivePaymentIndex] = useState<number | null>(null);
    const [editPaymentModal, setEditPaymentModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        totalPrice: "",
        totalMonths: "",
    });

    // New transaction form state
    const [newTransaction, setNewTransaction] = useState({
        serialnumber: "",
        fullname: "",
        service: "",
        price: "",
        status: "درحال-انجام" as User["status"],
        paymentType: "پرداخت-تکی" as User["paymentType"],
        monthlyPayment: "",
        totalMonths: "",
    });

    // Edit transaction form state
    const [editTransaction, setEditTransaction] = useState({
        serialnumber: "",
        fullname: "",
        service: "",
        price: "",
        status: "درحال-انجام" as User["status"],
        paymentType: "پرداخت-تکی" as User["paymentType"],
        monthlyPayment: "",
        totalMonths: "",
    });

    const open = Boolean(anchorEl);

    // Placeholders in Persian
    const pricePlaceholder = toPersianNumber("۱,۰۰۰,۰۰۰");
    const monthsPlaceholder = toPersianNumber("۴");

    // -------------------- Modal Handlers --------------------
    const handleAddTicket = () => setOpenModal(true);

    const handleEditTicket = (index: number) => {
        const user = users[index];
        setEditTransaction({
            serialnumber: user.SerialNumber,
            fullname: user.FullName,
            service: user.service,
            price: extractPriceNumber(user.price),
            status: user.status,
            paymentType: user.paymentType,
            monthlyPayment: user.monthlyPayment ? extractPriceNumber(user.monthlyPayment) : "",
            totalMonths: user.totalMonths ? user.totalMonths.toString() : "",
        });
        setEditingIndex(index);
        setEditModal(true);
    };

    const handleDeleteClick = (index: number) => {
        setDeleteIndex(index);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setDeleteIndex(null);
    };

    const handleConfirmDelete = async () => {
        if (deleteIndex === null) return;
        try {
            const user = users[deleteIndex];
            await userService.delete(user.id);
            setUsers(prevUsers => prevUsers.filter((_, i) => i !== deleteIndex));
            handleCloseDeleteConfirm();
        } catch (error) {
            console.error("Failed to delete user:", error);
            showError("خطا در حذف فاکتور");
            handleCloseDeleteConfirm();
        }
    };

    const handleOpenPaymentModal = (index: number) => {
        const user = users[index];
        setActivePaymentIndex(index);
        setPaymentDetails({
            totalPrice: extractPriceNumber(user.price),
            totalMonths: user.totalMonths ? user.totalMonths.toString() : "1",
        });
        setPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setPaymentModal(false);
        setActivePaymentIndex(null);
    };

    const handleOpenEditPaymentModal = () => setEditPaymentModal(true);
    const handleCloseEditPaymentModal = () => setEditPaymentModal(false);

    const handleSavePaymentDetails = async () => {
        if (activePaymentIndex === null) return;
        const user = users[activePaymentIndex];
        if (!user) {
            showError("اطلاعات کاربر یافت نشد");
            return;
        }

        try {
            let updatedUserData: Partial<User>;

            if (user.paymentType === "پرداخت-دوره-ای") {
                const totalPriceNum = extractPriceNumber(paymentDetails.totalPrice);
                const totalMonthsNum = extractPriceNumber(paymentDetails.totalMonths);
                const totalMonths = parseInt(totalMonthsNum) || 1;
                const totalPrice = formatPriceWithToman(totalPriceNum);
                const monthlyPayment = calculateMonthlyPaymentPersian(totalPriceNum, totalMonthsNum);

                updatedUserData = {
                    ...user,
                    monthlyPayment,
                    totalMonths,
                    price: totalPrice,
                };
            } else {
                const totalPriceNum = extractPriceNumber(paymentDetails.totalPrice);
                updatedUserData = {
                    ...user,
                    price: formatPriceWithToman(totalPriceNum),
                };
            }

            const response = await userService.update(user.id, updatedUserData as Omit<User, "id">);
            const updatedUsers = [...users];
            updatedUsers[activePaymentIndex] = response.data;
            setUsers(updatedUsers);

            handleCloseEditPaymentModal();
            handleClosePaymentModal();
        } catch (error) {
            console.error("Failed to update payment details:", error);
            showError("خطا در به‌روزرسانی جزئیات پرداخت");
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setNewTransaction({
            serialnumber: "",
            fullname: "",
            service: "",
            price: "",
            status: "درحال-انجام",
            paymentType: "پرداخت-تکی",
            monthlyPayment: "",
            totalMonths: "",
        });
    };

    const handleCloseEditModal = () => {
        setEditModal(false);
        setEditingIndex(null);
        setEditTransaction({
            serialnumber: "",
            fullname: "",
            service: "",
            price: "",
            status: "درحال-انجام",
            paymentType: "پرداخت-تکی",
            monthlyPayment: "",
            totalMonths: "",
        });
    };

    // -------------------- Save Handlers --------------------
    const handleSaveTransaction = async () => {
        if (!newTransaction.serialnumber.trim() ||
            !newTransaction.fullname.trim() ||
            !newTransaction.service.trim() ||
            !newTransaction.price.trim()) {
            showError("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }

        if (isDuplicateSerialNumber(newTransaction.serialnumber)) {
            showError("شماره فاکتور تکراری است");
            return;
        }

        try {
            const priceNum = extractPriceNumber(newTransaction.price);
            const formattedPrice = formatPriceWithToman(priceNum);
            let monthlyPayment = null;
            let totalMonths = null;

            if (newTransaction.paymentType === "پرداخت-دوره-ای") {
                const monthsNum = extractPriceNumber(newTransaction.totalMonths);
                if (!monthsNum || parseInt(monthsNum) < 1) {
                    showError("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
                    return;
                }
                monthlyPayment = calculateMonthlyPaymentPersian(priceNum, monthsNum);
                totalMonths = parseInt(monthsNum) || 1;
            }

            const newUser: Omit<User, "id"> = {
                SerialNumber: toPersianNumber(newTransaction.serialnumber), // store in Persian digits
                FullName: newTransaction.fullname,
                service: newTransaction.service,
                price: formattedPrice,
                status: newTransaction.status,
                paymentType: newTransaction.paymentType,
                monthlyPayment,
                totalMonths,
            };

            const response = await userService.create(newUser);
            setUsers(prevUsers => [...prevUsers, response.data]);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to create transaction:", error);
            showError("خطا در ایجاد فاکتور");
        }
    };

    const handleSaveEditTransaction = async () => {
        if (!editTransaction.serialnumber.trim() ||
            !editTransaction.fullname.trim() ||
            !editTransaction.service.trim() ||
            !editTransaction.price.trim() ||
            editingIndex === null) {
            showError("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }

        if (isDuplicateSerialNumber(editTransaction.serialnumber, editingIndex)) {
            showError("شماره فاکتور تکراری است");
            return;
        }

        try {
            const priceNum = extractPriceNumber(editTransaction.price);
            const formattedPrice = formatPriceWithToman(priceNum);
            let monthlyPayment = null;
            let totalMonths = null;

            if (editTransaction.paymentType === "پرداخت-دوره-ای") {
                const monthsNum = extractPriceNumber(editTransaction.totalMonths);
                if (!monthsNum || parseInt(monthsNum) < 1) {
                    showError("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
                    return;
                }
                monthlyPayment = calculateMonthlyPaymentPersian(priceNum, monthsNum);
                totalMonths = parseInt(monthsNum) || 1;
            }

            const userToUpdate = users[editingIndex];
            const updatedUser: Omit<User, "id"> = {
                SerialNumber: toPersianNumber(editTransaction.serialnumber),
                FullName: editTransaction.fullname,
                service: editTransaction.service,
                price: formattedPrice,
                status: editTransaction.status,
                paymentType: editTransaction.paymentType,
                monthlyPayment,
                totalMonths,
            };

            const response = await userService.update(userToUpdate.id, updatedUser);
            const updatedUsers = [...users];
            updatedUsers[editingIndex] = response.data;
            setUsers(updatedUsers);
            handleCloseEditModal();
        } catch (error) {
            console.error("Failed to update transaction:", error);
            showError("خطا در ویرایش فاکتور");
        }
    };

    // -------------------- Input Change Handlers --------------------
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'monthlyPayment') {
            setNewTransaction(prev => ({ ...prev, [name]: formatNumberWithCommas(value) }));
        } else if (name === 'serialnumber' || name === 'totalMonths') {
            setNewTransaction(prev => ({ ...prev, [name]: toPersianNumber(convertPersianToEnglishDigits(value)) }));
        } else {
            setNewTransaction(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'monthlyPayment') {
            setEditTransaction(prev => ({ ...prev, [name]: formatNumberWithCommas(value) }));
        } else if (name === 'serialnumber' || name === 'totalMonths') {
            setEditTransaction(prev => ({ ...prev, [name]: toPersianNumber(convertPersianToEnglishDigits(value)) }));
        } else {
            setEditTransaction(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'totalPrice') {
            setPaymentDetails(prev => ({ ...prev, [name]: formatNumberWithCommas(value) }));
        } else if (name === 'totalMonths') {
            setPaymentDetails(prev => ({ ...prev, [name]: toPersianNumber(convertPersianToEnglishDigits(value)) }));
        } else {
            setPaymentDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStatusChangeForm = (e: SelectChangeEvent<User["status"]>) => {
        setNewTransaction(prev => ({ ...prev, status: e.target.value as User["status"] }));
    };

    const handleEditStatusChangeForm = (e: SelectChangeEvent<User["status"]>) => {
        setEditTransaction(prev => ({ ...prev, status: e.target.value as User["status"] }));
    };

    const handlePaymentTypeChangeForm = (e: SelectChangeEvent<User["paymentType"]>) => {
        const newPaymentType = e.target.value as User["paymentType"];
        setNewTransaction(prev => ({
            ...prev,
            paymentType: newPaymentType,
            monthlyPayment: "",
            totalMonths: newPaymentType === "پرداخت-تکی" ? "" : prev.totalMonths
        }));
    };

    const handleEditPaymentTypeChangeForm = (e: SelectChangeEvent<User["paymentType"]>) => {
        const newPaymentType = e.target.value as User["paymentType"];
        setEditTransaction(prev => ({
            ...prev,
            paymentType: newPaymentType,
            monthlyPayment: "",
            totalMonths: newPaymentType === "پرداخت-تکی" ? "" : prev.totalMonths
        }));
    };

    // Quick status change menu
    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        setAnchorEl(event.currentTarget);
        setActiveIndex(index);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setActiveIndex(null);
    };

    const handleStatusChange = async (status: User["status"]) => {
        if (activeIndex === null) return;
        try {
            const user = users[activeIndex];
            const updatedUser = { ...user, status };
            const response = await userService.update(user.id, updatedUser);
            const updatedUsers = [...users];
            updatedUsers[activeIndex] = response.data;
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Failed to update status:", error);
            showError("خطا در تغییر وضعیت");
        } finally {
            handleCloseMenu();
        }
    };

    // -------------------- Render --------------------
    if (loading) {
        return <AccountingSkeleton />;
    }

    return (
        <div className="accounting" dir="rtl">

            {/* Header with plus button and search bar */}
            <div className="accounting-header">
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
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--color-white)',
                            }
                        }}
                    />
                </div>

                <div className="mydp">
                    <div className="dropdown">
                        <button
                            className="btn btn-primary"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            +
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddTicket();
                                    }}
                                >
                                    ایجاد فاکتور جدید
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Add New Transaction Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 450, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, direction: 'rtl'
                }}>
                    <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>ایجاد فاکتور جدید</Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="شماره فاکتور" name="serialnumber" value={newTransaction.serialnumber}
                                   onChange={handleInputChange} fullWidth required placeholder={toPersianNumber("۱۲۳۴۵۶۷۸۹")}
                                   slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                        <TextField label="نام کامل مشتری" name="fullname" value={newTransaction.fullname}
                                   onChange={handleInputChange} fullWidth required placeholder="نام و نام خانوادگی" />
                        <TextField label="خدمت/سرویس" name="service" value={newTransaction.service}
                                   onChange={handleInputChange} fullWidth required placeholder="نام خدمت یا سرویس مورد نظر را وارد کنید" />
                        <TextField label="مبلغ کل (تومان)" name="price" value={newTransaction.price}
                                   onChange={handleInputChange} fullWidth required placeholder={`مثال: ${pricePlaceholder}`}
                                   helperText="مبلغ کل را به تومان وارد کنید" sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }}
                                   slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                        <FormControl fullWidth required>
                            <InputLabel id="payment-type-label">نوع پرداخت</InputLabel>
                            <Select labelId="payment-type-label" value={newTransaction.paymentType}
                                    label="نوع پرداخت" onChange={handlePaymentTypeChangeForm}>
                                <MenuItem value="پرداخت-تکی">پرداخت تکی</MenuItem>
                                <MenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</MenuItem>
                            </Select>
                        </FormControl>
                        {newTransaction.paymentType === "پرداخت-دوره-ای" && (
                            <>
                                <TextField label="تعداد ماه‌ها" name="totalMonths" value={newTransaction.totalMonths}
                                           onChange={handleInputChange} fullWidth required placeholder={`مثال: ${monthsPlaceholder}`}
                                           helperText="تعداد ماه‌های پرداخت را وارد کنید"
                                           sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }}
                                           slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                                {newTransaction.price && newTransaction.totalMonths && (
                                    <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>
                                        پرداخت ماهیانه: {calculateMonthlyPaymentPersian(newTransaction.price, newTransaction.totalMonths)}
                                    </Typography>
                                )}
                            </>
                        )}
                        <FormControl fullWidth required>
                            <InputLabel id="status-label">وضعیت</InputLabel>
                            <Select labelId="status-label" value={newTransaction.status}
                                    label="وضعیت" onChange={handleStatusChangeForm}>
                                <MenuItem value="درحال-انجام">درحال انجام</MenuItem>
                                <MenuItem value="پرداخت-شده">پرداخت شده</MenuItem>
                                <MenuItem value="لغو-شده">لغو شده</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button variant="contained" onClick={handleSaveTransaction} fullWidth>ذخیره</Button>
                            <Button variant="outlined" onClick={handleCloseModal} fullWidth>انصراف</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal open={editModal} onClose={handleCloseEditModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 450, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, direction: 'rtl'
                }}>
                    <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>ویرایش فاکتور</Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="شماره فاکتور" name="serialnumber" value={editTransaction.serialnumber}
                                   onChange={handleEditInputChange} fullWidth required placeholder={toPersianNumber("۱۲۳۴۵۶۷۸۹")}
                                   slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                        <TextField label="نام کامل مشتری" name="fullname" value={editTransaction.fullname}
                                   onChange={handleEditInputChange} fullWidth required placeholder="نام و نام خانوادگی" />
                        <TextField label="خدمت/سرویس" name="service" value={editTransaction.service}
                                   onChange={handleEditInputChange} fullWidth required placeholder="نام خدمت یا سرویس مورد نظر را وارد کنید" />
                        <TextField label="مبلغ کل (تومان)" name="price" value={editTransaction.price}
                                   onChange={handleEditInputChange} fullWidth required placeholder={`مثال: ${pricePlaceholder}`}
                                   helperText="مبلغ کل را به تومان وارد کنید" sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }}
                                   slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                        <FormControl fullWidth required>
                            <InputLabel id="edit-payment-type-label">نوع پرداخت</InputLabel>
                            <Select labelId="edit-payment-type-label" value={editTransaction.paymentType}
                                    label="نوع پرداخت" onChange={handleEditPaymentTypeChangeForm}>
                                <MenuItem value="پرداخت-تکی">پرداخت تکی</MenuItem>
                                <MenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</MenuItem>
                            </Select>
                        </FormControl>
                        {editTransaction.paymentType === "پرداخت-دوره-ای" && (
                            <>
                                <TextField label="تعداد ماه‌ها" name="totalMonths" value={editTransaction.totalMonths}
                                           onChange={handleEditInputChange} fullWidth required placeholder={`مثال: ${monthsPlaceholder}`}
                                           slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                                {editTransaction.price && editTransaction.totalMonths && (
                                    <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>
                                        پرداخت ماهیانه: {calculateMonthlyPaymentPersian(editTransaction.price, editTransaction.totalMonths)}
                                    </Typography>
                                )}
                            </>
                        )}
                        <FormControl fullWidth required>
                            <InputLabel id="edit-status-label">وضعیت</InputLabel>
                            <Select labelId="edit-status-label" value={editTransaction.status}
                                    label="وضعیت" onChange={handleEditStatusChangeForm}>
                                <MenuItem value="درحال-انجام">درحال انجام</MenuItem>
                                <MenuItem value="پرداخت-شده">پرداخت شده</MenuItem>
                                <MenuItem value="لغو-شده">لغو شده</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button variant="contained" onClick={handleSaveEditTransaction} fullWidth sx={{ backgroundColor: '#10b981' }}>ذخیره تغییرات</Button>
                            <Button variant="outlined" onClick={handleCloseEditModal} fullWidth sx={{ borderColor: '#ef4444', color: '#ef4444' }}>انصراف</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Payment Details Modal */}
            <Dialog open={paymentModal} onClose={handleClosePaymentModal} maxWidth="sm" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 'var(--radius-lg)', direction: 'rtl' } } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>جزئیات پرداخت</DialogTitle>
                <DialogContent>
                    {activePaymentIndex !== null && users[activePaymentIndex] && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{users[activePaymentIndex].FullName}</Typography>
                                <Typography color="text.secondary">{users[activePaymentIndex].service}</Typography>
                            </Box>
                            <Box><Typography fontWeight="bold">مبلغ کل:</Typography><Typography variant="h6" color="primary">{users[activePaymentIndex].price}</Typography></Box>
                            <Box><Typography fontWeight="bold">نوع پرداخت:</Typography>
                                <Typography className={`payment-type ${users[activePaymentIndex].paymentType}`} sx={{ display: 'inline-block', p: '4px 12px', borderRadius: '20px', fontWeight: 'bold', mt: 1 }}>
                                    {users[activePaymentIndex].paymentType === "پرداخت-تکی" ? "پرداخت تکی" : "پرداخت دوره ای"}
                                </Typography>
                            </Box>
                            {users[activePaymentIndex].paymentType === "پرداخت-تکی" && (
                                <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center', border: '1px solid #bbdefb' }}>
                                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                        <PaymentIcon sx={{ fontSize: 32, color: 'white' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>پرداخت یکجا</Typography>
                                    <Typography variant="body2" color="text.secondary">این فاکتور به صورت یکجا پرداخت می‌شود</Typography>
                                </Box>
                            )}
                            {users[activePaymentIndex].paymentType === "پرداخت-دوره-ای" && (
                                <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center', border: '1px solid #c8e6c9' }}>
                                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 32, color: 'white' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold' }}>پرداخت دوره ای</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: '320px', mx: 'auto', mt: 2 }}>
                                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'right' }}>
                                            <Typography fontWeight="bold">تعداد اقساط: <Box component="span" sx={{ mr: 1 }}>{toPersianNumber(users[activePaymentIndex].totalMonths || 0)} ماه</Box></Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'right' }}>
                                            <Typography fontWeight="bold" color="success.main">مبلغ هر قسط: <Box component="span" sx={{ mr: 1 }}>{users[activePaymentIndex].monthlyPayment || '۰ تومان'}</Box></Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: '#f1f8e9', borderRadius: 1, border: '1px solid #aed581', textAlign: 'right' }}>
                                            <Typography fontWeight="bold" color="success.dark">مبلغ کل: <Box component="span" sx={{ mr: 1 }}>{users[activePaymentIndex].price}</Box></Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>این فاکتور به صورت اقساطی پرداخت می‌شود</Typography>
                                    <Button variant="outlined" onClick={handleOpenEditPaymentModal} sx={{ mt: 2, borderColor: '#10b981', color: '#10b981' }}>ویرایش جزئیات پرداخت</Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button onClick={handleClosePaymentModal} variant="outlined">بستن</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Payment Details Modal */}
            <Dialog open={editPaymentModal} onClose={handleCloseEditPaymentModal} maxWidth="sm" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 'var(--radius-lg)', direction: 'rtl' } } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>ویرایش جزئیات پرداخت</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>اطلاعات مربوط به پرداخت را ویرایش کنید</Typography>
                        <TextField variant="outlined" label="مبلغ کل (تومان)" name="totalPrice" value={paymentDetails.totalPrice}
                                   onChange={handlePaymentDetailsChange} fullWidth required placeholder={`مثال: ${pricePlaceholder}`}
                                   helperText="مبلغ کل را به تومان وارد کنید" sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }} />
                        {activePaymentIndex !== null && users[activePaymentIndex]?.paymentType === "پرداخت-دوره-ای" && (
                            <TextField variant="outlined" label="تعداد ماه‌ها" name="totalMonths" value={paymentDetails.totalMonths}
                                       onChange={handlePaymentDetailsChange} fullWidth required placeholder={`مثال: ${monthsPlaceholder}`} />
                        )}
                        {activePaymentIndex !== null && users[activePaymentIndex]?.paymentType === "پرداخت-دوره-ای" &&
                            paymentDetails.totalPrice && paymentDetails.totalMonths && (
                                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}><strong>مبلغ هر قسط:</strong></Typography>
                                    <Typography variant="h6" color="success.main">{calculateMonthlyPaymentPersian(paymentDetails.totalPrice, paymentDetails.totalMonths)}</Typography>
                                </Box>
                            )}
                        {activePaymentIndex !== null && users[activePaymentIndex]?.paymentType === "پرداخت-تکی" && (
                            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb', textAlign: 'center' }}>
                                <Typography variant="body2">این فاکتور به صورت یکجا پرداخت می‌شود</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button onClick={handleCloseEditPaymentModal} variant="outlined">انصراف</Button>
                    <Button onClick={handleSavePaymentDetails} variant="contained">ذخیره تغییرات</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 'var(--radius-lg)', direction: 'rtl', p: 2 } } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#ef4444', borderBottom: '2px solid #fee2e2' }}>تایید حذف</DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>آیا از حذف این فاکتور اطمینان دارید؟</Typography>
                    <Typography variant="body2" color="text.secondary">این عمل قابل بازگشت نیست.</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                    <Button onClick={handleCloseDeleteConfirm} variant="outlined" sx={{ borderColor: '#6b7280', color: '#6b7280' }}>انصراف</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" sx={{ backgroundColor: '#ef4444' }}>حذف</Button>
                </DialogActions>
            </Dialog>

            {/* Transactions Table */}
            <TableContainer component={Paper} className="accounting-card">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>شماره فاکتور</TableCell>
                            <TableCell>نام کامل</TableCell>
                            <TableCell>خدمت/سرویس</TableCell>
                            <TableCell>مبلغ کل</TableCell>
                            <TableCell>نوع پرداخت</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>ویرایش</TableCell>
                            <TableCell>حذف</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => {
                            const originalIndex = users.findIndex(u => u.id === user.id);
                            if (originalIndex === -1) return null;
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>{user.SerialNumber}</TableCell>
                                    <TableCell>{user.FullName}</TableCell>
                                    <TableCell><span className="service-cell">{user.service}</span></TableCell>
                                    <TableCell><span className="price-cell">{user.price}</span></TableCell>
                                    <TableCell>
                                        {user.paymentType === "پرداخت-تکی" ? (
                                            <SinglePaymentButton onClick={() => handleOpenPaymentModal(originalIndex)} size="medium" tooltipTitle="مشاهده جزئیات پرداخت یکجا" />
                                        ) : (
                                            <MultiPaymentButton onClick={() => handleOpenPaymentModal(originalIndex)} monthlyPayment={user.monthlyPayment} totalMonths={user.totalMonths} size="medium" tooltipTitle="مشاهده جزئیات پرداخت دوره ای" />
                                        )}
                                    </TableCell>
                                    <TableCell><span className={`status ${user.status}`}>{user.status}</span></TableCell>
                                    <TableCell>
                                        <div className="action-buttons">
                                            <Tooltip title="ویرایش فاکتور" arrow>
                                                <IconButton aria-label="edit" onClick={() => handleEditTicket(originalIndex)} sx={{ color: '#3b82f6' }}><EditIcon /></IconButton>
                                            </Tooltip>
                                            <Button className="quick-change-btn" onClick={(e) => handleOpenMenu(e, originalIndex)}>تغییر وضعیت</Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="حذف فاکتور" arrow>
                                            <IconButton aria-label="delete" onClick={() => handleDeleteClick(originalIndex)} sx={{ color: '#ef4444' }}><DeleteIcon /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Quick Status Change Menu */}
            <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <MenuItem onClick={() => handleStatusChange("درحال-انجام")}>درحال انجام</MenuItem>
                <MenuItem onClick={() => handleStatusChange("پرداخت-شده")}>پرداخت شده</MenuItem>
                <MenuItem onClick={() => handleStatusChange("لغو-شده")}>لغو شده</MenuItem>
            </Menu>

            {/* Error Snackbar */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>{error}</Alert>
            </Snackbar>
        </div>
    );
}