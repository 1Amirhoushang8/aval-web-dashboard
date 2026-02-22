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
                                         tickets,
                                         loading = false,
                                         toPersianNumber,
                                         open,
                                         onToggle
                                     }: TodayTicketsProps) {
    const navigate = useNavigate();

    // Default Persian number converter
    const persian = toPersianNumber || ((num) => {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
    });

    // Navigation function
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
        <div className="kpi-card today-tickets-card">
            <div className="kpi-header">
                <span className="kpi-title">تیکت‌های امروز</span>
                <button
                    className={`view-button ${open ? 'active' : ''}`}
                    onClick={onToggle}
                >
                    {open ? 'بستن' : 'مشاهده'}
                </button>
            </div>
            {/* Added cursor pointer and onClick to the data area */}
            <div
                className="tickets-count"
                onClick={handleNavigate}
                style={{ cursor: 'pointer' }}
            >
                <span className="kpi-value">{persian(tickets.length)}</span>
                <span className="kpi-subtitle">تیکت</span>
            </div>
        </div>
    );
}