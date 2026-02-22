export interface StoredTicket {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    file?: {
        name: string;
        type: string;
        size: number;
        url: string;
    };
}



export interface TodayTicketsProps {
    tickets: StoredTicket[];
    loading?: boolean;
    toPersianNumber?: (num: number | string) => string;
    open: boolean;
    onToggle: () => void;
}