
import React, { useState, useEffect, useRef } from "react";
import "./TicketFileUpload.scss";
import type {FileUploadProps} from "../../models/FileUploadInterface/FileUploadInterface.ts";


export default function TicketFileUpload({
                                       onFileChange,
                                       onFileError,
                                       disabled = false,
                                       initialFile = null,
                                       initialPreviewUrl = null,
                                       maxSize = 10 * 1024 * 1024,
                                       allowedTypes = [],
                                       allowedExtensions = []
                                   }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(initialFile);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);


    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };




    const validateFile = (selected: File): boolean => {

        const isValidType = allowedTypes.includes(selected.type);


        const fileExtension = selected.name.split('.').pop()?.toLowerCase();
        const isValidExtension = fileExtension ? allowedExtensions.includes(fileExtension) : false;

        if (!isValidType && !isValidExtension) {
            const allowedTypesText = allowedExtensions.map(ext => `.${ext}`).join(', ');
            setFileError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${allowedTypesText}`);
            return false;
        }


        if (selected.size > maxSize) {
            const maxSizeMB = maxSize / 1024 / 1024;
            const fileSizeMB = (selected.size / 1024 / 1024).toFixed(2);
            setFileError(`حجم فایل بسیار بزرگ است! (${fileSizeMB}MB از ${maxSizeMB}MB)`);
            return false;
        }

        return true;
    };


    const handleFileSelect = (selected: File | null) => {
        if (!selected) return;

        setFileError(null);

        if (validateFile(selected)) {
            setFile(selected);
            onFileChange(selected);
            onFileError(null);


            if (selected.type.startsWith("image/")) {
                const url = URL.createObjectURL(selected);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        handleFileSelect(selected);
    };

    const handleRemoveFile = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        setFileError(null);
        onFileChange(null);
        onFileError(null);


        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="file-section">
            <label className="file-btn">
                انتخاب فایل (اختیاری)
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={disabled}
                    accept={allowedTypes.join(',')}
                />
            </label>


            <div className="file-restrictions">
                <small>
                    فرمت‌های مجاز: تصاویر، PDF، Zip، Rar |
                    حداکثر حجم: {maxSize / 1024 / 1024} مگابایت
                </small>
            </div>


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
                    </div>
                ) : (
                    <span className="empty">
                        فایلی انتخاب نشده
                        <br />
                        <small>(حداکثر {maxSize / 1024 / 1024} مگابایت)</small>
                    </span>
                )}
            </div>


            {file && (
                <button
                    className="remove-btn outside"
                    onClick={handleRemoveFile}
                    disabled={disabled}
                    type="button"
                    aria-label="حذف فایل"
                >
                    حذف فایل
                </button>
            )}
        </div>
    );
}