import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "@mui/material";
import apiClient from "../../API/apiClient.ts";
import "./Chart.scss";
import type { ChartData } from "../../models/ChartDataInterface/ChartDataInterface.ts";

type TimeFilter = 'day' | 'week' | 'month';

interface FinancialStatsResponse {
    day: ChartData;
    week: ChartData;
    month: ChartData;
}

export default function ManageSiteChart() {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');

    // Poll every 10 seconds – chart will reflect database changes automatically
    const { data: allStats, isError, isLoading } = useQuery<FinancialStatsResponse>({
        queryKey: ["financialStats"],
        queryFn: async () => {
            const response = await apiClient.get("/financialStats");
            return response.data;
        },
        refetchInterval: 10_000,   // 10 seconds
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

    const rawData: ChartData | null = allStats ? allStats[timeFilter] : null;

    const currentData = rawData
        ? {
            ...rawData,
            totalRequests: rawData.totalRequests || rawData.requests.reduce((a, b) => a + b, 0),
            totalPayments: rawData.totalPayments || rawData.payments.reduce((a, b) => a + b, 0),
            allZero: rawData.requests.every(v => v === 0) && rawData.payments.every(v => v === 0)
        }
        : null;

    if (isLoading) {
        return (
            <div className="chart-loading">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری اطلاعات...</p>
            </div>
        );
    }

    if (isError || !currentData) {
        return (
            <div className="chart-error">
                <div className="error-icon">!</div>
                <h3>داده‌ای یافت نشد</h3>
                <p>اطلاعات مربوط به بازه {timeFilter === 'day' ? 'روزانه' : timeFilter === 'week' ? 'هفتگی' : 'ماهانه'} یافت نشد</p>
            </div>
        );
    }

    const maxValue = Math.max(...currentData.requests, ...currentData.payments, 1);
    const chartHeight = 300;
    const getBarHeight = (value: number) => (value / maxValue) * chartHeight;
    const isMonthView = timeFilter === 'month';

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
                        <span className="legend-value">{formatCurrencyPersian(currentData.totalRequests || 0)}</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color payments-color"></span>
                        <span className="legend-text">واریزی‌ها</span>
                        <span className="legend-value">{formatCurrencyPersian(currentData.totalPayments || 0)}</span>
                    </div>
                </div>
            </div>

            <div className="big-chart-container">
                {currentData.allZero && (
                    <div className="empty-chart-note">داده‌ای برای این بازه وجود ندارد</div>
                )}

                <div className="vertical-bar-chart">
                    <div className="chart-y-axis">
                        {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                            <div key={i} className="y-axis-label">
                                {formatCurrencyPersian(Math.floor(maxValue * ratio))}
                            </div>
                        ))}
                    </div>

                    <div className={`chart-bars-container ${isMonthView ? 'month-mode' : ''}`}>
                        {currentData.labels.map((label, index) => (
                            <div
                                key={index}
                                className="chart-bar-group"
                                style={{ width: isMonthView ? 'clamp(36px, 6vw, 55px)' : 'clamp(48px, 9vw, 85px)' }}
                            >
                                <div className="bar-label" style={{ fontSize: isMonthView ? '0.78rem' : '0.85rem' }}>
                                    {label}
                                </div>
                                <div className="bars-wrapper">
                                    <Tooltip title={`طلب‌ها: ${formatCurrencyPersian(currentData.requests[index])}`} arrow placement="top">
                                        <div
                                            className="bar bar-requests"
                                            style={{
                                                height: `${getBarHeight(currentData.requests[index])}px`,
                                                width: isMonthView ? '14px' : '22px'
                                            }}
                                        >
                                            {!isMonthView && (
                                                <span className="bar-value">
                                                    {formatCurrencyPersian(currentData.requests[index])}
                                                </span>
                                            )}
                                        </div>
                                    </Tooltip>

                                    <Tooltip title={`واریزی‌ها: ${formatCurrencyPersian(currentData.payments[index])}`} arrow placement="top">
                                        <div
                                            className="bar bar-payments"
                                            style={{
                                                height: `${getBarHeight(currentData.payments[index])}px`,
                                                width: isMonthView ? '14px' : '22px'
                                            }}
                                        >
                                            {!isMonthView && (
                                                <span className="bar-value">
                                                    {formatCurrencyPersian(currentData.payments[index])}
                                                </span>
                                            )}
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}