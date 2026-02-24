import apiClient from "./apiClient.ts";
import type { StoredTicket } from "../models/TicketInterfaces/TicketInterface.ts";

type CreateTicketDto = Omit<StoredTicket, "id">;

export const ticketService = {
    getAll: () =>
        apiClient.get<StoredTicket[]>("/tickets"),


    getById: (id: number | string) =>
        apiClient.get<StoredTicket>(`/tickets/${id}`),

    create: (data: CreateTicketDto) =>
        apiClient.post<StoredTicket>("/tickets", data),

    update: (id: number | string, data: CreateTicketDto) =>
        apiClient.put<StoredTicket>(`/tickets/${id}`, data),

    delete: (id: number | string) =>
        apiClient.delete<void>(`/tickets/${id}`),
};