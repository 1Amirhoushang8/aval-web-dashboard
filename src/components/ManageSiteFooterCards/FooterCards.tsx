import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../API/apiClient.ts";
import "./FooterCards.scss"

export default function FooterCards() {
    const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('day');


    const { data: allStats, isError, isLoading } = useQuery({
        queryKey: ["financialStats"],
        queryFn: async () => {
            const response = await apiClient.get("/financialStats");
            return response.data;
        }
    });

    const toPersianNumber = (num: number | string): string => {
        if (num === undefined || num === null) return "۰";
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
    };

    const formatCurrencyPersian = (amount: number): string => {
        const formattedAmount = (amount || 0).toLocaleString('en-US');
        return toPersianNumber(formattedAmount) + ' تومان';
    };

    const getTimeFilterLabel = (filter: 'day' | 'week' | 'month'): string => {
        const labels = { day: 'روزانه', week: 'هفتگی', month: 'ماهانه' };
        return labels[filter];
    };


    const rawData = allStats ? allStats[timeFilter] : null;


    const currentData = rawData ? {
        ...rawData,
        totalRequests: rawData.totalRequests || (rawData.requests ? rawData.requests.reduce((a: number, b: number) => a + b, 0) : 0),
        totalPayments: rawData.totalPayments || (rawData.payments ? rawData.payments.reduce((a: number, b: number) => a + b, 0) : 0)
    } : null;

    const balance = currentData ? currentData.totalRequests - currentData.totalPayments : 0;


    if (isLoading) return <div className="loading-text">در حال محاسبه مقادیر...</div>;


    if (isError || !currentData) {
        return (
            <div className="financial-summary" dir="rtl">
                <div className="footer-filter-section">
                    <div className="time-filter-buttons">
                        {(['day', 'week', 'month'] as const).map((filter) => (
                            <button
                                key={filter}
                                className={`time-filter-btn ${timeFilter === filter ? 'active' : ''}`}
                                onClick={() => setTimeFilter(filter)}
                            >
                                {getTimeFilterLabel(filter)}
                            </button>
                        ))}
                    </div>
                </div>
                <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                    داده‌ای برای بازه {getTimeFilterLabel(timeFilter)} ثبت نشده است.
                </p>
            </div>
        );
    }

    return (
        <div className="financial-summary" dir="rtl">
            <div className="footer-filter-section">
                <div className="filter-title">نمایش بر اساس:</div>
                <div className="time-filter-buttons">
                    {(['day', 'week', 'month'] as const).map((filter) => (
                        <button
                            key={filter}
                            className={`time-filter-btn ${timeFilter === filter ? 'active' : ''}`}
                            onClick={() => setTimeFilter(filter)}
                        >
                            {getTimeFilterLabel(filter)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="summary-cards-container">
                <div className="summary-card requests-card">
                    <div className="summary-icon">📥</div>
                    <div className="summary-content">
                        <div className="summary-title">مجموع طلب‌ها</div>
                        <div className="summary-value">{formatCurrencyPersian(currentData.totalRequests)}</div>
                    </div>
                </div>

                <div className="summary-card payments-card">
                    <div className="summary-icon">📤</div>
                    <div className="summary-content">
                        <div className="summary-title">مجموع واریزی‌ها</div>
                        <div className="summary-value">{formatCurrencyPersian(currentData.totalPayments)}</div>
                    </div>
                </div>

                <div className="summary-card balance-card">
                    <div className="summary-icon">💰</div>
                    <div className="summary-content">
                        <div className="summary-title">موجودی خالص</div>
                        <div className="summary-value" style={{ color: balance >= 0 ? '#2ecc71' : '#e74c3c' }}>
                            {formatCurrencyPersian(Math.abs(balance))}
                            {balance < 0 && <span style={{fontSize: '12px', marginRight: '5px'}}>(بدهکار)</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}