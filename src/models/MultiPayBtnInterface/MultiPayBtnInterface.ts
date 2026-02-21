export interface MultiPaymentButtonProps {
    onClick: () => void;
    monthlyPayment?: string | null;
    totalMonths?: number | null;
    showTooltip?: boolean;
    tooltipTitle?: string;
    size?: "small" | "medium" | "large";
}