export interface ChartData {
    labels: string[];
    requests: number[];
    payments: number[];
    totalRequests?: number;
    totalPayments?: number;
}