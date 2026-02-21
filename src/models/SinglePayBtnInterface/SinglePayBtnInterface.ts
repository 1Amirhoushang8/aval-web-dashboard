export interface SinglePaymentButtonProps {
    onClick: () => void;
    showTooltip?: boolean;
    tooltipTitle?: string;
    size?: "small" | "medium" | "large";
}