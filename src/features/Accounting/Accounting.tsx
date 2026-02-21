import { useState, useEffect } from "react";
import React from 'react';
import SinglePaymentButton from "../../components/SinglePayButton/SinglePayButton.tsx";
import MultiPaymentButton from "../../components/MultiPayButton/MultiPayButton.tsx";
import DeleteButton from "../../components/DeleteButton/DeleteButton.tsx";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "./Accounting.scss";

import type { User } from "../../models/AccountingInterfaces/AccountingInterface.ts";
import { userService } from "../../API/UserService.ts";

export default function AccountingPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);

    // Fetch users from API on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userService.getAll();
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                alert("خطا در دریافت اطلاعات کاربران");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Function to convert English numbers to Persian
    const toPersianNumber = (num: number | string): string => {
        if (num === null || num === undefined) return '';
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
    };

    // Function to convert Persian numbers to English
    const convertPersianToEnglish = (text: string): string => {
        if (!text) return '';
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        let result = text;

        // Replace Persian numbers
        for (let i = 0; i < 10; i++) {
            const persianRegex = new RegExp(persianNumbers[i], 'g');
            result = result.replace(persianRegex, englishNumbers[i]);
        }

        // Replace Arabic numbers
        for (let i = 0; i < 10; i++) {
            const arabicRegex = new RegExp(arabicNumbers[i], 'g');
            result = result.replace(arabicRegex, englishNumbers[i]);
        }

        return result;
    };

    // Helper to extract just the number from price string
    const extractPriceNumber = (priceString: string): string => {
        if (!priceString) return "0";
        const englishString = convertPersianToEnglish(priceString);
        const cleanString = englishString.replace(/\D/g, '');
        return cleanString || "0";
    };

    // Calculate monthly payment from total price and months
    const calculateMonthlyPaymentPersian = (totalPrice: string, months: string): string => {
        const cleanTotal = extractPriceNumber(totalPrice);
        const cleanMonths = extractPriceNumber(months);

        const total = parseInt(cleanTotal) || 0;
        const monthCount = parseInt(cleanMonths) || 1;

        if (monthCount === 0 || total === 0) return "۰ تومان";

        const monthly = Math.floor(total / monthCount);
        return toPersianNumber(monthly.toLocaleString('en-US')) + " تومان";
    };

    // Helper function to format price with تومان symbol in Persian numbers
    const formatPriceWithToman = (priceInput: string): string => {
        if (!priceInput || priceInput.trim() === '') return "۰ تومان";

        const numberPart = extractPriceNumber(priceInput);

        if (numberPart === '0' || numberPart === '') return "۰ تومان";

        const number = parseInt(numberPart, 10);
        if (isNaN(number)) return "۰ تومان";

        const formattedNumber = number.toLocaleString('en-US');
        return toPersianNumber(formattedNumber) + " تومان";
    };

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

    // Clean input for processing (convert Persian to English and remove non-digits)
    const cleanNumberInput = (value: string): string => {
        if (!value) return '';
        let englishValue = convertPersianToEnglish(value);
        englishValue = englishValue.replace(/\D/g, '');
        return englishValue;
    };

    // Format number with commas for display as user types (returns Persian numbers)
    const formatNumberWithCommas = (value: string): string => {
        if (!value) return '';

        const cleanValue = cleanNumberInput(value);

        if (cleanValue === '') return '';

        const numberValue = parseInt(cleanValue, 10);
        if (isNaN(numberValue)) return '';

        const formattedNumber = numberValue.toLocaleString('en-US');
        return toPersianNumber(formattedNumber);
    };

    // Open Add Modal
    const handleAddTicket = () => {
        setOpenModal(true);
    };

    // Open Edit Modal
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

    // Open Payment Details Modal
    const handleOpenPaymentModal = (index: number) => {
        const user = users[index];
        setActivePaymentIndex(index);

        if (user.paymentType === "پرداخت-دوره-ای") {
            setPaymentDetails({
                totalPrice: extractPriceNumber(user.price),
                totalMonths: user.totalMonths ? user.totalMonths.toString() : "1",
            });
        } else {
            setPaymentDetails({
                totalPrice: extractPriceNumber(user.price),
                totalMonths: "1",
            });
        }

        setPaymentModal(true);
    };

    // Open Edit Payment Modal
    const handleOpenEditPaymentModal = () => {
        setEditPaymentModal(true);
    };

    // Close Edit Payment Modal
    const handleCloseEditPaymentModal = () => {
        setEditPaymentModal(false);
    };

    // Close Payment Details Modal
    const handleClosePaymentModal = () => {
        setPaymentModal(false);
        setActivePaymentIndex(null);
    };

    // Save Payment Details - now with API call
    const handleSavePaymentDetails = async () => {
        if (activePaymentIndex === null) return;

        try {
            const user = users[activePaymentIndex];
            let updatedUserData: Partial<User> = {};

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

            // Call API to update
            const response = await userService.update(user.id, updatedUserData as Omit<User, "id">);
            // Update local state with response data
            const updatedUsers = [...users];
            updatedUsers[activePaymentIndex] = response.data;
            setUsers(updatedUsers);

            handleCloseEditPaymentModal();
            handleClosePaymentModal();
        } catch (error) {
            console.error("Failed to update payment details:", error);
            alert("خطا در به‌روزرسانی جزئیات پرداخت");
        }
    };

    // Close Add Modal
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

    // Close Edit Modal
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

    // Save New Transaction - with API call
    const handleSaveTransaction = async () => {
        if (!newTransaction.serialnumber.trim() ||
            !newTransaction.fullname.trim() ||
            !newTransaction.service.trim() ||
            !newTransaction.price.trim()) {
            alert("لطفاً تمام فیلدهای ضروری را پر کنید");
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
                    alert("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
                    return;
                }

                monthlyPayment = calculateMonthlyPaymentPersian(priceNum, monthsNum);
                totalMonths = parseInt(monthsNum) || 1;
            }

            const newUser: Omit<User, "id"> = {
                SerialNumber: toPersianNumber(newTransaction.serialnumber),
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
            alert("خطا در ایجاد فاکتور");
        }
    };

    // Save Edited Transaction - with API call
    const handleSaveEditTransaction = async () => {
        if (!editTransaction.serialnumber.trim() ||
            !editTransaction.fullname.trim() ||
            !editTransaction.service.trim() ||
            !editTransaction.price.trim() ||
            editingIndex === null) {
            alert("لطفاً تمام فیلدهای ضروری را پر کنید");
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
                    alert("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
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
            alert("خطا در ویرایش فاکتور");
        }
    };

    // Handle Input Changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'price' || name === 'monthlyPayment') {
            const formattedValue = formatNumberWithCommas(value);
            setNewTransaction(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'serialnumber' || name === 'totalMonths') {
            setNewTransaction(prev => ({
                ...prev,
                [name]: toPersianNumber(convertPersianToEnglish(value))
            }));
        } else {
            setNewTransaction(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle Edit Input Changes
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'price' || name === 'monthlyPayment') {
            const formattedValue = formatNumberWithCommas(value);
            setEditTransaction(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'serialnumber' || name === 'totalMonths') {
            setEditTransaction(prev => ({
                ...prev,
                [name]: toPersianNumber(convertPersianToEnglish(value))
            }));
        } else {
            setEditTransaction(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle Payment Details Changes
    const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'totalPrice') {
            const formattedValue = formatNumberWithCommas(value);
            setPaymentDetails(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'totalMonths') {
            setPaymentDetails(prev => ({
                ...prev,
                [name]: toPersianNumber(convertPersianToEnglish(value))
            }));
        } else {
            setPaymentDetails(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleStatusChangeForm = (e: SelectChangeEvent<User["status"]>) => {
        setNewTransaction(prev => ({
            ...prev,
            status: e.target.value as User["status"]
        }));
    };

    const handleEditStatusChangeForm = (e: SelectChangeEvent<User["status"]>) => {
        setEditTransaction(prev => ({
            ...prev,
            status: e.target.value as User["status"]
        }));
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

    // Quick Status Change Menu
    const handleOpenMenu = (
        event: React.MouseEvent<HTMLButtonElement>,
        index: number
    ) => {
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
            alert("خطا در تغییر وضعیت");
        } finally {
            handleCloseMenu();
        }
    };

    const handleDeleteItem = async (index: number) => {
        try {
            const user = users[index];
            await userService.delete(user.id);
            setUsers(prevUsers => prevUsers.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("خطا در حذف فاکتور");
        }
    };

    // Persian placeholders
    const pricePlaceholder = toPersianNumber("۱,۰۰۰,۰۰۰");
    const monthsPlaceholder = toPersianNumber("۴");

    // Show skeleton while loading
    if (loading) {
        return <AccountingSkeleton />;
    }

    return (
        <div className="accounting" dir="rtl">

            {/* Add Transaction Button */}
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

            {/* Add New Transaction Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 450,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    direction: 'rtl'
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
                        ایجاد فاکتور جدید
                    </Typography>

                    <Box component="form" sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        '& .MuiInputLabel-root': {
                            right: 25,
                            left: 'auto',
                            transformOrigin: 'top right',
                        },
                        '& .MuiInputLabel-shrink': {
                            transform: 'translate(0, -9px) scale(0.75)',
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                textAlign: 'right',
                            },
                        },
                        '& .MuiInputBase-input': {
                            textAlign: 'right',
                        }
                    }}>
                        <TextField
                            label="شماره فاکتور"
                            name="serialnumber"
                            value={newTransaction.serialnumber}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            placeholder={toPersianNumber("۱۲۳۴۵۶۷۸۹")}
                            slotProps={{
                                htmlInput: { inputMode: 'numeric' }
                            }}
                        />

                        <TextField
                            label="نام کامل مشتری"
                            name="fullname"
                            value={newTransaction.fullname}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            placeholder="نام و نام خانوادگی"
                        />

                        <TextField
                            label="خدمت/سرویس"
                            name="service"
                            value={newTransaction.service}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            placeholder="نام خدمت یا سرویس مورد نظر را وارد کنید"
                        />

                        <TextField
                            label="مبلغ کل (تومان)"
                            name="price"
                            value={newTransaction.price}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            placeholder={`مثال: ${pricePlaceholder}`}
                            helperText="مبلغ کل را به تومان وارد کنید"
                            sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }}
                            slotProps={{
                                htmlInput: { inputMode: 'numeric' }
                            }}
                        />

                        <FormControl fullWidth required>
                            <InputLabel id="payment-type-label">نوع پرداخت</InputLabel>
                            <Select
                                labelId="payment-type-label"
                                name="paymentType"
                                value={newTransaction.paymentType}
                                label="نوع پرداخت"
                                onChange={handlePaymentTypeChangeForm}
                            >
                                <MenuItem value="پرداخت-تکی">پرداخت تکی</MenuItem>
                                <MenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</MenuItem>
                            </Select>
                        </FormControl>

                        {newTransaction.paymentType === "پرداخت-دوره-ای" && (
                            <>
                                <TextField
                                    label="تعداد ماه‌ها"
                                    name="totalMonths"
                                    value={newTransaction.totalMonths}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    placeholder={`مثال: ${monthsPlaceholder}`}
                                    helperText="تعداد ماه‌های پرداخت را وارد کنید"
                                    sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }}
                                    slotProps={{
                                        htmlInput: { inputMode: 'numeric' }
                                    }}
                                />
                                {newTransaction.price && newTransaction.totalMonths && (
                                    <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>
                                        پرداخت ماهیانه: {calculateMonthlyPaymentPersian(newTransaction.price, newTransaction.totalMonths)}
                                    </Typography>
                                )}
                            </>
                        )}

                        <FormControl fullWidth required>
                            <InputLabel id="status-label">وضعیت</InputLabel>
                            <Select
                                labelId="status-label"
                                name="status"
                                value={newTransaction.status}
                                label="وضعیت"
                                onChange={handleStatusChangeForm}
                            >
                                <MenuItem value="درحال-انجام">درحال انجام</MenuItem>
                                <MenuItem value="پرداخت-شده">پرداخت شده</MenuItem>
                                <MenuItem value="لغو-شده">لغو شده</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveTransaction}
                                fullWidth
                                sx={{ backgroundColor: '#1976d2' }}
                            >
                                ذخیره
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCloseModal}
                                fullWidth
                                sx={{ borderColor: '#1976d2', color: '#1976d2' }}
                            >
                                انصراف
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal
                open={editModal}
                onClose={handleCloseEditModal}
                aria-labelledby="edit-modal-title"
                aria-describedby="edit-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 450,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    direction: 'rtl'
                }}>
                    <Typography id="edit-modal-title" variant="h6" component="h2" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
                        ویرایش فاکتور
                    </Typography>

                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(() => {
                            const rtlTextFieldSx = {
                                '& .MuiInputLabel-root': {
                                    right: 16,
                                    left: 'auto',
                                    transformOrigin: 'top right',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(0, -9px) scale(0.75)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        textAlign: 'right',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    textAlign: 'right',
                                }
                            };

                            return (
                                <>
                                    <TextField
                                        label="شماره فاکتور"
                                        name="serialnumber"
                                        value={editTransaction.serialnumber}
                                        onChange={handleEditInputChange}
                                        fullWidth
                                        required
                                        placeholder={toPersianNumber("۱۲۳۴۵۶۷۸۹")}
                                        sx={rtlTextFieldSx}
                                        slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                                    />

                                    <TextField
                                        label="نام کامل مشتری"
                                        name="fullname"
                                        value={editTransaction.fullname}
                                        onChange={handleEditInputChange}
                                        fullWidth
                                        required
                                        placeholder="نام و نام خانوادگی"
                                        sx={rtlTextFieldSx}
                                    />

                                    <TextField
                                        label="خدمت/سرویس"
                                        name="service"
                                        value={editTransaction.service}
                                        onChange={handleEditInputChange}
                                        fullWidth
                                        required
                                        placeholder="نام خدمت یا سرویس مورد نظر را وارد کنید"
                                        sx={rtlTextFieldSx}
                                    />

                                    <TextField
                                        label="مبلغ کل (تومان)"
                                        name="price"
                                        value={editTransaction.price}
                                        onChange={handleEditInputChange}
                                        fullWidth
                                        required
                                        placeholder={`مثال: ${pricePlaceholder}`}
                                        helperText="مبلغ کل را به تومان وارد کنید"
                                        sx={{
                                            ...rtlTextFieldSx,
                                            '& .MuiFormHelperText-root': { textAlign: 'right' }
                                        }}
                                        slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                                    />

                                    <FormControl fullWidth required sx={rtlTextFieldSx}>
                                        <InputLabel id="payment-type-label">نوع پرداخت</InputLabel>
                                        <Select
                                            labelId="payment-type-label"
                                            name="paymentType"
                                            value={editTransaction.paymentType}
                                            label="نوع پرداخت"
                                            onChange={handleEditPaymentTypeChangeForm}
                                            sx={{ textAlign: 'right' }}
                                        >
                                            <MenuItem value="پرداخت-تکی">پرداخت تکی</MenuItem>
                                            <MenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</MenuItem>
                                        </Select>
                                    </FormControl>

                                    {editTransaction.paymentType === "پرداخت-دوره-ای" && (
                                        <>
                                            <TextField
                                                label="تعداد ماه‌ها"
                                                name="totalMonths"
                                                value={editTransaction.totalMonths}
                                                onChange={handleEditInputChange}
                                                fullWidth
                                                required
                                                placeholder={`مثال: ${monthsPlaceholder}`}
                                                sx={rtlTextFieldSx}
                                                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                                            />
                                            {editTransaction.price && editTransaction.totalMonths && (
                                                <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>
                                                    پرداخت ماهیانه: {calculateMonthlyPaymentPersian(editTransaction.price, editTransaction.totalMonths)}
                                                </Typography>
                                            )}
                                        </>
                                    )}

                                    <FormControl fullWidth required sx={rtlTextFieldSx}>
                                        <InputLabel id="status-label">وضعیت</InputLabel>
                                        <Select
                                            labelId="status-label"
                                            name="status"
                                            value={editTransaction.status}
                                            label="وضعیت"
                                            onChange={handleEditStatusChangeForm}
                                            sx={{ textAlign: 'right' }}
                                        >
                                            <MenuItem value="درحال-انجام">درحال انجام</MenuItem>
                                            <MenuItem value="پرداخت-شده">پرداخت شده</MenuItem>
                                            <MenuItem value="لغو-شده">لغو شده</MenuItem>
                                        </Select>
                                    </FormControl>
                                </>
                            );
                        })()}

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveEditTransaction}
                                fullWidth
                                sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
                            >
                                ذخیره تغییرات
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCloseEditModal}
                                fullWidth
                                sx={{ borderColor: '#ef4444', color: '#ef4444' }}
                            >
                                انصراف
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Payment Details Modal */}
            <Dialog
                open={paymentModal}
                onClose={handleClosePaymentModal}
                aria-labelledby="payment-details-title"
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 'var(--radius-lg)',
                            fontFamily: '"Vazirmatn", "Vazirmatn Persian", sans-serif !important',
                            direction: 'rtl'
                        }
                    }
                }}
            >
                <DialogTitle
                    id="payment-details-title"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        color: 'var(--color-text-dark)',
                        borderBottom: '2px solid var(--color-border)',
                        paddingBottom: 'var(--spacing-sm)'
                    }}
                >
                    جزئیات پرداخت
                </DialogTitle>

                <DialogContent
                    sx={{
                        textAlign: 'right',
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        direction: 'rtl'
                    }}
                >
                    {activePaymentIndex !== null && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                    {users[activePaymentIndex].FullName}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {users[activePaymentIndex].service}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body1" fontWeight="bold">
                                    مبلغ کل:
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    {users[activePaymentIndex].price}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body1" fontWeight="bold">
                                    نوع پرداخت:
                                </Typography>
                                <Typography
                                    className={`payment-type ${users[activePaymentIndex].paymentType}`}
                                    sx={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        mt: 1
                                    }}
                                >
                                    {users[activePaymentIndex].paymentType === "پرداخت-تکی"
                                        ? "پرداخت تکی"
                                        : "پرداخت دوره ای"}
                                </Typography>
                            </Box>

                            {users[activePaymentIndex].paymentType === "پرداخت-تکی" && (
                                <Box sx={{
                                    p: 3,
                                    bgcolor: '#e3f2fd',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    border: '1px solid #bbdefb',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '50%',
                                        backgroundColor: '#1976d2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <PaymentIcon sx={{ fontSize: 32, color: 'white' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                        پرداخت یکجا
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        این فاکتور به صورت یکجا پرداخت می‌شود
                                    </Typography>
                                </Box>
                            )}

                            {users[activePaymentIndex].paymentType === "پرداخت-دوره-ای" && (
                                <Box sx={{
                                    p: 3,
                                    bgcolor: '#e8f5e9',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    border: '1px solid #c8e6c9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '50%',
                                        backgroundColor: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CalendarTodayIcon sx={{ fontSize: 32, color: 'white' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold' }}>
                                        پرداخت دوره ای
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.5,
                                        width: '100%',
                                        maxWidth: '320px'
                                    }}>
                                        <Box sx={{
                                            p: 1.5,
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                            textAlign: 'right'
                                        }}>
                                            <Typography fontWeight="bold">
                                                <Box component="span">تعداد اقساط:</Box>
                                                <Box component="span" sx={{ mr: 1 }}>
                                                    {toPersianNumber(users[activePaymentIndex].totalMonths || 0)} ماه
                                                </Box>
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            p: 1.5,
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                            textAlign: 'right'
                                        }}>
                                            <Typography fontWeight="bold" color="success.main">
                                                <Box component="span">مبلغ هر قسط:</Box>
                                                <Box component="span" sx={{ mr: 1 }}>
                                                    {users[activePaymentIndex].monthlyPayment || '۰ تومان'}
                                                </Box>
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            p: 1.5,
                                            bgcolor: '#f1f8e9',
                                            borderRadius: 1,
                                            border: '1px solid #aed581',
                                            textAlign: 'right'
                                        }}>
                                            <Typography fontWeight="bold" color="success.dark">
                                                <Box component="span">مبلغ کل:</Box>
                                                <Box component="span" sx={{ mr: 1 }}>
                                                    {users[activePaymentIndex].price}
                                                </Box>
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        این فاکتور به صورت اقساطی پرداخت می‌شود
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={handleOpenEditPaymentModal}
                                        sx={{
                                            mt: 2,
                                            borderColor: '#10b981',
                                            color: '#10b981',
                                            '&:hover': {
                                                borderColor: '#059669',
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)'
                                            }
                                        }}
                                    >
                                        ویرایش جزئیات پرداخت
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button
                        onClick={handleClosePaymentModal}
                        variant="outlined"
                        sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2'
                        }}
                    >
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Payment Details Modal */}
            <Dialog
                open={editPaymentModal}
                onClose={handleCloseEditPaymentModal}
                aria-labelledby="edit-payment-details-title"
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 'var(--radius-lg)',
                            fontFamily: '"Vazirmatn", "Vazirmatn Persian", sans-serif !important',
                            direction: 'rtl'
                        }
                    }
                }}
            >
                <DialogTitle
                    id="edit-payment-details-title"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        color: 'var(--color-text-dark)',
                        borderBottom: '2px solid var(--color-border)',
                        paddingBottom: 'var(--spacing-sm)'
                    }}
                >
                    ویرایش جزئیات پرداخت
                </DialogTitle>

                <DialogContent
                    sx={{
                        textAlign: 'right',
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: 'center' }}
                        >
                            اطلاعات مربوط به پرداخت را ویرایش کنید
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                variant="outlined"
                                label="مبلغ کل (تومان)"
                                name="totalPrice"
                                value={paymentDetails.totalPrice}
                                onChange={handlePaymentDetailsChange}
                                fullWidth
                                required
                                placeholder={`مثال: ${pricePlaceholder}`}
                                helperText="مبلغ کل را به تومان وارد کنید"
                                sx={{
                                    '& .MuiInputBase-input': {
                                        textAlign: 'right',
                                    },
                                    '& .MuiInputLabel-root': {
                                        right: 25,
                                        left: 'auto',
                                        transformOrigin: 'top right',
                                    },
                                    '& .MuiInputLabel-shrink': {
                                        transform: 'translate(0, -9px) scale(0.75)',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            textAlign: 'right',
                                        },
                                    },
                                    '& .MuiFormHelperText-root': {
                                        textAlign: 'right',
                                    },
                                }}
                            />

                            {activePaymentIndex !== null &&
                                users[activePaymentIndex].paymentType === "پرداخت-دوره-ای" && (
                                    <TextField
                                        variant="outlined"
                                        label="تعداد ماه‌ها"
                                        name="totalMonths"
                                        value={paymentDetails.totalMonths}
                                        onChange={handlePaymentDetailsChange}
                                        fullWidth
                                        required
                                        placeholder={`مثال: ${monthsPlaceholder}`}
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                textAlign: 'right',
                                            },
                                            '& .MuiInputLabel-root': {
                                                right: 25,
                                                left: 'auto',
                                                transformOrigin: 'top right',
                                            },
                                            '& .MuiInputLabel-shrink': {
                                                transform: 'translate(0, -9px) scale(0.75)',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    textAlign: 'right',
                                                },
                                            },
                                        }}
                                    />
                                )}

                            {activePaymentIndex !== null &&
                                users[activePaymentIndex].paymentType === "پرداخت-دوره-ای" &&
                                paymentDetails.totalPrice &&
                                paymentDetails.totalMonths && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: '#e8f5e9',
                                            borderRadius: 2,
                                            border: '1px solid #c8e6c9',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>مبلغ هر قسط:</strong>
                                        </Typography>
                                        <Typography variant="h6" color="success.main">
                                            {calculateMonthlyPaymentPersian(
                                                paymentDetails.totalPrice,
                                                paymentDetails.totalMonths
                                            )}
                                        </Typography>
                                    </Box>
                                )}

                            {activePaymentIndex !== null &&
                                users[activePaymentIndex].paymentType === "پرداخت-تکی" && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: '#e3f2fd',
                                            borderRadius: 2,
                                            border: '1px solid #bbdefb',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="body2">
                                            این فاکتور به صورت یکجا پرداخت می‌شود
                                        </Typography>
                                    </Box>
                                )}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button
                        onClick={handleCloseEditPaymentModal}
                        variant="outlined"
                        sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2'
                        }}
                    >
                        انصراف
                    </Button>
                    <Button
                        onClick={handleSavePaymentDetails}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1976d2'
                        }}
                    >
                        ذخیره تغییرات
                    </Button>
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
                        {users.map((user, index) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.SerialNumber}</TableCell>
                                <TableCell>{user.FullName}</TableCell>
                                <TableCell>
                                    <span className="service-cell">
                                        {user.service}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="price-cell">
                                        {user.price}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    {user.paymentType === "پرداخت-تکی" ? (
                                        <SinglePaymentButton
                                            onClick={() => handleOpenPaymentModal(index)}
                                            size="medium"
                                            tooltipTitle="مشاهده جزئیات پرداخت یکجا"
                                        />
                                    ) : (
                                        <MultiPaymentButton
                                            onClick={() => handleOpenPaymentModal(index)}
                                            monthlyPayment={user.monthlyPayment}
                                            totalMonths={user.totalMonths}
                                            size="medium"
                                            tooltipTitle="مشاهده جزئیات پرداخت دوره ای"
                                        />
                                    )}
                                </TableCell>

                                <TableCell>
                                    <span className={`status ${user.status}`}>
                                        {user.status}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="action-buttons">
                                        <Tooltip title="ویرایش فاکتور" arrow>
                                            <IconButton
                                                aria-label="edit"
                                                onClick={() => handleEditTicket(index)}
                                                sx={{
                                                    color: '#3b82f6',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    }
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Button
                                            className="quick-change-btn"
                                            onClick={(e) => handleOpenMenu(e, index)}
                                        >
                                            تغییر وضعیت
                                        </Button>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <DeleteButton
                                        onClick={() => handleDeleteItem(index)}
                                        size="medium"
                                        tooltipTitle="حذف فاکتور"
                                        confirmMessage="آیا از حذف این فاکتور اطمینان دارید؟"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Quick Status Change Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem onClick={() => handleStatusChange("درحال-انجام")}>
                    درحال انجام
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("پرداخت-شده")}>
                    پرداخت شده
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("لغو-شده")}>
                    لغو شده
                </MenuItem>
            </Menu>
        </div>
    );
}