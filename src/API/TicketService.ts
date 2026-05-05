import apiClient from "./apiClient";
import type { StoredTicket } from "../models/TicketInterfaces/TicketInterface";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

const unwrap = <T>(responseData: T | ApiResponse<T>): T => {
    if (responseData && typeof responseData === 'object' && !('success' in responseData)) {
        return responseData as T;
    }
    const wrapped = responseData as ApiResponse<T>;
    if (wrapped.success !== undefined) {
        if (!wrapped.success) {
            throw new Error(wrapped.message || "خطا در عملیات");
        }
        return wrapped.data as T;
    }
    throw new Error("Invalid API response format");
};

export const ticketService = {
    getAll: async (): Promise<StoredTicket[]> => {
        const response = await apiClient.get<StoredTicket[]>("/tickets");
        return unwrap<StoredTicket[]>(response.data);
    },

    getById: async (id: string | number): Promise<StoredTicket> => {
        const response = await apiClient.get<StoredTicket>(`/tickets/${id}`);
        return unwrap<StoredTicket>(response.data);
    },

    create: async (data: Omit<StoredTicket, "id">): Promise<StoredTicket> => {
        const response = await apiClient.post<StoredTicket>("/tickets", data);
        return unwrap<StoredTicket>(response.data);
    },

    update: async (id: string | number, data: Partial<StoredTicket>): Promise<StoredTicket> => {
        const response = await apiClient.put<StoredTicket>(`/tickets/${id}`, data);
        return unwrap<StoredTicket>(response.data);
    },

    delete: async (id: string | number): Promise<void> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/tickets/${id}`);
        const data = response.data;

        if (data && typeof data === 'object' && 'success' in data) {
            if (data.success === false) {
                throw new Error(data.message || "خطا در حذف");
            }
        }

    },
};