import "./TichetManage.scss";
import { useState, useEffect } from "react";

export interface StoredTicket {
    title: string;
    description: string;
    file?: {
        name: string;
        type: string;
        url: string;
    };
}

export default function TicketManage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    /* ---------- File Upload ---------- */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setFile(selected);

        if (selected.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(selected));
        } else {
            setPreviewUrl(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    /* ---------- Save Ticket ---------- */
    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            alert("لطفاً عنوان و توضیحات را وارد کنید");
            return;
        }

        const data: StoredTicket = {
            title,
            description,
            file: file
                ? {
                    name: file.name,
                    type: file.type,
                    url: previewUrl ?? "",
                }
                : undefined,
        };

        localStorage.setItem("ticketData", JSON.stringify(data));
        alert("تیکت با موفقیت ارسال شد ✅");
    };

    /* ---------- Load Saved ---------- */
    useEffect(() => {
        const saved = localStorage.getItem("ticketData");
        if (!saved) return;

        const data: StoredTicket = JSON.parse(saved);
        setTitle(data.title);
        setDescription(data.description);
        if (data.file?.url) {
            setPreviewUrl(data.file.url);
        }
    }, []);

    return (
        <div className="ticket-page" dir="rtl">
            <div className="ticket-card">

                <div className="field">
                    <label>عنوان تیکت</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="عنوان را وارد کنید"
                    />
                </div>

                <div className="field textarea">
                    <label>توضیحات</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="توضیحات تیکت"
                    />
                </div>

                {/* ---------- File Upload ---------- */}
                <div className="file-section">
                    <label className="file-btn">
                        انتخاب فایل (اختیاری)
                        <input type="file" onChange={handleFileChange} />
                    </label>

                    <div className="file-preview">
                        {file ? (
                            <div className="preview-box">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="preview" />
                                ) : (
                                    <div className="file-info">
                                        <span className="file-icon">📎</span>
                                        <span className="file-name">{file.name}</span>
                                    </div>
                                )}

                                <button className="remove-btn" onClick={removeFile}>
                                    ✖ حذف فایل
                                </button>
                            </div>
                        ) : (
                            <span className="empty">فایلی انتخاب نشده</span>
                        )}
                    </div>
                </div>

                <button className="submit-btn" onClick={handleSave}>
                    ارسال تیکت
                </button>
            </div>
        </div>
    );
}
