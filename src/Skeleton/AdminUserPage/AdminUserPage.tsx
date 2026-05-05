import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import "./AdminUserPage.scss";

export default function AdminUsersSkeleton() {
    return (
        <div className="admin-users-skeleton" dir="rtl">

            <div className="page-header-skeleton">
                <div className="skeleton-back-button"></div>
                <div className="skeleton-title"></div>
            </div>


            <div className="users-header-skeleton">
                <div className="skeleton-search"></div>
            </div>


            <TableContainer component={Paper} className="users-table-skeleton">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><div className="skeleton-header-cell"></div></TableCell>
                            <TableCell><div className="skeleton-header-cell"></div></TableCell>
                            <TableCell><div className="skeleton-header-cell"></div></TableCell>
                            <TableCell><div className="skeleton-header-cell"></div></TableCell>
                            <TableCell><div className="skeleton-header-cell"></div></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...Array(8)].map((_, index) => (
                            <TableRow key={index}>
                                <TableCell><div className="skeleton-cell short"></div></TableCell>
                                <TableCell><div className="skeleton-cell medium"></div></TableCell>
                                <TableCell><div className="skeleton-cell long"></div></TableCell>
                                <TableCell><div className="skeleton-cell medium"></div></TableCell>
                                <TableCell><div className="skeleton-cell icon"></div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}