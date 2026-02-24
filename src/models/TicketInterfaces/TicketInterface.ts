export interface StoredTicket {
    id: string | number;
    userId: string;
    title: string;
    description: string;
    date: string;
    time: string;
    status?: "pending" | "answered" | "in-progress" | string;
    adminResponse?: string | null;
    file?: {
        name: string;
        type: string;
        size: number;
        url: string;
    } | null | boolean;
}

export interface TodayTicketsProps {
    tickets: StoredTicket[];
    loading?: boolean;
    toPersianNumber?: (num: number | string) => string;
    open: boolean;
    onToggle: () => void;
}