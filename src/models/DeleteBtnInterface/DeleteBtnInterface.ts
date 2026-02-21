export  interface DeleteButtonProps {
    onClick: () => void;
    showTooltip?: boolean;
    tooltipTitle?: string;
    size?: "small" | "medium" | "large";
    confirmMessage?: string;
    showConfirm?: boolean;
}