import { useNavigate } from "react-router-dom";
import "./TodayTickets.scss";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface.ts";

interface TodayTicketsProps {
    tickets: StoredTicket[];
    loading?: boolean;
    toPersianNumber?: (num: number | string) => string;
    open: boolean;
    onToggle: () => void;
}

export default function TodayTickets({
                                         tickets = [],
                                         loading = false,
                                         toPersianNumber,
                                         open,
                                         onToggle
                                     }: TodayTicketsProps) {
    const navigate = useNavigate();


    const persian = toPersianNumber || ((num) => {
        if (num === undefined || num === null) return "۰";
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
    });


    const pendingCount = tickets.filter(t => t.status === "pending").length;


    const handleNavigate = () => {
        navigate("/AdminTicketPage");
    };

    if (loading) {
        return (
            <div className="kpi-card skeleton-card-kpi today-tickets-card">
                <div className="skeleton-item skeleton-kpi-title"></div>
                <div className="skeleton-item skeleton-kpi-value"></div>
            </div>
        );
    }

    return (
        <div className={`kpi-card today-tickets-card ${pendingCount > 0 ? 'has-pending' : ''}`}>
            <div className="kpi-header">
                <span className="kpi-title">تیکت‌های امروز</span>
                <button
                    className={`view-button ${open ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking toggle
                        onToggle();
                    }}
                >
                    {open ? 'بستن لیست' : 'مشاهده جزئیات'}
                </button>
            </div>

            <div
                className="tickets-count"
                onClick={handleNavigate}
                style={{ cursor: 'pointer' }}
                title="مشاهده تمام تیکت‌ها"
            >
                <div className="main-value-row">
                    <span className="kpi-value">{persian(tickets.length)}</span>
                    <span className="kpi-subtitle">تیکت ثبت شده</span>
                </div>


            </div>
        </div>
    );
}