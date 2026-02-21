import { Tooltip } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import "./SinglePayButton.scss";

import type {SinglePaymentButtonProps} from "../../models/SinglePayBtnInterface/SinglePayBtnInterface.ts"

export default function SinglePaymentButton({
                                                onClick,
                                                showTooltip = true,
                                                tooltipTitle = "مشاهده جزئیات پرداخت",
                                                size = "medium"
                                            }: SinglePaymentButtonProps) {

    const buttonContent = (
        <div
            className={`single-payment-button ${size}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label="پرداخت یکجا"
            dir="rtl"
        >
            <PaymentIcon className="payment-icon" />
            <span className="payment-text">پرداخت یکجا</span>
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