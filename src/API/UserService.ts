import apiClient from "./apiClient";
import type { User } from "../models/AccountingInterfaces/AccountingInterface";

type CreateUserDto = Omit<User, "id">;

// Robust unwrap that handles both wrapped and unwrapped responses
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

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get("/users");
        return unwrap<User[]>(response.data);
    },

    getById: async (id: string | number): Promise<User> => {
        const response = await apiClient.get(`/users/${id}`);
        return unwrap<User>(response.data);
    },

    create: async (data: CreateUserDto): Promise<User> => {
        const response = await apiClient.post("/users", data);
        return unwrap<User>(response.data);
    },

    update: async (id: string | number, data: Partial<User>): Promise<User> => {
        const response = await apiClient.put(`/users/${id}`, data);
        return unwrap<User>(response.data);
    },

    delete: async (id: string | number): Promise<void> => {
        const response = await apiClient.delete(`/users/${id}`);
        if (response.data && response.data.success === false) {
            throw new Error(response.data.message || "خطا در حذف");
        }

    },
};