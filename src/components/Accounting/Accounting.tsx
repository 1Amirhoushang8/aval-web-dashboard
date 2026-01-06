import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Menu,
    MenuItem,
} from "@mui/material";
import "./Accounting.scss";

import type {User} from "../../models/AccountingInterfaces/AccountingInterface.ts"

export default function Accounting() {
    const [users, setUsers] = useState<User[]>([
        {
            serialnumber: "124924246",
            price: "6,530,000 R",
            status: "درحال-انجام",
        },
        {
            serialnumber: "19204836",
            price: "356,000 R",
            status: "پرداخت-شده",
        },
        {
            serialnumber: "19204837",
            price: "1,200,000 R",
            status: "لغو-شده",
        },
        {
            serialnumber: "19204838",
            price: "980,000 R",
            status: "پرداخت-شده",
        },
        {
            serialnumber: "19204839",
            price: "450,000 R",
            status: "درحال-انجام",
        },
    ]);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const open = Boolean(anchorEl);

    const handleOpenMenu = (
        event: React.MouseEvent<HTMLButtonElement>,
        index: number
    ) => {
        setAnchorEl(event.currentTarget);
        setActiveIndex(index);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setActiveIndex(null);
    };

    const handleStatusChange = (status: User["status"]) => {
        if (activeIndex === null) return;

        const updatedUsers = [...users];
        updatedUsers[activeIndex].status = status;
        setUsers(updatedUsers);
        handleCloseMenu();
    };

    return (
        <div className="accounting">
            <TableContainer component={Paper} className="accounting-card">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>شماره سریال</TableCell>
                            <TableCell>مبلغ</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>تغییر وضعیت</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={index}>
                                <TableCell>{user.serialnumber}</TableCell>
                                <TableCell>{user.price}</TableCell>

                                <TableCell>
                                    <span className={`status ${user.status}`}>
                                        {user.status}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <Button
                                        className="change-btn"
                                        onClick={(e) =>
                                            handleOpenMenu(e, index)
                                        }
                                    >
                                        تغییر
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem onClick={() => handleStatusChange("درحال-انجام")}>
                    درحال انجام
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("پرداخت-شده")}>
                    پرداخت شده
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("لغو-شده")}>
                    لغو شده
                </MenuItem>
            </Menu>
        </div>
    );
}
