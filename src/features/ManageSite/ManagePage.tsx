import { useNavigate } from "react-router-dom";
import "./ManagePage.scss";
import ManageSiteChart from "../../components/ManageSiteChart/Chart.tsx";
import ManageSiteChartSkeleton from "../../Skeleton/ManageSiteChartSkeleton/ManageSiteChartSkeleton.tsx";
import FooterCards from "../../components/ManageSiteFooterCards/FooterCards.tsx";
import FooterCardsSkeleton from "../../Skeleton/ManageSiteFooterCard/ManageSiteFooterCard.tsx";
import TodayTickets from "../../components/TodayTickets/TodayTickets.tsx";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../API/apiClient.ts";
import type { StoredTicket } from "../../models/TicketInterfaces/TicketInterface.ts";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface User {
    id: string | number;
    username: string;
    fullName: string;
}

export default function ManageSitePage() {
    const navigate = useNavigate();
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

    const showError = useCallback((message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: "error",
        });
    }, []);

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const getTodayPersianDate = () => {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    };


    const unwrapResponse = <T,>(responseData: any): T => {
        if (responseData.success !== undefined) {

            if (!responseData.success) {
                throw new Error(responseData.message || "خطا در دریافت اطلاعات");
            }
            return responseData.data;
        }

        return responseData;
    };

    const {
        data: tickets = [],
        isLoading: ticketsLoading,
        isError: ticketsError,
        error: ticketsErrorObj
    } = useQuery<StoredTicket[]>({
        queryKey: ["tickets"],
        queryFn: async () => {
            const response = await apiClient.get("/tickets");
            return unwrapResponse<StoredTicket[]>(response.data);
        }
    });

    const {
        data: users = [],
        isLoading: usersLoading,
        isError: usersError,
        error: usersErrorObj
    } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await apiClient.get("/users");
            return unwrapResponse<User[]>(response.data);
        }
    });

    useEffect(() => {
        if (ticketsError) {
            console.error("Tickets error:", ticketsErrorObj);
            showError(ticketsErrorObj?.message || "خطا در دریافت اطلاعات تیکت‌ها از سرور.");
        }
        if (usersError) {
            console.error("Users error:", usersErrorObj);
            showError(usersErrorObj?.message || "خطا در دریافت اطلاعات کاربران.");
        }
    }, [ticketsError, usersError, ticketsErrorObj, usersErrorObj, showError]);

    const isLoading = ticketsLoading || usersLoading;

    const uniqueUsersCount = users.length;

    const todayTickets = useMemo(() => {
        const today = getTodayPersianDate();
        return tickets.filter(ticket => ticket.date === today);
    }, [tickets]);

    const toPersianNumber = (num: number | string): string => {
        if (!num && num !== 0) return "۰";
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
    };

    const toggleTicketList = () => setShowTicketList(prev => !prev);

    const handleTicketClick = (ticketId: string | number) => {
        navigate("/AdminTicketPage", { state: { ticketId: String(ticketId) } });
    };

    const handleViewUsers = () => {
        navigate("/AdminUsersPage");
    };

    return (
        <div className={`mainchart ${isLoading ? 'is-loading' : ''}`} dir="rtl" style={{ fontFamily: "Vazirmatn, Vazir, system-ui, sans-serif" }}>

            <div className="dash-h1">
                {isLoading ? (
                    <div className="skeleton-item skeleton-h1"></div>
                ) : (
                    <h1 className="dashtext">داشبورد مدیریت اول وب</h1>
                )}
            </div>

            <div className={`kpi-row ${showTicketList ? 'list-open' : ''}`}>
                <div className="kpi-card">
                    {isLoading ? (
                        <>
                            <div className="skeleton-item skeleton-kpi-title"></div>
                            <div className="skeleton-item skeleton-kpi-value"></div>
                        </>
                    ) : (
                        <>
                            <div className="kpi-header">
                                <span className="kpi-title">تعداد کاربران</span>
                                <button
                                    className="view-button"
                                    onClick={handleViewUsers}
                                    aria-label="مشاهده جزئیات کاربران"
                                >
                                    مشاهده جزئیات
                                </button>
                            </div>
                            <span className="kpi-value">{toPersianNumber(uniqueUsersCount)}</span>
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
                            <div className="header-cell description-cell">توضیحات کوتاه</div>
                            <div className="header-cell time-cell">زمان</div>
                        </div>

                        {todayTickets.length > 0 ? (
                            todayTickets.map((ticket, index) => (
                                <div
                                    key={ticket.id || index}
                                    className="ticket-item"
                                    onClick={() => handleTicketClick(String(ticket.id))}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="item-cell title-cell">
                                        <span className="ticket-title">{ticket.title}</span>
                                    </div>
                                    <div className="item-cell description-cell">
                                        <span className="ticket-description">{ticket.shortDetail}</span>
                                    </div>
                                    <div className="item-cell time-cell">
                                        <span className="ticket-time">{toPersianNumber(ticket.time)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p className="empty-message">تیکتی برای امروز ({toPersianNumber(getTodayPersianDate())}) ثبت نشده است.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                        borderRadius: '12px',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}