export type User = {
    id: number;
    fullname: string;
    serialnumber: string;
    price: string;
    service: string;
    paymentType: string;
    monthlyPayment: string | null;
    totalMonths: number | null;
    status: "لغو-شده" | "درحال-انجام" | "پرداخت-شده";
};