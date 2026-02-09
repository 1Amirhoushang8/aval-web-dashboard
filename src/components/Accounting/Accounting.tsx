import { useState } from "react";
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
    MenuItem as SelectMenuItem,
    Typography,
    IconButton,
    Tooltip, type SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "./Accounting.scss";

import type {User} from "../../models/AccountingInterfaces/AccountingInterface.ts"

export default function Accounting() {
    const [users, setUsers] = useState<User[]>([
        {
            id: 1,
            serialnumber: "124924246",
            fullname: "علی محمدی",
            service: "طراحی وب سایت",
            price: "6,530,000 تومان",
            status: "درحال-انجام",
            paymentType: "پرداخت-تکی",
            monthlyPayment: null,
            totalMonths: null,
        },
        {
            id: 2,
            serialnumber: "19204836",
            fullname: "مریم کریمی",
            service: "پشتیبانی سالانه",
            price: "356,000 تومان",
            status: "پرداخت-شده",
            paymentType: "پرداخت-دوره-ای",
            monthlyPayment: "89,000 تومان",
            totalMonths: 4,
        },
        {
            id: 3,
            serialnumber: "19204837",
            fullname: "رضا احمدی",
            service: "میزبانی وب",
            price: "1,200,000 تومان",
            status: "لغو-شده",
            paymentType: "پرداخت-تکی",
            monthlyPayment: null,
            totalMonths: null,
        },
        {
            id: 4,
            serialnumber: "19204838",
            fullname: "سارا نوروزی",
            service: "اپلیکیشن موبایل",
            price: "980,000 تومان",
            status: "پرداخت-شده",
            paymentType: "پرداخت-دوره-ای",
            monthlyPayment: "245,000 تومان",
            totalMonths: 4,
        },
        {
            id: 5,
            serialnumber: "19204839",
            fullname: "محمد حسینی",
            service: "بهینه‌سازی SEO",
            price: "450,000 تومان",
            status: "درحال-انجام",
            paymentType: "پرداخت-تکی",
            monthlyPayment: null,
            totalMonths: null,
        },
        {
            id: 6,
            serialnumber: "19204840",
            fullname: "فاطمه رضایی",
            service: "طراحی گرافیک",
            price: "2,150,000 تومان",
            status: "پرداخت-شده",
            paymentType: "پرداخت-دوره-ای",
            monthlyPayment: "537,500 تومان",
            totalMonths: 4,
        },
        {
            id: 7,
            serialnumber: "19204841",
            fullname: "امیرحسین محمدی",
            service: "مشاوره فنی",
            price: "750,000 تومان",
            status: "درحال-انجام",
            paymentType: "پرداخت-دوره-ای",
            monthlyPayment: "187,500 تومان",
            totalMonths: 4,
        },
    ]);

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

    // Helper function to format price with تومان symbol in English numbers - FIXED
    const formatPriceWithToman = (priceInput: string): string => {
        if (!priceInput || priceInput.trim() === '') return "0 تومان";

        // Remove all non-digit characters except commas
        let cleanPrice = priceInput.replace(/ تومان/g, '').replace(/ R/g, '').trim();
        cleanPrice = cleanPrice.replace(/[^\d,]/g, '');

        // Remove all commas first to get the raw number
        const rawNumber = cleanPrice.replace(/,/g, '');

        if (rawNumber === '' || rawNumber === '0') return "0 تومان";

        // Convert to number and format with English commas
        const number = parseInt(rawNumber, 10);
        if (isNaN(number)) return "0 تومان";

        // Format with English commas for thousands
        const formattedNumber = number.toLocaleString('en-US');

        return `${formattedNumber} تومان`;
    };

    // Helper to extract just the number from price string - FIXED
    const extractPriceNumber = (priceString: string): string => {
        if (!priceString) return "0";
        // Remove تومان and all non-digit characters except commas
        const cleanString = priceString.replace(/ تومان/g, '').replace(/ R/g, '').trim();
        return cleanString.replace(/,/g, ''); // Remove commas for calculation
    };

    // Calculate monthly payment from total price and months
    const calculateMonthlyPayment = (totalPrice: string, months: string): string => {
        const cleanTotal = extractPriceNumber(totalPrice);
        const total = parseInt(cleanTotal) || 0;
        const monthCount = parseInt(months) || 1;

        if (monthCount === 0) return "0 تومان";

        const monthly = Math.floor(total / monthCount);
        // Format with English number formatting
        return monthly.toLocaleString('en-US') + " تومان";
    };

    // Calculate total price from monthly payment and months
    const calculateTotalPrice = (monthlyPayment: string, months: string): string => {
        const cleanMonthly = extractPriceNumber(monthlyPayment);
        const monthly = parseInt(cleanMonthly) || 0;
        const monthCount = parseInt(months) || 1;

        const total = monthly * monthCount;
        // Format with English number formatting
        return total.toLocaleString('en-US') + " تومان";
    };

    // Format number to English with commas
    const formatNumberEnglish = (num: number): string => {
        return num.toLocaleString('en-US');
    };

    // Format Persian numbers to English
    const convertPersianToEnglish = (text: string): string => {
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

    // Clean input to ensure only English numbers and commas - FIXED
    const cleanNumberInput = (value: string): string => {
        // First convert any Persian/Arabic numbers to English
        let englishValue = convertPersianToEnglish(value);

        // Remove all non-digit characters except commas
        englishValue = englishValue.replace(/[^\d,]/g, '');

        // Handle multiple commas by splitting and joining
        const parts = englishValue.split(',');

        // If there are multiple parts, it's likely someone typed "1,000,000"
        // We need to remove all commas and then format properly
        if (parts.length > 1) {
            // Join all parts without commas (they're already separated)
            englishValue = parts.join('');
        }

        return englishValue;
    };

    // Format number with commas for display as user types - FIXED
    const formatNumberWithCommas = (value: string): string => {
        if (!value) return '';

        // Clean the input (remove all non-digits)
        const cleanValue = cleanNumberInput(value);

        if (cleanValue === '') return '';

        // Parse as integer
        const numberValue = parseInt(cleanValue, 10);
        if (isNaN(numberValue)) return '';

        // Format with commas for thousands
        return numberValue.toLocaleString('en-US');
    };

    // Open Add Modal
    const handleAddTicket = () => {
        setOpenModal(true);
    };

    // Open Edit Modal
    const handleEditTicket = (index: number) => {
        const user = users[index];
        setEditTransaction({
            serialnumber: user.serialnumber,
            fullname: user.fullname,
            service: user.service,
            price: extractPriceNumber(user.price), // This already returns without commas
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

    // Open Edit Payment Modal (for installment payments)
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

    // Save Payment Details
    const handleSavePaymentDetails = () => {
        if (activePaymentIndex === null) return;

        const updatedUsers = [...users];
        const user = updatedUsers[activePaymentIndex];

        if (user.paymentType === "پرداخت-دوره-ای") {
            const totalPrice = formatPriceWithToman(paymentDetails.totalPrice);
            const totalMonths = parseInt(paymentDetails.totalMonths) || 1;
            const monthlyPayment = calculateMonthlyPayment(paymentDetails.totalPrice, paymentDetails.totalMonths);

            updatedUsers[activePaymentIndex] = {
                ...user,
                monthlyPayment,
                totalMonths,
                price: totalPrice,
            };
        } else {
            // For single payment, just update the total price
            updatedUsers[activePaymentIndex] = {
                ...user,
                price: formatPriceWithToman(paymentDetails.totalPrice),
            };
        }

        setUsers(updatedUsers);
        handleCloseEditPaymentModal();
        handleClosePaymentModal();
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

    // Save New Transaction
    const handleSaveTransaction = () => {
        if (!newTransaction.serialnumber.trim() ||
            !newTransaction.fullname.trim() ||
            !newTransaction.service.trim() ||
            !newTransaction.price.trim()) {
            alert("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }

        const formattedPrice = formatPriceWithToman(newTransaction.price);
        let monthlyPayment = null;
        let totalMonths = null;

        if (newTransaction.paymentType === "پرداخت-دوره-ای") {
            // Check if totalMonths is provided
            if (!newTransaction.totalMonths || parseInt(newTransaction.totalMonths) < 1) {
                alert("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
                return;
            }

            // Calculate monthly payment based on total price and months
            monthlyPayment = calculateMonthlyPayment(newTransaction.price, newTransaction.totalMonths);
            totalMonths = parseInt(newTransaction.totalMonths) || 1;
        }

        const newUser: User = {
            id: users.length + 1,
            serialnumber: newTransaction.serialnumber,
            fullname: newTransaction.fullname,
            service: newTransaction.service,
            price: formattedPrice,
            status: newTransaction.status,
            paymentType: newTransaction.paymentType,
            monthlyPayment,
            totalMonths,
        };

        setUsers(prevUsers => [...prevUsers, newUser]);
        handleCloseModal();
    };

    // Save Edited Transaction
    const handleSaveEditTransaction = () => {
        if (!editTransaction.serialnumber.trim() ||
            !editTransaction.fullname.trim() ||
            !editTransaction.service.trim() ||
            !editTransaction.price.trim() ||
            editingIndex === null) {
            alert("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }

        const formattedPrice = formatPriceWithToman(editTransaction.price);
        let monthlyPayment = null;
        let totalMonths = null;

        if (editTransaction.paymentType === "پرداخت-دوره-ای") {
            // Check if totalMonths is provided
            if (!editTransaction.totalMonths || parseInt(editTransaction.totalMonths) < 1) {
                alert("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
                return;
            }

            // Calculate monthly payment based on total price and months
            monthlyPayment = calculateMonthlyPayment(editTransaction.price, editTransaction.totalMonths);
            totalMonths = parseInt(editTransaction.totalMonths) || 1;
        }

        const updatedUsers = [...users];
        updatedUsers[editingIndex] = {
            ...updatedUsers[editingIndex],
            serialnumber: editTransaction.serialnumber,
            fullname: editTransaction.fullname,
            service: editTransaction.service,
            price: formattedPrice,
            status: editTransaction.status,
            paymentType: editTransaction.paymentType,
            monthlyPayment,
            totalMonths,
        };

        setUsers(updatedUsers);
        handleCloseEditModal();
    };

    // Handle Input Changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'price' || name === 'monthlyPayment') {
            // Format number with English commas as user types
            const formattedValue = formatNumberWithCommas(value);
            setNewTransaction(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'serialnumber' || name === 'totalMonths') {
            // Convert Persian numbers to English for serial number and months
            const englishValue = convertPersianToEnglish(value);
            setNewTransaction(prev => ({
                ...prev,
                [name]: englishValue
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
            // Format number with English commas as user types
            const formattedValue = formatNumberWithCommas(value);
            setEditTransaction(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'serialnumber' || name === 'totalMonths') {
            // Convert Persian numbers to English for serial number and months
            const englishValue = convertPersianToEnglish(value);
            setEditTransaction(prev => ({
                ...prev,
                [name]: englishValue
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
            // Format number with English commas as user types
            const formattedValue = formatNumberWithCommas(value);
            setPaymentDetails(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'totalMonths') {
            // Convert Persian numbers to English
            const englishValue = convertPersianToEnglish(value);
            setPaymentDetails(prev => ({
                ...prev,
                [name]: englishValue
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

    const handleStatusChange = (status: User["status"]) => {
        if (activeIndex === null) return;

        const updatedUsers = [...users];
        updatedUsers[activeIndex].status = status;
        setUsers(updatedUsers);
        handleCloseMenu();
    };

    const handleDeleteItem = (index: number) => {
        if (window.confirm("آیا از حذف این فاکتور اطمینان دارید؟")) {
            setUsers(prevUsers => prevUsers.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="accounting">

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
                    borderRadius: 2
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
                        ایجاد فاکتور جدید
                    </Typography>

                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="شماره فاکتور"
                            name="serialnumber"
                            value={newTransaction.serialnumber}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ inputMode: 'numeric' }}
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
                            placeholder="مثال: 1,000,000"
                            helperText="مبلغ کل را به تومان وارد کنید"
                            InputProps={{
                                endAdornment: <span style={{ color: '#666', marginRight: '8px' }}>تومان</span>
                            }}
                            inputProps={{ inputMode: 'numeric' }}
                        />

                        <FormControl fullWidth required>
                            <InputLabel>نوع پرداخت</InputLabel>
                            <Select
                                name="paymentType"
                                value={newTransaction.paymentType}
                                label="نوع پرداخت"
                                onChange={handlePaymentTypeChangeForm}
                            >
                                <SelectMenuItem value="پرداخت-تکی">پرداخت تکی</SelectMenuItem>
                                <SelectMenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</SelectMenuItem>
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
                                    placeholder="مثال: 4"
                                    inputProps={{ inputMode: 'numeric' }}
                                    helperText="تعداد ماه‌های پرداخت را وارد کنید"
                                />
                                {newTransaction.price && newTransaction.totalMonths && (
                                    <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>
                                        پرداخت ماهیانه: {calculateMonthlyPayment(newTransaction.price, newTransaction.totalMonths)}
                                    </Typography>
                                )}
                            </>
                        )}

                        <FormControl fullWidth required>
                            <InputLabel>وضعیت</InputLabel>
                            <Select
                                name="status"
                                value={newTransaction.status}
                                label="وضعیت"
                                onChange={handleStatusChangeForm}
                            >
                                <SelectMenuItem value="درحال-انجام">درحال انجام</SelectMenuItem>
                                <SelectMenuItem value="پرداخت-شده">پرداخت شده</SelectMenuItem>
                                <SelectMenuItem value="لغو-شده">لغو شده</SelectMenuItem>
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
                    borderRadius: 2
                }}>
                    <Typography id="edit-modal-title" variant="h6" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
                        ویرایش فاکتور
                    </Typography>

                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="شماره فاکتور"
                            name="serialnumber"
                            value={editTransaction.serialnumber}
                            onChange={handleEditInputChange}
                            fullWidth
                            required
                            inputProps={{ inputMode: 'numeric' }}
                        />

                        <TextField
                            label="نام کامل مشتری"
                            name="fullname"
                            value={editTransaction.fullname}
                            onChange={handleEditInputChange}
                            fullWidth
                            required
                            placeholder="نام و نام خانوادگی"
                        />

                        <TextField
                            label="خدمت/سرویس"
                            name="service"
                            value={editTransaction.service}
                            onChange={handleEditInputChange}
                            fullWidth
                            required
                            placeholder="نام خدمت یا سرویس مورد نظر را وارد کنید"
                        />

                        <TextField
                            label="مبلغ کل (تومان)"
                            name="price"
                            value={editTransaction.price}
                            onChange={handleEditInputChange}
                            fullWidth
                            required
                            placeholder="مثال: 1,000,000"
                            helperText="مبلغ کل را به تومان وارد کنید"
                            InputProps={{
                                endAdornment: <span style={{ color: '#666', marginRight: '8px' }}>تومان</span>
                            }}
                            inputProps={{ inputMode: 'numeric' }}
                        />

                        <FormControl fullWidth required>
                            <InputLabel>نوع پرداخت</InputLabel>
                            <Select
                                name="paymentType"
                                value={editTransaction.paymentType}
                                label="نوع پرداخت"
                                onChange={handleEditPaymentTypeChangeForm}
                            >
                                <SelectMenuItem value="پرداخت-تکی">پرداخت تکی</SelectMenuItem>
                                <SelectMenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</SelectMenuItem>
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
                                    placeholder="مثال: 4"
                                    inputProps={{ inputMode: 'numeric' }}
                                    helperText="تعداد ماه‌های پرداخت را وارد کنید"
                                />
                                {editTransaction.price && editTransaction.totalMonths && (
                                    <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>
                                        پرداخت ماهیانه: {calculateMonthlyPayment(editTransaction.price, editTransaction.totalMonths)}
                                    </Typography>
                                )}
                            </>
                        )}

                        <FormControl fullWidth required>
                            <InputLabel>وضعیت</InputLabel>
                            <Select
                                name="status"
                                value={editTransaction.status}
                                label="وضعیت"
                                onChange={handleEditStatusChangeForm}
                            >
                                <SelectMenuItem value="درحال-انجام">درحال انجام</SelectMenuItem>
                                <SelectMenuItem value="پرداخت-شده">پرداخت شده</SelectMenuItem>
                                <SelectMenuItem value="لغو-شده">لغو شده</SelectMenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveEditTransaction}
                                fullWidth
                                sx={{ backgroundColor: '#10b981' }}
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
            >
                <DialogTitle id="payment-details-title" sx={{ textAlign: 'center' }}>
                    جزئیات پرداخت
                </DialogTitle>
                <DialogContent>
                    {activePaymentIndex !== null && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    {users[activePaymentIndex].fullname}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {users[activePaymentIndex].service}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    مبلغ کل:
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    {users[activePaymentIndex].price}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    نوع پرداخت:
                                </Typography>
                                <Typography variant="body1"
                                            className={`payment-type ${users[activePaymentIndex].paymentType}`}
                                            sx={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontWeight: 'bold'
                                            }}
                                >
                                    {users[activePaymentIndex].paymentType === "پرداخت-تکی" ? "پرداخت تکی" : "پرداخت دوره ای"}
                                </Typography>
                            </Box>

                            {/* Single Payment Panel */}
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
                                        justifyContent: 'center',
                                        mb: 1
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

                            {/* Installment Payment Panel */}
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
                                        justifyContent: 'center',
                                        mb: 1
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
                                        maxWidth: '300px'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 1.5,
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                تعداد اقساط:
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {users[activePaymentIndex].totalMonths || '0'} ماه
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 1.5,
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                مبلغ هر قسط:
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold" color="success.main">
                                                {users[activePaymentIndex].monthlyPayment || '0 تومان'}
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 1.5,
                                            bgcolor: '#f1f8e9',
                                            borderRadius: 1,
                                            border: '1px solid #aed581'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                مبلغ کل:
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold" color="success.dark">
                                                {users[activePaymentIndex].price}
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
                        sx={{ borderColor: '#1976d2', color: '#1976d2' }}
                    >
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Payment Details Modal - Separate Modal for editing */}
            <Dialog
                open={editPaymentModal}
                onClose={handleCloseEditPaymentModal}
                aria-labelledby="edit-payment-details-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="edit-payment-details-title" sx={{ textAlign: 'center' }}>
                    ویرایش جزئیات پرداخت
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            اطلاعات مربوط به پرداخت را ویرایش کنید
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="مبلغ کل (تومان)"
                                name="totalPrice"
                                value={paymentDetails.totalPrice}
                                onChange={handlePaymentDetailsChange}
                                fullWidth
                                required
                                placeholder="مثال: 1,000,000"
                                helperText="مبلغ کل را به تومان وارد کنید"
                                InputProps={{
                                    endAdornment: <span style={{ color: '#666', marginRight: '8px' }}>تومان</span>
                                }}
                                inputProps={{ inputMode: 'numeric' }}
                            />

                            {activePaymentIndex !== null && users[activePaymentIndex].paymentType === "پرداخت-دوره-ای" && (
                                <TextField
                                    label="تعداد ماه‌ها"
                                    name="totalMonths"
                                    value={paymentDetails.totalMonths}
                                    onChange={handlePaymentDetailsChange}
                                    fullWidth
                                    required
                                    placeholder="مثال: 4"
                                    inputProps={{ inputMode: 'numeric' }}
                                    InputProps={{
                                        endAdornment: <span style={{ color: '#666', marginRight: '8px' }}>ماه</span>
                                    }}
                                />
                            )}

                            {activePaymentIndex !== null &&
                                users[activePaymentIndex].paymentType === "پرداخت-دوره-ای" &&
                                paymentDetails.totalPrice &&
                                paymentDetails.totalMonths && (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#e8f5e9',
                                        borderRadius: 2,
                                        border: '1px solid #c8e6c9',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>مبلغ هر قسط:</strong>
                                        </Typography>
                                        <Typography variant="h6" color="success.main">
                                            {calculateMonthlyPayment(paymentDetails.totalPrice, paymentDetails.totalMonths)}
                                        </Typography>
                                    </Box>
                                )}

                            {activePaymentIndex !== null &&
                                users[activePaymentIndex].paymentType === "پرداخت-تکی" && (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#e3f2fd',
                                        borderRadius: 2,
                                        border: '1px solid #bbdefb',
                                        textAlign: 'center'
                                    }}>
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
                        sx={{ borderColor: '#1976d2', color: '#1976d2' }}
                    >
                        انصراف
                    </Button>
                    <Button
                        onClick={handleSavePaymentDetails}
                        variant="contained"
                        sx={{ backgroundColor: '#1976d2' }}
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
                                <TableCell>{user.serialnumber}</TableCell>
                                <TableCell>{user.fullname}</TableCell>
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
                                    <Tooltip title="مشاهده جزئیات پرداخت" arrow>
                                        <span
                                            className={`payment-type ${user.paymentType}`}
                                            onClick={() => handleOpenPaymentModal(index)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {user.paymentType === "پرداخت-تکی" ? "پرداخت تکی" : "پرداخت دوره ای"}
                                            {user.paymentType === "پرداخت-دوره-ای" && user.monthlyPayment && (
                                                <div className="monthly-payment">
                                                    ({user.monthlyPayment} در ماه)
                                                </div>
                                            )}
                                        </span>
                                    </Tooltip>
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
                                    <Tooltip title="حذف فاکتور" arrow>
                                        <IconButton
                                            aria-label="delete"
                                            onClick={() => handleDeleteItem(index)}
                                            sx={{
                                                color: '#f44336',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                }
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
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
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                transformOrigin={{vertical: "top", horizontal: "right"}}
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