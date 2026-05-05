import { useState, useEffect, useMemo } from "react";
import SinglePaymentButton from "../../components/SinglePayButton/SinglePayButton.tsx";
import MultiPaymentButton from "../../components/MultiPayButton/MultiPayButton.tsx";
import AccountingSkeleton from "../../Skeleton/AccountingSkeleton/AccountingSkeleton.tsx";
import ModalSkeleton from "../../Skeleton/AccountingPanelSkeleton/AccountingPanelSkeleton.tsx";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Menu, MenuItem, Modal, Box, TextField, FormControl,
    InputLabel, Select, Typography, IconButton, Tooltip, type SelectChangeEvent,
    Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "./Accounting.scss";

import { servicesService, type ServiceRecord } from "../../API/ServicesService";
import { userService } from "../../API/UserService";



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

const extractPriceNumber = (priceString: string): string => {
    if (!priceString) return "0";
    const englishString = convertPersianToEnglishDigits(priceString);
    return englishString.replace(/\D/g, '') || "0";
};

const formatPriceWithToman = (priceInput: string): string => {
    if (!priceInput || priceInput.trim() === '') return "۰ تومان";
    const numberPart = extractPriceNumber(priceInput);
    if (numberPart === '0' || numberPart === '') return "۰ تومان";
    const number = parseInt(numberPart, 10);
    if (isNaN(number)) return "۰ تومان";
    const formattedNumber = number.toLocaleString('en-US');
    return toPersianNumber(formattedNumber) + " تومان";
};

const calculateMonthlyPaymentPersian = (totalPrice: string, months: string): string => {
    const cleanTotal = extractPriceNumber(totalPrice);
    const cleanMonths = extractPriceNumber(months);
    const total = parseInt(cleanTotal) || 0;
    const monthCount = parseInt(cleanMonths) || 1;
    if (monthCount === 0 || total === 0) return "۰ تومان";
    const monthly = Math.floor(total / monthCount);
    return toPersianNumber(monthly.toLocaleString('en-US')) + " تومان";
};

const cleanNumberInput = (value: string): string => {
    if (!value) return '';
    return convertPersianToEnglishDigits(value).replace(/\D/g, '');
};

const formatNumberWithCommas = (value: string): string => {
    if (!value) return '';
    const cleanValue = cleanNumberInput(value);
    if (cleanValue === '') return '';
    const numberValue = parseInt(cleanValue, 10);
    if (isNaN(numberValue)) return '';
    const formattedNumber = numberValue.toLocaleString('en-US');
    return toPersianNumber(formattedNumber);
};

