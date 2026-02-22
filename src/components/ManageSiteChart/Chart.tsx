import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../API/apiClient.ts";
import "./Chart.scss";

interface ChartData {
    labels: string[];
    requests: number[];
    payments: number[];
    totalRequests?: number;
    totalPayments?: number;
}

type TimeFilter = 'day' | 'week' | 'month';

export default function ManageSiteChart() {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');

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
        const formattedAmount = amount.toLocaleString('en-US');
        return toPersianNumber(formattedAmount) + ' تومان';
    };

    // Safely extract current data
    const rawData: ChartData | null = allStats ? allStats[timeFilter] : null;

    // Calculate totals automatically if they aren't in the JSON
    const currentData = rawData ? {
        ...rawData,
        totalRequests: rawData.totalRequests || rawData.requests.reduce((a, b) => a + b, 0),
        totalPayments: rawData.totalPayments || rawData.payments.reduce((a, b) => a + b, 0)
    } : null;

    if (isLoading) {
        return (
            <div className="chart-loading">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری اطلاعات...</p>
            </div>
        );
    }

    // This triggers if the button you clicked doesn't have data in db.json
    if (isError || !currentData) {
        return (
            <div className="chart-error">
                <div className="error-icon">!</div>
                <h3>داده‌ای یافت نشد</h3>
                <p>اطلاعات مربوط به بازه {timeFilter === 'day' ? 'روزانه' : timeFilter === 'week' ? 'هفتگی' : 'ماهانه'} در دیتابیس موجود نیست.</p>
                <div className="time-filter-buttons" style={{marginTop: '10px'}}>
                    <button className="time-filter-btn active" onClick={() => setTimeFilter('day')}>بازگشت به روزانه</button>
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...currentData.requests, ...currentData.payments, 1);
    const chartHeight = 300;
    const getBarHeight = (value: number) => (value / maxValue) * chartHeight;

    return (
        <div className="financial-chart-section" dir="rtl">
            <div className="chart-header">
                <div className="chart-title-section">
                    <h2 className="chart-title">گزارش مالی</h2>
                    <div className="time-filter-buttons">
                        {(['day', 'week', 'month'] as const).map((filter) => (
                            <button
                                key={filter}
                                className={`time-filter-btn ${timeFilter === filter ? 'active' : ''}`}
                                onClick={() => setTimeFilter(filter)}
                            >
                                {filter === 'day' ? 'روزانه' : filter === 'week' ? 'هفتگی' : 'ماهانه'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color requests-color"></span>
                        <span className="legend-text">طلب‌ها</span>
                        <span className="legend-value">{formatCurrencyPersian(currentData.totalRequests)}</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color payments-color"></span>
                        <span className="legend-text">واریزی‌ها</span>
                        <span className="legend-value">{formatCurrencyPersian(currentData.totalPayments)}</span>
                    </div>
                </div>
            </div>

            <div className="big-chart-container">
                <div className="vertical-bar-chart">
                    <div className="chart-y-axis">
                        {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                            <div key={i} className="y-axis-label">
                                {formatCurrencyPersian(Math.floor(maxValue * ratio))}
                            </div>
                        ))}
                    </div>

                    <div className="chart-bars-container">
                        {currentData.labels.map((label, index) => (
                            <div key={index} className="chart-bar-group">
                                <div className="bar-label">{label}</div>
                                <div className="bars-wrapper">
                                    <div
                                        className="bar bar-requests"
                                        style={{ height: `${getBarHeight(currentData.requests[index])}px` }}
                                        title={`طلب‌ها: ${formatCurrencyPersian(currentData.requests[index])}`}
                                    >
                                        <span className="bar-value">
                                            {formatCurrencyPersian(currentData.requests[index])}
                                        </span>
                                    </div>
                                    <div
                                        className="bar bar-payments"
                                        style={{ height: `${getBarHeight(currentData.payments[index])}px` }}
                                        title={`واریزی‌ها: ${formatCurrencyPersian(currentData.payments[index])}`}
                                    >
                                        <span className="bar-value">
                                            {formatCurrencyPersian(currentData.payments[index])}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}