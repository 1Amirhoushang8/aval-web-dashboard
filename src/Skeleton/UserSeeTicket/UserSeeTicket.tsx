import { TableRow, TableCell, Skeleton } from "@mui/material";

export default function UserSeeTicketSkeleton() {
    return (
        <>
            {Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="50%" />
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="rounded" width={90} height={32} />
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 2 }} />
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="circular" width={40} height={40} />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}