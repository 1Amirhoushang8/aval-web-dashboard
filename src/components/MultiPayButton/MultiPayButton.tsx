import { Tooltip } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "./MultiPayButton.scss";

import type {MultiPaymentButtonProps} from "../../models/MultiPayBtnInterface/MultiPayBtnInterface.ts"

export default function MultiPaymentButton({
                                               onClick,
                                               monthlyPayment,
                                               showTooltip = true,
                                               tooltipTitle = "مشاهده جزئیات پرداخت دوره ای",
                                               size = "medium"
                                           }: MultiPaymentButtonProps) {

    const buttonContent = (
        <div
            className={`multi-payment-button ${size}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label="پرداخت دوره ای"
            dir="rtl"
        >
            <CalendarTodayIcon className="payment-icon" />
            <div className="payment-content">
                <span className="payment-text">پرداخت دوره ای</span>
                {monthlyPayment && (
                    <span className="monthly-payment">
                        {monthlyPayment} در ماه
                    </span>
                )}

            </div>
        </div>
    );

    if (showTooltip) {
        return (
            <Tooltip title={tooltipTitle} arrow>
                {buttonContent}
            </Tooltip>
        );
    }

    return buttonContent;
}