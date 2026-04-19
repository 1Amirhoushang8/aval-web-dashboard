export interface FileUploadProps {
    onFileChange: (file: File | null) => void;
    onFileError: (error: string | null) => void;
    disabled?: boolean;
    initialFile?: File | null;
    initialPreviewUrl?: string | null;
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
}