import "./ManagePage.scss";
import ManageSiteChart from "../../components/ManageSiteChart/Chart.tsx";
import ManageSiteChartSkeleton from "../../Skeleton/ManageSiteChartSkeleton/ManageSiteChartSkeleton.tsx";
import FooterCards from "../../components/ManageSiteFooterCards/FooterCards.tsx";
import FooterCardsSkeleton from "../../Skeleton/ManageSiteFooterCard/ManageSiteFooterCard.tsx";
import TodayTickets from "../../components/TodayTickets/TodayTickets.tsx";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../API/apiClient.ts";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface.ts";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


export default function ManageSitePage() {
    const [showTicketList, setShowTicketList] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info" | "warning";
    }>({
        open: false,
        message: "",
        severity: "error",
    });

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showError = (message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: "error",
        });
    };

    // --- Helper: Get Today's Persian Date (YYYY/MM/DD) ---
    const getTodayPersianDate = () => {
        return new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/');
    };

    // --- Fetching Real Data from JSON API ---
    const {
        data: tickets = [],
        isLoading,
        isError,
    } = useQuery<StoredTicket[]>({
        queryKey: ["tickets"],
        queryFn: async () => {
            try {
                const response = await apiClient.get("/tickets");
                return response.data;
            } catch (err) {
                throw new Error("مشکل در اتصال به سرور");
            }
        },
        retry: 2,
        retryDelay: 1000,
    });

    // Show error message if query fails
    useEffect(() => {
        if (isError) {
            const errorMessage = "خطا در دریافت اطلاعات از سرور. لطفاً اتصال اینترنت خود را بررسی کنید.";
            showError(errorMessage);
        }
    }, [isError]);

    // --- Filtering Logic: Reset every 24 hours ---
    const todayTickets = useMemo(() => {
        const today = getTodayPersianDate();
        return tickets.filter(ticket => ticket.date === today);
    }, [tickets]);

    const toPersianNumber = (num: number | string): string => {
        if (!num && num !== 0) return "";
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
    };

    const toggleTicketList = () => setShowTicketList(prev => !prev);



    return (
        <div className={`mainchart ${isLoading ? 'is-loading' : ''}`} dir="rtl" style={{ fontFamily: "Vazirmatn, Vazir, system-ui, sans-serif" }}>

            {/* Dashboard Heading */}
            <div className="dash-h1">
                {isLoading ? (
                    <div className="skeleton-item skeleton-h1"></div>
                ) : (
                    <h1 className="dashtext">داشبورد مدیریت اول وب</h1>
                )}
            </div>

            {/* KPI Row */}
            <div className={`kpi-row ${showTicketList ? 'list-open' : ''}`}>
                <div className="kpi-card">
                    {isLoading ? (
                        <>
                            <div className="skeleton-item skeleton-kpi-title"></div>
                            <div className="skeleton-item skeleton-kpi-value"></div>
                        </>
                    ) : (
                        <>
                            <span className="kpi-title">کاربران فعال</span>
                            <span className="kpi-value">{toPersianNumber(1245)}</span>
                        </>
                    )}
                </div>

                <TodayTickets
                    tickets={todayTickets}
                    loading={isLoading}
                    toPersianNumber={toPersianNumber}
                    open={showTicketList}
                    onToggle={toggleTicketList}
                />
            </div>

            {/* Ticket List - Filters automatically every 24 hours */}
            {!isLoading && showTicketList && (
                <div className="ticket-list-container">
                    <div className="ticket-list-header">
                        <h3 className="list-title">
                            <span className="title-text">فعالیت‌های تیکت امروز</span>
                            <span className="ticket-count">({toPersianNumber(todayTickets.length)} مورد)</span>
                        </h3>
                    </div>
                    <div className="ticket-list">
                        <div className="list-header-row">
                            <div className="header-cell title-cell">عنوان تیکت</div>
                            <div className="header-cell description-cell">توضیحات</div>
                            <div className="header-cell time-cell">زمان</div>
                        </div>

                        {todayTickets.length > 0 ? (
                            todayTickets.map((ticket, index) => (
                                <div key={ticket.id || index} className="ticket-item">
                                    <div className="item-cell title-cell">
                                        <span className="ticket-title">{ticket.title}</span>
                                    </div>
                                    <div className="item-cell description-cell">
                                        <span className="ticket-description">{ticket.description}</span>
                                    </div>
                                    <div className="item-cell time-cell">
                                        <span className="ticket-time">{toPersianNumber(ticket.time)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p className="empty-message">تیکتی برای امروز ثبت نشده است.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Feature Sections */}
            {isLoading ? (
                <>
                    <ManageSiteChartSkeleton />
                    <FooterCardsSkeleton />
                </>
            ) : (
                <>
                    <ManageSiteChart />
                    <FooterCards />
                </>
            )}

            {/* Improved Error Snackbar with better Farsi message */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        fontFamily: 'Vazirmatn, sans-serif',
                        direction: 'rtl',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        '& .MuiAlert-message': {
                            padding: '8px 0',
                            fontSize: '0.95rem',
                            fontWeight: 500
                        },
                        '& .MuiAlert-icon': {
                            fontSize: '24px',
                            opacity: 0.9
                        }
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⚠️</span>
                        <span>خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.</span>
                    </div>
                </Alert>
            </Snackbar>
        </div>
    );
}