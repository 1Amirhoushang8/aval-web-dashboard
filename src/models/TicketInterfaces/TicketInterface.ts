export interface StoredTicket {
    id: string | number;
    userId: string;
    title: string;
    shortDetail: string;
    description: string;
    date: string;
    time: string;
    status: string;
    adminResponse?: string | null;
    file?: boolean | {
        name: string;
        type: string;
        size: number;
        data: string;
    };
}

export interface TodayTicketsProps {
    tickets: StoredTicket[];
    loading?: boolean;
    toPersianNumber?: (num: number | string) => string;
    open: boolean;
    onToggle: () => void;
}