import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Skeleton,
} from "@mui/material";
import "./AccountingSkeleton.scss";

const AccountingSkeleton: React.FC = () => {
    return (
        <div className="accounting skeleton-loading-accounting" dir="rtl">

            <div className="mydp">
                <div className="dropdown">
                    <Skeleton
                        variant="circular"
                        width={48}
                        height={48}
                        className="skeleton-item"
                        sx={{ bgcolor: 'transparent' }}
                    />
                </div>
            </div>


            <TableContainer component={Paper} className="accounting-card">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>شماره فاکتور</TableCell>
                            <TableCell>نام کامل</TableCell>
                            <TableCell>خدمت/سرویس</TableCell>
                            <TableCell>مبلغ کل</TableCell>
                            <TableCell>نوع پرداخت</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>ویرایش/جزییات</TableCell>
                            <TableCell>حذف</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                            <TableRow key={item}>
                                <TableCell>
                                    <Skeleton variant="text" width={60} height={20} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="text" width={100} height={20} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="text" width={120} height={20} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="text" width={90} height={20} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="circular" width={32} height={32} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="rounded" width={80} height={28} className="skeleton-item" sx={{ bgcolor: 'transparent', borderRadius: '16px' }} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Skeleton variant="circular" width={28} height={28} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                        <Skeleton variant="rounded" width={70} height={28} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="circular" width={32} height={32} className="skeleton-item" sx={{ bgcolor: 'transparent' }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default AccountingSkeleton;