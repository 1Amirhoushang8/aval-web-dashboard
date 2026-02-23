import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import "./AdminTicketPage.scss";

interface AdminTicketSkeletonProps {
    rows?: number;
}

const AdminTicketSkeleton: React.FC<AdminTicketSkeletonProps> = ({ rows = 5 }) => {
    // We now use 9 columns to match the main table (User, Service, Title, Desc, File, Time, Status, Response, Actions)
    const columnCount = 9;

    return (
        <div className="admin-ticket-skeleton">
            {/* Header Skeleton */}
            <div className="skeleton-header">
                <div className="skeleton-header-title">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                </div>
                <div className="skeleton-stats">
                    <div className="skeleton-stat-card"></div>
                    <div className="skeleton-stat-card"></div>
                    <div className="skeleton-stat-card"></div>
                    <div className="skeleton-stat-card"></div>
                </div>
            </div>

            {/* Table Skeleton */}
            <TableContainer component={Paper} className="skeleton-table-container">
                <Table className="skeleton-table">
                    <TableHead>
                        <TableRow>
                            {[...Array(columnCount)].map((_, item) => (
                                <TableCell key={item}>
                                    <div className="skeleton-cell"></div>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...Array(rows)].map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {[...Array(columnCount)].map((_, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {colIndex === 0 ? (
                                            <div className="skeleton-user-info">
                                                <div className="skeleton-icon"></div>
                                                <div className="skeleton-text"></div>
                                            </div>
                                        ) : colIndex === 1 ? (
                                            /* Skeleton for the new Service column */
                                            <div className="skeleton-badge" style={{ width: '80px', height: '20px' }}></div>
                                        ) : colIndex === 2 ? (
                                            <div className="skeleton-text skeleton-title-short"></div>
                                        ) : colIndex === 3 ? (
                                            <div className="skeleton-text skeleton-description"></div>
                                        ) : colIndex === 4 ? (
                                            <div className="skeleton-file">
                                                <div className="skeleton-icon-small"></div>
                                                <div className="skeleton-text skeleton-file-text"></div>
                                            </div>
                                        ) : colIndex === 5 ? (
                                            <div className="skeleton-date">
                                                <div className="skeleton-text skeleton-date-text"></div>
                                                <div className="skeleton-text skeleton-time-text"></div>
                                            </div>
                                        ) : colIndex === 6 ? (
                                            <div className="skeleton-badge"></div>
                                        ) : colIndex === 7 ? (
                                            <div className="skeleton-response">
                                                <div className="skeleton-text skeleton-response-text"></div>
                                                <div className="skeleton-button-small"></div>
                                            </div>
                                        ) : (
                                            <div className="skeleton-actions">
                                                <div className="skeleton-button"></div>
                                                <div className="skeleton-icon-button"></div>
                                            </div>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default AdminTicketSkeleton;