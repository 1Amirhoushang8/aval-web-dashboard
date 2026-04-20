export type User = {
    id: string | number;
    username: string;
    password?: string;
    fullName: string;
    roleKey?: string;
    serialNumber: string;
    phoneNumber: string;
    price?: string;
    service: string;
    paymentType?: string;
    monthlyPayment?: string | null;
    totalMonths?: number | null;
    status: "لغو-شده" | "درحال-انجام" | "پرداخت-شده";
};