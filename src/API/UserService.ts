import apiClient from "./apiClient.ts";
import type { User } from "../models/AccountingInterfaces/AccountingInterface.ts";

type CreateUserDto = Omit<User, "id">;

export const userService = {
    getAll: () =>
        apiClient.get<User[]>("/users"),

    getById: (id: string | number) =>
        apiClient.get<User>(`/users/${id}`),

    create: (data: CreateUserDto) =>
        apiClient.post<User>("/users", data),

    update: (id: string | number, data: CreateUserDto) =>
        apiClient.put<User>(`/users/${id}`, data),

    delete: (id: string | number) =>
        apiClient.delete<void>(`/users/${id}`),
};
