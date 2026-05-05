import apiClient from "./apiClient";

export interface ServiceRecord {
    id: string | number;
    userId: string;
    userFullName?: string;
    serialNumber: string;
    serviceName: string;
    price: string;
    status: string;
    paymentType: string;
    monthlyPayment?: string | null;
    totalMonths?: number | null;
}


const toCamelCase = (data: any): ServiceRecord => ({
    id: data.id,
    userId: data.userId,
    userFullName: data.userFullName,
    serialNumber: data.serialNumber,
    serviceName: data.serviceName || data.service,
    price: data.price,
    status: data.status,
    paymentType: data.paymentType,
    monthlyPayment: data.monthlyPayment ?? null,
    totalMonths: data.totalMonths ?? null,
});

export const servicesService = {
    getAll: async (): Promise<ServiceRecord[]> => {
        const res = await apiClient.get("/services");
        return res.data.map(toCamelCase);
    },
    create: async (payload: {
        userId: string;
        serialNumber: string;
        serviceName?: string;
        price?: string;
        status?: string;
        paymentType?: string;
        monthlyPayment?: string | null;
        totalMonths?: number | null;
    }) => {
        const res = await apiClient.post("/services", {
            userId: payload.userId,
            serialNumber: payload.serialNumber,
            serviceName: payload.serviceName,
            price: payload.price,
            status: payload.status,
            paymentType: payload.paymentType,
            monthlyPayment: payload.monthlyPayment,
            totalMonths: payload.totalMonths,
        });
        return toCamelCase(res.data);
    },
    update: async (id: string | number, payload: Partial<ServiceRecord>) => {
        const res = await apiClient.put(`/services/${id}`, {
            serialNumber: payload.serialNumber,
            serviceName: payload.serviceName,
            price: payload.price,
            status: payload.status,
            paymentType: payload.paymentType,
            monthlyPayment: payload.monthlyPayment,
            totalMonths: payload.totalMonths,
        });
        return toCamelCase(res.data);
    },
    delete: async (id: string | number) => {
        await apiClient.delete(`/services/${id}`);
    },
};