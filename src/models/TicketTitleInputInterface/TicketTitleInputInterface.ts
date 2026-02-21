export interface TitleInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    commonProblems: string[];
}