// ---------- Component ----------
export default function AccountingPage() {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<ServiceRecord[]>([]);
    const [users, setUsers] = useState<{ id: string; fullName: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);

    const showError = (message: string) => setError(message);
    const handleCloseError = () => setError(null);

    useEffect(() => {
        const fetchData = async () => {
            try {


                // 2️⃣ Load actual data
                const [servicesData, usersData] = await Promise.all([
                    servicesService.getAll(),
                    userService.getAll(),
                ]);
                setServices(servicesData.filter(s => s.serviceName && s.serviceName.trim() !== '' && s.serviceName !== 'انتخاب نشده'));
                setUsers(usersData.map(u => ({ id: String(u.id), fullName: u.fullName })));
            } catch (err: unknown) {
                console.error("Fetch error:", err);
                const message = err instanceof Error ? err.message : "خطا در دریافت اطلاعات";
                showError(message);
            } finally {
                setLoading(false);
            }
        };
        void fetchData();
    }, []);

    const filteredServices = useMemo(() => {
        let list = services;
        if (searchTerm.trim()) {
            const term = normalizePersianText(searchTerm);
            list = list.filter(s =>
                normalizePersianText(s.userFullName || '').includes(term) ||
                normalizePersianText(s.serviceName || '').includes(term)
            );
        }
        return list;
    }, [services, searchTerm]);

    const isDuplicateSerialNumber = (serialNumber: string, excludeId?: string | number): boolean => {
        return services.some(s =>
            s.serialNumber === serialNumber && (excludeId === undefined || s.id !== excludeId)
        );
    };

    // ---------- Modal states ----------
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editModalLoading, setEditModalLoading] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | number | null>(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [activePaymentServiceId, setActivePaymentServiceId] = useState<string | number | null>(null);
    const [editPaymentModal, setEditPaymentModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({ totalPrice: "", totalMonths: "" });

    const [newService, setNewService] = useState({
        serialNumber: "",
        fullName: "",
        serviceName: "",
        price: "",
        status: "درحال-انجام",
        paymentType: "پرداخت-تکی",
        monthlyPayment: "",
        totalMonths: "",
    });

    const [editService, setEditService] = useState({
        serialNumber: "",
        serviceName: "",
        price: "",
        status: "درحال-انجام",
        paymentType: "پرداخت-تکی",
        monthlyPayment: "",
        totalMonths: "",
    });

    const open = Boolean(anchorEl);
    const pricePlaceholder = toPersianNumber("۱,۰۰۰,۰۰۰");
    const monthsPlaceholder = toPersianNumber("۴");

    // ---------- Handlers ----------
    const handleAddTicket = () => setOpenModal(true);

    const handleEditService = async (index: number) => {
        const service = filteredServices[index];
        if (!service) return;
        setEditingServiceId(service.id);
        setEditModal(true);
        setEditModalLoading(true);
        try {
            const current = services.find(s => s.id === service.id);
            if (current) {
                setEditService({
                    serialNumber: current.serialNumber || "",
                    serviceName: current.serviceName || "",
                    price: current.price ? extractPriceNumber(current.price) : "",
                    status: current.status,
                    paymentType: current.paymentType,
                    monthlyPayment: current.monthlyPayment ? extractPriceNumber(current.monthlyPayment) : "",
                    totalMonths: current.totalMonths?.toString() ?? "",
                });
            }
        } catch {
            showError("مشکلی پیش آمد");
        } finally {
            setEditModalLoading(false);
        }
    };

    const handleDeleteClick = (index: number) => {
        const service = filteredServices[index];
        if (!service) return;
        setDeleteId(service.id);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await servicesService.delete(deleteId);
            setServices(prev => prev.filter(s => s.id !== deleteId));
            handleCloseDeleteConfirm();
        } catch(err: unknown) {
            console.error("Delete error:", err);
            showError("خطا در حذف فاکتور");
            handleCloseDeleteConfirm();
        }
    };

    const handleOpenPaymentModal = (index: number) => {
        const service = filteredServices[index];
        if (!service) return;
        setActivePaymentServiceId(service.id);
        setPaymentDetails({
            totalPrice: extractPriceNumber(service.price || ""),
            totalMonths: service.totalMonths?.toString() ?? "1",
        });
        setPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setPaymentModal(false);
        setActivePaymentServiceId(null);
    };

    const handleOpenEditPaymentModal = () => setEditPaymentModal(true);
    const handleCloseEditPaymentModal = () => setEditPaymentModal(false);

    const handleSavePaymentDetails = async () => {
        if (!activePaymentServiceId) return;
        const service = services.find(s => s.id === activePaymentServiceId);
        if (!service) return;
        try {
            let updatedData: Partial<ServiceRecord>;
            if (service.paymentType === "پرداخت-دوره-ای") {
                const totalPriceNum = extractPriceNumber(paymentDetails.totalPrice);
                const totalMonthsNum = extractPriceNumber(paymentDetails.totalMonths);
                const totalMonths = parseInt(totalMonthsNum) || 1;
                updatedData = {
                    monthlyPayment: calculateMonthlyPaymentPersian(totalPriceNum, totalMonthsNum),
                    totalMonths,
                    price: formatPriceWithToman(totalPriceNum),
                };
            } else {
                const totalPriceNum = extractPriceNumber(paymentDetails.totalPrice);
                updatedData = { price: formatPriceWithToman(totalPriceNum) };
            }
            const updated = await servicesService.update(service.id, updatedData);
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, ...updated } : s));
            handleCloseEditPaymentModal();
            handleClosePaymentModal();
        } catch (err: unknown) {
            console.error("Payment update error:", err);
            showError("خطا در به‌روزرسانی جزئیات پرداخت");
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setNewService({
            serialNumber: "",
            fullName: "",
            serviceName: "",
            price: "",
            status: "درحال-انجام",
            paymentType: "پرداخت-تکی",
            monthlyPayment: "",
            totalMonths: "",
        });
    };

    const handleCloseEditModal = () => {
        setEditModal(false);
        setEditingServiceId(null);
        setEditService({
            serialNumber: "",
            serviceName: "",
            price: "",
            status: "درحال-انجام",
            paymentType: "پرداخت-تکی",
            monthlyPayment: "",
            totalMonths: "",
        });
        setEditModalLoading(false);
    };

    const handleSaveNewService = async () => {
        if (!newService.serialNumber.trim() || !newService.fullName.trim() || !newService.serviceName.trim() || !newService.price.trim()) {
            showError("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }
        if (isDuplicateSerialNumber(newService.serialNumber)) {
            showError("شماره فاکتور تکراری است");
            return;
        }
        const user = users.find(u => normalizePersianText(u.fullName) === normalizePersianText(newService.fullName));
        if (!user) {
            showError("نام مشتری در سیستم وجود ندارد. لطفاً ابتدا مشتری را ثبت کنید.");
            return;
        }
        try {
            const priceNum = extractPriceNumber(newService.price);
            const formattedPrice = formatPriceWithToman(priceNum);
            let monthlyPayment: string | null = null;
            let totalMonths: number | null = null;
            if (newService.paymentType === "پرداخت-دوره-ای") {
                const monthsStr = extractPriceNumber(newService.totalMonths);
                const monthsNum = parseInt(monthsStr);
                if (!monthsNum || monthsNum < 1) {
                    showError("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
                    return;
                }
                monthlyPayment = calculateMonthlyPaymentPersian(priceNum, monthsStr);
                totalMonths = monthsNum;
            }
            const created = await servicesService.create({
                userId: user.id,
                serialNumber: newService.serialNumber,
                serviceName: newService.serviceName,
                price: formattedPrice,
                status: newService.status,
                paymentType: newService.paymentType,
                monthlyPayment,
                totalMonths,
            });
            setServices(prev => [...prev, created]);
            handleCloseModal();
        } catch (err: unknown) {
            console.error("Create service error:", err);
            const message = err instanceof Error ? err.message : "خطا در ایجاد فاکتور";
            showError(message);
        }
    };

    const handleSaveEditService = async () => {
        if (!editingServiceId || !editService.serviceName.trim() || !editService.price.trim()) {
            showError("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }
        if (isDuplicateSerialNumber(editService.serialNumber, editingServiceId)) {
            showError("شماره فاکتور تکراری است");
            return;
        }
        try {
            const priceNum = extractPriceNumber(editService.price);
            const formattedPrice = formatPriceWithToman(priceNum);
            let monthlyPayment: string | null = null;
            let totalMonths: number | null = null;
            if (editService.paymentType === "پرداخت-دوره-ای") {
                const monthsStr = extractPriceNumber(editService.totalMonths);
                const monthsNum = parseInt(monthsStr);
                if (!monthsNum || monthsNum < 1) {
                    showError("برای پرداخت دوره‌ای، تعداد ماه‌ها باید وارد شود");
                    return;
                }
                monthlyPayment = calculateMonthlyPaymentPersian(priceNum, monthsStr);
                totalMonths = monthsNum;
            }
            const updated = await servicesService.update(editingServiceId, {
                serialNumber: editService.serialNumber,
                serviceName: editService.serviceName,
                price: formattedPrice,
                status: editService.status,
                paymentType: editService.paymentType,
                monthlyPayment,
                totalMonths,
            });
            setServices(prev => prev.map(s => s.id === editingServiceId ? { ...s, ...updated } : s));
            handleCloseEditModal();
        } catch (err: unknown) {
            console.error("Edit service error:", err);
            const message = err instanceof Error ? err.message : "خطا در ویرایش فاکتور";
            showError(message);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'monthlyPayment') {
            setNewService(prev => ({ ...prev, [name]: formatNumberWithCommas(value) }));
        } else if (name === 'serialNumber' || name === 'totalMonths') {
            setNewService(prev => ({ ...prev, [name]: toPersianNumber(convertPersianToEnglishDigits(value)) }));
        } else {
            setNewService(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'monthlyPayment') {
            setEditService(prev => ({ ...prev, [name]: formatNumberWithCommas(value) }));
        } else if (name === 'serialNumber' || name === 'totalMonths') {
            setEditService(prev => ({ ...prev, [name]: toPersianNumber(convertPersianToEnglishDigits(value)) }));
        } else {
            setEditService(prev => ({ ...prev, [name]: value }));
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

    const handleStatusChangeForm = (e: SelectChangeEvent<string>) => {
        setNewService(prev => ({ ...prev, status: e.target.value }));
    };
    const handleEditStatusChangeForm = (e: SelectChangeEvent<string>) => {
        setEditService(prev => ({ ...prev, status: e.target.value }));
    };
    const handlePaymentTypeChangeForm = (e: SelectChangeEvent<string>) => {
        const newType = e.target.value;
        setNewService(prev => ({
            ...prev,
            paymentType: newType,
            monthlyPayment: "",
            totalMonths: newType === "پرداخت-تکی" ? "" : prev.totalMonths
        }));
    };
    const handleEditPaymentTypeChangeForm = (e: SelectChangeEvent<string>) => {
        const newType = e.target.value;
        setEditService(prev => ({
            ...prev,
            paymentType: newType,
            monthlyPayment: "",
            totalMonths: newType === "پرداخت-تکی" ? "" : prev.totalMonths
        }));
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        setAnchorEl(event.currentTarget);
        setActiveIndex(index);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
        setActiveIndex(null);
    };

    const handleStatusChange = async (status: string) => {
        if (activeIndex === null) return;
        const service = filteredServices[activeIndex];
        try {
            const updated = await servicesService.update(service.id, { status });
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, ...updated } : s));
        } catch (err: unknown) {
            console.error("Status change error:", err);
            showError("خطا در تغییر وضعیت");
        } finally {
            handleCloseMenu();
        }
    };

    if (loading) return <AccountingSkeleton />;

    return (
        <div className="accounting" dir="rtl">
            <div className="accounting-header">
                <div className="search-bar">
                    <TextField variant="outlined" placeholder="جستجو بر اساس نام ..." value={searchTerm} onChange={handleSearchChange} size="small" fullWidth
                               sx={{ '& .MuiInputBase-input': { textAlign: 'right' }, '& .MuiOutlinedInput-root': { borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' } }} />
                </div>
                <div className="mydp">
                    <div className="dropdown">
                        <button className="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false">+</button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleAddTicket(); }}>ایجاد فاکتور جدید</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, direction: 'rtl' }}>
                    <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>ایجاد فاکتور جدید</Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="شماره فاکتور" name="serialNumber" value={newService.serialNumber} onChange={handleInputChange} fullWidth required placeholder={toPersianNumber("۱۲۳۴۵۶۷۸۹")} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                        <TextField label="نام کامل مشتری" name="fullName" value={newService.fullName} onChange={handleInputChange} fullWidth required placeholder="نام و نام خانوادگی" />
                        <TextField label="خدمت/سرویس" name="serviceName" value={newService.serviceName} onChange={handleInputChange} fullWidth required placeholder="نام خدمت یا سرویس مورد نظر را وارد کنید" />
                        <TextField label="مبلغ کل (تومان)" name="price" value={newService.price} onChange={handleInputChange} fullWidth required placeholder={`مثال: ${pricePlaceholder}`} helperText="مبلغ کل را به تومان وارد کنید" sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                        <FormControl fullWidth required>
                            <InputLabel id="payment-type-label">نوع پرداخت</InputLabel>
                            <Select labelId="payment-type-label" value={newService.paymentType} label="نوع پرداخت" onChange={handlePaymentTypeChangeForm}>
                                <MenuItem value="پرداخت-تکی">پرداخت تکی</MenuItem>
                                <MenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</MenuItem>
                            </Select>
                        </FormControl>
                        {newService.paymentType === "پرداخت-دوره-ای" && (
                            <>
                                <TextField label="تعداد ماه‌ها" name="totalMonths" value={newService.totalMonths} onChange={handleInputChange} fullWidth required placeholder={`مثال: ${monthsPlaceholder}`} helperText="تعداد ماه‌های پرداخت را وارد کنید" sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                                {newService.price && newService.totalMonths && (
                                    <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>پرداخت ماهیانه: {calculateMonthlyPaymentPersian(newService.price, newService.totalMonths)}</Typography>
                                )}
                            </>
                        )}
                        <FormControl fullWidth required>
                            <InputLabel id="status-label">وضعیت</InputLabel>
                            <Select labelId="status-label" value={newService.status} label="وضعیت" onChange={handleStatusChangeForm}>
                                <MenuItem value="درحال-انجام">درحال انجام</MenuItem>
                                <MenuItem value="پرداخت-شده">پرداخت شده</MenuItem>
                                <MenuItem value="لغو-شده">لغو شده</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button variant="contained" onClick={handleSaveNewService} fullWidth>ذخیره</Button>
                            <Button variant="outlined" onClick={handleCloseModal} fullWidth>انصراف</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Edit Modal */}
            <Modal open={editModal} onClose={handleCloseEditModal}>
                {editModalLoading ? (
                    <ModalSkeleton />
                ) : (
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, direction: 'rtl' }}>
                        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>ویرایش فاکتور</Typography>
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField label="شماره فاکتور" name="serialNumber" value={editService.serialNumber} onChange={handleEditInputChange} fullWidth required placeholder={toPersianNumber("۱۲۳۴۵۶۷۸۹")} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                            <TextField label="خدمت/سرویس" name="serviceName" value={editService.serviceName} onChange={handleEditInputChange} fullWidth required placeholder="نام خدمت یا سرویس مورد نظر را وارد کنید" />
                            <TextField label="مبلغ کل (تومان)" name="price" value={editService.price} onChange={handleEditInputChange} fullWidth required placeholder={`مثال: ${pricePlaceholder}`} helperText="مبلغ کل را به تومان وارد کنید" sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                            <FormControl fullWidth required>
                                <InputLabel id="edit-payment-type-label">نوع پرداخت</InputLabel>
                                <Select labelId="edit-payment-type-label" value={editService.paymentType} label="نوع پرداخت" onChange={handleEditPaymentTypeChangeForm}>
                                    <MenuItem value="پرداخت-تکی">پرداخت تکی</MenuItem>
                                    <MenuItem value="پرداخت-دوره-ای">پرداخت دوره ای</MenuItem>
                                </Select>
                            </FormControl>
                            {editService.paymentType === "پرداخت-دوره-ای" && (
                                <>
                                    <TextField label="تعداد ماه‌ها" name="totalMonths" value={editService.totalMonths} onChange={handleEditInputChange} fullWidth required placeholder={`مثال: ${monthsPlaceholder}`} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                                    {editService.price && editService.totalMonths && (
                                        <Typography variant="body2" sx={{ color: 'success.main', textAlign: 'center' }}>پرداخت ماهیانه: {calculateMonthlyPaymentPersian(editService.price, editService.totalMonths)}</Typography>
                                    )}
                                </>
                            )}
                            <FormControl fullWidth required>
                                <InputLabel id="edit-status-label">وضعیت</InputLabel>
                                <Select labelId="edit-status-label" value={editService.status} label="وضعیت" onChange={handleEditStatusChangeForm}>
                                    <MenuItem value="درحال-انجام">درحال انجام</MenuItem>
                                    <MenuItem value="پرداخت-شده">پرداخت شده</MenuItem>
                                    <MenuItem value="لغو-شده">لغو شده</MenuItem>
                                </Select>
                            </FormControl>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button variant="contained" onClick={handleSaveEditService} fullWidth sx={{ backgroundColor: '#10b981' }}>ذخیره تغییرات</Button>
                                <Button variant="outlined" onClick={handleCloseEditModal} fullWidth sx={{ borderColor: '#ef4444', color: '#ef4444' }}>انصراف</Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Modal>

            {/* Payment Modal */}
            <Dialog open={paymentModal} onClose={handleClosePaymentModal} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 'var(--radius-lg)', direction: 'rtl' } } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>جزئیات پرداخت</DialogTitle>
                <DialogContent>
                    {activePaymentServiceId && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{services.find(s => s.id === activePaymentServiceId)?.userFullName}</Typography>
                                <Typography color="text.secondary">{services.find(s => s.id === activePaymentServiceId)?.serviceName}</Typography>
                            </Box>
                            <Box><Typography fontWeight="bold">مبلغ کل:</Typography><Typography variant="h6" color="primary">{services.find(s => s.id === activePaymentServiceId)?.price}</Typography></Box>
                            <Box><Typography fontWeight="bold">نوع پرداخت:</Typography>
                                <Typography className={`payment-type ${services.find(s => s.id === activePaymentServiceId)?.paymentType}`} sx={{ display: 'inline-block', p: '4px 12px', borderRadius: '20px', fontWeight: 'bold', mt: 1 }}>
                                    {services.find(s => s.id === activePaymentServiceId)?.paymentType === "پرداخت-تکی" ? "پرداخت تکی" : "پرداخت دوره ای"}
                                </Typography>
                            </Box>
                            {services.find(s => s.id === activePaymentServiceId)?.paymentType === "پرداخت-تکی" && (
                                <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center', border: '1px solid #bbdefb' }}>
                                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                        <PaymentIcon sx={{ fontSize: 32, color: 'white' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>پرداخت یکجا</Typography>
                                    <Typography variant="body2" color="text.secondary">این فاکتور به صورت یکجا پرداخت می‌شود</Typography>
                                </Box>
                            )}
                            {services.find(s => s.id === activePaymentServiceId)?.paymentType === "پرداخت-دوره-ای" && (
                                <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center', border: '1px solid #c8e6c9' }}>
                                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 32, color: 'white' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold' }}>پرداخت دوره ای</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: '320px', mx: 'auto', mt: 2 }}>
                                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'right' }}>
                                            <Typography fontWeight="bold">تعداد اقساط: <Box component="span" sx={{ mr: 1 }}>{toPersianNumber(services.find(s => s.id === activePaymentServiceId)?.totalMonths || 0)} ماه</Box></Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'right' }}>
                                            <Typography fontWeight="bold" color="success.main">مبلغ هر قسط: <Box component="span" sx={{ mr: 1 }}>{services.find(s => s.id === activePaymentServiceId)?.monthlyPayment || '۰ تومان'}</Box></Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: '#f1f8e9', borderRadius: 1, border: '1px solid #aed581', textAlign: 'right' }}>
                                            <Typography fontWeight="bold" color="success.dark">مبلغ کل: <Box component="span" sx={{ mr: 1 }}>{services.find(s => s.id === activePaymentServiceId)?.price}</Box></Typography>
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

            {/* Edit Payment Modal */}
            <Dialog open={editPaymentModal} onClose={handleCloseEditPaymentModal} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 'var(--radius-lg)', direction: 'rtl' } } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>ویرایش جزئیات پرداخت</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>اطلاعات مربوط به پرداخت را ویرایش کنید</Typography>
                        <TextField variant="outlined" label="مبلغ کل (تومان)" name="totalPrice" value={paymentDetails.totalPrice} onChange={handlePaymentDetailsChange} fullWidth required placeholder={`مثال: ${pricePlaceholder}`} helperText="مبلغ کل را به تومان وارد کنید" sx={{ '& .MuiFormHelperText-root': { textAlign: 'right' } }} />
                        {activePaymentServiceId && services.find(s => s.id === activePaymentServiceId)?.paymentType === "پرداخت-دوره-ای" && (
                            <TextField variant="outlined" label="تعداد ماه‌ها" name="totalMonths" value={paymentDetails.totalMonths} onChange={handlePaymentDetailsChange} fullWidth required placeholder={`مثال: ${monthsPlaceholder}`} />
                        )}
                        {activePaymentServiceId && services.find(s => s.id === activePaymentServiceId)?.paymentType === "پرداخت-دوره-ای" && paymentDetails.totalPrice && paymentDetails.totalMonths && (
                            <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ mb: 1 }}><strong>مبلغ هر قسط:</strong></Typography>
                                <Typography variant="h6" color="success.main">{calculateMonthlyPaymentPersian(paymentDetails.totalPrice, paymentDetails.totalMonths)}</Typography>
                            </Box>
                        )}
                        {activePaymentServiceId && services.find(s => s.id === activePaymentServiceId)?.paymentType === "پرداخت-تکی" && (
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
            <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 'var(--radius-lg)', direction: 'rtl', p: 2 } } }}>
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

            {/* Main Table */}
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
                        {filteredServices.map((service, index) => (
                            <TableRow key={service.id}>
                                <TableCell>{service.serialNumber}</TableCell>
                                <TableCell>{service.userFullName}</TableCell>
                                <TableCell><span className="service-cell">{service.serviceName}</span></TableCell>
                                <TableCell><span className="price-cell">{service.price}</span></TableCell>
                                <TableCell>
                                    {service.paymentType === "پرداخت-تکی" ? (
                                        <SinglePaymentButton onClick={() => handleOpenPaymentModal(index)} size="medium" tooltipTitle="مشاهده جزئیات پرداخت یکجا" />
                                    ) : (
                                        <MultiPaymentButton onClick={() => handleOpenPaymentModal(index)} monthlyPayment={service.monthlyPayment} totalMonths={service.totalMonths} size="medium" tooltipTitle="مشاهده جزئیات پرداخت دوره ای" />
                                    )}
                                </TableCell>
                                <TableCell><span className={`status ${service.status}`}>{service.status}</span></TableCell>
                                <TableCell>
                                    <div className="action-buttons">
                                        <Tooltip title="ویرایش فاکتور" arrow>
                                            <IconButton aria-label="edit" onClick={() => handleEditService(index)} sx={{ color: '#3b82f6' }}><EditIcon /></IconButton>
                                        </Tooltip>
                                        <Button className="quick-change-btn" onClick={(e) => handleOpenMenu(e, index)}>تغییر وضعیت</Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="حذف فاکتور" arrow>
                                        <IconButton aria-label="delete" onClick={() => handleDeleteClick(index)} sx={{ color: '#dc2626', '&:hover': { backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#b91c1c', transform: 'scale(1.1)' }, transition: 'all 0.2s ease-in-out' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <MenuItem onClick={() => handleStatusChange("درحال-انجام")}>درحال انجام</MenuItem>
                <MenuItem onClick={() => handleStatusChange("پرداخت-شده")}>پرداخت شده</MenuItem>
                <MenuItem onClick={() => handleStatusChange("لغو-شده")}>لغو شده</MenuItem>
            </Menu>

            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>{error}</Alert>
            </Snackbar>
        </div>
    );
}