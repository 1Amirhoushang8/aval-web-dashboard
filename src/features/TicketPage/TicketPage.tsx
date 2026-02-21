import "./TicketPage.scss";
import { useState } from "react";
import TicketTitle from "../../components/TicketTitles/TicketTitle.tsx";
import TicketDescription from "../../components/TicketDescription/TicketDescription.tsx";
import TicketFileUpload from "../../components/TicketFileUpload/TicketFileUpload.tsx";
import { ticketService } from "../../API/TicketService.ts";

export default function ManageTicketPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [uploadKey, setUploadKey] = useState(0);

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const ALLOWED_FILE_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
        'application/pdf',
        'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'
    ];

    const ALLOWED_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
        'pdf',
        'zip', 'rar', '7z', 'tar', 'gz'
    ];

    const commonProblems = [
        "مشکل در ورود به سیستم", "خرابی سخت افزار", "مشکل نرم افزاری", "اتصال به اینترنت",
        "مشکل پرینتر", "مشکل صدا یا میکروفون", "مشکل صفحه نمایش", "پشتیبانی نرم افزار",
        "نصب برنامه جدید", "حذف ویروس یا بدافزار", "بازیابی اطلاعات", "تنظیمات شبکه",
        "مشکل ایمیل", "پشتیبان گیری", "سایر مشکلات"
    ];

    // Helper to get current Persian date and time
    const getPersianDateTime = () => {
        const now = new Date();

        // Format Date: 1404/12/02
        const dateStr = now.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/');

        // Format Time: 11:16
        const timeStr = now.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

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
        setDescription("");
        setFile(null);
        setPreviewUrl(null);
        setFileError(null);
        setUploadKey(prev => prev + 1);
    };

    const handleSave = async () => {
        setFileError(null);

        if (!title.trim() || !description.trim()) {
            alert("لطفاً عنوان و توضیحات را وارد کنید");
            return;
        }

        setIsSaving(true);

        try {
            const { dateStr, timeStr } = getPersianDateTime();

            // Prepare data for API
            const ticketData = {
                title: title.trim(),
                description: description.trim(),
                date: dateStr,        // Automatically added
                time: timeStr,        // Automatically added
                type: "ایجاد شده",    // Set default activity type
                priority: "medium",   // Set default priority for the dashboard
                ...(file && previewUrl && {
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: previewUrl,
                    }
                })
            };

            // Send to API
            await ticketService.create(ticketData);

            // Success – clear form and notify user
            clearForm();
            alert("تیکت با موفقیت ارسال شد ✅");
        } catch (error) {
            console.error("Failed to create ticket:", error);
            alert("خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="ticket-page" dir="rtl">
            <div className="ticket-card">
                <TicketTitle
                    value={title}
                    onChange={setTitle}
                    disabled={isSaving}
                    commonProblems={commonProblems}
                />

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
                    {isSaving ? (
                        <div className="loader-container">
                            <span>در حال ارسال...</span>
                        </div>
                    ) : (
                        'ارسال تیکت'
                    )}
                </button>
            </div>
        </div>
    );
}