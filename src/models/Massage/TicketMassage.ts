export interface Message {
    id: string;
    ticketId: string;
    senderId: string;
    senderType: "user" | "admin";
    text: string;
    timestamp: string;
    isRead: boolean;
}