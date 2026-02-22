export type User = {
    id: number;
    username: string;
    FullName: string;
    SerialNumber: string ;
    price: string;
    service: string;
    paymentType: string;
    monthlyPayment: string | null;
    totalMonths: number | null;
    status: "لغو-شده" | "درحال-انجام" | "پرداخت-شده";
};