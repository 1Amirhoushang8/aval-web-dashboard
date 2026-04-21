import apiClient from "./apiClient";
import type { StoredTicket } from "../models/TicketInterfaces/TicketInterface";

// Helper to unwrap ApiResponse<T>
const unwrap = <T>(response: any): T => {
    if (response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data.message || "خطا در عملیات");
};

export const ticketService = {
    getAll: async (): Promise<StoredTicket[]> => {
        const response = await apiClient.get("/tickets");
        return unwrap<StoredTicket[]>(response);
    },

    getById: async (id: string | number): Promise<StoredTicket> => {
        const response = await apiClient.get(`/tickets/${id}`);
        return unwrap<StoredTicket>(response);
    },

    create: async (data: Omit<StoredTicket, "id">): Promise<StoredTicket> => {
        const response = await apiClient.post("/tickets", data);
        return unwrap<StoredTicket>(response);
    },

    update: async (id: string | number, data: Partial<StoredTicket>): Promise<StoredTicket> => {
        const response = await apiClient.put(`/tickets/${id}`, data);
        return unwrap<StoredTicket>(response);
    },

    delete: async (id: string | number): Promise<void> => {
        const response = await apiClient.delete(`/tickets/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || "خطا در حذف");
        }
    },
};