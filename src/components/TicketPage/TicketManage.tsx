import "./TicketManage.scss";
import { useState, useEffect, useRef } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type {StoredTicket} from "../../models/TicketInterfaces/TicketInterface.ts";

export default function TicketManage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownContentRef = useRef<HTMLDivElement>(null);

    // File upload configuration
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Allowed file types
    const ALLOWED_FILE_TYPES = [
        // Images
        'image/jpeg',      // .jpg, .jpeg
        'image/png',       // .png
        'image/gif',       // .gif
        'image/webp',      // .webp
        'image/svg+xml',   // .svg
        'image/bmp',       // .bmp

        // PDF
        'application/pdf', // .pdf

        // Archives
        'application/zip',             // .zip
        'application/x-zip-compressed', // .zip
        'application/x-rar-compressed', // .rar
        'application/x-7z-compressed', // .7z
        'application/x-tar',           // .tar
        'application/gzip'             // .gz
    ];

    // File type extensions for display
    const ALLOWED_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
        'pdf',
        'zip', 'rar', '7z', 'tar', 'gz'
    ];

    // Common ticket titles (problems)
    const commonProblems = [
        "مشکل در ورود به سیستم",
        "خرابی سخت افزار",
        "مشکل نرم افزاری",
        "اتصال به اینترنت",
        "مشکل پرینتر",
        "مشکل صدا یا میکروفون",
        "مشکل صفحه نمایش",
        "پشتیبانی نرم افزار",
        "نصب برنامه جدید",
        "حذف ویروس یا بدافزار",
        "بازیابی اطلاعات",
        "تنظیمات شبکه",
        "مشکل ایمیل",
        "پشتیبان گیری",
        "سایر مشکلات"
    ];

    /* ---------- Close dropdown when clicking outside ---------- */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                dropdownContentRef.current &&
                !dropdownContentRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /* ---------- Prevent body scroll when dropdown is open ---------- */
    useEffect(() => {
        if (isDropdownOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isDropdownOpen]);

    /* ---------- Load Saved ---------- */
    useEffect(() => {
        const saved = localStorage.getItem("ticketData");
        if (!saved) {
            setIsLoading(false);
            return;
        }

        // Simulate loading for better UX
        const timer = setTimeout(() => {
            const data: StoredTicket = JSON.parse(saved);
            setTitle(data.title);
            setDescription(data.description);
            if (data.file?.url) {
                setPreviewUrl(data.file.url);
            }
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    /* ---------- File Upload with Validation ---------- */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        // Clear previous errors
        setFileError(null);

        // 1. Check file type
        const isValidType = ALLOWED_FILE_TYPES.includes(selected.type);

        // Check by extension for rare MIME types
        const fileExtension = selected.name.split('.').pop()?.toLowerCase();
        const isValidExtension = fileExtension ? ALLOWED_EXTENSIONS.includes(fileExtension) : false;

        if (!isValidType && !isValidExtension) {
            const allowedTypesText = ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(', ');
            setFileError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${allowedTypesText}`);
            e.target.value = ''; // Clear file input
            return;
        }

        // 2. Check file size (10MB limit)
        if (selected.size > MAX_FILE_SIZE) {
            const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
            const fileSizeMB = (selected.size / 1024 / 1024).toFixed(2);
            setFileError(`حجم فایل بسیار بزرگ است! (${fileSizeMB}MB از ${maxSizeMB}MB)`);
            e.target.value = ''; // Clear file input
            return;
        }

        // 3. File is valid - proceed
        setFile(selected);
        setFileError(null);

        // Create preview for images
        if (selected.type.startsWith("image/")) {
            const url = URL.createObjectURL(selected);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const removeFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        setFileError(null);

        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    /* ---------- Save Ticket ---------- */
    const handleSave = async () => {
        // Clear any previous file errors
        setFileError(null);

        // Validate required fields
        if (!title.trim() || !description.trim()) {
            alert("لطفاً عنوان و توضیحات را وارد کنید");
            return;
        }

        // Validate file if exists
        if (file) {
            // Re-validate file before saving
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setFileError("فرمت فایل نامعتبر است");
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setFileError("حجم فایل بیش از حد مجاز است");
                return;
            }
        }

        setIsSaving(true);

        // Simulate API call for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const data: StoredTicket = {
            title,
            description,
            file: file
                ? {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: previewUrl ?? "",
                }
                : undefined,
        };

        localStorage.setItem("ticketData", JSON.stringify(data));

        setIsSaving(false);
        alert("تیکت با موفقیت ارسال شد ✅");
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleTitleSelect = (selectedTitle: string) => {
        setTitle(selectedTitle);
        setIsDropdownOpen(false);
    };

    const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const clearTitle = () => {
        setTitle("");
    };

    if (isLoading) {
        return (
            <div className="ticket-page" dir="rtl">
                <div className="ticket-card loading">
                    <div className="field">
                        <label>عنوان تیکت</label>
                        <div className="dropdown-wrapper">
                            <div className="dropdown-header">
                                <input type="text" disabled />
                            </div>
                        </div>
                    </div>
                    <div className="field textarea">
                        <label>توضیحات</label>
                        <textarea rows={4} disabled />
                    </div>
                    <div className="file-section">
                        <button className="file-btn" disabled>انتخاب فایل</button>
                        <div className="file-preview"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ticket-page" dir="rtl">
            <div className="ticket-card">
                {/* Dropdown Title Field */}
                <div className="field" ref={dropdownRef}>
                    <label>عنوان تیکت</label>
                    <div className="dropdown-wrapper">
                        <div
                            className={`dropdown-header ${isDropdownOpen ? 'active' : ''}`}
                            onClick={toggleDropdown}
                        >
                            <input
                                type="text"
                                value={title}
                                placeholder="انتخاب مشکل یا وارد کردن عنوان"
                                readOnly
                                className="dropdown-input"
                                disabled={isSaving}
                            />
                            <div className="dropdown-controls">
                                {title && (
                                    <button
                                        className="clear-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearTitle();
                                        }}
                                        type="button"
                                        aria-label="پاک کردن"
                                    >
                                        ✕
                                    </button>
                                )}
                                <div className="dropdown-arrow">
                                    {isDropdownOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </div>
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="dropdown-content" ref={dropdownContentRef}>
                                <div className="dropdown-title">مشکلات رایج</div>
                                <div className="dropdown-options">
                                    {commonProblems.map((problem, index) => (
                                        <div
                                            key={index}
                                            className={`dropdown-option ${title === problem ? 'selected' : ''}`}
                                            onClick={() => handleTitleSelect(problem)}
                                        >
                                            {problem}
                                        </div>
                                    ))}
                                </div>

                                <div className="custom-title-section">
                                    <div className="section-label">عنوان دلخواه:</div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={handleCustomTitleChange}
                                        placeholder="در صورت نبود مشکل بالا، عنوان دلخواه وارد کنید"
                                        className="custom-input"
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="field textarea">
                    <label>توضیحات</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="توضیحات کامل مشکل را وارد کنید"
                        disabled={isSaving}
                    />
                </div>

                {/* ---------- File Upload ---------- */}
                <div className="file-section">
                    <label className="file-btn">
                        انتخاب فایل (اختیاری)
                        <input
                            type="file"
                            onChange={handleFileChange}
                            disabled={isSaving}
                            accept={ALLOWED_FILE_TYPES.join(',')}
                        />
                    </label>

                    {/* File restrictions info */}
                    <div className="file-restrictions">
                        <small>
                            فرمت‌های مجاز: تصاویر، PDF، Zip، Rar |
                            حداکثر حجم: ۱۰ مگابایت
                        </small>
                    </div>

                    {/* File error message */}
                    {fileError && (
                        <div className="file-error-message">
                            <span className="error-icon">⚠️</span>
                            {fileError}
                        </div>
                    )}

                    <div className={`file-preview ${file ? 'has-file' : ''}`}>
                        {file ? (
                            <div className="preview-box">
                                {previewUrl ? (
                                    <div className="image-preview">
                                        <img src={previewUrl} alt="preview" />
                                        <div className="file-details">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{formatFileSize(file.size)}</span>
                                            <span className="file-type">{file.type.split('/')[1]?.toUpperCase()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="file-info">
                                        <span className="file-icon">
                                            {file.type === 'application/pdf' ? '📄' :
                                                file.type.includes('zip') || file.type.includes('rar') ? '🗜️' : '📎'}
                                        </span>
                                        <div className="file-details">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{formatFileSize(file.size)}</span>
                                            <span className="file-type">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="remove-btn"
                                    onClick={removeFile}
                                    disabled={isSaving}
                                    type="button"
                                    aria-label="حذف فایل"
                                >
                                    حذف فایل
                                </button>
                            </div>
                        ) : (
                            <span className="empty">
                                فایلی انتخاب نشده
                                <br />
                                <small>(حداکثر ۱۰ مگابایت)</small>
                            </span>
                        )}
                    </div>
                </div>

                <button
                    className="submit-btn"
                    onClick={handleSave}
                    disabled={isSaving || !!fileError}
                >
                    {isSaving ? 'در حال ارسال...' : 'ارسال تیکت'}
                </button>
            </div>
        </div>
    );

}