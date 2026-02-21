import apiClient from "./apiClient.ts";
import type { User } from "../models/AccountingInterfaces/AccountingInterface.ts";

type CreateUserDto = Omit<User, "id">;

export const userService = {
    getAll: () =>
        apiClient.get<User[]>("/users"),

    getById: (id: number) =>
        apiClient.get<User>(`/users/${id}`),

    create: (data: CreateUserDto) =>
        apiClient.post<User>("/users", data),

    update: (id: number, data: CreateUserDto) =>
        apiClient.put<User>(`/users/${id}`, data),

    delete: (id: number) =>
        apiClient.delete<void>(`/users/${id}`),
};
