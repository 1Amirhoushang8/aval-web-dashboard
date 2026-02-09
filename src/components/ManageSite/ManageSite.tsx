import "./ManageSite.scss";
import { useState } from "react";

export default function ManageSite() {
    const [showTicketList, setShowTicketList] = useState(false);
    const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('day');

    // Sample ticket data for today's activity
    const todayTickets = [
        {
            id: 1,
            type: "ایجاد شده",
            title: "مشکل در ورود به سیستم",
            user: "علی محمدی",
            time: "10:30 صبح",
            priority: "بالا"
        },
        {
            id: 2,
            type: "به‌روزرسانی شده",
            title: "خرابی پرینتر",
            user: "مریم کریمی",
            time: "11:45 صبح",
            priority: "متوسط"
        },
        {
            id: 3,
            type: "حذف شده",
            title: "درخواست نصب نرم‌افزار",
            user: "رضا احمدی",
            time: "12:15 بعدازظهر",
            priority: "پایین"
        },
        {
            id: 4,
            type: "ایجاد شده",
            title: "مشکل اتصال اینترنت",
            user: "سارا نوروزی",
            time: "14:30 بعدازظهر",
            priority: "بالا"
        },
        {
            id: 5,
            type: "به‌روزرسانی شده",
            title: "پشتیبانی نرم‌افزار",
            user: "محمد حسینی",
            time: "15:20 بعدازظهر",
            priority: "متوسط"
        }
    ];

    // Sample financial data with days/weeks/months
    const financialData = {
        day: {
            labels: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
            requests: [400000, 300000, 550000, 250000, 350000, 450000, 600000],
            payments: [250000, 200000, 300000, 150000, 250000, 350000, 400000],
            totalRequests: 1250000,
            totalPayments: 850000
        },
        week: {
            labels: ["هفته ۱", "هفته ۲", "هفته ۳", "هفته ۴"],
            requests: [1200000, 800000, 950000, 1100000],
            payments: [900000, 600000, 750000, 850000],
            totalRequests: 4500000,
            totalPayments: 3200000
        },
        month: {
            labels: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"],
            requests: [4500000, 3800000, 5200000, 4100000, 4800000, 5500000],
            payments: [3500000, 2800000, 4200000, 3100000, 3800000, 4500000],
            totalRequests: 18500000,
            totalPayments: 12500000
        }
    };

    const toggleTicketList = () => {
        setShowTicketList(!showTicketList);
    };

    // Fixed: Format currency with English numbers
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US') + ' تومان';
    };

    const currentData = financialData[timeFilter];
    const maxValue = Math.max(...currentData.requests, ...currentData.payments);
    const chartHeight = 300;

    const getBarHeight = (value: number) => {
        return (value / maxValue) * chartHeight;
    };

    return (
        <div className="mainchart" dir="rtl" style={{ fontFamily: "Vazirmatn, Vazir, system-ui, sans-serif" }}>
            {/* Dashboard Heading */}
            <div className="dash-h1">
                <h1 className="dashtext">داشبورد مدیریت اول وب</h1>
            </div>

            {/* KPI Row */}
            <div className={`kpi-row ${showTicketList ? 'list-open' : ''}`}>
                {/* Active Users Card */}
                <div className="kpi-card">
                    <span className="kpi-title">کاربران فعال</span>
                    <span className="kpi-value">1,245</span>
                </div>

                {/* Today's Tickets Card - Updated */}
                <div className="kpi-card today-tickets-card">
                    <div className="kpi-header">
                        <span className="kpi-title">تیکت‌های امروز</span>
                        <button
                            className={`view-button ${showTicketList ? 'active' : ''}`}
                            onClick={toggleTicketList}
                        >
                            {showTicketList ? 'بستن' : 'مشاهده'}
                        </button>
                    </div>

                    <div className="tickets-count">
                        <span className="kpi-value">{todayTickets.length}</span>
                        <span className="kpi-subtitle">تیکت</span>
                    </div>
                </div>

                {/* Financial Stats Card */}

            </div>

            {/* Ticket List (Shown below when open) */}
            {showTicketList && (
                <div className="ticket-list-container">
                    <div className="ticket-list-header">
                        <h3 className="list-title">
                            <span className="title-text">فعالیت‌های تیکت امروز</span>
                            <span className="ticket-count">({todayTickets.length} مورد)</span>
                        </h3>
                        <div className="list-actions">
                            <span className="last-update">آخرین بروزرسانی: همین الان</span>
                        </div>
                    </div>

                    <div className="ticket-list">
                        <div className="list-header-row">
                            <div className="header-cell type-cell">نوع</div>
                            <div className="header-cell title-cell">عنوان تیکت</div>
                            <div className="header-cell user-cell">کاربر</div>
                        </div>

                        {todayTickets.map(ticket => (
                            <div key={ticket.id} className="ticket-item">
                                <div className="item-cell type-cell">
                                    <span className={`type-badge type-${ticket.type.replace(' ', '-')}`}>
                                        {ticket.type}
                                    </span>
                                </div>
                                <div className="item-cell title-cell">
                                    <span className="ticket-title">{ticket.title}</span>
                                </div>
                                <div className="item-cell user-cell">
                                    <span className="user-name">{ticket.user}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial Chart Section */}
            <div className="financial-chart-section">
                <div className="chart-header">
                    <div className="chart-title-section">
                        <h2 className="chart-title">گزارش مالی</h2>
                        <div className="time-filter-buttons">
                            <button
                                className={`time-filter-btn ${timeFilter === 'day' ? 'active' : ''}`}
                                onClick={() => setTimeFilter('day')}
                            >
                                روزانه
                            </button>
                            <button
                                className={`time-filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                                onClick={() => setTimeFilter('week')}
                            >
                                هفتگی
                            </button>
                            <button
                                className={`time-filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                                onClick={() => setTimeFilter('month')}
                            >
                                ماهانه
                            </button>
                        </div>
                    </div>

                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-color requests-color"></span>
                            <span className="legend-text">ستون طلب‌ها</span>
                            <span className="legend-value">{formatCurrency(currentData.totalRequests)}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color payments-color"></span>
                            <span className="legend-text">ستون واریزی‌ها</span>
                            <span className="legend-value">{formatCurrency(currentData.totalPayments)}</span>
                        </div>
                    </div>
                </div>

                <div className="big-chart-container">
                    <div className="vertical-bar-chart">
                        <div className="chart-y-axis">
                            <div className="y-axis-label">{formatCurrency(maxValue)}</div>
                            <div className="y-axis-label">{formatCurrency(Math.floor(maxValue * 0.75))}</div>
                            <div className="y-axis-label">{formatCurrency(Math.floor(maxValue * 0.5))}</div>
                            <div className="y-axis-label">{formatCurrency(Math.floor(maxValue * 0.25))}</div>
                            <div className="y-axis-label">0</div>
                        </div>

                        <div className="chart-bars-container">
                            {currentData.labels.map((label, index) => (
                                <div key={index} className="chart-bar-group">
                                    <div className="bar-label">{label}</div>
                                    <div className="bars-wrapper">
                                        <div
                                            className="bar bar-requests"
                                            style={{ height: `${getBarHeight(currentData.requests[index])}px` }}
                                            title={`طلب‌ها: ${formatCurrency(currentData.requests[index])}`}
                                        >
                                            <span className="bar-value">
                                                {formatCurrency(currentData.requests[index])}
                                            </span>
                                        </div>
                                        <div
                                            className="bar bar-payments"
                                            style={{ height: `${getBarHeight(currentData.payments[index])}px` }}
                                            title={`واریزی‌ها: ${formatCurrency(currentData.payments[index])}`}
                                        >
                                            <span className="bar-value">
                                                {formatCurrency(currentData.payments[index])}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="chart-x-axis">
                            <span>مقدار (تومان)</span>
                        </div>
                    </div>


                </div>

                {/* Financial Summary Cards */}
                <div className="financial-summary">
                    <div className="summary-card requests-card">
                        <div className="summary-icon">📥</div>
                        <div className="summary-content">
                            <div className="summary-title">مجموع طلب‌ها</div>
                            <div className="summary-value">{formatCurrency(currentData.totalRequests)}</div>

                        </div>
                    </div>

                    <div className="summary-card payments-card">
                        <div className="summary-icon">📤</div>
                        <div className="summary-content">
                            <div className="summary-title">مجموع واریزی‌ها</div>
                            <div className="summary-value">{formatCurrency(currentData.totalPayments)}</div>

                        </div>
                    </div>

                    <div className="summary-card balance-card">
                        <div className="summary-icon">💰</div>
                        <div className="summary-content">
                            <div className="summary-title">موجودی خالص</div>
                            <div className="summary-value">
                                {formatCurrency(currentData.totalRequests - currentData.totalPayments)}
                            </div>

                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
}