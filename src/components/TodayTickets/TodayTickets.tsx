import "./TodayTickets.scss";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface.ts";

interface TodayTicketsProps {
    tickets: StoredTicket[];          // now accepts StoredTicket[]
    loading?: boolean;
    toPersianNumber?: (num: number | string) => string;
    open: boolean;                    // still needed for button state
    onToggle: () => void;
}

export default function TodayTickets({
                                         tickets,
                                         loading = false,
                                         toPersianNumber,
                                         open,
                                         onToggle
                                     }: TodayTicketsProps) {
    // Default Persian number converter if not provided
    const persian = toPersianNumber || ((num) => {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
    });

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
            <div className="tickets-count">
                <span className="kpi-value">{persian(tickets.length)}</span>
                <span className="kpi-subtitle">تیکت</span>
            </div>
        </div>
    );
}