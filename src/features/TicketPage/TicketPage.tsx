import "./TicketPage.scss";
import { useState } from "react";
import TicketTitle from "../../components/TicketTitles/TicketTitle.tsx";
import TicketDescription from "../../components/TicketDescription/TicketDescription.tsx";
import TicketFileUpload from "../../components/TicketFileUpload/TicketFileUpload.tsx";
import { ticketService } from "../../API/TicketService.ts";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

export default function ManageTicketPage() {
    const [title, setTitle] = useState("");
    const [shortDetail, setShortDetail] = useState(""); // State for the required short description
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [uploadKey, setUploadKey] = useState(0);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSuccess = (message: string) => {
        setSnackbar({ open: true, message, severity: "success" });
    };

    const showError = (message: string) => {
        setSnackbar({ open: true, message, severity: "error" });
    };

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const ALLOWED_FILE_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
        'application/pdf',
        'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'
    ];

    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'pdf', 'zip', 'rar', '7z', 'tar', 'gz'];

    const commonProblems = [
        "مشکل در ورود به سیستم", "خرابی سخت افزار", "مشکل نرم افزاری", "اتصال به اینترنت",
        "مشکل پرینتر", "مشکل صدا یا میکروفون", "مشکل صفحه نمایش", "پشتیبانی نرم افزار",
        "نصب برنامه جدید", "حذف ویروس یا بدافزار", "بازیابی اطلاعات", "تنظیمات شبکه",
        "مشکل ایمیل", "پشتیبان گیری", "سایر مشکلات"
    ];

    const getPersianDateTime = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false });
        return { dateStr, timeStr };
    };

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        if (selectedFile) setFileError(null);
    };

    const handleFileError = (error: string | null) => {
        setFileError(error);
    };

    const clearForm = () => {
        setTitle("");
        setShortDetail("");
        setDescription("");
        setFile(null);
        setPreviewUrl(null);
        setFileError(null);
        setUploadKey(prev => prev + 1);
    };

    const handleSave = async () => {
        // Validation: shortDetail is now required
        if (!title.trim() || !shortDetail.trim() || !description.trim()) {
            showError("لطفاً عنوان، توضیحات کوتاه و توضیحات کامل را وارد کنید");
            return;
        }

        const userStr = localStorage.getItem("user");
        if (!userStr) {
            showError("لطفاً ابتدا وارد حساب کاربری خود شوید");
            return;
        }
        const currentUser = JSON.parse(userStr);

        setIsSaving(true);

        try {
            const { dateStr, timeStr } = getPersianDateTime();

            const ticketData = {
                title: title.trim(),
                shortDetail: shortDetail.trim(), // Mapping to interface
                description: description.trim(),
                date: dateStr,
                time: timeStr,
                userId: String(currentUser.id),
                status: "pending",
                adminResponse: null,
                ...(file && previewUrl && {
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: previewUrl,
                    }
                })
            };

            await ticketService.create(ticketData);
            clearForm();
            showSuccess("تیکت با موفقیت ارسال شد ✅");
        } catch (error) {
            console.error("Failed to create ticket:", error);
            showError("خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="ticket-page" dir="rtl">
            {isSaving && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <CircularProgress color="inherit" />
                        <p>لطفاً کمی صبر کنید...</p>
                    </div>
                </div>
            )}

            <div className={`ticket-card ${isSaving ? 'blur' : ''}`}>
                <TicketTitle
                    value={title}
                    onChange={setTitle}
                    disabled={isSaving}
                    commonProblems={commonProblems}
                />

                {/* Short Detail Input Section */}
                <div className="short-detail-input-wrapper" style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#444",
                        fontSize: "0.95rem"
                    }}>
                        توضیحات کوتاه <span style={{ color: "#f44336" }}>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="خلاصه‌ای از مشکل را در یک جمله بنویسید"
                        value={shortDetail}
                        onChange={(e) => setShortDetail(e.target.value)}
                        disabled={isSaving}
                        style={{
                            width: "100%",
                            padding: "12px 15px",
                            borderRadius: "12px",
                            border: "1px solid #ddd",
                            fontFamily: "Vazirmatn, sans-serif",
                            fontSize: "1rem",
                            transition: "border-color 0.3s ease",
                            outline: "none",
                            backgroundColor: isSaving ? "#f5f5f5" : "#fff"
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#666AF2")}
                        onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                </div>

                <TicketDescription
                    value={description}
                    onChange={setDescription}
                    disabled={isSaving}
                    placeholder="توضیحات کامل مشکل را وارد کنید"
                />

                <TicketFileUpload
                    key={uploadKey}
                    onFileChange={handleFileChange}
                    onFileError={handleFileError}
                    disabled={isSaving}
                    maxSize={MAX_FILE_SIZE}
                    allowedTypes={ALLOWED_FILE_TYPES}
                    allowedExtensions={ALLOWED_EXTENSIONS}
                />

                <button
                    className="submit-btn"
                    onClick={handleSave}
                    disabled={isSaving || !!fileError}
                >
                    {isSaving ? 'در حال ارسال...' : 'ارسال تیکت'}
                </button>
            </div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%', fontFamily: 'Vazirmatn, sans-serif' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}