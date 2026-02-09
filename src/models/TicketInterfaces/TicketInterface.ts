export interface StoredTicket {
    title: string;
    description: string;
    file?: {
        name: string;
        type: string;
        size: number;
        url: string;
    };
}
