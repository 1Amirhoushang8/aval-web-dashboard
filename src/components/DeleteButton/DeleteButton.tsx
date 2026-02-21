
import { Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "./DeleteButton.scss";

import type { DeleteButtonProps } from "../../models/DeleteBtnInterface/DeleteBtnInterface"


export default function DeleteButton({
                                         onClick,
                                         showTooltip = true,
                                         tooltipTitle = "حذف فاکتور",
                                         size = "medium",
                                         confirmMessage = "آیا از حذف این فاکتور اطمینان دارید؟",
                                         showConfirm = true
                                     }: DeleteButtonProps) {

    const handleClick = () => {
        if (showConfirm) {
            if (window.confirm(confirmMessage)) {
                onClick();
            }
        } else {
            onClick();
        }
    };

    const button = (
        <IconButton
            aria-label="delete"
            onClick={handleClick}
            className={`delete-button ${size}`}
        >
            <DeleteIcon className="delete-icon" />
        </IconButton>
    );

    if (showTooltip) {
        return (
            <Tooltip title={tooltipTitle} arrow>
                {button}
            </Tooltip>
        );
    }

    return button;
}