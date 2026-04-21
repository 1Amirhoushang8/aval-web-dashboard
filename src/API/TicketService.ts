import apiClient from "./apiClient";
import type { StoredTicket } from "../models/TicketInterfaces/TicketInterface";


const unwrap = <T>(responseData: any): T => {
    // Already unwrapped (array or object without 'success' property)
    if (responseData && typeof responseData === 'object' && !('success' in responseData)) {
        return responseData as T;
    }
    // Wrapped ApiResponse format
    if (responseData.success !== undefined) {
        if (!responseData.success) {
            throw new Error(responseData.message || "خطا در عملیات");
        }
        return responseData.data as T;
    }
    throw new Error("Invalid API response format");
};

export const ticketService = {
    getAll: async (): Promise<StoredTicket[]> => {
        const response = await apiClient.get("/tickets");
        return unwrap<StoredTicket[]>(response.data);
    },

    getById: async (id: string | number): Promise<StoredTicket> => {
        const response = await apiClient.get(`/tickets/${id}`);
        return unwrap<StoredTicket>(response.data);
    },

    create: async (data: Omit<StoredTicket, "id">): Promise<StoredTicket> => {
        const response = await apiClient.post("/tickets", data);
        return unwrap<StoredTicket>(response.data);
    },

    update: async (id: string | number, data: Partial<StoredTicket>): Promise<StoredTicket> => {
        const response = await apiClient.put(`/tickets/${id}`, data);
        return unwrap<StoredTicket>(response.data);
    },

    delete: async (id: string | number): Promise<void> => {
        const response = await apiClient.delete(`/tickets/${id}`);
        const data = response.data;
        if (data && typeof data === 'object' && 'success' in data && data.success === false) {
            throw new Error(data.message || "خطا در حذف");
        }
        // Success: 204 No Content (no body) or unwrapped empty response
    },
};