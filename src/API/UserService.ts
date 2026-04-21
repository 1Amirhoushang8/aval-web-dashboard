import apiClient from "./apiClient";
import type { User } from "../models/AccountingInterfaces/AccountingInterface";

type CreateUserDto = Omit<User, "id">;


const unwrap = <T>(response: any): T => {
    if (response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data.message || "خطا در عملیات");
};

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get("/users");
        return unwrap<User[]>(response);
    },

    getById: async (id: string | number): Promise<User> => {
        const response = await apiClient.get(`/users/${id}`);
        return unwrap<User>(response);
    },

    create: async (data: CreateUserDto): Promise<User> => {
        const response = await apiClient.post("/users", data);
        return unwrap<User>(response);
    },

    update: async (id: string | number, data: Partial<User>): Promise<User> => {
        const response = await apiClient.put(`/users/${id}`, data);
        return unwrap<User>(response);
    },

    delete: async (id: string | number): Promise<void> => {
        const response = await apiClient.delete(`/users/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || "خطا در حذف");
        }
    },
};