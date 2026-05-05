import apiClient from "./apiClient";
import type { User } from "../models/AccountingInterfaces/AccountingInterface";

type CreateUserDto = Omit<User, "id">;

interface WrappedApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

function unwrap<T>(responseData: unknown): T {
    if (typeof responseData === 'object' && responseData !== null) {
        if (!('success' in responseData)) {
            return responseData as T;
        }
        const wrapped = responseData as WrappedApiResponse<T>;

        if (!wrapped.success) {
            throw new Error(wrapped.message || "خطا در عملیات");
        }
        if (wrapped.data !== undefined) {
            return wrapped.data;
        }
    }
    throw new Error("Invalid API response format");
}

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>("/users");
        return unwrap<User[]>(response.data);
    },


    getById: async (id: string | number): Promise<User> => {
        const response = await apiClient.get<User>(`/users/${id}`);
        return unwrap<User>(response.data);
    },


    create: async (data: CreateUserDto): Promise<User> => {
        const response = await apiClient.post<User>("/users", data);
        return unwrap<User>(response.data);
    },


    update: async (id: string | number, data: Partial<User>): Promise<User> => {
        const response = await apiClient.put<User>(`/users/${id}`, data);
        return unwrap<User>(response.data);
    },

    delete: async (id: string | number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },


    deleteService: async (id: string | number): Promise<void> => {
        await apiClient.delete(`/users/${id}/service`);
    },
};